# Random BPM Metronome

A minimal React + Vite app that plays a metronome click with a random BPM chosen on each tick between your selected low/high BPM.

## Run

```bash
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Notes

- Uses Web Audio API; click Play to start audio (user gesture required).
- Current BPM changes every tick; delay is recalculated accordingly.
