# Taigi Keyboard Landing Page

Landing page for Taigi Keyboard app.

Built with Jekyll and hosted on GitHub Pages.

## Repository

https://github.com/taigikeyboard/website

## Local Development

```bash
bundle install
bundle exec jekyll serve
```

Visit `http://localhost:4000` to preview the site.

## Configuration

Edit `_config.yml` to customize:
- App information
- Features list
- Colors and styling
- Social links

## Adding an image

Two pipelines, depending on where the image came from.

### A photo, screenshot or icon (PNG / JPEG / GIF)

Commit **only** the original. The `.webp` beside it is generated and
`.gitignore`d — `make build` and `make serve` run `make webp-all` first, and so
does the deploy workflow, so the file exists wherever the site is built.

Reference both, so browsers without WebP still get an image:

```html
<picture>
  <source srcset="{{ '/assets/foo.webp' | relative_url }}" type="image/webp">
  <img src="{{ '/assets/foo.png' | relative_url }}" alt="what it shows"
       width="1200" height="800" loading="lazy">
</picture>
```

`width` and `height` reserve the space before the image arrives, which keeps the
page from shifting under the reader. Drop `loading="lazy"` for anything visible
without scrolling.

Some images must stay in their original format and get no `.webp`: the CSS
phone frame, the `og:image` targets social scrapers may not decode as WebP, and
the favicons. `WEBP_SKIP` in the `Makefile` lists them — add a new `og:image` or
favicon there, and reference such an image directly rather than through
`<picture>`.

Name sources in lowercase `.png` / `.jpg` / `.jpeg` / `.gif`, and give each one a
distinct stem: `foo.png` and `foo.jpg` in the same directory would both claim
`foo.webp`.

Every `.webp` under `assets/` belongs to `webp-all` and is safe to throw away —
it deletes any whose source is gone or skip-listed, so a hand-placed one will
not survive. Deleting an image therefore needs no cleanup beyond removing the
markup that referenced it.

### An SVG exported from Excalidraw

Excalidraw embeds every pasted screenshot as a full-resolution base64 PNG, and
the export dialog's scale setting only changes the SVG's `width`/`height`
attributes, so the payload cannot be shrunk from inside Excalidraw. Export with
**Embed scene turned off**, drop the file in `assets/`, then:

```bash
make webp-svg
```

That re-encodes each embedded PNG as WebP in place — it cut the two typing
cheat sheets from 342 KB and 604 KB to 160 KB and 133 KB. Commit the rewritten
SVG.

Unlike `webp-all` this is a manual step and the deploy workflow does not run it,
because it rewrites tracked files. Forgetting it costs bytes, not correctness.
Re-run it after every fresh export; running it twice changes nothing.

## Files the macOS release flow writes

Two files here are **generated, not hand-edited**. `macos/scripts/publish-release.sh`
in the app repository writes both, after it has proven anonymously that the
package it just uploaded is downloadable:

| File | Read by | Contents |
|---|---|---|
| `appcast/macos.json` | the installed macOS input method, polling for updates | newest published version + the release page to send the user to |
| `_data/macos_release.json` | this site's macOS download button | the same version, plus the direct package URL the button links at |

The button links straight at the package so the download starts on one click,
which means its URL carries the version and changes every release — hence the
data file. It deliberately does **not** use `/releases/latest/download/...`:
`latest` resolves across the whole repository, and this repository is a website
that may one day hold releases of its own.

Editing either file by hand publishes a version, or a download link, that may
not exist. Before the first macOS release the data file reads `0.0.0` with an
empty URL, which is what hides the button.

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

## Credits

Based on [Automatic App Landing Page](https://github.com/emilbaehr/automatic-app-landing-page) by Emil Baehr.

## License

[MIT License](LICENSE)
