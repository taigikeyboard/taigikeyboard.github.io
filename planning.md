# Regional sponsorship links

- Scope: preserve ECPay for Taiwan only; add hosted PayPal link for overseas support in USD.
- Approach: configure two payment methods, render both in the sponsor section, wrap options on narrow screens.
- Integration: use ordinary links; no payment SDK or payment data handled by this site.
- Review: independent pre-implementation review found no blockers; check note specificity and narrow-screen sizing.
- Validation: production Jekyll build, rendered sponsor markup, independent diff review.
- Completed: `make build`, generated HTML inspection, `git diff --check`, and independent diff review passed. Browser preview unavailable because browser connection failed; no visual QA or live payment test claimed.
- Publication: prepare branch and PR; merge requires user instruction.
