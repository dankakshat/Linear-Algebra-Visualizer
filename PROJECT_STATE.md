# PROJECT_STATE.md

## Summary

The project was ~75–85% complete on upload (Sections 1–8 fully built, Sections 9–10 and
several "extra features" from the spec missing, and the codebase was un-buildable because
the flat ZIP export didn't match the folder-based import paths already written into every
file). This pass:

1. Reconstructed the correct `src/` folder structure from the import paths already present
   in the code (no guessing — every `../components/x/Y` and `../lib/z` import told us
   exactly where its target belonged).
2. Verified the pre-existing Sections 1–8 build and run correctly, untouched.
3. Implemented Section 9 (Linear Combination Builder) and Section 10 (Learning Mode, with
   Quiz and Challenge sub-modes) per the original spec.
4. Implemented the remaining "extra features": progress tracking to localStorage, a
   fullscreen toggle, matrix export/import as JSON, a screenshot (PNG) export, and a
   loading transition.
5. Wired all 10 sections + Hero into `App.tsx`, confirmed `npm run build` is clean (zero
   TypeScript errors, zero build errors).

---

## Completed Features

**Core experience (Sections 1–8, pre-existing, verified working)**
- Hero with animated floating vector background and scroll-to-explore CTA
- Section 1 — 2D Column Picture: draggable result point, live x/y sliders, head-to-tail
  animation, correct/incorrect glow, distance readout
- Section 2 — Row Picture vs Column Picture, split view with a toggle
- Section 3 — 3D Column Picture (React Three Fiber), orbit/zoom, animated vector addition
- Section 4 — Span Explorer, live matrix editing, "spans a plane" vs "spans everything"
- Section 5 — Independent vs Dependent columns, with collapse-to-line / collapse-to-plane
  animations and presets
- Section 6 — Dimension Explorer, 2D → 9D with a true 2D view, true 3D view, and an
  abstract "spoke" visualization for 4D–9D, plus an in-context "what does this mean?" modal
- Section 7 — Reachability guessing game (random columns/target, guess, reveal, explanation)
- Section 8 — Matrix Playground, editable up to 9×9, live rank/determinant/independence/
  reachability/span readouts

**Newly implemented this pass**
- **Section 9 — Linear Combination Builder**: click a column, set a scale, "Add step" to
  append it to a running chain; undo/redo history; "Replay" animates the chain back in
  from scratch; per-step log of every addition; live running sum vs. target `b`; a
  screenshot button that rasterizes the current SVG to a downloadable PNG.
- **Section 10 — Learning Mode**: three tabs —
  - *Learn*: the exact 6-step scripted walkthrough from the spec ("This is Column 1" →
    "We reached b"), reusing the existing `VectorField2D` visualization driven by scripted
    x/y values so each step animates via the same springs Section 1 already uses.
  - *Quiz*: 6 conceptual multiple-choice questions (span, independence, reachability,
    existence/uniqueness of solutions, why >3D can't be drawn), immediate feedback with a
    plain-language explanation, session + all-time score.
  - *Challenge*: randomly generated solvable 2×2 systems; the user dials in `x` and `y`
    with sliders to try to land on `b`; streak/best tracking.
- **Progress tracking**: `lib/types.ts` already had the `ProgressState` shape and
  `loadProgress`/`saveProgress` localStorage helpers stubbed in from the earlier pass —
  these are now actually wired up: `App.tsx` records visited sections, and Section 10
  records learning-mode step and quiz score/attempts.
- **Fullscreen mode**: `FloatingToolbar` (top-left) toggles `requestFullscreen()`.
- **Export/Import matrix as JSON**: in the Matrix Playground (Section 8) — exports
  `{ size, columns, b }`, imports and validates the same shape, with a friendly error for
  malformed files.
- **Screenshot button**: in Section 9, serializes the builder's SVG to a canvas and
  downloads a PNG.
- **Loading animation**: a brief spinner transition on first mount (`App.tsx`).

**Structural fix**
- The uploaded ZIP was a flat file dump with folder-shaped import paths (e.g.
  `Section1.tsx` importing `'../components/shared/GlassCard'` while sitting next to
  `GlassCard.tsx` in the same flat directory). This pass moved every file into the
  structure its own imports already specified — nothing was rewritten to do this, only
  relocated.

---

## Remaining Features (not implemented — candidates for a future pass)

- **Section 2 3D↔2D simultaneous animation polish**: works, but could use tighter sync
  between the row-picture line animation and the column-picture vector animation.
- **Keyboard shortcuts**: mentioned in the spec's UI section, not implemented anywhere
  (e.g. arrow keys to nudge sliders, `R` to randomize).
- **KaTeX/MathJax rendering**: the Readme lists this in the tech stack, but no equation
  typesetting is used anywhere — all math is shown as plain styled text/monospace. Fine
  for the current visual style, but worth a deliberate decision either way.
- **Global cross-section state**: every section holds its own local matrix/vector state.
  There's no "shared workspace" matrix that flows across Sections 1, 8, and 9. This was a
  deliberate scope decision (touching this would mean restructuring already-working
  sections), but a future pass could add an optional shared-state layer.
- **Code-splitting**: the production bundle is ~1.3MB (mostly three.js + @react-three/
  fiber + drei). `vite build` warns about this. Candidate fix: dynamic `import()` for the
  3D-only sections (3, 5, 6, 7) so the 2D-only path doesn't pay for three.js on first load.
- **Bigger question banks**: Quiz has 6 questions, Challenge generates infinite variants
  but only tests the 2×2 solve-for-x-y skill — could add a second challenge type (e.g.
  "is this reachable?" or "what's the rank?").

---

## Folder Structure

```
app/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts          (base: '/column-picture/', for GitHub Pages)
├── Readme.md
├── PROJECT_STATE.md
└── src/
    ├── main.tsx
    ├── App.tsx              orchestrates all sections + IntersectionObserver nav
    ├── index.css            theme tokens, glass/glow utility classes
    ├── lib/
    │   ├── math.ts          2D vector helpers (Vec2), Cramer's-rule 2×2 solve
    │   ├── linalg.ts        n-dimensional helpers: rank, determinant, rref, reachability
    │   ├── types.ts         ProgressState + localStorage load/save
    │   ├── exportImport.ts  matrix JSON download/upload/validate
    │   └── svgScreenshot.ts SVG → canvas → PNG download
    ├── sections/            one file per full-page section (Hero, Section1..Section10)
    └── components/
        ├── shared/          GlassCard, SectionHeader, DragNumber, SectionDots, FloatingToolbar
        ├── hero/             FloatingVectors (background)
        ├── section1/         VectorField2D (reused by Sections 1, 6, 10)
        ├── section2/         LinePicture2D
        ├── section3/         Scene3D, Arrow3D (reused by Section 6)
        ├── section4/         SpanVisualizer2D (reused by Section 5)
        ├── section5/         PlaneSpan3D
        ├── section6/         AbstractDimensionView
        ├── section7/         ReachabilityScene3D
        └── section9/         StepChain2D (head-to-tail chain renderer)
```

## Architecture Overview

- **Rendering**: one `<section id="section-N">` per topic, stacked vertically; `App.tsx`
  uses an `IntersectionObserver` to track which section is in view for the side nav dots
  and for progress tracking.
- **2D math** (`lib/math.ts`) and **n-D math** (`lib/linalg.ts`) are kept separate and
  dependency-free on purpose: the 2D helpers are fast/exact (Cramer's rule) for the
  interactive sections that only ever deal with 2 columns in 2D; the n-D helpers do real
  Gaussian elimination for rank/determinant/reachability in the Matrix Playground and
  Dimension Explorer.
- **Shared visual language**: `DragNumber` (drag-to-scrub / click-to-type numbers),
  `GlassCard`, and `SectionHeader` are used everywhere so every section looks and behaves
  consistently. Color convention: column 1 = blue `#4c7dff`, column 2 = cyan `#22d3ee`,
  column 3 = violet `#a855f7`, correct/match = mint `#34d399`, incorrect = rose `#fb6b6b`.
- **2D visualizations are all hand-rolled SVG** (not a charting library) with
  `framer-motion` driving spring transitions on arrow endpoints — this is why sections like
  Section 6 and Section 10 can reuse `VectorField2D` simply by changing the `x`/`y` props;
  the arrows animate themselves.
- **3D visualizations** use `@react-three/fiber` + `drei`'s `OrbitControls`/`Grid`, with a
  shared `Arrow3D` primitive.
- **Progress/localStorage**: a single JSON blob under key `column-picture:progress:v1`
  holds visited sections, quiz score/attempts, and learning-mode step/completion. Read with
  `loadProgress()`, written with `saveProgress()` — both tolerate missing/corrupt storage.

## Known Issues

- **Bundle size**: ~1.3MB minified JS (mostly three.js). Not a correctness issue, but flagged
  by Vite at build time. See "Remaining Features" for the code-splitting fix.
- **`three-mesh-bvh` deprecation warning** during `npm install` (transitive dependency of
  `@react-three/drei`) — cosmetic, no functional impact, will resolve itself on a future
  `drei` upgrade.
- **Fullscreen API**: `requestFullscreen()` can be silently denied by the browser in some
  embedded/iframe contexts (e.g. certain preview panes) — the toolbar handles the rejection
  gracefully (no crash) but obviously can't force fullscreen where the browser refuses it.
- No automated tests exist for the math helpers (`lib/math.ts`, `lib/linalg.ts`) — they're
  small and pure, but a future pass could add unit tests, especially around `rowEchelon`/
  `rank`/`determinant` for degenerate (rank-deficient) inputs.

## Suggested Next Prompt

> "Split the 3D-only sections (3, 5, 6, 7) into dynamic imports so three.js only loads
> when a user actually scrolls to a 3D section, and add a couple of Vitest unit tests for
> `rank`, `determinant`, and `isReachable` in `lib/linalg.ts` covering rank-deficient and
> square-singular cases."
