# Deepesh's Agent Instructions

These are common instructions for Deepesh's agents across all scenarios.

## General Guidelines

- Never use the em dash "—". Use the plain dash "-" instead.
- When writing commit messages, NEVER auto-add your agent name as a co-author.
- Never manually modify `CHANGELOG.md` files or any files that are marked as auto-generated.
- When writing or substantially editing long Markdown files, put each full sentence on its own line.
  - Preserve normal Markdown structure.
  - Avoid wrapping multiple sentences onto one physical line.
- When making technical decisions, do not give much weight to development cost.
  - Prefer quality, simplicity, robustness, scalability, and long-term maintainability.
- When fixing bugs, always start by reproducing the bug in an end-to-end (E2E) environment that closely matches the end-user experience.
  - This ensures you identify the actual root cause so the fix genuinely resolves the issue.
- When performing end-to-end testing on a product, be extremely meticulous about the UI and strive for pixel-perfect quality.
  - If something clearly looks off, even if it is unrelated to your current task, attempt to fix it as well.
- Apply the same high standards to engineering excellence:
  - Resolve lint issues.
  - Fix failing tests.
  - Eliminate flaky tests.
  - If you notice an issue, even if it was not introduced by your current work, fix it whenever reasonable.

## Deepesh's Opinions

When working on something that would benefit from Deepesh's viewpoints, read:

# Voice Profile

When writing, speaking, or posting on behalf of Deepesh using his identity, read: ~/VOICE.md to see how Deepesh talks.
