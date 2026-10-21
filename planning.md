# Regional sponsorship links

- Scope: preserve ECPay for Taiwan only; add hosted PayPal link for overseas support in USD.
- Approach: configure two payment methods, render both in the sponsor section, wrap options on narrow screens.
- Integration: use ordinary links; no payment SDK or payment data handled by this site.
- Review: independent pre-implementation review found no blockers; check note specificity and narrow-screen sizing.
- Validation: production Jekyll build, rendered sponsor markup, independent diff review.
- Completed: `make build`, generated HTML inspection, `git diff --check`, and independent diff review passed. Browser preview unavailable because browser connection failed; no visual QA or live payment test claimed.
- Publication: prepare branch and PR; merge requires user instruction.

## English and Japanese website

- Keep Taiwanese at `/`; add `/en/` and `/ja/` with shared templates and explicit locale data.
- Translate homepage navigation, content, installation, sponsorship, metadata, and accessibility labels. Preserve shared release data, payment URLs, platform IDs, and feature switches.
- Keep existing typing reference artwork in Taiwanese with a localized caption. Existing English legal pages remain in English and are labeled accordingly; language switch links lead to localized homepages.
- Add native-language links, active language state, canonical and alternate-language metadata; no automatic redirection.
- Use a wrapping sticky navigation bar so longer translations remain accessible on mobile without covering content.
- Independent approach review passed. Validate locale completeness, production builds, generated metadata/internal links, baseurl handling, and download gating; request independent final review.
- This branch depends on pending sponsorship PR #23. Do not merge or publish without user instruction.
- Completed: three-locale production build/check, `/preview` baseurl build/check, desktop-download-disabled and features-enabled build/check. Open Graph locales corrected and independently re-reviewed: SHIP. Codex simplification checklist passed; browser visual QA unavailable because browser connection fails.
- Current design direction (user, 2026-10-21): restrained Apple style without generic AI decoration. Transparent globe/current-language/chevron disclosure, plain white language list with fine border, small corner radius and minimal shadow. Native details/summary and links work without JS; enhancement dismisses on Escape, outside click, and focus leaving. Preserve visible keyboard focus; no animations.
- Alignment correction approved: desktop logo stays left; navigation uses auto leading margin to group links with the language switch on the right, with 32px between those groups. Reset margins on mobile to retain icon/language first row and navigation second row.
- Actual Chrome alignment check found inline navigation text 1.2px lower than the language globe. Use 44px flex-centered navigation links with explicit line-height, matching language trigger geometry. Use deliberate two-row navigation through 1100px to prevent orphan language controls; keep mobile typography and hidden brand at 768px.
