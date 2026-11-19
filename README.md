# Neon Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/labibhanafi/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/labibhanafi/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline web app that turns your own photos into GTA-style cover art — the multi-panel poster look, bold gradient caption lettering, and a Vice City sunset or neon colour grade. Built for the [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun.

## What it does

- **8 poster layouts** — Vice Split, Triple Stack, Hero Left / Right, Quad Grid, Full Bleed, Marquee, Skyline Trio. Each layout splits the poster into panels.
- **Up to 4 photos** — load the two bundled samples, upload your own, or drag a photo onto a slot. Every panel gets its own crop: zoom and shift X / Y per photo. One photo fills every panel; several photos fill the panels in order.
- **8 colour grades** — Vice Sunset, Neon Nights, Palm Dusk, Ocean Drive, Bubblegum, Heatwave, Ultraviolet, After Hours. Each grade re-lights the whole poster: sky gradient, glowing sun, sunset wash, vignette.
- **Editable caption** — a gradient title (4 title gradients, adjustable size, slight lean, dark outline) plus a glowing neon subtitle.
- **1-click PNG export in 7 sizes** — 1080×1080, 1080×1350, 1920×1080, 1080×1920 (story), 2048×1152, 1200×630, 1080×566. The PNG is rendered at full size on a canvas and downloads straight from your browser.

## 100% offline, 100% private

The app is plain static files under `app/` with no build step. Open `app/index.html` in desktop Chrome with the network off and it works: every script, style and image it loads is a file under `app/`, and photos are read on your own machine and drawn straight onto the canvas — never uploaded, never tracked.

## Try it

```sh
# serve app/ with any static server, e.g. Node's own:
node serve.ts
# or: python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080 — the two sample photos load automatically, so you can export a cover in seconds.

## Shot mode (for screenshots)

The app reads query parameters, so a cover or the editor can be opened in a known state:

- `?shot=cover&photo=pier&caption=Sunset%20Heist` — the poster alone, square
- `?shot=editor&photo=boulevard&caption=Boulevard%20Queen` — the full editor with a photo loaded
- `?shot=export&size=1080x1920&photo=pier&caption=Neon%20Nights` — the poster drawn at an export size

`layout`, `grade`, `titlegrad` and `subtitle` are accepted too (e.g. `layout=4&grade=1`).

## Hand-in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-app.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

It never removes the output directory itself — it creates it and empties its contents child by child — so it also works when the output directory is a mount the process cannot delete.

## Files

| Path | What it is |
| --- | --- |
| `app/index.html` | The page: stage canvas + control panels |
| `app/style.css` | Dark neon UI |
| `app/app.js` | Layouts, grades, photo slots, canvas renderer, PNG export |
| `app/samples/` | Two free-to-use sample photos (made with an image model for make.fun) |
| `main.ts` | The hand-in program |
| `vendor/makefun-app.ts` | The kit's dossier library, unchanged |
| `screenshots/` | Four screenshots of the app at work |

## Licence

MIT — see [LICENSE](LICENSE). An original design: no Rockstar Games logo, wordmark, official artwork, character or font file is used anywhere.

<sub>Entered on [make.fun](https://make.fun/?ref=3t7y0djc&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
