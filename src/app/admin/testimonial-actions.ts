"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createTestimonial,
  deleteTestimonial,
  moveTestimonial,
  seedTestimonials,
  updateTestimonial,
  type TestimonialInput,
} from "@/lib/testimonial-repo";
import { initialOf, slugifyName } from "@/lib/testimonials";
import { requireSession } from "./session";
import type { ActionState } from "./actions";

/**
 * Create / update / delete for carousel reviews.
 *
 * A separate module from `actions.ts` rather than an addition to it: every export
 * of a `"use server"` file is a callable endpoint, and keeping the review
 * endpoints in their own file makes the surface of each feature legible. Both
 * import the same `requireSession` guard.
 */

/** Paths whose rendered output embeds review content. */
function revalidateTestimonials() {
  // The carousel only appears on the homepage; /admin/testimonials is the list
  // that has to reflect the change immediately.
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

function parseTestimonial(formData: FormData): TestimonialInput {
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const name = text("name");
  const rating = Number(text("rating"));
  const order = Number(text("order"));

  return {
    name,
    // 0 is the "no preference" signal the repo reads as "append to the end";
    // a blank field and a non-numeric one both mean the same thing here.
    order: Number.isFinite(order) && order > 0 ? Math.round(order) : 0,
    // Both derived from the name when left blank, so the common case is just
    // "name, role, quote" and nothing else to think about.
    slug: text("slug") || slugifyName(name),
    initial: text("initial").slice(0, 2).toUpperCase() || initialOf(name),
    role: text("role"),
    quote: text("quote"),
    // Blank is meaningful: it means "fall back to the letter badge", so it is
    // stored as absent rather than an empty string. The Mongo client runs with
    // `ignoreUndefined`, so this genuinely omits the field instead of writing null.
    photo: text("photo") || undefined,
    // Clamped rather than rejected: the input is already `min=1 max=5`, so an
    // out-of-range value here means the browser check was bypassed, and a
    // carousel that renders 40 stars is a worse outcome than a silent clamp.
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
  };
}

function validate(testimonial: TestimonialInput): string | null {
  if (!testimonial.name) return "The review needs a name.";
  if (!testimonial.slug) {
    return "That name produces an empty key — add some letters or numbers to it.";
  }
  if (!/^[a-z0-9-]+$/.test(testimonial.slug)) {
    return "The key can only contain lowercase letters, numbers and hyphens.";
  }
  if (!testimonial.role) {
    return "Add the line under the name — instrument and how long they have traded.";
  }
  if (!testimonial.quote) return "The review has no quote.";
  // The card is a fixed-height panel in a carousel; a 900-word essay would
  // overflow it rather than wrap gracefully.
  if (testimonial.quote.length > 400) {
    return `That quote is ${testimonial.quote.length} characters. Keep it under 400 so it fits the card.`;
  }
  return null;
}

export async function saveTestimonial(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const testimonial = parseTestimonial(formData);

  const invalid = validate(testimonial);
  if (invalid) return { error: invalid };

  try {
    if (id) {
      await updateTestimonial(id, testimonial);
    } else {
      await createTestimonial(testimonial);
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not save the review.",
    };
  }

  revalidateTestimonials();
  redirect("/admin/testimonials?saved=1");
}

export async function removeTestimonial(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");

  await deleteTestimonial(id);
  revalidateTestimonials();
  redirect("/admin/testimonials?deleted=1");
}

/**
 * Nudges a review one slot up or down the carousel.
 *
 * Deliberately not a state-setting action: it says "move relative to where this
 * currently is", so two admins clicking at once cannot write positions derived
 * from a stale render.
 */
export async function reorderTestimonial(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (direction !== "up" && direction !== "down") {
    throw new Error("A move has to be up or down.");
  }

  await moveTestimonial(id, direction);
  revalidateTestimonials();
  redirect("/admin/testimonials?moved=1");
}

export async function importSeedTestimonials() {
  await requireSession();

  const inserted = await seedTestimonials();
  revalidateTestimonials();
  redirect(`/admin/testimonials?imported=${inserted}`);
}
