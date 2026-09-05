# Blog Integration Pattern (reference for new content types)

> Branding note: in this codebase the "blog" feature is user-facing as **"Market Notes"**, but all
> code (types, functions, folders) is named around `post`/`blog`. This doc describes the underlying
> pattern so it can be replicated for a new content type (e.g. "guides", "faqs", "case-studies").

## 0. Data source summary

**MongoDB**, with a bundled static-array fallback — **not** a headless CMS (no Sanity/Contentful/Strapi
anywhere in this repo). Every read tries Mongo first and falls back to a hardcoded `SEED_*` array if
`MONGODB_URI` is unset, the collection is empty, or the query throws. Writes have no fallback — they
require Mongo to be configured.

Env vars (`.env.example`):

```
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB="beyondpips"          # defaults to "beyondpips"
ADMIN_PASSWORD="12345678"        # single shared admin password
AUTH_SECRET="replace-me-with-a-long-random-string"   # signs the session cookie
```

---

## 1. File/folder structure

```
src/app/blog/page.tsx                          # public blog index (/blog)
src/app/blog/[slug]/page.tsx                   # public blog detail (/blog/[slug])

src/lib/posts.ts                               # Post type + SEED_POSTS (static fallback) + date formatter
src/lib/blog-repo.ts                           # data-access layer (Mongo reads/writes + seed fallback)
src/lib/mongodb.ts                             # shared Mongo client/connection cache
src/lib/image-repo.ts                          # generic image blob storage (shared with testimonials)
src/lib/auth.ts                                # admin session token (HMAC, Edge-compatible)
src/lib/nav-links.ts                           # "Market Notes" nav entry -> /blog

src/app/admin/actions.ts                       # server actions: signIn/signOut/savePost/removePost/importSeedPosts
src/app/admin/session.ts                       # requireSession() guard for server actions
src/app/admin/PostForm.tsx                     # create/edit form (client component)
src/app/admin/layout.tsx                       # bare /admin wrapper (robots: noindex)
src/app/admin/login/page.tsx                   # /admin/login
src/app/admin/(dashboard)/layout.tsx           # signed-in chrome (header/nav/sign-out)
src/app/admin/(dashboard)/page.tsx             # /admin — posts list table
src/app/admin/(dashboard)/posts/new/page.tsx   # /admin/posts/new
src/app/admin/(dashboard)/posts/[id]/page.tsx  # /admin/posts/[id] — edit

src/app/api/admin/images/route.ts              # POST — upload endpoint (auth-gated, used by ImageField)
src/app/api/images/[id]/route.ts               # GET — public image byte-serving endpoint

src/components/sections/Blog2.tsx              # homepage "3 latest notes" strip
src/components/admin/ImageField.tsx            # upload/paste-link/pick-bundled image widget (used for cover+avatar)
src/components/ui/Avatar.tsx                   # photo-or-initials avatar (used on cards/detail/admin table)
src/lib/avatar.ts                              # initials/colour derivation used by Avatar

src/proxy.ts                                   # Next 16 "proxy" (middleware) — gates /admin/:path*
```

> There's a second content type built with the exact same pattern already in this repo:
> **testimonials** — `src/app/admin/TestimonialForm.tsx`, `src/lib/testimonial-repo.ts`,
> `src/app/admin/testimonial-actions.ts`, `src/app/admin/(dashboard)/testimonials/*`.
> It's a good second reference to diff against when replicating the pattern.

---

## 2. Data access layer

`src/lib/mongodb.ts` — cached `MongoClient` on `globalThis` (survives HMR):

```ts
export const isConfigured = Boolean(process.env.MONGODB_URI);
// getDb() returns null if unconfigured or recently failed (30s retry cooldown)
```

`src/lib/blog-repo.ts` — collection name `"posts"`. Reads are wrapped in React's `cache()` for
per-render dedupe (a post page calls `getPostBySlug` twice — once in `generateMetadata`, once in the
page body — plus `listPosts` for "more notes").

```ts
export const listPosts = cache(async (): Promise<Post[]> => {
  try {
    const posts = await collection();
    if (!posts) return [...SEED_POSTS].sort(byNewest);
    const docs = await posts.find({}).sort({ publishedAt: -1 }).toArray();
    if (docs.length === 0) return [...SEED_POSTS].sort(byNewest);
    return docs.map(toPost);
  } catch (error) {
    console.error("[blog-repo] listPosts fell back to seed content:", error);
    return [...SEED_POSTS].sort(byNewest);
  }
});
```

Other exports: `getPostBySlug`, `getPostById`, `createPost`, `updatePost`, `deletePost`,
`hasStoredPosts()`, and `seedPosts()` (idempotent — only inserts into an empty collection).

Images (cover photos, author avatars) are **not** filesystem files — they're stored as binary blobs
in a separate `images` collection (`src/lib/image-repo.ts`) and served through `/api/images/[id]`,
because serverless hosts have a read-only/ephemeral filesystem.

---

## 3. Types/schema

`src/lib/posts.ts` — the canonical shape (no external CMS schema; this doubles as the "content model"):

```ts
export type Post = {
  id?: string;              // Mongo _id as string; absent on bundled seed records
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  avatar?: string;          // optional; falls back to generated initials avatar
  author: string;
  publishedAt: string;      // ISO yyyy-mm-dd
  readMinutes: number;
  body: string[];           // one entry per paragraph
};
```

`src/lib/blog-repo.ts` — Mongo document shape and write-time input type:

```ts
type PostDoc = Omit<Post, "id"> & {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
export type PostInput = Omit<Post, "id">;
```

`SEED_POSTS: Post[]` (also in `src/lib/posts.ts`) is the bundled fallback content, and doubles as the
seed data inserted into Mongo via `seedPosts()`.

---

## 4. Routing

**Index — `src/app/blog/page.tsx`**:

```ts
export const metadata: Metadata = {
  title: "...",
  description: "...",
  alternates: { canonical: "/blog" },
  openGraph: { /* ... */ },
};

export default async function BlogPage() {
  const posts = await listPosts();
  const [featured, ...rest] = posts;
  const categories = [...new Set(posts.map((post) => post.category))];
  // hero header + category pills + featured card + grid of rest + CTA
}
```

**Detail — `src/app/blog/[slug]/page.tsx`** — statically generated at build, with on-demand fallback
for posts created after build (`dynamicParams` left at its default `true`):

```ts
type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Note not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, url: `/blog/${post.slug}` },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  // breadcrumb, header, cover image, body paragraphs, promo CTA, related posts grid
}
```

**Cache invalidation on write** — `src/app/admin/actions.ts`:

```ts
function revalidateBlog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/blog/${slug}`);
}
```

**Admin routes** — `/admin`, `/admin/posts/new`, `/admin/posts/[id]`, `/admin/login`, gated by
`src/proxy.ts` (`matcher: "/admin/:path*"`), plus a second server-side check `requireSession()`
inside every mutating server action (belt-and-braces, since actions are directly callable endpoints).

---

## 5. Components

- **`src/components/sections/Blog2.tsx`** — homepage section, server component, shows the 3 newest
  posts (`listPosts().slice(0, 3)`) as cards: image, category pill, avatar+author+date, title link,
  and a "Read all notes" button to `/blog`.
- **`src/app/blog/page.tsx`** — index page: hero header with derived category filter pills, a
  "featured" hero card (newest post), a responsive grid of the rest, CTA block. Includes an inline
  `Meta` sub-component for author/date/read-time.
- **`src/app/blog/[slug]/page.tsx`** — detail page: breadcrumb, title/excerpt/author header, cover
  image, paragraph body (first paragraph styled larger as a "standfirst"), an inline promo CTA block,
  and a "More from the desk" related-posts grid (3 other posts).
- **`src/components/ui/Avatar.tsx`** — photo-or-generated-initials avatar, server-safe (no hooks) so
  it works inside prerendered pages.
- **`src/components/admin/ImageField.tsx`** — reusable admin widget: upload file / paste URL / pick
  from bundled options; used for both cover image and author avatar fields; posts to
  `/api/admin/images`.
- **`src/app/admin/PostForm.tsx`** — single client component used for both create and edit (an
  existing `post` prop supplies defaults + a hidden `id`); textarea-based body editor (blank-line
  separated paragraphs); category `<datalist>` from a fixed suggestion list; live-derived slug
  preview.
- **`src/app/admin/(dashboard)/page.tsx`** — admin list table (thumbnail, title/slug, category,
  author+avatar, date, edit/delete actions), with banners for "no MongoDB configured" and "DB
  connected but empty — import starter notes."

---

## 6. API / server-action layer

No REST/GraphQL query layer for reads — reads go straight through `src/lib/blog-repo.ts` functions
imported directly into Server Components (`listPosts`, `getPostBySlug`, `getPostById`).

Writes are **Server Actions**, not API routes (`src/app/admin/actions.ts`, `"use server"`):

```ts
export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const post = parsePost(formData);          // parses/derives slug, splits body into paragraphs
  const invalid = validate(post);
  if (invalid) return { error: invalid };
  try {
    if (id) await updatePost(id, post); else await createPost(post);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the note." };
  }
  revalidateBlog(post.slug);
  redirect("/admin?saved=1");
}

export async function removePost(formData: FormData) { /* requireSession, deletePost, revalidateBlog, redirect */ }
export async function importSeedPosts() { /* requireSession, seedPosts(), revalidateBlog(), redirect */ }
```

The one true API **route** (`src/app/api/admin/images/route.ts`) exists only because Server Actions
cap request bodies at 1MB — file uploads need a route handler:

```ts
export async function POST(request: Request) {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  // validates FormData file, MIME allowlist, size limit (5MB), magic-byte sniff
  const id = await saveImage(bytes, file.type, file.name);
  return NextResponse.json({ url: imageUrl(id) }, { status: 201 });
}
```

`src/app/api/images/[id]/route.ts` serves the stored bytes back out publicly with
`Cache-Control: public, max-age=31536000, immutable` (content-addressed by Mongo `_id`).

---

## 7. SEO / metadata

Per-page `Metadata` exports — no separate SEO library:

- **Index**: static `metadata` export — `title`, `description`, `alternates.canonical: "/blog"`,
  `openGraph.{title,description,url}`.
- **Detail**: `generateMetadata` computed from the fetched post — `title: post.title`,
  `description: post.excerpt`, `alternates.canonical: /blog/${slug}`,
  `openGraph: { type: "article", title, description, url }`.
- No explicit per-post OG image (falls back to the root `opengraph-image.png` / layout default).
- Admin routes are explicitly de-indexed: `src/app/admin/layout.tsx` →
  `metadata.robots = { index: false, follow: false, nocache: true }`.

---

## 8. Other config / registration points

- **No sitemap file exists in this repo** — `/blog` and post pages are not enumerated in any
  `sitemap.ts`/`sitemap.xml`. If you want sitemap support for the new content type, that's new work,
  not something to copy.
- **Nav entry**: `src/lib/nav-links.ts` — `{ label: "Market Notes", href: "/blog" }` in `NAV_LINKS`.
- **Footer entry**: `src/components/layout/Footer.tsx:32` — `{ label: "Market notes", href: "/blog" }`.
- **Admin section switcher**: `src/app/admin/(dashboard)/layout.tsx` lists
  `[{ href: "/admin", label: "Market notes" }, { href: "/admin/testimonials", label: "Testimonials" }]`
  — a new content type adds itself here.
- **Auth/session env**: `ADMIN_PASSWORD`, `AUTH_SECRET` gate all admin mutations;
  `src/lib/auth.ts` implements HMAC-signed session tokens with Web Crypto (Edge-compatible, used both
  in `src/proxy.ts` middleware and in server actions).
- **Route protection**: `src/proxy.ts` (`export const config = { matcher: "/admin/:path*" }`)
  redirects unauthenticated visitors to `/admin/login`, preserving `next` for return-navigation.

---

## 9. Step-by-step: replicating this for a new content type

Example: replacing `<type>` with something like `guide` / `faq` / `case-study`.

1. **Content model**: create `src/lib/<type>.ts` with a `<Type>` type and a `SEED_<TYPE>S: <Type>[]`
   array (static fallback content), mirroring `src/lib/posts.ts`.
2. **Data-access layer**: create `src/lib/<type>-repo.ts` mirroring `blog-repo.ts` — `list<Type>s`,
   `get<Type>BySlug`, `get<Type>ById` (all `cache()`-wrapped, Mongo-first with seed fallback), plus
   `create<Type>` / `update<Type>` / `delete<Type>` writes and a `seed<Type>s()` importer. Use a
   distinct Mongo collection name (e.g. `"<type>s"`).
3. **Public routes**: add `src/app/<type>/page.tsx` (index) and `src/app/<type>/[slug]/page.tsx`
   (detail, with `generateStaticParams` + `generateMetadata`), following the patterns in section 4.
4. **Admin CRUD**: add `src/app/admin/<Type>Form.tsx`, `src/app/admin/(dashboard)/<type>s/page.tsx`
   (list), `.../new/page.tsx`, `.../[id]/page.tsx`, plus server actions in a new
   `src/app/admin/<type>-actions.ts` (or extend `actions.ts`), each guarded with `requireSession()`
   and calling the equivalent of `revalidateBlog()` for the new routes.
5. **Reuse as-is**: `ImageField`, `Avatar`, `image-repo.ts` / `/api/admin/images` and
   `/api/images/[id]` — none of these are blog-specific, don't duplicate them.
6. **Register the section**: add entries to `src/lib/nav-links.ts`, `Footer.tsx`, and the admin
   dashboard's section switcher array in `src/app/admin/(dashboard)/layout.tsx`.
7. **Env/config**: no new env vars needed — the new repo module reuses `MONGODB_URI` /
   `MONGODB_DB` / `ADMIN_PASSWORD` / `AUTH_SECRET` already in place.
8. **Sitemap**: not currently implemented for blog either — treat as optional new work if you want it.
