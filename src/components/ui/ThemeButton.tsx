import type { ReactNode, MouseEventHandler } from "react";
import Link from "next/link";

type Variant = "outline" | "secondary" | "dark" | "white";

type ThemeButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler;
  type?: "button" | "submit";
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
}: ThemeButtonProps) {
  const classes = `group inline-flex w-max items-center justify-between gap-5 rounded-md p-[3px] pl-5 transition-all duration-300 ${VARIANT_CLASSES[variant]} ${VARIANT_SHEEN[variant]} ${className}`;

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

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
