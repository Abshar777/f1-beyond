"use client";

import type { ReactNode, MouseEventHandler } from "react";
import Link from "next/link";
import { openContactModal } from "@/lib/contact-modal";

type Variant = "outline" | "secondary" | "dark" | "white";

type ThemeButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler;
  type?: "button" | "submit";
  /**
   * Follow `href` instead of opening the contact form. Every CTA on the site
   * routes to the form by default; set this on a button that genuinely needs to
   * navigate or jump to an anchor.
   */
  keepHref?: boolean;
};

const ARROW_ICON = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.28333 11.9167L0 10.6333L8.8 1.83333H0.916667V0H11.9167V11H10.0833V3.11667L1.28333 11.9167Z"
      fill="currentColor"
    />
  </svg>
);

const VARIANT_CLASSES: Record<Variant, string> = {
  outline:
    "border border-primary/10 bg-transparent hover:border-transparent hover:bg-secondary [&_.tb-text]:text-primary hover:[&_.tb-text]:text-white [&_.tb-icon]:bg-secondary [&_.tb-icon]:text-white",
  secondary:
    "border border-transparent bg-secondary hover:-translate-y-1 hover:bg-white [&_.tb-text]:text-white hover:[&_.tb-text]:text-primary [&_.tb-icon]:bg-white [&_.tb-icon]:text-secondary",
  dark: "border border-primary bg-primary hover:border-secondary hover:bg-secondary [&_.tb-text]:text-white [&_.tb-icon]:bg-white [&_.tb-icon]:text-primary",
  white:
    "border border-transparent bg-white hover:-translate-y-1 hover:bg-secondary [&_.tb-text]:text-primary hover:[&_.tb-text]:text-white [&_.tb-icon]:bg-secondary [&_.tb-icon]:text-white",
};

/**
 * Where the brushed-gold gradient lands per variant — on the button body when
 * the fill itself is gold, otherwise on the small icon box, which is the only
 * gold surface on those. `outline` and `dark` only turn gold on hover, so they
 * get the gradient on hover to match.
 *
 * These are plain class hooks resolved in globals.css, not Tailwind variants:
 * `[&_.tb-icon]:gold-surface` silently does nothing, because a variant can only
 * wrap a generated utility, never an arbitrary custom class name.
 */
const VARIANT_GOLD: Record<Variant, string> = {
  outline: "tb-gold-icon tb-gold-hover",
  secondary: "gold-surface hover:[background-image:none]",
  dark: "tb-gold-hover",
  white: "tb-gold-icon",
};

/**
 * Sheen colour per variant: gold reads on the dark fill, dark reads on the
 * gold/white fills. A white sweep on a gold button is invisible.
 */
const VARIANT_SHEEN: Record<Variant, string> = {
  outline: "spotlight-btn spotlight-btn-gold",
  secondary: "spotlight-btn spotlight-btn-dark",
  dark: "spotlight-btn spotlight-btn-gold",
  white: "spotlight-btn spotlight-btn-dark",
};

/** Shared pill CTA: label + small square icon box, matches the source template's .theme-btn. */
export default function ThemeButton({
  href,
  children,
  variant = "outline",
  icon,
  className = "",
  onClick,
  type = "button",
  keepHref = false,
}: ThemeButtonProps) {
  const classes = `group inline-flex w-max items-center justify-between gap-5 rounded-md p-[3px] pl-5 transition-all duration-300 ${VARIANT_CLASSES[variant]} ${VARIANT_GOLD[variant]} ${VARIANT_SHEEN[variant]} ${className}`;

  const content = (
    <>
      <span className="tb-text whitespace-nowrap font-mona text-sm font-medium capitalize transition-colors duration-300">
        {children}
      </span>
      <span className="tb-icon flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded transition-colors duration-300 [&>svg]:transition-transform [&>svg]:duration-300 group-hover:[&>svg]:rotate-45">
        {icon ?? ARROW_ICON}
      </span>
    </>
  );

  if (href && keepHref) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  // An href without `keepHref` becomes a real <button> rather than a link with a
  // prevented default: it opens a dialog, so that is the correct semantics, and
  // it means no dead route is left in the markup for middle-click or
  // open-in-new-tab to find. Several of these pointed at /courses, /courses-v1
  // and /team, which do not exist on this single-page site.
  if (href) {
    return (
      <button
        type="button"
        className={classes}
        onClick={(event) => {
          onClick?.(event);
          openContactModal();
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
