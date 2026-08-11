import Link from "next/link";
import { hasStoredPosts, listPosts } from "@/lib/blog-repo";
import { isConfigured } from "@/lib/mongodb";
import { formatPostDate } from "@/lib/posts";
import Avatar from "@/components/ui/Avatar";
import { importSeedPosts, removePost } from "../actions";

/**
 * Always render fresh — a cached admin list would show an author the note they
 * just deleted.
 */
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminPostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [posts, stored] = await Promise.all([listPosts(), hasStoredPosts()]);

  const notice = params.saved
    ? "Note saved."
    : params.deleted
      ? "Note deleted."
      : params.imported
        ? `Imported ${params.imported} starter note${params.imported === "1" ? "" : "s"}.`
        : null;

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-mona text-[24px] font-medium tracking-[-0.025em] text-primary">
            Market notes
          </h1>
          <p className="mt-1 font-mona text-[13.5px] text-text">
            {posts.length} note{posts.length === 1 ? "" : "s"}
            {stored ? " · stored in MongoDB" : " · showing bundled starter content"}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="gold-surface rounded-md bg-secondary px-4 py-2.5 font-mona text-[13.5px] font-medium text-primary"
        >
          New note
        </Link>
      </div>

      {notice && (
        <p className="mb-6 rounded-md border border-secondary/30 bg-secondary/[0.08] px-4 py-3 font-mona text-[13.5px] text-primary">
          {notice}
        </p>
      )}

      {/* Two different problems, two different messages: no database at all
          versus a database that is simply still empty. */}
      {!isConfigured && (
        <p className="mb-6 rounded-md border border-red/20 bg-red/[0.06] px-4 py-3 font-mona text-[13.5px] leading-[165%] text-red">
          <strong className="font-semibold">MONGODB_URI is not set.</strong> The
          list below is the bundled starter content, and saving will fail. Add the
          connection string to <code>.env.local</code> and restart the dev server.
        </p>
      )}

      {isConfigured && !stored && (
        <div className="mb-6 rounded-md border border-primary/12 bg-white px-4 py-4">
          <p className="mb-3 font-mona text-[13.5px] leading-[165%] text-text">
            The database is connected but has no notes yet, so the blog is showing
            the six bundled starter notes. Import them to make them editable.
          </p>
          <form action={importSeedPosts}>
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-primary/15 px-3.5 py-2 font-mona text-[13px] font-medium text-primary transition-colors duration-200 hover:border-secondary hover:text-secondary"
            >
              Import starter notes
            </button>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-[12px] border border-primary/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="bg-bg">
                {["", "Note", "Category", "Author", "Published", ""].map((heading, i) => (
                  <th
                    // Two columns are intentionally unlabelled — the thumbnail
                    // and the actions — so the key falls back to the index.
                    key={heading || `col-${i}`}
                    scope="col"
                    className="px-5 py-3 font-mona text-[11.5px] font-semibold tracking-[0.07em] text-text uppercase"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.slug} className="border-t border-primary/[0.07]">
                  <td className="py-4 pl-5">
                    {/* Fixed box with object-cover so a portrait upload cannot
                        stretch the row. The cover is the fastest way to spot the
                        right note in a list of similar titles. */}
                    <img
                      src={post.image}
                      alt=""
                      className="h-11 w-[72px] shrink-0 rounded border border-primary/10 bg-bg object-cover"
                    />
                  </td>
                  <th scope="row" className="max-w-[380px] py-4 pr-5 pl-4">
                    <span className="block font-mona text-[14.5px] font-medium text-primary">
                      {post.title}
                    </span>
                    <span className="mt-0.5 block font-mona text-[12px] text-text">
                      /blog/{post.slug}
                    </span>
                  </th>
                  <td className="px-5 py-4 font-mona text-[13.5px] text-text">
                    {post.category}
                  </td>
                  <td className="px-5 py-4 font-mona text-[13.5px] text-text">
                    <span className="flex items-center gap-2">
                      <Avatar name={post.author} src={post.avatar} size={24} />
                      {post.author}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mona text-[13.5px] whitespace-nowrap text-text">
                    {formatPostDate(post.publishedAt)}
                  </td>
                  <td className="px-5 py-4">
                    {post.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="rounded-md border border-primary/12 px-3 py-1.5 font-mona text-[12.5px] font-medium text-primary transition-colors duration-200 hover:border-secondary hover:text-secondary"
                        >
                          Edit
                        </Link>
                        <form action={removePost}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="slug" value={post.slug} />
                          <button
                            type="submit"
                            className="cursor-pointer rounded-md border border-red/25 px-3 py-1.5 font-mona text-[12.5px] font-medium text-red transition-colors duration-200 hover:bg-red/[0.07]"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    ) : (
                      // Seed records have no _id, so there is nothing to update
                      // or delete until they are imported.
                      <span className="block text-right font-mona text-[12px] text-text/70">
                        not imported
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
