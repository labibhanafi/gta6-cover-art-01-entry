[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/labibhanafi/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/labibhanafi/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Neon Vice Cover Studio

Turn any photo into GTA-style cover art: a multi-panel Vice City sunset poster with bold gradient lettering, exported as a PNG to share. Fully offline — open `app/index.html` in desktop Chrome, no build step, no network request, no upload. Your photos never leave your machine.

## How it works

1. **Photos** — upload up to 4 of your own photos (or drag & drop them onto the page), or load the two bundled sample photos. Each photo gets its own zoom and shift sliders, so you can crop and position it inside its panel.
2. **Layout** — pick one of 8 poster layouts: Palm Split, Hero Left, Hero Right, Quad Grid, Triptych, Full Bleed, Strip Stack, Sunset Trio.
3. **Colour grade** — pick one of 8 sunset / neon grades: Vice Sunset, Neon Nights, Ocean Drive, Pink Heat, Teal Rush, Golden Hour, Ultraviolet, Mono Noir.
4. **Lettering** — edit the title (gradient fill, dark outline) and the neon subtitle, resize the title, toggle film grain + vignette and the “VICE CITY · 2026” corner badge.
5. **Export** — one click writes a PNG in any of 7 sizes: 1080×1080, 1080×1350, 1920×1080, 1080×1920 (story), 2048×1152, 1200×630, 1080×566.

The preview on the right is live: it is exactly what the exported PNG looks like.

## Run it

```sh
# serve app/ with any static server, e.g.
python3 -m http.server 8080 --directory app
# then open http://localhost:8080
```

Or just open `app/index.html` directly in Chrome — it works from `file://` too.

## Files

- `main.ts` — entry program: copies `app/` + `screenshots/` to the output directory and writes `dossier.json` via `vendor/makefun-app.ts`. It never removes the output directory itself (it may be a mount); it only empties its contents child by child.
- `app/index.html` — the editor page.
- `app/style.css` — dark neon editor chrome.
- `app/app.js` — the whole cover engine: panel layouts, grades, photo crop/position, grain, vignette, lettering, PNG export. Plain classic script, no libraries.
- `app/samples/` — two bundled sample photos (boulevard, pier), free to use.
- `screenshots/` — 4 screenshots of the app at work, taken in headless Chrome.

## Originality

All art and lettering in this entry is original: no Rockstar Games logo, wordmark, official artwork, character or font. The title is set in a system sans-serif with a gradient fill drawn on canvas. No third-party libraries are used at all.

## License

MIT — see [LICENSE](LICENSE).

<sub>Entered on [make.fun](https://make.fun/?ref=3t7y0djc&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
