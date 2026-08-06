# Logo assets — Beyondpips Trading Academy

Generated from `../Beyond Pipes logo_Horizontal-02.png` (the supplied master).

| File | Where it shows | Background | Size |
|---|---|---|---|
| `logo-light.png` | Header (scrolled pill), Footer | dark | 2986 × 621 (4.81:1) |
| `logo-dark.png` | Header (over cream hero), Mobile menu | light | 2986 × 621 (4.81:1) |
| `logo-mark.png` | Preloader | any | 621 × 621 (1:1) |

## Why there are two colour variants

In the supplied master the **"Beyondpips" wordmark is white** — it only reads on
a dark background. Used as-is over the cream hero or the white mobile menu, that
word disappears and you see just the gold mark and "Trading Academy".

`logo-dark.png` is the same artwork with the white wordmark recoloured to
zinc-900 (`#18181b`), leaving all the gold untouched. The header cross-fades
between the two as it collapses onto its dark pill.

## Regenerating

Both variants are derived, so re-run the generation if the master changes:
crop to the content bounding box, then for the dark variant recolour pixels that
are near-white *and* low-saturation (so pale gold highlights aren't caught).
The square mark is the left glyph (x 297–824 in the master) padded to a square.

The original Eduflow template logos are kept in `../_original-logos/`.
