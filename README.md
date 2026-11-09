# troupe-vault
ThoughtSignal, by Troupe Consulting: AI helpers for the little things

A static site (plain HTML and CSS, one small script) for GitHub Pages, served from the repo root of `main`.
All links are relative, so it works under `/troupe-vault/`.

- `index.html`: home page (hero, how it works, the cast, packs and prices, questions)
- `cast/*.html`: one page per helper
- `mascots/*.svg`: placeholder shapes; swap a file for a real image and update its `src`
- `style.css`, `site.js`: shared by every page

## Placeholders

Join links point to a Google Form and the $1 pre-order to Gumroad. Both are placeholders
(`PLACEHOLDER-GOOGLE-FORM-ID`, `PLACEHOLDER-GUMROAD`) and carry `?v=vault`.
While a link holds `PLACEHOLDER`, clicking it shows a short note instead of leaving the page.
Sign in is a placeholder button too. Nothing on the site collects data.

## Test

```sh
npm test
```

Checks page basics, that every relative link and asset resolves, that placeholder links carry
`?v=vault`, and that the copy avoids words it should not use.
