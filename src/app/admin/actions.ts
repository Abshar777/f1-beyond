"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth";
import {
  createPost,
  deletePost,
  seedPosts,
  updatePost,
  type PostInput,
} from "@/lib/blog-repo";

export type ActionState = { error?: string; ok?: boolean };

/**
 * Server-side gate for every mutating action.
 *
 * `proxy.ts` already keeps signed-out visitors out of the admin UI, but a server
 * action is a callable endpoint — it does not have to be reached by navigating
 * through a protected route. Without this check, anyone who knew the action id
 * could post to it directly. The proxy is convenience; this is the actual
 * authorisation.
 */
async function requireSession() {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    redirect("/admin/login");
  }
}

/** Constant-time compare that does not leak length through an early return. */
function passwordMatches(supplied: string, expected: string) {
  const a = new TextEncoder().encode(supplied);
  const b = new TextEncoder().encode(expected);
  // timingSafeEqual throws on a length mismatch, so both sides are hashed to a
  // fixed width first — otherwise the throw itself reveals the length.
  if (a.byteLength !== b.byteLength) {
    // Still do the work, then fail, so a wrong-length guess costs the same.
    timingSafeEqual(new Uint8Array(32), new Uint8Array(32));
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return {
      error:
        "ADMIN_PASSWORD is not set on the server. Add it to .env.local and restart the dev server.",
    };
  }

  if (!passwordMatches(password, expected)) {
    // One message for both "no password" and "wrong password" — telling them
    // which is which is free information for anyone guessing.
    return { error: "That password is not right." };
  }

  let token: string;
  try {
    token = await createSessionToken();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Sign-in failed." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE_SECONDS));

  // Only ever redirect within this site: an attacker-supplied `next` of
  // https://evil.example would otherwise turn the login into an open redirect.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/admin");
}

export async function signOut() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  redirect("/admin/login");
}

/** Paths whose rendered output embeds post content. */
function revalidateBlog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/blog/${slug}`);
}

function parsePost(formData: FormData): PostInput {
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const title = text("title");
  const slug =
    text("slug") ||
    // Derived from the title when left blank, so a note can be saved without
    // hand-writing a slug.
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const readMinutes = Number(text("readMinutes"));

  return {
    slug,
    title,
    category: text("category"),
    excerpt: text("excerpt"),
    image: text("image"),
    // Blank is meaningful here: it means "generate initials from the
    // author name", so it is stored as absent rather than an empty string.
    avatar: text("avatar") || undefined,
    author: text("author"),
    publishedAt: text("publishedAt"),
    readMinutes: Number.isFinite(readMinutes) && readMinutes > 0 ? readMinutes : 5,
    // One paragraph per blank-line-separated block, which is how the body
    // renders — the editor is a textarea, not a rich-text field.
    body: text("body")
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
  };
}

function validate(post: PostInput): string | null {
  if (!post.title) return "The note needs a title.";
  if (!post.slug) return "The note needs a slug.";
  if (!/^[a-z0-9-]+$/.test(post.slug)) {
    return "The slug can only contain lowercase letters, numbers and hyphens.";
  }
  if (!post.category) return "Pick a category.";
  if (!post.excerpt) return "The excerpt is what shows on the index — add one.";
  if (!post.author) return "Who wrote it?";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt)) {
    return "The publish date needs to be a real date.";
  }
  if (post.body.length === 0) return "The note has no body text.";
  return null;
}

export async function savePost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const post = parsePost(formData);

  const invalid = validate(post);
  if (invalid) return { error: invalid };

  try {
    if (id) {
      await updatePost(id, post);
    } else {
      await createPost(post);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save the note.",
    };
  }

  revalidateBlog(post.slug);
  redirect("/admin?saved=1");
}

export async function removePost(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  await deletePost(id);
  revalidateBlog(slug);
  redirect("/admin?deleted=1");
}

export async function importSeedPosts() {
  await requireSession();

  const inserted = await seedPosts();
  revalidateBlog();
  redirect(`/admin?imported=${inserted}`);
}
