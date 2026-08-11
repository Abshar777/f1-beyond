/**
 * Generated initial avatars, for authors with no photo.
 *
 * The colour is derived from the name rather than picked at random or by list
 * position: the same author must get the same colour on the index, in the post
 * header and in the admin, and a random pick would change on every render (and
 * differ between the server and client render, which is a hydration mismatch).
 */

/**
 * Muted, saturated tones that sit beside the gold without competing with it.
 * Each is dark enough for the light foreground to clear contrast comfortably.
 */
const PALETTE = [
  { bg: "#1f5f4f", fg: "#e8f6f1" }, // teal
  { bg: "#5b3a6e", fg: "#f3ebf8" }, // plum
  { bg: "#2f4a7a", fg: "#e9eff9" }, // indigo
  { bg: "#8a4b2a", fg: "#fbeee6" }, // clay
  { bg: "#4a5a26", fg: "#f0f4e4" }, // olive
  { bg: "#7a2f3f", fg: "#fbe9ec" }, // burgundy
  { bg: "#33475b", fg: "#e9eef3" }, // slate
  { bg: "#8a6a16", fg: "#fdf4dc" }, // bronze, the closest to the brand gold
];

/**
 * FNV-1a. Any stable hash would do; the point is that it is deterministic and
 * spreads similar names (two authors called "Marcus …") across different
 * buckets rather than clustering them.
 */
function hash(value: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function avatarColours(name: string) {
  return PALETTE[hash(name.trim().toLowerCase()) % PALETTE.length];
}

/**
 * First letter of the first and last words — "Marcus Reed" → "MR". A
 * single-word name uses its first two letters, so "Beyondpips" → "BE" rather
 * than a lonely "B".
 */
export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
