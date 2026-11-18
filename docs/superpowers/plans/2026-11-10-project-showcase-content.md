# Project Showcase Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let students publish course-agnostic project pages with ordered media/text blocks, clear contribution credit, and searchable catalog tags.

**Architecture:** Store typed project content blocks as related EF records. Validate all submitted block types and URLs on the API, upload images/PDFs through authenticated storage endpoints, and render only the supported types in the project page. Use a searchable fixed tag catalog with canonical values and preserve legacy project fields and enum values.

**Tech Stack:** React, TypeScript, Vite, ASP.NET Core 10, EF Core, PostgreSQL, xUnit, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-10-project-showcase-content-design.md`

## Global Constraints

- Content types are `Text`, `Image`, `YouTube`, `Document`, and `Link`.
- External content URLs must use HTTPS. YouTube embeds accept only recognized YouTube hosts and valid video IDs.
- Existing project category numeric values, stored tags, cover, GitHub link, and PDF link remain readable.
- The feature does not call Gemini.

## Review Focus

- Unsafe URL schemes or look-alike YouTube hosts never render; test rejection in the API validator and frontend URL parser.
- Text/media blocks missing required content fail validation; test both empty and valid content.
- Existing projects with no content blocks still render their legacy cover and links; test fallback in the content renderer.
- Updating blocks preserves their submitted order and removes deleted blocks; test service persistence.
- Unknown tag values do not enter the new catalog flow; test canonical alias mapping and rejection.

---

### Task 1: Red contract tests

**Files:**
- Create: `backend-tests/ProjectShowcaseContractTests.cs`

- [x] Write failing tests for broad formats, ordered content records, contributor fields, and valid/invalid YouTube/text block validation.
- [x] Run only `ProjectShowcaseContractTests` and confirm assertion failures describe missing behavior.

### Task 2: Domain, validation, persistence, and API contract

**Files:**
- Create: `backend/Models/ProjectContentBlock.cs`
- Create: `backend/Enums/ProjectContentBlockType.cs`
- Create: `backend/Services/ProjectContentBlockValidator.cs`
- Modify: `backend/Models/Project.cs`, `ProjectCollaborator.cs`
- Modify: `backend/Enums/ProjectCategory.cs`
- Modify: request/response DTOs, `AppDbContext`, `ProjectService`, `ProjectRepository`, and `ProjectController`
- Create: EF migration for content blocks and contribution fields
- Modify/Test: `backend-tests/ProjectShowcaseContractTests.cs`

- [x] Add the block entity/type and contributor fields, preserving current enum values.
- [x] Add tests for canonical tags, safe/unsafe block URLs, empty text, block limits, and service create/update order.
- [x] Run tests to confirm those behavior assertions fail before implementing the rules.
- [x] Implement server validation, canonical tag catalog, create/update mapping, and block persistence.
- [x] Create and inspect the EF migration without applying it to a shared database.
- [x] Run focused tests to verify valid requests pass and invalid requests fail.

### Task 3: Frontend behavior tests

**Files:**
- Modify: `agora-frontend/package.json` and lockfile
- Create: `agora-frontend/src/features/project-form/projectContent.test.ts`
- Create/Modify: `agora-frontend/vite.config.ts`

- [x] Use Node's built-in test runner (no new test dependency) and add a `test` script.
- [x] Test valid YouTube URL parsing, invalid host/scheme rejection, block ordering, and tag catalog selection.
- [x] Run tests to confirm failures before adding the implementation helpers.
- [x] Add parsing/validation, tag selection, and submission helpers and run the focused suite.

### Task 4: Guided project composer

**Files:**
- Create: `agora-frontend/src/features/project-form/components/ProjectContentBuilder.tsx`
- Create: `agora-frontend/src/features/project-form/components/ProjectTagPicker.tsx`
- Modify: new/edit project hooks and pages, project form types, team form, and upload hook
- Modify/Test: frontend behavior tests

- [x] Add text, multi-image, YouTube, PDF, and link blocks with captions and move-up/down ordering.
- [x] Add author and collaborator contribution inputs.
- [x] Replace free-text tags with searchable canonical selections; broaden format choices while retaining legacy values in edit.
- [x] Persist typed blocks and selected tags from create and edit forms; keep old records editable.
- [x] Run frontend tests and production build.

### Task 5: Project page renderer

**Files:**
- Create: `agora-frontend/src/features/project-details/components/ProjectContentBlocks.tsx`
- Modify: project details page/types and project sidebar/team display
- Modify/Test: frontend behavior tests

- [x] Render text, images, YouTube embeds, PDF cards, and external links by block type.
- [x] Render contributor attribution and canonical tags.
- [x] Preserve legacy cover/GitHub/PDF fields when no content blocks exist.
- [x] Run frontend tests and production build.

### Task 6: Verification

- [x] Run the full backend test suite.
- [x] Run the frontend Node test suite and production build.
- [x] Review the migration and branch diff; report any blocked test infrastructure or remaining risk.
