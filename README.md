# troupe-vault
ThoughtSignal, by Troupe Consulting: an AI chief of staff for the little things

A static site (plain HTML and CSS, one small script) for GitHub Pages, served from the repo root of `main`.
All links are relative, so it works under `/troupe-vault/`.

- `index.html`: home page (hero, how it works, the Chief of Staff and the six jobs it takes on, join the waitlist, questions)
- `cast/chief-of-staff.html`: the lead helper
- `cast/*.html`: one page for each of the six jobs it takes on
- `mascots/*.svg`: placeholder shapes; swap a file for a real image and update its `src`
- `style.css`, `site.js`: shared by every page

## Placeholders

The site is a free waitlist: no prices, pre-orders or sign-in. Every join link points to a
Google Form placeholder (`PLACEHOLDER-GOOGLE-FORM-ID`) and carries `?v=vault`.
While a link holds `PLACEHOLDER`, clicking it shows a short note instead of leaving the page.
Nothing on the site collects data.

## Test

```sh
npm test
```

Checks page basics, that every relative link and asset resolves, that placeholder links carry
`?v=vault`, that the copy avoids words it should not use (including prices, pre-orders and refunds),
and that the Chief of Staff page and the six job pages link to each other.
