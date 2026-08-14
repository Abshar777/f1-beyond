"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

/**
 * Live trade tape — real executed trades, straight from the exchange.
 *
 * The socket is opened by the *browser*, not the server, which is the whole
 * reason this is affordable: a tape ticking ~24 times a second costs zero
 * function invocations and zero bandwidth on our host, because the data never
 * passes through it. There is no route handler behind this component.
 *
 * Crypto rather than FX or spot metals, and not for want of trying: FX is
 * over-the-counter, so no consolidated tape exists to subscribe to. Anything
 * advertising "live forex trades" is showing quotes or one broker's own fills.
 * XAUT is included as the metals bridge — tokenised gold that tracks spot
 * closely — and is labelled as such on screen rather than passed off as
 * XAU/USD.
 */

type StreamConfig = {
  /** Binance symbol, lowercase, as it appears in the stream name. */
  symbol: string;
  label: string;
  priceDp: number;
  qtyDp: number;
  /**
   * Trades smaller than this in USD are dropped.
   *
   * Not cosmetic. BTC alone prints ~24 trades a second, most of them dust worth
   * a few dollars, which turns the whole list over twice a second and buries the
   * thinner instruments entirely. The threshold is stated on screen — a filtered
   * tape that says so is honest; one that quietly hides trades is not.
   */
  minNotional: number;
  note?: string;
};

/** The floor applied to everything that is not gold. */
const MAJOR_FLOOR = 500;
/** The lower floor the gold books get — see the note on the gold entries. */
const GOLD_FLOOR = 50;

const STREAMS: StreamConfig[] = [
  { symbol: "btcusdt", label: "BTC/USDT", priceDp: 2, qtyDp: 5, minNotional: MAJOR_FLOOR },
  { symbol: "ethusdt", label: "ETH/USDT", priceDp: 2, qtyDp: 4, minNotional: MAJOR_FLOOR },
  // Two gold-backed tokens rather than one. They are separate instruments with
  // their own books and their own prices — XAUT and PAXG were 0.3% apart when
  // this was written — so showing both is a fairer picture of tokenised gold
  // than picking a winner, and it roughly doubles how often gold prints.
  //
  // Both carry a $50 floor instead of the majors' $500: gold prints a fraction
  // as often as BTC here, and at $500 it would scroll past almost never, which
  // defeats the point of including it.
  {
    symbol: "xautusdt",
    label: "XAUT/USDT",
    priceDp: 2,
    qtyDp: 4,
    minNotional: GOLD_FLOOR,
    note: "tokenised gold",
  },
  {
    symbol: "paxgusdt",
    label: "PAXG/USDT",
    priceDp: 2,
    qtyDp: 4,
    minNotional: GOLD_FLOOR,
    note: "tokenised gold",
  },
];

const BY_SYMBOL = new Map(STREAMS.map((s) => [s.symbol.toUpperCase(), s]));

const WS_URL = `wss://stream.binance.com:9443/stream?streams=${STREAMS.map(
  (s) => `${s.symbol}@trade`,
).join("/")}`;

/** Enough to fill the panel and give a sense of history; older rows are dropped. */
const MAX_ROWS = 40;

/**
 * How often buffered trades are flushed into React state.
 *
 * The socket delivers ~24 messages a second. Calling setState on each one would
 * mean 24 renders a second of a 40-row list, for updates far faster than anyone
 * can read. Messages accumulate in a ref and land in one render per tick.
 */
const FLUSH_MS = 250;

/** Reconnect backoff: 1s, 2s, 4s, 8s, 16s, then hold at 30s. */
const backoffMs = (attempt: number) => Math.min(1000 * 2 ** attempt, 30_000);

type Trade = {
  key: string;
  label: string;
  note?: string;
  price: number;
  qty: number;
  notional: number;
  side: "buy" | "sell";
  at: number;
  priceDp: number;
  qtyDp: number;
};

type Status = "connecting" | "live" | "reconnecting";

/** Local wall-clock HH:MM:SS. Hand-rolled to match the rest of the codebase. */
function clock(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function group(value: string) {
  const [whole, fraction] = value.split(".");
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${spaced}.${fraction}` : spaced;
}

const money = (n: number, dp: number) => group(n.toFixed(dp));

/** Binance `m` is "buyer is the maker" — so the aggressor was the seller. */
const sideOf = (buyerIsMaker: boolean): Trade["side"] =>
  buyerIsMaker ? "sell" : "buy";

function toTrade(
  config: StreamConfig,
  raw: { t: number; p: string; q: string; T: number; m: boolean },
): Trade | null {
  const price = Number(raw.p);
  const qty = Number(raw.q);
  if (!Number.isFinite(price) || !Number.isFinite(qty)) return null;

  const notional = price * qty;
  if (notional < config.minNotional) return null;

  return {
    key: `${config.symbol}-${raw.t}`,
    label: config.label,
    note: config.note,
    price,
    qty,
    notional,
    side: sideOf(raw.m),
    at: raw.T,
    priceDp: config.priceDp,
    qtyDp: config.qtyDp,
  };
}

export default function LiveTape() {
  const [trades, setTrades] = useState<Trade[]>([]);
  /**
   * Most recent print per instrument, held separately from `trades`.
   *
   * Not derived from the row buffer, which was the original mistake: BTC and ETH
   * between them fill all 40 rows within a minute, so the far thinner gold book
   * scrolls out of the window and its price reverted to "waiting for a print" —
   * the exact failure the strip exists to prevent. Nothing is evicted from here.
   */
  const [latest, setLatest] = useState<Record<string, Trade>>({});
  const [status, setStatus] = useState<Status>("connecting");
  /** Seconds until the next reconnect attempt, for the badge. */
  const [retryIn, setRetryIn] = useState(0);

  const bufferRef = useRef<Trade[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── flush the buffer on a fixed tick rather than per message ──
  useEffect(() => {
    const id = setInterval(() => {
      if (bufferRef.current.length === 0) return;
      const incoming = bufferRef.current;
      bufferRef.current = [];
      // Sorted, not just prepended in arrival order. The three streams come off
      // different matching engines, so a batch can carry an ETH print stamped a
      // second before a BTC print that arrived earlier — which showed up as the
      // bottom row of the tape being newer than the top one.
      setTrades((current) =>
        [...incoming, ...current].sort((a, b) => b.at - a.at).slice(0, MAX_ROWS),
      );
      setLatest((current) => {
        const next = { ...current };
        for (const trade of incoming) {
          // Guarded rather than assigned blindly: a batch is not strictly
          // time-ordered, so the last one seen is not always the newest.
          if (!next[trade.label] || trade.at >= next[trade.label].at) {
            next[trade.label] = trade;
          }
        }
        return next;
      });
    }, FLUSH_MS);
    return () => clearInterval(id);
  }, []);

  // ── socket lifecycle ──
  //
  // Deliberately one effect owning plain local functions rather than a set of
  // `useCallback`s. The retry path has to call `connect` from inside `connect`,
  // and a self-referencing `useCallback` is both a lint error and a real
  // footgun: the identity captured by the timer is the *previous* render's. A
  // function declaration recurses correctly and needs no dependency bookkeeping.
  useEffect(() => {
    let stopped = false;

    const clearTimers = () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      retryTimerRef.current = null;
      countdownRef.current = null;
    };

    function scheduleRetry() {
      if (stopped) return;
      clearTimers();

      const wait = backoffMs(attemptRef.current);
      attemptRef.current += 1;

      setRetryIn(Math.ceil(wait / 1000));
      countdownRef.current = setInterval(
        () => setRetryIn((n) => (n > 0 ? n - 1 : 0)),
        1000,
      );
      retryTimerRef.current = setTimeout(connect, wait);
    }

    function connect() {
      if (stopped) return;

      let socket: WebSocket;
      try {
        socket = new WebSocket(WS_URL);
      } catch {
        // Constructing can throw outright behind a proxy that blocks wss.
        scheduleRetry();
        return;
      }
      socketRef.current = socket;

      socket.onopen = () => {
        attemptRef.current = 0;
        clearTimers();
        setRetryIn(0);
        setStatus("live");
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string) as {
            data?: { s?: string; t: number; p: string; q: string; T: number; m: boolean };
          };
          const payload = message.data;
          if (!payload?.s) return;

          const config = BY_SYMBOL.get(payload.s);
          if (!config) return;

          const trade = toTrade(config, payload);
          if (trade) bufferRef.current.push(trade);
        } catch {
          // A single malformed frame is not worth tearing the connection down for.
        }
      };

      // `onclose` fires after `onerror` too, so retry is scheduled in one place.
      socket.onerror = () => socket.close();
      socket.onclose = () => {
        if (stopped) return;
        setStatus("reconnecting");
        scheduleRetry();
      };
    }

    const open = () => {
      const existing = socketRef.current;
      if (existing && existing.readyState <= WebSocket.OPEN) return;
      setStatus("connecting");
      connect();
    };

    const close = () => {
      clearTimers();
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket) {
        // Detached first: otherwise this deliberate close runs the retry path
        // and reconnects a tab nobody is looking at.
        socket.onclose = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.close();
      }
    };

    // A backgrounded tab holding a socket open is bandwidth and battery spent on
    // rows nobody can see, and it comes back to a list of stale trades anyway.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        close();
        setStatus("reconnecting");
      } else {
        attemptRef.current = 0;
        open();
      }
    };

    if (document.visibilityState === "visible") open();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisibility);
      close();
    };
  }, []);

  // ── seed from recent trades so the panel is never empty ──
  //
  // One REST call per instrument, from the browser, on mount. It fills the tape
  // immediately instead of leaving skeleton rows until the first trade prints —
  // which for the thinner gold book could be a minute of nothing.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const seeded = await Promise.all(
        STREAMS.map(async (config) => {
          try {
            const response = await fetch(
              // 200, not MAX_ROWS: most prints are dust that `minNotional`
              // discards, so seeding 40 raw trades survived as about five rows.
              `https://api.binance.com/api/v3/trades?symbol=${config.symbol.toUpperCase()}&limit=200`,
              { cache: "no-store" },
            );
            if (!response.ok) return [];
            const rows = (await response.json()) as {
              id: number; price: string; qty: string; time: number; isBuyerMaker: boolean;
            }[];
            return rows
              .map((row) =>
                toTrade(config, {
                  t: row.id, p: row.price, q: row.qty, T: row.time, m: row.isBuyerMaker,
                }),
              )
              .filter((t): t is Trade => t !== null);
          } catch {
            return [];
          }
        }),
      );

      if (cancelled) return;

      const rows = seeded.flat().sort((a, b) => b.at - a.at).slice(0, MAX_ROWS);
      // Merged behind whatever the socket already delivered, so a seed that
      // resolves late cannot push live trades off the top of the list.
      setTrades((current) => {
        if (rows.length === 0) return current;
        const known = new Set(current.map((t) => t.key));
        return [...current, ...rows.filter((t) => !known.has(t.key))]
          .sort((a, b) => b.at - a.at)
          .slice(0, MAX_ROWS);
      });
      setLatest((current) => {
        const next = { ...current };
        for (const trade of rows) {
          if (!next[trade.label] || trade.at >= next[trade.label].at) {
            next[trade.label] = trade;
          }
        }
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="live-tape"
      className="bg-bg py-20 min-[1400px]:py-[90px] min-[1920px]:py-[130px]"
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="left"
          eyebrow="live tape"
          title={
            <>
              Real trades, as they <em>print</em>
            </>
          }
        />

        {/* ── per-instrument strip ── */}
        <Reveal stagger className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STREAMS.map((config) => {
            const trade = latest[config.label];
            return (
            <div
              key={config.label}
              className="rounded-[10px] border border-primary/10 bg-white px-5 py-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mona text-[13px] font-medium text-primary">
                  {config.label}
                </span>
                {config.note && (
                  <span className="font-mona text-[10.5px] text-text/70">
                    {config.note}
                  </span>
                )}
              </div>
              <span className="mt-1.5 block font-mona text-[21px] leading-none font-medium tabular-nums text-primary">
                {trade ? money(trade.price, config.priceDp) : "—"}
              </span>
              <span className="mt-1.5 block font-mona text-[11.5px] text-text">
                {trade ? `last print ${clock(trade.at)}` : "waiting for a print"}
              </span>
            </div>
            );
          })}
        </Reveal>

        {/* ── tape ── */}
        <Reveal>
          <div className="overflow-hidden rounded-[12px] border border-primary/10 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 px-5 py-3.5 sm:px-6">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className={`h-[7px] w-[7px] shrink-0 rounded-full ${
                    status === "live"
                      ? "animate-tape-pulse bg-green"
                      : "bg-text/40"
                  }`}
                />
                <span className="font-mona text-[12.5px] font-medium text-primary">
                  {status === "live"
                    ? "Live"
                    : status === "connecting"
                      ? "Connecting…"
                      : "Reconnecting"}
                </span>
                {/* The honest version of a dropped feed: the rows stay, and the
                    badge says they are not moving rather than implying they are. */}
                {status !== "live" && trades.length > 0 && (
                  <span className="font-mona text-[11.5px] text-text">
                    showing last received
                    {retryIn > 0 ? ` · retrying in ${retryIn}s` : ""}
                  </span>
                )}
              </div>
              <span className="font-mona text-[11.5px] text-text/80">
                Prints over ${MAJOR_FLOOR} · gold over ${GOLD_FLOOR} · exchange
                feed
              </span>
            </div>

            {/* Its own scroll container, so the page body never scrolls sideways. */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="bg-bg">
                    {["Time", "Instrument", "Side", "Size", "Price", "Value"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="px-5 py-2.5 font-mona text-[11px] font-semibold tracking-[0.07em] text-text uppercase sm:px-6"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {trades.length === 0
                    ? // Skeleton rows rather than an empty box: the panel keeps
                      // its height, so nothing below it jumps when data lands.
                      Array.from({ length: 8 }, (_, i) => (
                        <tr key={`skeleton-${i}`} className="border-t border-primary/[0.06]">
                          {Array.from({ length: 6 }, (__, cell) => (
                            <td key={cell} className="px-5 py-[11px] sm:px-6">
                              <span className="block h-[9px] w-full max-w-[80px] rounded-full bg-primary/[0.06]" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : trades.map((trade) => (
                        <tr
                          key={trade.key}
                          className="tape-row border-t border-primary/[0.06]"
                        >
                          <td className="px-5 py-[11px] font-mona text-[12.5px] tabular-nums whitespace-nowrap text-text sm:px-6">
                            {clock(trade.at)}
                          </td>
                          <td className="px-5 py-[11px] font-mona text-[12.5px] font-medium whitespace-nowrap text-primary sm:px-6">
                            {trade.label}
                          </td>
                          <td className="px-5 py-[11px] sm:px-6">
                            {/* Gold and slate, not the usual green/red — the
                                palette is the brand's, and red is reserved for
                                errors everywhere else on this site. */}
                            <span
                              className={`font-mona text-[12px] font-semibold tracking-[0.04em] uppercase ${
                                trade.side === "buy" ? "text-secondary" : "text-text"
                              }`}
                            >
                              {trade.side}
                            </span>
                          </td>
                          <td className="px-5 py-[11px] font-mona text-[12.5px] tabular-nums whitespace-nowrap text-text sm:px-6">
                            {money(trade.qty, trade.qtyDp)}
                          </td>
                          <td className="px-5 py-[11px] font-mona text-[12.5px] font-medium tabular-nums whitespace-nowrap text-primary sm:px-6">
                            {money(trade.price, trade.priceDp)}
                          </td>
                          <td className="px-5 py-[11px] font-mona text-[12.5px] tabular-nums whitespace-nowrap text-text sm:px-6">
                            ${money(trade.notional, 0)}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        <p className="mt-4 font-mona text-[12.5px] leading-[165%] text-text/80">
          Trades are executed prints from a public exchange feed, not our own
          positions and not a recommendation. XAUT is tokenised gold and tracks
          spot closely, but it is not XAU/USD spot. Crypto shown because foreign
          exchange trades over the counter, so no public tape of executed FX
          trades exists.
        </p>
      </div>
    </section>
  );
}
