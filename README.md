# John Boyd's Library

A Pudding-style, scroll-driven, single-page visualization of John Boyd's personal library —
the books that built the OODA loop, and a speculative reading list of what he might have
read had he lived past 1997.

**Live site:** [GitHub Pages URL here once deployed]

---

## What's Inside

- **174 books** in Boyd's actual (or plausibly owned) library
- **~150 speculative titles** (post-1997, rating ≥ 4.0) linked back to actual books via curated connection edges
- **4 intellectual branches:** War & Strategy · Systems & Science · Mind & Knowledge · Power & Organizations
- **Sortable/filterable rankings** with drag-to-reorder and pin-to-top
- **D3 v7 collapsible tidy tree** — click to filter rankings, hover for details, zoom/pan
- **Long-scroll narrative** with IntersectionObserver card animations
- **Reading progress bar**, URL hash state persistence, `prefers-reduced-motion` support
- **No build step** — open `index.html` directly in a browser (file://)

---

## File Structure

```
Boyd Library Project/
├── index.html                ← full experience, one page
├── css/
│   └── style.css             ← all styling, CSS custom properties
├── js/
│   ├── data.js               ← all book data consolidated (JS syntax fixed)
│   ├── state.js              ← global state with pub/sub
│   ├── hero.js               ← video loop + scroll cue
│   ├── rankings.js           ← sortable/filterable/reorderable list
│   ├── tree.js               ← D3 v7 collapsible tidy tree
│   ├── scroll.js             ← IntersectionObserver + progress bar
│   └── app.js                ← init, wires modules together
├── scripts/
│   └── buildData.mjs         ← Node util: export clean JSON
├── Boyd56.png                ← portrait (original, untouched)
├── black_and_white_man_web.mp4 ← hero video (original, untouched)
├── .gitignore
└── README.md
```

Original files (`boyd-library-actual.js`, `boyd-library-analysis (4).html`,
`boyd-library-tree.html`) remain untouched.

---

## Running Locally

**Option 1 — File protocol (simplest):**
```bash
open index.html     # macOS
start index.html    # Windows
xdg-open index.html # Linux
```

> Note: Some browsers block D3 data loading over `file://` due to CORS.
> If the tree doesn't render, use Option 2.

**Option 2 — Local server (recommended):**
```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000

# Node (npx)
npx serve .
# then open http://localhost:3000
```

**Option 3 — Node data export:**
```bash
node scripts/buildData.mjs
# Creates data/books-actual.json and data/books-speculative.json
```

---

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Under **Source**, select **Deploy from a branch**
4. Branch: `main` (or `master`), Folder: `/ (root)`
5. Click **Save**

The site will be live at `https://yourusername.github.io/repository-name/`.

No Jekyll, no build pipeline. GitHub Pages serves the static files directly.

---

## Design System

| Token | Value |
|---|---|
| `--bg` | `#0d0d0d` |
| `--surface` | `#161616` |
| `--text` | `#e8e2d4` (warm cream) |
| `--accent` | `#c9a84c` (Boyd gold) |
| `--branch-war` | `#8b1a1a` |
| `--branch-science` | `#1a4a8b` |
| `--branch-mind` | `#2d6e4e` |
| `--branch-power` | `#6b3d8b` |

Fonts: **Playfair Display** (headings) + **Inter** (body) via Google Fonts.

---

## Data Sources

- Robert Coram, *Boyd: The Fighter Pilot Who Changed the Art of War* (2002)
- Frans P.B. Osinga, *Science, Strategy and War* (2007)
- Grant T. Hammond, *The Mind of War* (2001)
- Pentagon archival records and reading lists
- Goodreads community ratings (as of 2024–2025)

---

## License

Visualization code: MIT License.
Book data: compiled from public biographical sources; no original text reproduced.
