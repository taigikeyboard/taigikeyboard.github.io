# Image Source and WebP Build Plan

## Goal

Keep editable PNG/JPEG/GIF files in version control and generate WebP derivatives automatically for local development and deployment.

## Stages

1. **Establish source images** — Restore a PNG source for every currently tracked WebP image and ignore generated WebP files. Success: every referenced image has a versioned source file.
2. **Automate conversion** — Make local serve/build targets generate missing or stale WebP files, including PNG, JPEG, and GIF inputs. Success: one command prepares images and builds or serves the site.
3. **Add browser fallbacks** — Serve WebP through `<picture>` where useful while retaining PNG sources for compatibility, metadata, and icons. Success: generated pages reference both formats appropriately.
4. **Update deployment and verify** — Install conversion tools in GitHub Actions, build the site, and validate image references. Success: clean generation and Jekyll build pass locally.

## Status

- [x] Stage 1
- [x] Stage 2
- [x] Stage 3
- [x] Stage 4

---

# Feature Slideshow Plan

## Goal

Replace large feature GIFs with lightweight, automatically cycling WebP/PNG slideshows that reuse the App's current screenshots and remain readable when animation is disabled.

## Source Images

- Input modes: copy the light variants of `input_modes_1` through `input_modes_4`.
- Letter case: copy the light variants of `case_auto`, `case_lower`, and `case_caps`.
- Next-word suggestions: copy the light variants of `nextword_learn_1` through `nextword_learn_5`.
- Emoji keyboard: needs an additional ordered screenshot set before its GIF can be replaced. Until then, retain `emoji-keyboard.gif`.

## Stages

1. **Prepare slideshow assets** — Copy and consistently rename the three available screenshot sequences into `assets/`, keeping PNG sources in version control and generating WebP through the existing build. Success: each sequence has equal-size, ordered source images and a generated WebP for every image.
2. **Add slideshow data and markup** — Extend feature configuration to accept an ordered `slideshow` image list while preserving the existing single `image` path. Render the first image as the no-JavaScript fallback. Success: static and slideshow feature cards use the same reusable markup without duplicating feature content.
3. **Implement progressive enhancement** — Add a small shared script that advances slides every 0.7 seconds, pauses when the page is hidden or the card is hovered/focused, and leaves the first slide static for `prefers-reduced-motion`. Success: all three sequences cycle independently without layout shift and remain useful without JavaScript.
4. **Style and verify** — Keep a fixed aspect ratio per slideshow, add a subtle position indicator, test desktop/mobile layouts, validate fallback paths, and compare transferred bytes against the current GIF/WebP files. Success: Jekyll builds cleanly, accessibility behavior passes, and the replacement downloads less data than the existing animations.

## Tests

- `make build`
- Validate every rendered PNG/WebP reference exists in `_site`.
- Verify JavaScript-disabled output shows the first slide.
- Verify `prefers-reduced-motion: reduce` prevents automatic cycling.
- Verify hover/focus and background-tab pause behavior.
- Check mobile and desktop cards for clipping or layout shift.

## Status

- [x] Stage 1
- [x] Stage 2
- [x] Stage 3
- [ ] Stage 4 — automated checks pass; desktop/mobile visual verification remains
- [ ] Emoji screenshot set supplied
