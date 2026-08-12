import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Server-side gate for every mutating admin action.
 *
 * `proxy.ts` already keeps signed-out visitors out of the admin UI, but a server
 * action is a callable endpoint — it does not have to be reached by navigating
 * through a protected route. Without this check, anyone who knew the action id
 * could post to it directly. The proxy is convenience; this is the actual
 * authorisation.
 *
 * Lives in its own module rather than in `actions.ts` so the post and review
 * actions share one implementation. It must NOT be exported from a `"use server"`
 * file: every export of such a module becomes its own callable endpoint, and a
 * guard is not something to expose as one.
 */
export async function requireSession() {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    redirect("/admin/login");
  }
}
