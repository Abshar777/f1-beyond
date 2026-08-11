import { avatarColours, initialsOf } from "@/lib/avatar";

/**
 * Author avatar: the photo if there is one, otherwise generated initials on a
 * colour derived from the name.
 *
 * Presentational and server-safe (no hooks), so it drops into the prerendered
 * blog pages without pushing them client-side.
 *
 * `size` is applied inline rather than through a class because it is a number
 * from the caller — Tailwind cannot generate a utility for an arbitrary runtime
 * value, so `h-[${size}px]` would silently produce no CSS at all.
 */
export default function Avatar({
  name,
  src,
  size = 32,
  className = "",
}: {
  name: string;
  /** Optional photo URL. Falls back to initials when absent or blank. */
  src?: string;
  size?: number;
  className?: string;
}) {
  const box = { width: size, height: size };

  if (src?.trim()) {
    return (
      <img
        src={src}
        alt=""
        style={box}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  const { bg, fg } = avatarColours(name);

  return (
    <span
      // The name is already printed next to every use of this, so the initials
      // are decorative and would only be read out twice.
      aria-hidden
      style={{
        ...box,
        backgroundColor: bg,
        color: fg,
        fontSize: Math.round(size * 0.38),
      }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-mona font-semibold tracking-[0.02em] select-none ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
