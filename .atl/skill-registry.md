# Skill Registry — MiGrilla

> Generated: 2026-04-09
> Project: migrilla
> Working directory: /home/joaquinvesapa/work/MiGrilla

## Project Convention Files

| File | Path | Role |
|------|------|------|
| AGENTS.md | /home/joaquinvesapa/work/MiGrilla/AGENTS.md | Project conventions, build commands, code style |
| AGENTS.md (user) | /home/joaquinvesapa/.config/opencode/AGENTS.md | Global agent behavior, personality, engram protocol |

## Project-Level Skills

| Skill | Path | Trigger |
|-------|------|---------|
| remotion-best-practices | .agents/skills/remotion-best-practices/SKILL.md | Best practices for Remotion video creation in React |

## User-Level Skills (~/.config/opencode/skills/)

| Skill | Trigger |
|-------|---------|
| branch-pr | Creating a pull request, opening a PR, or preparing changes for review |
| go-testing | Writing Go tests, using teatest, or adding test coverage |
| issue-creation | Creating a GitHub issue, reporting a bug, or requesting a feature |
| judgment-day | "judgment day", "review adversarial", "dual review", "juzgar" |
| release-docs | "release docs", "documentar release", "generar ADRs", "release notes" |
| sdd-apply | Implement tasks from a change (orchestrator launches) |
| sdd-archive | Archive a completed change (orchestrator launches) |
| sdd-design | Write technical design document (orchestrator launches) |
| sdd-explore | Explore/investigate ideas before committing (orchestrator launches) |
| sdd-init | Initialize SDD in a project, "sdd init", "iniciar sdd" |
| sdd-onboard | Guided SDD walkthrough (orchestrator launches) |
| sdd-propose | Create a change proposal (orchestrator launches) |
| sdd-spec | Write specifications/scenarios (orchestrator launches) |
| sdd-tasks | Break down a change into tasks (orchestrator launches) |
| sdd-verify | Validate implementation against specs (orchestrator launches) |
| skill-creator | Creating a new skill, adding agent instructions |
| skill-registry | "update skills", "skill registry", "actualizar skills" |

## User-Level Skills (~/.config/opencode/skill/)

| Skill | Trigger |
|-------|---------|
| ai-sdk-5 | Building AI chat features (breaking changes from v4) |
| blazor-wasm-dx | Writing Blazor components, .razor files, DevExpress UI |
| django-drf | Building REST APIs with Django — ViewSets, Serializers, Filters |
| dotnet-ports | Writing C# code in Ports.* projects |
| efcore-ports | Writing database code with EF Core + SQL Server |
| jira-epic | Creating a Jira epic, large feature, or multi-task initiative |
| jira-task | Creating a Jira task, ticket, or issue |
| nextjs-15 | Working with Next.js — routing, Server Actions, data fetching |
| playwright | Writing E2E tests — Page Objects, selectors, MCP workflow |
| ports-api | Writing ASP.NET Core controllers, API endpoints, middleware |
| pr-review | Reviewing a PR, checking a PR, given a PR URL |
| pytest | Writing Python tests — fixtures, mocking, markers |
| react-19 | Writing React components (React Compiler, no useMemo/useCallback) |
| sdd-apply | Implement tasks from a change (orchestrator launches) |
| sdd-archive | Archive a completed change (orchestrator launches) |
| sdd-design | Write technical design document (orchestrator launches) |
| sdd-explore | Explore/investigate ideas (orchestrator launches) |
| sdd-init | Initialize SDD in a project |
| sdd-propose | Create a change proposal (orchestrator launches) |
| sdd-spec | Write specifications (orchestrator launches) |
| sdd-tasks | Break down a change into tasks (orchestrator launches) |
| sdd-verify | Validate implementation (orchestrator launches) |
| skill-creator | Creating a new skill, documenting patterns for AI |
| tailwind-4 | Styling with Tailwind — cn(), theme variables |
| typescript | Writing TypeScript — types, interfaces, generics |
| zod-4 | Using Zod for validation (breaking changes from v3) |
| zustand-5 | Managing React state with Zustand |

## ~/.agents/skills/ (User)

| Skill | Trigger |
|-------|---------|
| find-skills | "find a skill for X", "is there a skill that can..." |
| supabase-postgres-best-practices | Writing, reviewing, or optimizing Postgres queries / schema |
| vercel-react-best-practices | React/Next.js performance optimization |
| web-design-guidelines | "review my UI", "check accessibility", "audit design" |

## Stack-Specific Auto-Load Rules (MiGrilla)

Based on project stack (Next.js 16 + React 19 + Supabase + Tailwind 4), auto-load these skills:

| Context | Skill |
|---------|-------|
| Writing/modifying React components | react-19 |
| Styling with Tailwind classes | tailwind-4 |
| Writing TypeScript types/interfaces | typescript |
| Working on Next.js routing/Server Actions | nextjs-15 |
| Writing Zod schemas | zod-4 |
| Supabase query optimization | supabase-postgres-best-practices |
| Writing Vitest tests | (no dedicated vitest skill — use testing patterns directly) |
| Creating a PR | branch-pr |
| Creating a GitHub issue | issue-creation |
