---
name: _shared-conventions
description: Shared development conventions applied to all dev agents. Simple, generic, and stable.
---

# Shared Development Conventions

These rules apply to **all development agents**.
They define **how we build software here**, not what technology we use.

Keep this document **small, stable, and boring**.

---

## 1. Core principles

- **KISS**: prefer the simplest solution that works.
- **SOLID (pragmatic)**: single responsibility, explicit boundaries.
- **YAGNI**: do not build for hypothetical future needs.
- **Clean Code**: readable, intentional naming, small units.

---

## 2. Small, incremental work

- All work must be split into **small, independent slices**.
- Each slice:
  - has one clear goal
  - has one owner
  - can be integrated safely
- Large changes must be split before implementation.

---

## 3. Contracts over assumptions

- Never assume behavior of another part of the system.
- Dependencies must be expressed as **explicit contracts**.
- If a contract is missing, define it before coding.

---

## 4. Explicit over implicit

- Make decisions visible in code or docs.
- Avoid hidden coupling and side effects.
- Prefer clarity over cleverness.

---

## 5. Change safety

- Prefer additive, non-breaking changes.
- Avoid touching unrelated code.
- Breaking changes require:
  - explicit acknowledgment
  - migration or rollback plan

---

## 6. Consistency first

- Follow existing patterns unless they are clearly broken.
- Consistency is more important than personal preference.
- New patterns must be documented and applied consistently.

---

## 7. Versioned decisions (light ADR)

When a change:
- affects architecture,
- changes a shared contract,
- introduces a new pattern,
- or impacts multiple slices or agents,

a short decision record (ADR) MUST be written.

### Approval rule

If the ADR has **structural or long-term impact**, the agent MUST:
1) create the ADR with status `Proposed`
2) present it to the user
3) wait for explicit user acceptance

Only after acceptance may the ADR be marked `Accepted`
and implementation may proceed.

Low-risk or informational ADRs do not block execution.

### Rules
- Keep it short (1 page max).
- One decision per file.
- Focus on *why*, not implementation details.

### Location
- `docs/adr/ADR-###.md`

### Minimal format
- Context
- Decision
- Consequences

If no ADR exists, future agents may challenge or revert the decision.

---

## 8. Naming rules

- Names must express intent clearly.
- Avoid abbreviations and numeric names.
- Names should remain understandable out of context.

---

## 9. Errors & safety

- Errors must be explicit and actionable.
- Silent failures are not acceptable.
- Never hide or swallow errors.

---

## 10. Reviewability

- Changes must be easy to review.
- Avoid mixing unrelated concerns.
- Keep slices small and focused.

---

## 11. Testing & verification

- Every slice must include:
  - how to verify it works
- Test effort should match risk and impact.

---

## 12. Bounded improvement

- Leave touched code slightly better if it’s safe.
- Do not refactor outside the slice scope.

---

## Final rule

When requirements or decisions are unclear:
- choose the safest simple default
- make behavior explicit
- document assumptions
- reduce scope
- move forward