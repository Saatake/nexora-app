# Rich Project Portfolios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Generate distinct portfolio drafts grounded in rich project media and contribution data, then render those saved materials safely in public portfolios.

**Architecture:** The authenticated API loads selected projects with ordered content blocks and collaborators, sends bounded text and owned-storage images to Gemini, and returns a validated versioned composition. Portfolio save/read DTOs preserve approved project media/contributor evidence, while React renders only safe text, links, validated YouTube embeds, and allowlisted design variants.

**Tech Stack:** ASP.NET Core 10, EF Core/Npgsql, xUnit, React 19, TypeScript, Vite, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-11-12-project-rich-portfolios-design.md`

## Global Constraints

- Never execute model-generated HTML, JSX, JavaScript, or CSS.
- Use stored member contribution fields only for individual attribution; do not assign another member's work to the portfolio owner.
- Keep each analyzed image at or below 5 MiB and aggregate analyzed images at or below 12 MiB; use owned project storage URLs only.
- Keep public privacy filtering, project ownership validation, and existing AI request rate limits.
- Do not call Gemini on public portfolio page views.

## Review Focus

- Private project media must not appear in public responses.
- A collaborator's role/contribution must never be presented as the portfolio owner's.
- Arbitrary URLs and unsafe protocols must never become fetched images, anchors, or iframe sources.
- Unknown design values and legacy responses must normalize to a safe composition.
- Large/missing/corrupt image blocks must be skipped within current byte limits without failing generation.

---

### Task 1: Evidence construction and AI design contract

**Files:**
- Create: `backend/Services/PortfolioProjectEvidence.cs`
- Modify: `backend/Controllers/PortfolioController.cs`
- Modify: `backend/Services/PortfolioAiDraftService.cs`
- Modify: `backend/Dtos/Responses/PortfolioDesignSpecDto.cs`
- Test: `backend-tests/PortfolioProjectEvidenceTests.cs`
- Test: `backend-tests/PortfolioDesignSpecTests.cs`

**Interfaces:**
- `PortfolioProjectEvidence.Create(Project, string ownerId)` returns bounded serializable evidence for that project, including ordered content blocks and per-member attribution.
- Design spec v2 adds `mediaLayout` and the `field-notes` and `gallery-led` directions; old version 1 payloads continue to normalize via the safe legacy path.

- [x] Write tests for evidence ordering/attribution and invalid or unknown design values.
- [x] Run tests and confirm the new behavior fails before implementation.
- [x] Load content blocks and collaborators for the generation request without changing ownership/privacy checks.
- [x] Extend generation schema and prompt to select materially distinct directions using the actual project material.
- [x] Run focused backend tests and build.

### Task 2: Persist and return project presentation data

**Files:**
- Modify: `backend/Dtos/Responses/PortfolioResponseDto.cs`
- Modify: `backend/Controllers/PortfolioController.cs`
- Modify: `backend/Repositories/ProjectRepository.cs` only if shared query behavior is needed
- Test: `backend-tests/PortfolioResponseTests.cs`

**Interfaces:**
- Each portfolio project response includes ordered content blocks and contributor records with display name, role, and contribution.
- Private projects remain filtered from public response exactly as today.

- [x] Write tests for portfolio response projection, legacy empty values, and private project filtering.
- [x] Run focused tests and confirm missing media/contributor projection fails before implementation.
- [x] Project safe content blocks and member records in draft, save/reopen, and public response flows.
- [x] Run focused backend tests and build.

### Task 3: Render media and distinct compositions

**Files:**
- Modify: `agora-frontend/src/features/portfolio/types.ts`
- Modify: `agora-frontend/src/features/portfolio/PortfolioRenderer.tsx`
- Modify: `agora-frontend/src/pages/PortfolioEditorPage.tsx`
- Test: `agora-frontend/src/features/portfolio/types.test.ts`

**Interfaces:**
- Renderer consumes typed content blocks and contributor records from each portfolio project.
- YouTube blocks render a “Vídeo pitch” label and an embed URL built only from a validated YouTube ID.
- Support five directions and three media layouts through allowlisted React classes/components.

- [x] Write tests for legacy normalization, unknown enum fallback, and unsafe media URL rejection.
- [x] Run focused tests and confirm new media/design behavior fails before implementation.
- [x] Render text, image, YouTube, document, and link blocks with accessible responsive treatment and member-specific roles.
- [x] Render `field-notes` and `gallery-led`; keep distinct composition decisions stronger than palette differences.
- [x] Run frontend tests and build.

### Task 4: Verify integrated portfolio flow

**Files:**
- Modify: `docs/superpowers/specs/2026-11-10-ai-generated-student-portfolios-design.md`
- No other files unless verification finds a defect.

- [x] Run focused backend tests, the full backend test suite, and frontend test/build commands.
- [x] Inspect the final diff for privacy, SSRF, unsafe iframe/link URLs, token logging, and regressions in legacy portfolios.
- [x] Record live Gemini generation as a local/manual check; it was not invoked during automated verification.

## Verification record

- Backend: 29/29 xUnit tests passed; API build passed. The custom output folder was used because the running local API held the normal `backend/bin` assembly open.
- Frontend: 16/16 Node tests passed; TypeScript and Vite production build passed.
- NuGet vulnerability metadata could not reach `api.nuget.org` in the sandbox; builds completed with the existing NU1900 warning.
