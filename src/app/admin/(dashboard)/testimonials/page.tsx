import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  hasStoredTestimonials,
  listTestimonials,
} from "@/lib/testimonial-repo";
import { isConfigured } from "@/lib/mongodb";
import {
  importSeedTestimonials,
  removeTestimonial,
  reorderTestimonial,
} from "../../testimonial-actions";

/**
 * Always render fresh — a cached admin list would show an editor the review they
 * just deleted.
 */
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTestimonialsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [testimonials, stored] = await Promise.all([
    listTestimonials(),
    hasStoredTestimonials(),
  ]);

  const notice = params.saved
    ? "Review saved."
    : params.deleted
      ? "Review deleted."
      : params.moved
        ? "Order updated."
        : params.imported
          ? `Imported ${params.imported} starter review${params.imported === "1" ? "" : "s"}.`
          : null;

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-mona text-[24px] font-medium tracking-[-0.025em] text-primary">
            Testimonials
          </h1>
          <p className="mt-1 font-mona text-[13.5px] text-text">
            {testimonials.length} review{testimonials.length === 1 ? "" : "s"}
            {stored
              ? " · stored in MongoDB"
              : " · showing bundled starter content"}
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="gold-surface rounded-md bg-secondary px-4 py-2.5 font-mona text-[13.5px] font-medium text-primary"
        >
          New review
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
          list below is the bundled starter content, and saving will fail. Add
          the connection string to <code>.env.local</code> and restart the dev
          server.
        </p>
      )}

      {isConfigured && !stored && (
        <div className="mb-6 rounded-md border border-primary/12 bg-white px-4 py-4">
          <p className="mb-3 font-mona text-[13.5px] leading-[165%] text-text">
            The database is connected but has no reviews yet, so the carousel is
            showing the six bundled ones. Import them to make them editable.
          </p>
          <form action={importSeedTestimonials}>
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-primary/15 px-3.5 py-2 font-mona text-[13px] font-medium text-primary transition-colors duration-200 hover:border-secondary hover:text-secondary"
            >
              Import starter reviews
            </button>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-[12px] border border-primary/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="bg-bg">
                {["#", "", "Reviewer", "Quote", "Rating", ""].map((heading, i) => (
                  <th
                    // The avatar and the actions columns are intentionally
                    // unlabelled, so the key falls back to the index.
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
              {testimonials.map((testimonial, index) => (
                <tr
                  key={testimonial.slug}
                  className="border-t border-primary/[0.07]"
                >
                  {/* Position, with the arrows that change it. Disabled at the
                      ends rather than hidden, so the column keeps its width and
                      rows do not jog sideways as you move one down the list. */}
                  <td className="py-4 pl-5">
                    <div className="flex items-center gap-2">
                      <span className="w-4 font-mona text-[13px] tabular-nums text-text">
                        {testimonial.order}
                      </span>
                      {testimonial.id && (
                        <span className="flex flex-col gap-[2px]">
                          {(
                            [
                              ["up", index === 0, "Move up"],
                              ["down", index === testimonials.length - 1, "Move down"],
                            ] as const
                          ).map(([direction, atEnd, label]) => (
                            <form key={direction} action={reorderTestimonial}>
                              <input type="hidden" name="id" value={testimonial.id} />
                              <input type="hidden" name="direction" value={direction} />
                              <button
                                type="submit"
                                disabled={atEnd}
                                aria-label={`${label}: ${testimonial.name}`}
                                className="flex h-[15px] w-5 cursor-pointer items-center justify-center rounded-[3px] border border-primary/12 text-text transition-colors duration-200 hover:border-secondary hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-primary/12 disabled:hover:text-text"
                              >
                                {direction === "up" ? (
                                  <ChevronUp size={11} strokeWidth={2.6} aria-hidden />
                                ) : (
                                  <ChevronDown size={11} strokeWidth={2.6} aria-hidden />
                                )}
                              </button>
                            </form>
                          ))}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pl-4">
                    {testimonial.photo ? (
                      <img
                        src={testimonial.photo}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-full border border-primary/10 bg-bg object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-mona text-[13.5px] font-medium text-secondary uppercase"
                      >
                        {testimonial.initial}
                      </span>
                    )}
                  </td>
                  <th scope="row" className="max-w-[200px] py-4 pr-5 pl-4">
                    <span className="block font-mona text-[14.5px] font-medium text-primary">
                      {testimonial.name}
                    </span>
                    <span className="mt-0.5 block font-mona text-[12px] text-text">
                      {testimonial.role}
                    </span>
                  </th>
                  <td className="max-w-[380px] px-5 py-4 font-mona text-[13px] leading-[160%] text-text">
                    {/* Clamped to two lines: the full quote would make every row
                        a different height and the table hard to scan. */}
                    <span className="line-clamp-2">{testimonial.quote}</span>
                  </td>
                  <td className="px-5 py-4 font-mona text-[13.5px] whitespace-nowrap text-text">
                    {testimonial.rating}/5
                  </td>
                  <td className="px-5 py-4">
                    {testimonial.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/testimonials/${testimonial.id}`}
                          className="rounded-md border border-primary/12 px-3 py-1.5 font-mona text-[12.5px] font-medium text-primary transition-colors duration-200 hover:border-secondary hover:text-secondary"
                        >
                          Edit
                        </Link>
                        <form action={removeTestimonial}>
                          <input
                            type="hidden"
                            name="id"
                            value={testimonial.id}
                          />
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
