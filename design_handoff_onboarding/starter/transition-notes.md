# Slide transition — recommended approach in React/Next

The prototype hand-rolls the in/out slide with `requestAnimationFrame` and a manual
`entered` flag. That works but is fiddly (the first slide can render invisible if the
enter state isn't painted before the transition — the prototype fixes this with a
**double** rAF). In your codebase, use **Framer Motion** instead — it's purpose-built
for this and removes the gotcha entirely.

## Install
```
npm i framer-motion
```

## Pattern: directional slide with AnimatePresence

```tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// direction: 1 = forward (new enters from right), -1 = back (enters from left)
const variants = {
  enter: (dir: number) => ({ x: dir * 24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -24, opacity: 0 }),
};

function Stage({ stageKey, direction, children }: {
  stageKey: string | number;
  direction: number;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={stageKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { duration: 0.42, ease: EASE },
          opacity: { duration: 0.32, ease: EASE },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- `mode="wait"` plays exit fully before enter — matches the prototype's out-then-in feel.
- `initial={false}` means the very first stage appears without animating in (no invisible
  first paint). If you *want* the intro to animate in on mount, set `initial="enter"`.
- Track `direction` in state: set `+1` before advancing, `-1` before going back, and bump
  it right before you change `stage`.
- After a stage settles, focus the input in an `onAnimationComplete` handler (or a short
  `useEffect` timeout) to mirror the ~360ms autofocus.
- The **progress bar** width can stay a plain CSS `transition: width 560ms` — no motion lib
  needed there.

## Respect reduced motion
Wrap with `useReducedMotion()` from framer-motion and drop the `x` offset (keep a quick
opacity fade) when the user prefers reduced motion.
