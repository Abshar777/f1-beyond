import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  // The admin UI must never reach an index or a share card.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Minimal wrapper for everything under /admin.
 *
 * Deliberately carries no chrome. The signed-in screens get their header from
 * `(dashboard)/layout.tsx`; the login page sits outside that route group, so it
 * does not render a "Sign out" button to someone who is not signed in.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-bg">{children}</div>;
}
