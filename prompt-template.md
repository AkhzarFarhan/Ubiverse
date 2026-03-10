# Ubiverse Reusable Prompt Template

Copy, paste, and fill this in when asking an LLM to add or modify a feature in this repo.

---

## Full prompt template

Read [AGENTS.md](AGENTS.md), [rules.md](rules.md), [architecture.md](architecture.md), [modules.md](modules.md), [workflows.md](workflows.md), [skills.md](skills.md), and [current-state.md](current-state.md) first.

Then work on the Ubiverse repository using the documented architecture and constraints.

### Task
[Describe the feature, bug fix, refactor, or UI improvement clearly.]

### Goal
[Describe the end-user outcome and why this change is needed.]

### Relevant area
- Module/file likely involved: [example: Ledger / Tasbih / app shell / auth / deployment]
- User flow affected: [describe briefly]

### Requirements
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]
- [Requirement 4]

### Constraints
- Preserve the current vanilla HTML/CSS/JS architecture
- Keep the app mobile-first and touch-friendly
- Reuse existing helpers and module patterns where possible
- Do not add frameworks, build tools, or unnecessary dependencies
- Preserve Firebase + localStorage behavior unless explicitly changing it
- Update relevant `.md` docs if the behavior materially changes
- Add tests or a manual test checklist when applicable

### Implementation instructions
- First summarize the current architecture relevant to this task
- Identify which files should change before editing
- Keep edits minimal and focused
- Preserve existing style and conventions
- Avoid unrelated refactors

### Deliverables
- Implement the requested functionality
- Update styles if needed
- Briefly summarize which files changed and why
- Include manual test steps

---

## Short prompt template

Read [AGENTS.md](AGENTS.md), [rules.md](rules.md), [architecture.md](architecture.md), [modules.md](modules.md), and [current-state.md](current-state.md) first. Then implement this change in Ubiverse using the existing vanilla JS module pattern and mobile-first styling:

[Describe your feature here]

Constraints:
- no frameworks
- preserve existing architecture
- keep Firebase/localStorage behavior intact unless needed
- update docs if behavior changes
- include test steps

---

## Example prompt

Read [AGENTS.md](AGENTS.md), [rules.md](rules.md), [architecture.md](architecture.md), [modules.md](modules.md), [workflows.md](workflows.md), [skills.md](skills.md), and [current-state.md](current-state.md) first.

Then implement a recurring transaction feature in the Ledger module.

Requirements:
- Allow marking an entry as recurring monthly
- Show recurring transactions in a separate section
- Keep the current fast-entry Ledger UX
- Keep the UI compact on mobile
- Preserve current Firebase path structure unless a change is required
- Update docs if storage or behavior changes
- Include manual test steps

---

## Best results tips

- Be specific about the module name.
- State the expected user behavior, not just the technical change.
- Mention whether storage, auth, routing, or deployment should remain unchanged.
- If the task is sensitive, explicitly say: “avoid unrelated refactors”.
- If you want higher confidence, add: “Summarize the plan before editing, then implement.”
