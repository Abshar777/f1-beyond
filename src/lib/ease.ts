import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

/**
 * cubic-bezier(0.16, 1, 0.3, 1) — quick pickup, then a very long flat settle.
 * Shared by every scroll animation and mirrored in the nav's CSS transitions
 * so page motion and chrome motion read as one system.
 */
export const SMOOTH = CustomEase.create("appSmooth", "M0,0 C0.16,1 0.3,1 1,1");

/** The same curve for plain CSS transitions (Tailwind arbitrary ease). */
export const SMOOTH_CSS = "cubic-bezier(0.16,1,0.3,1)";

/**
 * Symmetric ease-in-out for the header's collapse to a floating pill. A
 * decelerating curve makes a width change look like it slips at the start;
 * easing in on both ends keeps the two edges moving together.
 */
export const NAV_COLLAPSE_CSS = "cubic-bezier(0.65,0,0.1,1)";
