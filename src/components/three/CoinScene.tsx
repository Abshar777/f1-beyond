"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Html, Lightformer, useTexture } from "@react-three/drei";
import type { Group } from "three";
// `import type` only — erased at compile time, so the `server-only` guard in
// rates.ts is never pulled into this client bundle.
import type { MarketRates, MetalQuote } from "@/lib/rates";
import CoinFallback from "./CoinFallback";

/**
 * The three spot metals actually quoted on forex venues. Each disc is given
 * its real metal colour rather than all-gold, so the cluster reads as a
 * commodities desk instead of a pile of tokens.
 *
 * Appearance only. The quote each badge shows arrives as a prop from the server
 * (see `lib/rates.ts`) — hardcoding a price here is what this used to do, and a
 * frozen number on a trading site ages into a straightforward untruth.
 */
const METALS = [
  {
    symbol: "XAU",
    pair: "XAU/USD",
    name: "Gold",
    body: "#d4af37",
    rim: "#e6c14e",
    boss: "#f0d484",
    edgeTint: "#6b5410",
    roughness: 0.19,
  },
  {
    symbol: "XAG",
    pair: "XAG/USD",
    name: "Silver",
    body: "#c9ced6",
    rim: "#e4e8ee",
    boss: "#f2f5f8",
    edgeTint: "#6a6f76",
    roughness: 0.16,
  },
  {
    symbol: "XPT",
    pair: "XPT/USD",
    name: "Platinum",
    body: "#b9bec4",
    rim: "#d7dbe0",
    boss: "#eceef1",
    edgeTint: "#63676c",
    roughness: 0.13,
  },
] as const;

/**
 * Signed percentage, at the precision a desk would quote it.
 *
 * Hand-formatted rather than via `toLocaleString`: these values are rendered
 * inside a client component that still runs through SSR, and leaning on the
 * runtime's ICU data for the first paint is how you earn a hydration mismatch
 * between Node and the browser.
 */
function formatChange(pct: number) {
  return `${pct < 0 ? "-" : "+"}${Math.abs(pct).toFixed(2)}%`;
}

/**
 * Interactive gold coin cluster.
 *
 * Lighting comes from procedural <Lightformer> panels rather than an
 * `Environment preset`: presets stream an HDR from a CDN, which would make the
 * hero depend on a third-party fetch. Metals need *something* to reflect —
 * without an environment map a metalness:1 surface renders nearly black — so
 * the lightformers double as the highlights sweeping each rim.
 *
 * Framing: the camera sits at z=7.4 with a 42° vertical FOV, giving a visible
 * half-extent of ~2.84 units in the square container. Every coin's
 * position ± (radius × scale) is kept inside that with headroom for the float
 * drift — at the previous z=6.2 the two side coins reached ±2.77 against a
 * ±2.38 bound and were visibly sliced off by the canvas edges.
 */

const CAMERA_Z = 7.4;

/** Length of the one-off reveal spin after the preloader clears. */
const INTRO_SECONDS = 5;
/**
 * Starting angular velocity (rad/s); decays quadratically to 0 across
 * INTRO_SECONDS, integrating to roughly 1.2 full turns.
 */
const INTRO_PEAK_SPIN = 4.6;

type Metal = (typeof METALS)[number];

function Coin({
  metal,
  quote,
  position,
  scale = 1,
  spin = 0.35,
  tilt = [0.42, 0, 0.18],
  labelOffset,
}: {
  metal: Metal;
  /** Live quote for this metal. Undefined leaves the badge showing the pair. */
  quote?: MetalQuote;
  position: [number, number, number];
  scale?: number;
  spin?: number;
  tilt?: [number, number, number];
  labelOffset?: number;
}) {
  const ref = useRef<Group>(null);
  // useTexture caches by URL, so every coin shares one decode.
  // Height field + proof-finish map for the struck face. NOT colour data,
  // so both must stay in linear space — TextureLoader's NoColorSpace
  // default is correct here and must not be switched to sRGB.
  const relief = useTexture("/assets/imgs/logo/coin-face-height.png");
  const finish = useTexture("/assets/imgs/logo/coin-face-rough.png");
  const edge = useTexture("/assets/imgs/logo/coin-edge-mask.png");

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * spin;
  });

  // The label is anchored in the untilted parent, but the disc below it is
  // tilted — and a tilted disc projects shorter than its radius, so anchoring
  // at a flat 1.0 left it visibly hovering. Track the actual projected top:
  // radius*cos(tiltX) + halfThickness*sin(tiltX), plus a hair of clearance.
  const tiltX = tilt[0];
  // Negative clearance intentionally tucks the badge a touch over the rim —
  // the pill is anchored by its bottom edge, so sitting exactly on the
  // projected top still reads as a floating gap at the gold coin's scale.
  const LABEL_CLEARANCE = -0.06;
  const projectedTop =
    Math.cos(tiltX) + 0.085 * Math.abs(Math.sin(tiltX)) + LABEL_CLEARANCE;
  const offset = labelOffset ?? projectedTop;

  return (
    <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.7}>
      <group position={position} scale={scale}>
        {/* Label lives outside the tilted/spinning group so it stays upright
            and legible while the disc turns underneath it. */}
        <Html
          center
          position={[0, offset, 0]}
          // drei scales Html by roughly distanceFactor / cameraDistance, so a
          // *smaller* factor shrinks the badge. At 14 these rendered ~277px
          // wide; 4 against the 7.4 camera distance keeps them compact.
          distanceFactor={4}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex -translate-y-1/2 items-center gap-1.5 rounded-full border border-primary/10 bg-white/85 px-2 py-[3px] whitespace-nowrap shadow-sm backdrop-blur-sm">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: metal.body }}
            />
            <span className="font-mona text-[10px] font-medium text-primary">
              {metal.pair}
            </span>
            {/* Omitted rather than zeroed when there is no previous close to
                compare against — "+0.00%" would assert a flat market. */}
            {quote?.changePct != null && (
              <span
                className={`font-mona text-[10px] font-medium ${
                  quote.changePct < 0 ? "text-text" : "text-secondary"
                }`}
              >
                {formatChange(quote.changePct)}
              </span>
            )}
          </div>
        </Html>

        <group rotation={tilt}>
          <group ref={ref}>
            <mesh>
              <cylinderGeometry args={[1, 1, 0.17, 72]} />
              <meshStandardMaterial
                color={metal.body}
                metalness={1}
                roughness={metal.roughness}
              />
            </mesh>

            {/* Inscription milled into the edge. A separate open-ended
                cylinder a hair outside the disc, rather than a second material
                on the disc itself — the side, top and bottom are one geometry
                group each, so layering a masked overlay is the only way to get
                dark text over the metal without replacing the whole side. */}
            <mesh>
              <cylinderGeometry args={[1.004, 1.004, 0.168, 96, 1, true]} />
              <meshStandardMaterial
                alphaMap={edge}
                transparent
                // Softer than the face strike on purpose: a mid-tone of the
                // metal, still reflective, and held under full opacity so the
                // lettering settles into the band instead of reading as a
                // black decal laid over it.
                opacity={0.72}
                color={metal.edgeTint}
                metalness={0.55}
                roughness={0.5}
                depthWrite={false}
              />
            </mesh>

            {/* raised rim, both faces, so the disc reads as a struck coin */}
            {[0.089, -0.089].map((y) => (
              <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.74, 0.045, 20, 72]} />
                <meshStandardMaterial
                  color={metal.rim}
                  metalness={1}
                  roughness={metal.roughness + 0.09}
                />
              </mesh>
            ))}

            {/* Struck face — genuinely displaced geometry, not a decal.
                Three things together make this read as a die strike rather
                than a watermark laid on the metal:

                1. It IS the face. A dense polar grid (ringGeometry gives a
                   real ring x radial grid, unlike circleGeometry's triangle
                   fan, which has no interior vertices to move) at the coin's
                   own radius, so there is no seam and no floating overlay.
                2. displacementMap physically moves those vertices, so the mark
                   has height, breaks the silhouette and occludes itself.
                3. bumpMap off the same height field. Displacement alone does
                   not recompute normals, so without this the raised mark would
                   be lit exactly like the flat field and the walls would stay
                   invisible — the geometry would be there but unreadable.

                Colouring it dark (the previous approach) is what made it look
                printed on. Here it is the same metal as the disc and the form
                is described purely by light, with the roughnessMap frosting
                the field so the polished device stands off it. */}
            {[
              { y: 0.0855, rx: -Math.PI / 2 },
              { y: -0.0855, rx: Math.PI / 2 },
            ].map(({ y, rx }) => (
              <mesh key={y} position={[0, y, 0]} rotation={[rx, 0, 0]}>
                {/* Outer radius matches the disc exactly so this replaces the
                    cap rather than sitting on it. RingGeometry's UVs are
                    planar across the bounding square, which is what the square
                    face artwork expects. */}
                <ringGeometry args={[0.006, 1, 220, 96]} />
                <meshStandardMaterial
                  displacementMap={relief}
                  displacementScale={0.03}
                  bumpMap={relief}
                  bumpScale={0.55}
                  roughnessMap={finish}
                  color={metal.body}
                  metalness={1}
                  // Base must stay at the disc's own roughness. The finish map
                  // only ever multiplies *down*, so this is the field, and it
                  // has to match the metal exactly — raising it to frost the
                  // field turned the whole face near-black, because polished
                  // metal here reflects a handful of small lightformers and
                  // roughening it just averages them into the dark surround.
                  // The device is left to fall to a sharper mirror instead,
                  // which brightens rather than dims.
                  roughness={metal.roughness + + 0.22}
                />
              </mesh>
            ))}

          </group>
        </group>
      </group>
    </Float>
  );
}

/**
 * Cluster wrapper: leans toward the pointer, and can be flung horizontally by
 * dragging. Deliberately not OrbitControls — that captures wheel/touch and
 * would fight page scrolling. These handlers never call preventDefault, so
 * touch-dragging the hero still scrolls the page.
 */
function Cluster({ metals }: { metals?: MarketRates["metals"] }) {
  const group = useRef<Group>(null);
  const drag = useRef({ active: false, lastX: 0, velocity: 0 });
  // Showcase pass that runs once, when the preloader clears.
  const intro = useRef({ t: 0, running: false });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const start = () => {
      intro.current.t = 0;
      intro.current.running = true;
    };

    // Already finished before this canvas mounted (warm cache) — run now.
    if (window.__preloaderDone) start();

    window.addEventListener("preloader:done", start);
    return () => window.removeEventListener("preloader:done", start);
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // ── intro: spin up and settle over INTRO_SECONDS ──
    const it = intro.current;
    if (it.running) {
      it.t += delta;
      const p = Math.min(it.t / INTRO_SECONDS, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic — settle

      // Quadratic (not cubic) decay for the spin: a cubic falloff is spent by
      // ~3s and covers barely half a turn, so the "5 second" reveal reads as
      // over early. Squared keeps it perceptibly turning to about 4s.
      g.rotation.y += INTRO_PEAK_SPIN * Math.pow(1 - p, 2) * delta;

      // settle into place from slightly small and low
      g.scale.setScalar(0.9 + 0.1 * eased);
      g.position.y = -0.35 * (1 - eased);

      if (p >= 1) {
        it.running = false;
        g.scale.setScalar(1);
        g.position.y = 0;
      }
    }

    const d = drag.current;
    d.velocity *= 0.94; // inertia decay
    g.rotation.y += d.velocity * delta;

    // ease toward the pointer rather than snapping, so the lean feels weighted
    const targetX = -state.pointer.y * 0.2;
    const targetZ = state.pointer.x * 0.07;
    g.rotation.x += (targetX - g.rotation.x) * 0.055;
    g.rotation.z += (targetZ - g.rotation.z) * 0.055;
  });

  const endDrag = (e?: { target?: unknown; pointerId?: number }) => {
    drag.current.active = false;
    const target = e?.target as
      | { releasePointerCapture?: (id: number) => void }
      | undefined;
    if (target?.releasePointerCapture && e?.pointerId !== undefined) {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        /* capture may already be gone */
      }
    }
  };

  return (
    <>
      <group ref={group}>
        <Coin
          metal={METALS[0]}
          quote={metals?.[METALS[0].symbol]}
          position={[0.1, 0.2, 0]}
          scale={1.5}
          spin={0.3}
        />
        <Coin
          metal={METALS[1]}
          quote={metals?.[METALS[1].symbol]}
          position={[-1.75, -1.05, -0.7]}
          scale={0.78}
          spin={-0.4}
          tilt={[0.55, 0, -0.3]}
        />
        <Coin
          metal={METALS[2]}
          quote={metals?.[METALS[2].symbol]}
          position={[1.85, -1.2, -0.4]}
          scale={0.6}
          spin={0.48}
          tilt={[0.3, 0, 0.42]}
        />
      </group>

      {/*
        Drag catcher — deliberately a SIBLING of the rotating group, not a
        child. Nested inside it, the plane rotated along with the cluster and
        swung away from the camera, so after a small drag it no longer faced
        the ray and pointer events silently stopped landing. Kept static it
        always presents the same face to the camera.

        setPointerCapture keeps the drag alive when the cursor leaves the
        canvas mid-gesture, which otherwise stalls the fling.
      */}
      <mesh
        position={[0, 0, 3]}
        onPointerDown={(e) => {
          drag.current.active = true;
          drag.current.lastX = e.clientX;
          (e.target as { setPointerCapture?: (id: number) => void })
            ?.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current.active) return;
          const dx = e.clientX - drag.current.lastX;
          drag.current.lastX = e.clientX;
          drag.current.velocity += dx * 0.03;
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <planeGeometry args={[26, 26]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

export default function CoinScene({
  /**
   * Live metal quotes, fetched on the server and handed down through Hero2.
   * Optional so the scene still renders — badges showing just the pair — if a
   * caller has no rates to give it.
   */
  metals,
}: {
  metals?: MarketRates["metals"];
}) {
  // Lazy initialisers rather than an effect: this component is only ever
  // mounted client-side (`ssr: false`), so `document`/`navigator` exist on the
  // first render — and probing here avoids the extra render pass that setting
  // this from an effect would cause. Neither value can change afterwards.
  const [webglOk] = useState(() => {
    try {
      const probe = document.createElement("canvas");
      return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch {
      return false;
    }
  });
  const [isMobile] = useState(() =>
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
  );

  useEffect(() => {
    // R3F sizes the canvas from a ResizeObserver on its container. Because
    // this component is dynamically imported it mounts after first layout, and
    // the observer can miss that initial box — leaving the canvas stuck at its
    // intrinsic 300x150 until something else resizes the window.
    //
    // Deliberately setTimeout rather than requestAnimationFrame: rAF does not
    // fire at all while a tab is backgrounded, so a page opened in a
    // background tab would keep the wrong canvas size until it was focused
    // *and* resized. setTimeout still runs (throttled) when hidden.
    const id = window.setTimeout(
      () => window.dispatchEvent(new Event("resize")),
      0,
    );
    return () => window.clearTimeout(id);
  }, []);

  if (!webglOk) return <CoinFallback />;

  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      // full DPR is wasted on phones and is the usual cause of a hot device
      dpr={isMobile ? 1 : [1, 2]}
      performance={{ min: 0.5 }}
      camera={{ position: [0, 0, CAMERA_Z], fov: 42 }}
      resize={{ debounce: 0, scroll: false }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, -2, -3]} intensity={0.5} color="#e6c14e" />

      <Environment resolution={256}>
        <Lightformer intensity={3.2} position={[6, 4, 4]} scale={[9, 9, 1]} color="#ffffff" />
        <Lightformer intensity={2.4} position={[-6, 2, 2]} scale={[7, 7, 1]} color="#f7e6b0" />
        <Lightformer intensity={1.6} position={[0, -5, 2]} scale={[9, 4, 1]} color="#d4af37" />
        {/* Key light for the faces. The three panels above all sit off to the
            side, which lights the coin *edges* beautifully and leaves the flat
            caps mirroring empty space — a metalness:1 surface reflects what is
            in front of it, and there was nothing there, so the faces rendered
            black. That was survivable while the mark was a diffuse dark decal
            painted on top, but the strike is now the same metal as the disc
            and is described purely by reflection, so it needs a source. A ring
            rather than a flat panel: it sweeps a curved highlight across the
            relief as the coin turns, instead of washing the face flat. */}
        <Lightformer
          form="ring"
          intensity={3.4}
          position={[1.4, 1.8, 6.4]}
          scale={[7, 7, 1]}
          color="#fff4d8"
        />
        <Lightformer
          intensity={0.9}
          position={[-2.4, -1.2, 6]}
          scale={[9, 9, 1]}
          color="#f0dca4"
        />
      </Environment>

      <Suspense fallback={null}>
        <Cluster metals={metals} />
      </Suspense>
    </Canvas>
  );
}
