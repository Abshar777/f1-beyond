import Link from "next/link";
import { signOut } from "../actions";

/**
 * Chrome for the signed-in admin screens.
 *
 * A route group, so it applies to /admin, /admin/posts/new and
 * /admin/posts/[id] without adding a URL segment — and without reaching
 * /admin/login, which must not show a sign-out control.
 *
 * Sign-out is a form posting to a server action rather than a link: it mutates
 * session state, and a link would be vulnerable to being triggered by a
 * prefetch or a crawler.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-primary/10 bg-white">
        <div className="mx-auto flex w-full max-w-[1100px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <img
                src="/assets/imgs/logo/logo-dark.png"
                alt="Beyondpips"
                className="h-7 w-auto"
              />
            </Link>
            <span className="rounded-full bg-primary/[0.06] px-2.5 py-1 font-mona text-[11px] font-semibold tracking-[0.08em] text-text uppercase">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="font-mona text-[13.5px] font-medium text-text transition-colors hover:text-secondary"
            >
              View blog
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="cursor-pointer rounded-md border border-primary/12 px-3.5 py-2 font-mona text-[13px] font-medium text-primary transition-colors duration-200 hover:border-secondary hover:text-secondary"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
        {children}
      </main>
    </>
  );
}
