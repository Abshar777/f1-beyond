import { MongoClient, type Db } from "mongodb";

/**
 * MongoDB connection, cached across hot reloads.
 *
 * Next's dev server re-evaluates modules on every edit. Creating a client at
 * module scope without this cache opens a fresh connection pool per reload and
 * exhausts the server's connection limit within a few minutes of editing, so the
 * client is parked on `globalThis` — the one object that survives HMR.
 *
 * Nothing here throws on a missing `MONGODB_URI`: the callers fall back to the
 * bundled seed content, so a checkout with no `.env.local` still builds and the
 * marketing site still renders. `isConfigured` is how callers tell the two apart.
 */
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "beyondpips";

export const isConfigured = Boolean(uri);

type Cache = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
  /** When the last connection attempt failed, for the retry cooldown below. */
  failedAt: number;
};

const globalForMongo = globalThis as typeof globalThis & {
  __beyondpipsMongo?: Cache;
};

const cache: Cache = (globalForMongo.__beyondpipsMongo ??= {
  client: null,
  promise: null,
  failedAt: 0,
});

const CONNECT_TIMEOUT_MS = 8000;

/**
 * How long to stop trying after a failed connection.
 *
 * Without this, an unreachable cluster costs the full server-selection timeout
 * *per call*. A production build renders seventeen pages, most of which read
 * posts, so a dead database turned an 8-second build into a 45-second one — and
 * in production it would add eight seconds to every request during an outage.
 * One attempt per window, then straight to the seed fallback.
 */
const RETRY_COOLDOWN_MS = 30_000;

export async function getDb(): Promise<Db | null> {
  if (!uri) return null;

  // Recently failed: do not pay the timeout again. Returning null makes callers
  // fall back to the bundled content immediately.
  if (!cache.client && Date.now() - cache.failedAt < RETRY_COOLDOWN_MS) {
    return null;
  }

  if (!cache.promise) {
    cache.promise = new MongoClient(uri, {
      // Fail fast rather than hanging a page render for 30s when the cluster is
      // unreachable or the IP is not allow-listed in Atlas.
      serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
      // Omit undefined fields instead of writing them as null. Without this an
      // optional property like `avatar?: string` is stored as `null`, which no
      // longer matches its own TypeScript type — the reads then hand back null
      // where the type promises string | undefined.
      ignoreUndefined: true,
    })
      .connect()
      .then((client) => {
        cache.client = client;
        cache.failedAt = 0;
        return client;
      })
      .catch((error) => {
        // Clear the promise so a later request can retry once the cooldown has
        // passed, rather than replaying a rejected one forever.
        cache.promise = null;
        cache.failedAt = Date.now();
        throw error;
      });
  }

  const client = await cache.promise;
  return client.db(dbName);
}
