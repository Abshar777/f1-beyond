/**
 * Reviews shown in the testimonials carousel.
 *
 * Mirrors `lib/posts.ts`: a `Testimonial` type plus the bundled records the site
 * ships with. `slug` is the stable key — testimonials have no public URL of
 * their own, but the carousel needs a key that survives a re-render and the
 * database needs something unique to index, and deriving both from the name
 * gives one value that does each job.
 */
export type Testimonial = {
  /** Mongo `_id`. Absent on bundled seed records, which cannot be edited. */
  id?: string;
  /** Stable unique key, derived from the name. */
  slug: string;
  /** Letter in the avatar badge. Derived from the name unless overridden. */
  initial: string;
  name: string;
  /** The line under the name — instrument and how long they have traded. */
  role: string;
  quote: string;
  /** Filled stars, 1–5. */
  rating: number;
  /**
   * Reviewer photo. Absent means the card falls back to the `initial` badge,
   * which is the deliberate default — most reviewers do not send a headshot.
   */
  photo?: string;
  /**
   * Position in the carousel, 1-based and contiguous.
   *
   * Every mutation renumbers the whole list to 1..n (see `renumber` in
   * `testimonial-repo.ts`), so this is always a dense sequence with no gaps or
   * duplicates. That is what makes the position field in the editor mean what it
   * says: "put this one third" is unambiguous only if the third slot is unique.
   */
  order: number;
};

/** First letter of the name, for the badge. Falls back to a dot when empty. */
export function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase() || "·";
}

/** Name → stable key: lowercase, hyphenated, punctuation dropped. */
export function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const SEED_TESTIMONIALS: Testimonial[] = [
  {
    slug: "emily-e-carter",
    initial: "E",
    name: "Emily E. Carter",
    role: "Forex · 2 years trading",
    rating: 5,
    order: 1,
    quote:
      "I could read a candle and nothing else when I started. The risk rules alone changed how I size every trade — I stopped blowing up accounts by month two.",
  },
  {
    slug: "eleanor-e-pena",
    initial: "E",
    name: "Eleanor E. Pena",
    role: "Crypto · 1 year trading",
    rating: 5,
    order: 2,
    quote:
      "The live sessions are the difference. Watching a mentor talk through an entry in real time, on a real chart, beats any recorded course I have bought.",
  },
  {
    slug: "marcus-hale",
    initial: "M",
    name: "Marcus Hale",
    role: "Indices · 8 months trading",
    rating: 5,
    order: 3,
    quote:
      "What sold me was being told to stop trading for two weeks and just journal setups. Nobody selling signals tells you that. My win rate went up when I traded less.",
  },
  {
    slug: "priya-raghavan",
    initial: "P",
    name: "Priya Raghavan",
    role: "Commodities · 3 years trading",
    rating: 5,
    order: 4,
    quote:
      "I came in already profitable and still got value. The position-sizing framework replaced the gut-feel approach I had been getting away with for two years.",
  },
  {
    slug: "daniel-okoro",
    initial: "D",
    name: "Daniel Okoro",
    role: "Forex · 1 year trading",
    rating: 5,
    order: 5,
    quote:
      "The psychology track is the part I did not think I needed. Turns out my problem was never the strategy — it was moving my stop after I was already wrong.",
  },
  {
    slug: "sofia-marchetti",
    initial: "S",
    name: "Sofia Marchetti",
    role: "Crypto & metals · 6 months trading",
    rating: 5,
    order: 6,
    quote:
      "I finished with a written plan I actually follow, and a mentor who reviewed it line by line. That review was worth more than the rest of the course combined.",
  },
];
