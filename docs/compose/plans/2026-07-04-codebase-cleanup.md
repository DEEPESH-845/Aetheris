# Codebase Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove dead code, unused files, duplicate dependencies, and fix structural issues across the Aetheris codebase.

**Architecture:** Delete unused artifacts, remove empty directories, clean up CSS, fix type issues, and correct the middleware filename.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Clerk, Zustand, Framer Motion

## Global Constraints

- Do NOT modify any working component logic beyond the listed fixes
- Preserve all existing imports and module resolution paths where possible
- Run `npm run build` after all changes to verify nothing breaks

---

### Task 1: Remove Unused NPM Dependencies

**Files:**
- Modify: `package.json`

**Steps:**
- [x] Remove `@paper-design/shaders-react`, `d3`, and `@types/d3` from dependencies
- [x] Run `npm install` to update lockfile
- [x] Verify build: `npm run build`

### Task 2: Delete Empty Directories and Dead Files

**Files:**
- Delete: `src/types/` (empty)
- Delete: `src/styles/` (empty)
- Delete: `src/components/simulation/` (empty)
- Delete: `src/components/core/Skeleton.tsx` (never imported)

**Steps:**
- [x] Remove empty directories and Skeleton.tsx
- [x] Verify build: `npm run build`

### Task 3: Remove Boilerplate and Stale Files

**Files:**
- Delete: `public/next.svg`, `public/vercel.svg`, `public/globe.svg`, `public/file.svg`, `public/window.svg`
- Delete: `repomix-output.xml`
- Delete: `skills-lock.json`
- Delete: `tsconfig.tsbuildinfo`
- Delete: `next-env.d.ts`
- Delete: `backend/telemetry_generator.py` (dead, broken imports)
- Delete: `backend/__pycache__/` (should never be committed)

**Steps:**
- [x] Remove all listed files
- [x] Verify build: `npm run build`

### Task 4: Clean CSS — Remove Unused Utilities and Theme Token

**Files:**
- Modify: `src/app/globals.css:48-61` — remove `.neon-border`, `.neon-text-cyan`, `.neon-text-magenta`
- Modify: `src/app/globals.css:11` — remove `--color-neon-blue`

**Steps:**
- [x] Remove the three unused utility classes (lines 48-61)
- [x] Remove `--color-neon-blue` theme variable (line 11)
- [x] Verify build: `npm run build`

### Task 5: Fix Type Issues and Naming

**Files:**
- Modify: `src/app/dashboard/topology/page.tsx:18` — change `any` to `Variants` from framer-motion
- Modify: `src/app/dashboard/ai-core/page.tsx:159` — rename `AICorePagePage` to `AICorePage`

**Steps:**
- [x] Fix the `any` type in topology page
- [x] Fix the doubled function name in ai-core page
- [x] Verify build: `npm run build`

### Task 6: Remove Unused Import and Dead Export

**Files:**
- Modify: `src/app/dashboard/orchestration/page.tsx:8` — remove unused `sendToBackend` import
- Modify: `src/simulation/engine.ts:7` — remove the exported `sendToBackend` variable and all its assignments

**Steps:**
- [x] Remove the unused import from orchestration page
- [x] Remove `sendToBackend` export and all assignments in engine.ts
- [x] Verify build: `npm run build`

### Task 7: Clean Git Tracking

**Steps:**
- [x] Update `.gitignore` to add `__pycache__/`
- [x] Clean leading blank lines in `.gitignore`
