# Social links — 2026-10-25

- Add supplied Facebook page/group, LINE, Discord, Instagram, Threads and GitHub repository to shared footer. Retain existing email and LinkedIn.
- Reuse inline Font Awesome SVG and monochrome hover styling; use icons only, with localized accessible names and title hints for Facebook destinations. Wrap on mobile, retain focus outlines and 44px targets.
- Grounded in `_includes/footer.html`, `_sass/_landing.scss`, `_config.yml`; aligns with code-review rules §1–5. No dependency or JavaScript added.
- Verify production/baseurl builds, locale checker, exact destinations and server-free desktop/mobile Chrome rendering. Independent pre/post review; Codex simplification checklist. Merge remains user-gated.

# Accepted website refinements

- Retain original all-platform download layout. Detected-device download experiment reverted; about typography and hero imagery skipped by user.
- Accepted: remove typing guide section/navigation, compact mobile navigation, consistent prose links, color-only download/social hover, compact footer/localized policy labels, Windows-only concise signing note, tighter install spacing, policy command wrapping.
- Include user's Taiwanese sponsor paragraph/Ko-fi copy edits. Locale checker permits differing counts of prose strings while preserving object-array structure/type checks.
- Validate final production/baseurl builds, locales, JS syntax, independent full-diff review and server-free desktop/mobile checks. User requested commit/push2026-10-24; update PR25 scope, merge still requires user instruction. Do not start/restart servers.

# Mobile navigation preview

- User approved2026-10-24: mobile one-row logo/language/menu; expand chapter links on demand, desktop and original downloads preserved; no sliding animation. User owns server starts/restarts.
- Reuse one navigation list, localized accessible toggle and native language disclosure. Progressive enhancement retains visible links without JavaScript. Escape/outside/link/focus-leave close; language/navigation mutually exclusive; reset at breakpoint.
- Best practices: shared code-review rules §1–5; standard button/disclosure semantics, no duplicate links/dependencies. Validate all locales, desktop/mobile widths, keyboard, language switching, no-JavaScript and legal pages using server-free Chrome.
- Keep local for user inspection/revert; preserve earlier typing-guide removal and user's Taiwanese copy edits.

# Donation chooser

- User approved (2026-10-24): one primary support button; choose payment in centered desktop dialog / mobile bottom sheet, quiet rows with separators and arrows.
- Reuse payment configuration and one translated link list. Native details provides no-JavaScript access; enhance same content into native modal dialog.
- Native dialog supplies focus containment and Escape; localize heading/close, restore trigger focus, dismiss backdrop safely, cap sheet height and respect safe areas.
- Best practices: code-review rules §1–5; existing shared template/data model, no payment SDK, no duplicated links. Independent approach review passed with accessibility and typography checks to validate.
- Validate production/locales, browser desktop/mobile/short landscape, keyboard/close/backdrop, no-JavaScript, payment URLs. Update existing PR #25; merge remains user-gated.

# Ko-fi donation link

- Scope: add the supplied Ko-fi URL alongside ECPay and PayPal in all three languages.
- Approach: extend existing payment configuration and locale entries; reuse template and responsive styles.
- Alignment: existing data-driven rendering; no new integration or abstraction (code-review rules §1–4).
- Validation: production Jekyll build, locale checks, rendered Ko-fi links in all three languages, whitespace check.
- Mechanical configuration/content addition: Codex simplification checklist; no design review sandwich needed.
- Publication: prepare PR; merge requires user instruction.

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
