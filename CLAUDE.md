# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `pnpm dev`
- **Build**: `pnpm build` (runs TypeScript compilation then Vite build)
- **Lint**: `pnpm lint`
- **Preview production build**: `pnpm preview`

## Architecture

This is a React 19 + TypeScript + Vite application for mahjong-related tools.

**Stack:**

- React 19 with Vite 7
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- shadcn/ui components using Base UI primitives (base-vega style)
- class-variance-authority for component variants
- Lucide React for icons

**Path Aliases:**

- `@/*` maps to `./src/*`

**UI Components:**

- Components live in `src/components/ui/` and use Base UI primitives (e.g., `@base-ui/react`)
- Use `cn()` from `@/lib/utils` for merging Tailwind classes
- Add new shadcn components via: `npx shadcn@latest add <component-name>`

**Code Style:**

- Prettier with tailwindcss plugin for class sorting
- ESLint with TypeScript, React Hooks, and React Refresh rules

## UI Design Principles

UI設計時は以下のドキュメントを参照してください:
https://raw.githubusercontent.com/anthropics/claude-code/refs/heads/main/plugins/frontend-design/skills/frontend-design/SKILL.md
