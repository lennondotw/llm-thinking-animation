# LLM Thinking Animation

A ChatGPT-o3-style "thinking" animation built with React 19 and [Motion](https://motion.dev). The interesting part is not the visuals but how the resizing container stays smooth while its content keeps changing.

🔗 **[Live Demo](https://lennondotw.github.io/llm-thinking-animation/)**

## The core problem

Each thinking step has different content and therefore a different size. Animating a container whose size is driven by its own children is a circular dependency: the children decide the size, the size animation reflows the children, which changes the size again. The techniques below exist to break that cycle and keep the motion smooth.

## Key techniques

### Container-first transition

The container animates to the target size **before** its content appears, instead of growing together with the content. The new step is rendered and measured first; the container springs to that measured size while the content is still invisible (`opacity: 0`, occupying layout via a `y` offset). Only after the box has settled does the text stream in. This avoids the jelly-like effect of a box that resizes one line at a time.

### Genuine content clipping

The easy way to fake a resizing box is to draw a border in an overlay layer and let the content flow freely underneath. This box is the real thing: the animated element has `overflow-clip` and genuinely clips its content to the animating bounds, which is what makes it read as a true container rather than a decorative outline.

That faithfulness is exactly what makes it hard. Because the clipping container's own width is being animated, any content that sizes itself relative to that container (e.g. `width: 100%`) would follow the width spring frame-by-frame and reflow throughout the transition.

### Virtual width provider

The fix is a separate width source that is decoupled from the animating container:

- A zero-height phantom element (`invisible h-0 w-full`) measures the **available** width from the parent — independent of the animation.
- An inner wrapper is pinned to that fixed width, acting as the width provider for the content. Its width never changes during the animation, so content lays out once at the stable target width instead of tracking the container's intermediate widths.
- The content is then measured for its natural width/height, and the clipping container springs to those values — clipping the (already stably-laid-out) content along the way.

```tsx
{/* phantom: measures the available width, contributes no height */}
<div ref={containerMeasureRef} className="invisible h-0 w-full" />

{/* real container: animates its size AND clips content to it */}
<motion.div animate={controls} className="overflow-clip">
  {/* width provider: pinned to the available width, immune to the size animation */}
  <div style={{ width: containerMeasure?.width }}>
    <div ref={contentMeasureRef}>{/* lays out at a stable width, measured for the target size */}</div>
  </div>
</motion.div>
```

### Container layout animation

The container does **not** use FLIP. FLIP animates size with a transform (scale/translate) and leaves the surrounding flow untouched — so the box would appear to grow while the content below it stays put, overlapping mid-transition and then jumping when the transform resolves.

Instead the container animates its real `width`/`height`, so it occupies genuine space in the document flow on every frame. That means a real reflow per frame — deliberately. Everything below it reflows along with it, smoothly and without overlap or jumps. The cost is kept to the minimum: only the container box's contribution to the outer flow changes, because the inner content sits at a pinned width and never re-lays-out internally.

The proof is the "Made with ❤️" signature line right below the box: it has zero animation code — no `motion`, no magic, just natural layout — yet it glides up and down perfectly smoothly. Because it lives in the same reflowing document flow, its gap to the container stays constant on every frame — it tracks the height in lockstep, never lagging behind or drifting. That motion is purely the natural reflow driven by the container's height animation.

Step-to-step content swaps are a separate concern: those use `<AnimatePresence mode="popLayout">`, which pops the exiting step out of the flow so the entering step isn't pushed around mid-transition.

### Skipping animation on first mount and remount

A freshly mounted box should appear at its correct size, not animate up from zero:

- On the very first render `useMeasure` hasn't resolved yet, so the width is captured synchronously in a ref callback via `getBoundingClientRect()` and applied with `controls.set()` (no animation) instead of `controls.start()`. This prevents a flash of the wrong size.
- `<AnimatePresence initial={false}>` skips the enter animation for the initial step.
- A `disableAllAnimations` flag (threaded down to every motion element) forces `duration: 0`, used when the box is remounted via a changing `key` so the reset is instant rather than re-running the whole sequence.

```tsx
useLayoutEffect(() => {
  if (contentMeasure?.width === undefined) {
    controls.set({ width: immediateContentWidth.current }); // first mount: no animation
    return;
  }
  void controls.start({ width: contentMeasure.width, height: contentMeasure.height });
}, [contentMeasure?.width, contentMeasure?.height, controls]);
```

### Character-group text streaming

Body text is split into fixed-size character groups (grapheme-aware) and staggered in with a per-group delay derived from a target characters-per-second rate, producing a steady streaming effect independent of paragraph length.

### Light-sweep shimmer

Step titles use a CSS `mask-image` gradient animated via `maskPosition` to sweep a highlight across the text — a pure-CSS shimmer with no extra DOM.

## Tech stack

- React 19
- Motion (Framer Motion's successor)
- TypeScript (strict)
- Tailwind CSS 4
- Vite
- `@react-hookz/web` for `useMeasure`

## Development

```bash
pnpm install
pnpm dev          # start dev server
pnpm build        # production build
pnpm test         # run tests
pnpm lint:eslint && pnpm lint:tsc
```
