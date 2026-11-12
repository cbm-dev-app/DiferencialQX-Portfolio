# Validation

Reviewed on 2026-11-12 using Node.js 24 on Windows.

| Check | Result |
| --- | --- |
| TypeScript (`tsc --noEmit`) | Passed |
| ESLint on application, domain and test source | Passed |
| Domain tests | 3 passed |
| Expo production web export | Passed |
| Mobile viewport walkthrough | Passed: setup, five cases, results, history, detail |
| Expected score | 15 correct answers, 100% |
| Reload behavior | Session-only attempt disappears |
| External requests during browser walkthrough | None; external requests were blocked and monitored |
| Browser runtime errors during walkthrough | None |
| Screenshot review | Four new images visually reviewed; synthetic content only |
| Dependency audit | Open findings; see SECURITY.md |

The domain tests cover all three session sizes, unique case IDs, ordered questions, references, scoring with unanswered questions, service-side recalculation within the local adapter, and lookup isolation by demo identity.

Native iOS/Android builds, purchases, real authentication and cloud behavior were not tested in this edition. The walkthrough does not constitute a clinical, accessibility or penetration-test certification.
