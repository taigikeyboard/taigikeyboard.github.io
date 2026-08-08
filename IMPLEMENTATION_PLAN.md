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
