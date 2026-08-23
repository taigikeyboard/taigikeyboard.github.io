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
