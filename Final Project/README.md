# Sliding Window & Two Pointer Visualizer

A React app to visualize classic competitive programming patterns step-by-step.

## Algorithms included

| Tab | Algorithm | Pattern |
|-----|-----------|---------|
| Sliding Window | Max Sum Subarray of size K | Fixed-size window |
| Two Pointer | Two Sum on sorted array | Converging pointers |
| Longest Substring | Longest substring without repeating chars | Variable-size window |

## Getting started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Controls

- **Prev / Next** — step through the algorithm one state at a time
- **Play / Pause** — auto-advance at ~700ms per step
- **Reset** — restart from step 0
- **New Array / custom input** — randomize input

## Color legend

| Color | Meaning |
|-------|---------|
| Blue  | Current window |
| Green | Element being added |
| Red   | Element being removed / conflict |
| Purple | Left pointer |
| Orange | Right pointer |
