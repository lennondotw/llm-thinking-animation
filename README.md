# LLM Thinking Animation

A ChatGPT-o3-style "thinking" animation built with React 19 and [Motion](https://motion.dev). The interesting part is not the visuals but how the resizing container stays smooth while its content keeps changing.

🔗 **[Live Demo](https://lennondotw.github.io/llm-thinking-animation/)**

## The core problem

Each thinking step has different content and therefore a different size. Animating a container whose size is driven by its own children is a circular dependency: the children decide the size, the size animation reflows the children, which changes the size again. The techniques below exist to break that cycle and keep the motion smooth.

## Key techniques

### Container-first transition

The container animates to the target size **before** its content appears, instead of growing together with the content. The new step is rendered and measured first; the container springs to that measured size while the content is still invisible (`opacity: 0`, occupying layout via a `y` offset). Only after the box has settled does the text stream in. This avoids the jelly-like effect of a box that resizes one line at a time.

### Decoupled width measurement

Width and height come from two independent measurement layers, so the animation never feeds back into layout:

- A zero-height phantom element (`invisible h-0 w-full`) measures the **available** width from the parent.
- The inner container is pinned to that fixed width, so content lays out at a stable width and never reflows when the parent animates.
- The content is then measured for its natural width/height, and the animated container springs to those values.

```tsx
{/* phantom: measures available width, contributes no height */}
<div ref={containerMeasureRef} className="invisible h-0 w-full" />

<motion.div animate={controls} className="overflow-clip">
  {/* pinned width: content can't reflow when the parent resizes */}
  <div style={{ width: containerMeasure?.width }}>
    <div ref={contentMeasureRef}>{/* measured for target size */}</div>
  </div>
</motion.div>
```

### FLIP layout animations

Step-to-step transitions use Motion's FLIP-based layout animations (`layout` + `<AnimatePresence mode="popLayout">`). `popLayout` pops the exiting step out of the layout flow so the entering step doesn't get pushed around mid-transition, keeping enter/exit perfectly overlapped.

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
