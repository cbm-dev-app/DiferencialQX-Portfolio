# Architecture

## Boundaries

| Layer | Location | Responsibility |
| --- | --- | --- |
| Navigation | `app/` | Session setup, examination, results, history and detail routes |
| State | `store/exam-attempt-store.tsx` | Validate a session and control its state transitions |
| Presentation | `components/attempt-review-content.tsx` | Render scores, answers and case references |
| Data adapter | `lib/attempts-service.ts` | Calculate scores, save session-only snapshots, retrieve reviews |
| Fixtures | `data/demo-cases.ts` | Original synthetic cases and case-level randomization |
| Contracts | `types/exam.ts` | Case, question, answer and session types |

## State transitions

`idle → in_progress → submitted`; reset returns to `idle`.

Starting a session checks case count, unique case identifiers, references, and grouped question structure. Answer selection is restricted to the current unsubmitted case. Advancing requires every question in that case to be answered. Final submission requires the last case and all preceding cases to be complete.

Questions use four options and one correct answer. Answer keys combine case and question identifiers. References are displayed during review. The service recalculates the score from case snapshots and selected answers when saving.

## Persistence and privacy

The demo adapter stores attempts only in JavaScript memory. It never initializes Firebase, authenticates a user, invokes a store purchase, or imports administration scripts. `portfolio-demo` is a fixed demonstration identifier, not an account.

This adapter is a deliberate portfolio boundary. Production account authorization, entitlement enforcement, server-side validation and durable storage require separate design and verification.

## Design decisions

The source exam, review and history screens were retained to demonstrate actual project work. A new setup screen makes the disconnected edition explicit. Existing Spanish field names and interface language are retained to minimize changes to the domain model. Demo data is generated independently of the private CSV bank and original mock cases.

The PRD describes an `opciones[]` field while local source types use individual A–D fields. This edition documents and preserves the implemented A–D contract; it makes no production schema changes.
