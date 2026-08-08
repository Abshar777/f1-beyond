/**
 * Market-notes content, shared by the homepage `Blog2` strip (first three) and
 * the `/blog` index and detail routes.
 *
 * Placeholder editorial written in the desk's voice — replace with real posts
 * before launch. Dates are absolute rather than relative so nothing silently
 * ages, and every slug is stable because the detail route is generated from it.
 */
export type Post = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  avatar: string;
  author: string;
  date: string;
  readMinutes: number;
  body: string[];
};

export const POSTS: Post[] = [
  {
    slug: "position-sizing-keeps-traders-solvent",
    category: "Risk",
    title: "Position sizing: the one habit that keeps traders solvent",
    excerpt:
      "Most blown accounts are not the result of bad analysis. They are the result of a good idea sized badly.",
    image: "/assets/imgs/stock/trading-charts-1.jpg",
    avatar: "/assets/imgs/home2/blog/blog-user2_1.webp",
    author: "Marcus Reed",
    date: "May 15, 2026",
    readMinutes: 6,
    body: [
      "Ask a struggling trader why they lost the account and you will usually hear something about a strategy that stopped working. Look at the trade log and you will almost always find something duller: three or four positions that were far too large for the balance behind them.",
      "Sizing is the part of the process that decides whether being wrong is survivable. A trader who risks one percent per idea can be wrong eight times in a row and still have most of the account. At ten percent, that same run is over.",
      "The mechanics are not complicated. Decide what a single idea is allowed to cost, in currency, before you look for the entry. Measure the distance to the level that invalidates the trade. Divide the first by the second, multiplied by the value of a pip at one lot, and you have your size. Our pip calculator does the arithmetic — the discipline is deciding the number before the chart tempts you to change it.",
      "The uncomfortable part is that correct sizing makes your winners smaller. That is the trade. You are buying the right to stay at the desk long enough for a real edge to show up.",
    ],
  },
  {
    slug: "reading-crypto-liquidity-before-entry",
    category: "Crypto",
    title: "Reading crypto liquidity before you take the entry",
    excerpt:
      "A level is only a level if there is size behind it. In crypto, that changes hour to hour.",
    image: "/assets/imgs/stock/trading-screens.jpg",
    avatar: "/assets/imgs/home2/blog/blog-user2_2.webp",
    author: "Olivia Chen",
    date: "May 25, 2026",
    readMinutes: 7,
    body: [
      "Crypto markets do not keep office hours, but their liquidity does. The same support that held cleanly during the London overlap can be cut straight through at three in the morning, on a book a fraction of the depth.",
      "Before taking a level seriously, check what is actually resting there. Thin books produce the long wicks that stop you out and then reverse — not because the analysis was wrong, but because there was not enough size to absorb a modest market order.",
      "Practically, this means treating time of day as part of the setup rather than an afterthought. Note when volume genuinely arrives on the pairs you trade, and be honest about whether a level formed in that window or in the quiet hours.",
      "None of this is a reason to avoid crypto. It is a reason to size smaller when the book is thin, and to stop blaming the strategy for a fill that liquidity was never going to honour.",
    ],
  },
  {
    slug: "why-traders-break-their-own-rules",
    category: "Psychology",
    title: "Why most traders break their own rules — and how to stop",
    excerpt:
      "Nobody moves a stop because they forgot the plan. They move it because the plan started to hurt.",
    image: "/assets/imgs/stock/seminar-stage.jpg",
    avatar: "/assets/imgs/home2/blog/blog-user2_3.webp",
    author: "Daniel Roberts",
    date: "Jun 28, 2026",
    readMinutes: 5,
    body: [
      "Every trader who has moved a stop knew, at the moment they moved it, that they should not. The rule was not unclear and it had not been forgotten. It was simply less painful to widen the risk than to accept being wrong.",
      "This is why writing the plan is only half the work. A rule that lives in your head is negotiable in the moment; a rule written down, with the reasoning beside it, is much harder to argue with while a position is open.",
      "The intervention that helps most is boring: journal the decision, not the outcome. Record what you intended, what you actually did, and which of the two you would repeat. Patterns surface within a fortnight, and they are rarely about entries.",
      "Discipline is not a personality trait some traders were issued. It is the residue of having watched your own log tell you the same thing enough times.",
    ],
  },
  {
    slug: "what-a-trading-journal-should-record",
    category: "Process",
    title: "What a trading journal should actually record",
    excerpt:
      "Logging profit and loss tells you what happened. It does not tell you why, which is the only useful part.",
    image: "/assets/imgs/stock/trading-desk.jpg",
    avatar: "/assets/imgs/home2/blog/blog-user2_1.webp",
    author: "Marcus Reed",
    date: "Jul 9, 2026",
    readMinutes: 6,
    body: [
      "Most journals are a list of results. That is a scoreboard, not a diagnostic. A profitable month full of rule breaks is a worse sign than a flat month traded exactly to plan, and a results-only log cannot tell the difference.",
      "Record the setup you thought you saw, the level that would invalidate it, the size you took and why, and — critically — whether you followed your own rules. Outcome goes in last, because it is the least informative field.",
      "Review weekly, not per trade. Single trades are noise; ten of them start to show whether your losses cluster around a particular session, instrument or state of mind.",
      "The goal is not a tidy spreadsheet. It is being able to answer, with evidence, the question of whether your process or your discipline is the thing costing you money.",
    ],
  },
  {
    slug: "spreads-slippage-and-the-real-cost-of-a-trade",
    category: "Execution",
    title: "Spreads, slippage and the real cost of a trade",
    excerpt:
      "The entry you planned and the entry you got are rarely the same price. Over a year, that gap is a strategy.",
    image: "/assets/imgs/stock/trading-laptop.jpg",
    avatar: "/assets/imgs/home2/blog/blog-user2_2.webp",
    author: "Olivia Chen",
    date: "Jul 22, 2026",
    readMinutes: 5,
    body: [
      "Backtests are run at the price you asked for. Live accounts are filled at the price available. On a strategy taking several trades a day, the difference between those two numbers is often larger than the edge being tested.",
      "Spread is the visible part and the easier one to plan around: know what your instrument typically costs to cross, and avoid the minutes around a release when it widens. Slippage is harder, because it shows up precisely when you most wanted the fill.",
      "Measure both. Log the price you intended against the price you received, and after fifty trades you will have a realistic figure for what execution is costing you. Most traders are surprised, and not upward.",
      "Then decide whether the strategy still has an edge after that cost. If it does not, you have learned something far more valuable than another indicator.",
    ],
  },
  {
    slug: "how-much-capital-to-start-trading",
    category: "Getting started",
    title: "How much capital do you actually need to start?",
    excerpt:
      "Less than the adverts suggest, and more than the people selling you a course usually admit.",
    image: "/assets/imgs/stock/trading-chart-2.jpg",
    avatar: "/assets/imgs/home2/blog/blog-user2_3.webp",
    author: "Daniel Roberts",
    date: "Aug 4, 2026",
    readMinutes: 6,
    body: [
      "To learn: nothing. A demo account teaches candles, order types, sessions and the mechanics of your platform perfectly well, and you should stay on one until your journal shows a process you can repeat.",
      "To trade meaningfully: enough that correct position sizing is still possible. If one percent of the balance is smaller than the minimum position your broker will accept, the account is not too small to trade — it is too small to trade *properly*, which is a different and more serious problem.",
      "That threshold depends on the instrument and the contract size, not on ambition. Run the numbers for the pair you actually intend to trade before funding anything.",
      "And the part rarely said out loud: only fund an account with money whose loss would change nothing about your month. Most retail traders lose money. Sizing your capital honestly is the first risk decision you make, and you make it before you place a single trade.",
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((post) => post.slug === slug);
}
