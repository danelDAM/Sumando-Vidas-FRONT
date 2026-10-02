# AGENTS.md

## Project

Vite + React + TypeScript website for Por Ellos.

## Rules

- Make the smallest change necessary to complete the task.
- Inspect only files relevant to the task.
- Do not read the entire repository unless necessary.
- Before creating anything, check whether an existing component, hook, utility, style, or data structure can be reused.
- Prefer modifying existing code over creating parallel implementations.
- Do not refactor unrelated code.
- Do not introduce dependencies, frameworks, libraries, or tooling unless required.
- Preserve existing architecture and conventions.
- Keep user-facing content in Spanish unless explicitly requested otherwise.
- Keep UI responsive and consistent with the existing design.
- Do not invent content, data, claims, or organization information.

## Structure

- `src/main.tsx` → application entry
- `src/App.tsx` → routes
- `src/components/` → shared components
- `src/pages/` → pages
- `src/data/` → navigation and reusable content
- `src/styles/` → global/shared styles
- `src/hooks/` → custom hooks

## Workflow

1. Understand the request.
2. Locate only the relevant files.
3. Reuse existing code where possible.
4. Make the smallest viable change.
5. Validate with `npm run build` when code was modified.
6. Report only relevant changes and issues.

## Token efficiency

- Do not explain obvious code or architecture.
- Do not repeat information already present in the repository.
- Do not inspect unrelated files.
- Do not generate large amounts of code when a smaller change is sufficient.
- Prefer targeted searches over reading large files.
- Stop investigating once enough context is available to safely implement the task.