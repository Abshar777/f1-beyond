import { cache } from "react";
import { ObjectId, type Collection } from "mongodb";
import { getDb, isConfigured } from "@/lib/mongodb";
import { SEED_TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

/**
 * Data access for carousel reviews.
 *
 * Deliberately the same shape as `blog-repo`, including the fallback policy:
 * every read degrades to `SEED_TESTIMONIALS` when the database is absent or
 * unreachable, because an empty carousel on the marketing page looks broken,
 * while writes fail loudly — silently accepting an edit that was never
 * persisted is worse than an error message.
 *
 * Ordering is by the explicit `order` field, which every write renumbers to a
 * dense 1..n sequence (see `renumber`). Renumbering rather than leaving gaps is
 * what lets the editor offer a plain "position" number: with duplicates or holes,
 * "put this third" would have no single answer. `createdAt` is the tiebreaker so
 * a list that somehow does contain duplicates still sorts deterministically
 * instead of depending on what order Mongo happened to return.
 */

type TestimonialDoc = Omit<Testimonial, "id"> & {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type TestimonialInput = Omit<Testimonial, "id">;

const COLLECTION = "testimonials";

async function collection(): Promise<Collection<TestimonialDoc> | null> {
  const db = await getDb();
  return db ? db.collection<TestimonialDoc>(COLLECTION) : null;
}

function toTestimonial(doc: TestimonialDoc): Testimonial {
  const { _id, createdAt, updatedAt, ...rest } = doc;
  void createdAt;
  void updatedAt;
  return { ...rest, id: _id?.toHexString() };
}

/** Distinguishes "reading the database" from "showing the bundled seed". */
export async function getTestimonialSource(): Promise<"database" | "seed"> {
  if (!isConfigured) return "seed";
  try {
    return (await collection()) ? "database" : "seed";
  } catch {
    return "seed";
  }
}

export const listTestimonials = cache(async (): Promise<Testimonial[]> => {
  try {
    const testimonials = await collection();
    if (!testimonials) return SEED_TESTIMONIALS;

    const docs = await testimonials
      .find({})
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    // An empty collection means "not seeded yet", not "no reviews".
    if (docs.length === 0) return SEED_TESTIMONIALS;

    return docs.map(toTestimonial);
  } catch (error) {
    console.error(
      "[testimonial-repo] listTestimonials fell back to seed content:",
      error,
    );
    return SEED_TESTIMONIALS;
  }
});

export async function getTestimonialById(
  id: string,
): Promise<Testimonial | null> {
  if (!ObjectId.isValid(id)) return null;
  const testimonials = await collection();
  if (!testimonials) return null;

  const doc = await testimonials.findOne({ _id: new ObjectId(id) });
  return doc ? toTestimonial(doc) : null;
}

// ── writes ──────────────────────────────────────────────────────────────────

function requireCollection() {
  return collection().then((testimonials) => {
    if (!testimonials) {
      throw new Error(
        "MONGODB_URI is not set, so reviews cannot be saved. Add it to .env.local and restart the dev server.",
      );
    }
    return testimonials;
  });
}

/**
 * Rewrites `order` across the collection so it reads 1..n in the given sequence.
 *
 * One `bulkWrite` rather than n round trips, and it runs after every mutation so
 * the sequence is never left with a hole (a delete) or a collision (two records
 * asked for the same position). At carousel scale — single or low double digits —
 * rewriting every row is cheaper than the bookkeeping needed to avoid it.
 */
async function renumber(
  testimonials: Collection<TestimonialDoc>,
  orderedIds: ObjectId[],
): Promise<void> {
  if (orderedIds.length === 0) return;

  await testimonials.bulkWrite(
    orderedIds.map((_id, index) => ({
      updateOne: { filter: { _id }, update: { $set: { order: index + 1 } } },
    })),
    // Order matters within the batch only in that every write must land; there
    // are no interdependencies, so let the driver parallelise them.
    { ordered: false },
  );
}

/** Ids in current carousel order — the basis for any repositioning. */
async function orderedIds(
  testimonials: Collection<TestimonialDoc>,
): Promise<ObjectId[]> {
  const docs = await testimonials
    .find({}, { projection: { _id: 1 } })
    .sort({ order: 1, createdAt: 1 })
    .toArray();
  return docs.map((doc) => doc._id!).filter(Boolean);
}

export async function createTestimonial(
  input: TestimonialInput,
): Promise<string> {
  const testimonials = await requireCollection();
  const now = new Date();

  // Checked up front so a duplicate name gives a sentence rather than a driver
  // error mentioning E11000.
  if (await testimonials.findOne({ slug: input.slug })) {
    throw new Error(
      `There is already a review keyed "${input.slug}". Add a distinguishing detail to the name.`,
    );
  }

  const existing = await orderedIds(testimonials);

  const result = await testimonials.insertOne({
    ...input,
    // Parked past the end first; the renumber below moves it to its real slot.
    order: existing.length + 1,
    createdAt: now,
    updatedAt: now,
  });

  // A requested position of 0 or beyond the end clamps to the ends rather than
  // erroring — "put it first" and "put it last" are both reasonable readings of
  // an out-of-range number, and neither deserves a rejected save.
  const target = Math.min(
    Math.max(input.order || existing.length + 1, 1),
    existing.length + 1,
  );
  const next = [...existing];
  next.splice(target - 1, 0, result.insertedId);
  await renumber(testimonials, next);

  return result.insertedId.toHexString();
}

export async function updateTestimonial(
  id: string,
  input: TestimonialInput,
): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error("That review id is not valid.");
  const testimonials = await requireCollection();
  const _id = new ObjectId(id);

  const clash = await testimonials.findOne({ slug: input.slug, _id: { $ne: _id } });
  if (clash) {
    throw new Error(
      `There is already a review keyed "${input.slug}". Add a distinguishing detail to the name.`,
    );
  }

  // Optional fields that were cleared have to be `$unset`, not `$set`.
  //
  // The Mongo client runs with `ignoreUndefined: true` — which is what stops a
  // blank photo being written as `null`, contradicting `photo?: string`. The
  // catch is that it drops the key from `$set` entirely, so an update carrying
  // `photo: undefined` leaves whatever was already stored in place. Clearing a
  // photo in the editor then silently did nothing.
  const set: Record<string, unknown> = { updatedAt: new Date() };
  const unset: Record<string, ""> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) unset[key] = "";
    else set[key] = value;
  }

  const result = await testimonials.updateOne({ _id }, {
    $set: set,
    // Only include `$unset` when it has keys: an empty operator object is a
    // driver error, not a no-op.
    ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
  });
  if (result.matchedCount === 0) {
    throw new Error("That review no longer exists.");
  }

  // Move it to the requested slot. Pulled out of the list first, then inserted,
  // so "position 3" counts slots in the list *without* this record — otherwise
  // moving something down by one would look like nothing happened.
  const current = await orderedIds(testimonials);
  const without = current.filter((candidate) => !candidate.equals(_id));
  const target = Math.min(Math.max(input.order || 1, 1), without.length + 1);
  without.splice(target - 1, 0, _id);
  await renumber(testimonials, without);
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error("That review id is not valid.");
  const testimonials = await requireCollection();
  const result = await testimonials.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    throw new Error("That review no longer exists.");
  }
  // Close the gap the delete left, so positions stay 1..n.
  await renumber(testimonials, await orderedIds(testimonials));
}

/**
 * Swaps a review with its neighbour.
 *
 * Expressed as "move relative to current position" rather than "set order to N"
 * because that is what the arrows in the list mean, and because it cannot
 * desynchronise: the new arrangement is derived from the stored order at the
 * moment of the click, not from what the page happened to render earlier.
 */
export async function moveTestimonial(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error("That review id is not valid.");
  const testimonials = await requireCollection();
  const _id = new ObjectId(id);

  const current = await orderedIds(testimonials);
  const index = current.findIndex((candidate) => candidate.equals(_id));
  if (index === -1) throw new Error("That review no longer exists.");

  const swapWith = direction === "up" ? index - 1 : index + 1;
  // Already at the end it is being pushed towards: nothing to do, and not an
  // error — the arrow is simply inert there.
  if (swapWith < 0 || swapWith >= current.length) return;

  const next = [...current];
  [next[index], next[swapWith]] = [next[swapWith], next[index]];
  await renumber(testimonials, next);
}

/**
 * Copies the bundled seed into an empty collection.
 *
 * Idempotent — it only inserts when the collection is empty, so running it
 * twice cannot duplicate anything and it will not resurrect a review the admin
 * deliberately deleted.
 *
 * `createdAt` is stepped a millisecond per record rather than sharing one
 * timestamp, because it is the sort tiebreaker and identical values would leave
 * the carousel order down to however Mongo happened to return them.
 */
export async function seedTestimonials(): Promise<number> {
  const testimonials = await requireCollection();

  await testimonials.createIndex({ slug: 1 }, { unique: true });
  await testimonials.createIndex({ order: 1, createdAt: 1 });

  if ((await testimonials.countDocuments({}, { limit: 1 })) > 0) return 0;

  const base = Date.now();
  const result = await testimonials.insertMany(
    SEED_TESTIMONIALS.map((testimonial, i) => ({
      ...testimonial,
      createdAt: new Date(base + i),
      updatedAt: new Date(base + i),
    })),
  );
  return result.insertedCount;
}

/**
 * How many reviews are actually stored.
 *
 * Distinct from `listTestimonials().length`, which substitutes the bundled six
 * when the collection is empty — the position field needs the real count, or
 * creating the very first review would offer "of 7".
 */
export async function countTestimonials(): Promise<number> {
  try {
    const testimonials = await collection();
    if (!testimonials) return 0;
    return await testimonials.countDocuments({});
  } catch {
    return 0;
  }
}

/** True when the collection has documents — drives the admin's seed prompt. */
export async function hasStoredTestimonials(): Promise<boolean> {
  try {
    const testimonials = await collection();
    if (!testimonials) return false;
    return (await testimonials.countDocuments({}, { limit: 1 })) > 0;
  } catch {
    return false;
  }
}
