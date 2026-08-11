import { cache } from "react";
import { ObjectId, type Collection } from "mongodb";
import { getDb, isConfigured } from "@/lib/mongodb";
import { SEED_POSTS, type Post } from "@/lib/posts";

/**
 * Data access for market notes.
 *
 * Reads are wrapped in React's `cache()`, which memoises per render pass. That
 * matters because a post page asks for the same record twice — once in
 * `generateMetadata` for the title and description, once in the component for
 * the body — and `listPosts` again for the "more notes" row. Without deduping,
 * every render of every post costs three round trips instead of two.
 *
 * This is separate from route caching: the public pages are prerendered and
 * revalidated on write, so a *visitor* never triggers a query at all. `cache()`
 * only reduces the cost of the renders that do happen — at build, and after an
 * edit.
 *
 * Every read falls back to `SEED_POSTS` when the database is absent or
 * unreachable. That is deliberate rather than lazy: the public blog is part of a
 * marketing site, and a cold Atlas cluster or a missing `.env.local` should
 * degrade to the bundled content, not to a 500 or an empty index. Writes have no
 * fallback — they fail loudly, because silently accepting an edit that was never
 * persisted is far worse than an error message.
 */

/** Shape stored in Mongo. `_id` is the identity; `slug` is the public key. */
type PostDoc = Omit<Post, "id"> & {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type PostInput = Omit<Post, "id">;

const COLLECTION = "posts";

async function collection(): Promise<Collection<PostDoc> | null> {
  const db = await getDb();
  return db ? db.collection<PostDoc>(COLLECTION) : null;
}

function toPost(doc: PostDoc): Post {
  // createdAt/updatedAt are bookkeeping — they never reach the public shape.
  const { _id, createdAt, updatedAt, ...rest } = doc;
  void createdAt;
  void updatedAt;
  return { ...rest, id: _id?.toHexString() };
}

/** Newest first, matching how the index and the homepage strip present them. */
function byNewest(a: Post, b: Post) {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/** Distinguishes "reading the database" from "showing the bundled seed". */
export async function getSource(): Promise<"database" | "seed"> {
  if (!isConfigured) return "seed";
  try {
    return (await collection()) ? "database" : "seed";
  } catch {
    return "seed";
  }
}

export const listPosts = cache(async (): Promise<Post[]> => {
  try {
    const posts = await collection();
    if (!posts) return [...SEED_POSTS].sort(byNewest);

    const docs = await posts.find({}).sort({ publishedAt: -1 }).toArray();
    // An empty collection means "not seeded yet", not "no posts" — showing a
    // blank blog on a fresh database would look broken.
    if (docs.length === 0) return [...SEED_POSTS].sort(byNewest);

    return docs.map(toPost);
  } catch (error) {
    console.error("[blog-repo] listPosts fell back to seed content:", error);
    return [...SEED_POSTS].sort(byNewest);
  }
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  try {
    const posts = await collection();
    if (!posts) return SEED_POSTS.find((post) => post.slug === slug) ?? null;

    const doc = await posts.findOne({ slug });
    if (doc) return toPost(doc);
    // Fall through to the seed so links that predate the database keep working.
    return SEED_POSTS.find((post) => post.slug === slug) ?? null;
  } catch (error) {
    console.error("[blog-repo] getPostBySlug fell back to seed content:", error);
    return SEED_POSTS.find((post) => post.slug === slug) ?? null;
  }
});

export async function getPostById(id: string): Promise<Post | null> {
  if (!ObjectId.isValid(id)) return null;
  const posts = await collection();
  if (!posts) return null;

  const doc = await posts.findOne({ _id: new ObjectId(id) });
  return doc ? toPost(doc) : null;
}

// ── writes ──────────────────────────────────────────────────────────────────

function requireCollection() {
  return collection().then((posts) => {
    if (!posts) {
      throw new Error(
        "MONGODB_URI is not set, so posts cannot be saved. Add it to .env.local and restart the dev server.",
      );
    }
    return posts;
  });
}

export async function createPost(input: PostInput): Promise<string> {
  const posts = await requireCollection();
  const now = new Date();

  // Checked rather than left to the unique index so the admin gets a sentence
  // instead of a driver error mentioning E11000.
  if (await posts.findOne({ slug: input.slug })) {
    throw new Error(`The slug "${input.slug}" is already used by another note.`);
  }

  const result = await posts.insertOne({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  return result.insertedId.toHexString();
}

export async function updatePost(id: string, input: PostInput): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error("That note id is not valid.");
  const posts = await requireCollection();
  const _id = new ObjectId(id);

  const clash = await posts.findOne({ slug: input.slug, _id: { $ne: _id } });
  if (clash) {
    throw new Error(`The slug "${input.slug}" is already used by another note.`);
  }

  const result = await posts.updateOne(
    { _id },
    { $set: { ...input, updatedAt: new Date() } },
  );
  if (result.matchedCount === 0) throw new Error("That note no longer exists.");
}

export async function deletePost(id: string): Promise<void> {
  if (!ObjectId.isValid(id)) throw new Error("That note id is not valid.");
  const posts = await requireCollection();
  const result = await posts.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) throw new Error("That note no longer exists.");
}

/**
 * Copies the bundled seed into an empty collection.
 *
 * Idempotent: it only ever inserts when the collection has no documents, so
 * running it twice cannot duplicate anything, and it will not resurrect a note
 * the admin deliberately deleted.
 */
export async function seedPosts(): Promise<number> {
  const posts = await requireCollection();

  await posts.createIndex({ slug: 1 }, { unique: true });
  await posts.createIndex({ publishedAt: -1 });

  if ((await posts.countDocuments({}, { limit: 1 })) > 0) return 0;

  const now = new Date();
  const result = await posts.insertMany(
    SEED_POSTS.map((post) => ({ ...post, createdAt: now, updatedAt: now })),
  );
  return result.insertedCount;
}

/** True when the collection has documents — drives the admin's seed prompt. */
export async function hasStoredPosts(): Promise<boolean> {
  try {
    const posts = await collection();
    if (!posts) return false;
    return (await posts.countDocuments({}, { limit: 1 })) > 0;
  } catch {
    return false;
  }
}
