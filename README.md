# Alex Shaji — Portfolio (retro OS)

Static portfolio with a skeuomorphic window UI, Pixel Operator Mono typography, and dialog-based navigation.

## Run locally

```bash
cd ~/Documents/portfolio
python3 -m http.server 8080
```

Open http://localhost:8080

## Customize

- Edit project copy in `js/app.js` (`PROJECTS`) and folder names in `index.html`.
- Replace `hello@example.com` and Not Work folder `href="#"` links.
- For a true bold pixel face, add `PixelOperatorMono-Bold.woff2` from [dafont Pixel Operator](https://www.dafont.com/pixel-operator.font) into `assets/fonts/`.

## Structure

- `index.html` — home + dialog sections (Work, Not Work, About)
- `css/styles.css` — design tokens, buttons, windows
- `js/app.js` — open/close dialogs, folder → project detail
- `js/cat.js` — sprite-sheet cat walker (from codex hello-cat-site mock)
- `assets/cat-sheet.png` — cat animation sprites
