# AI-generated student portfolios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate, revise, save, and render a complete student portfolio with project-grounded writing and a persisted, individualized visual composition.

**Architecture:** Gemini returns a versioned JSON design specification plus portfolio and project copy. The API validates and stores that specification with the portfolio; React renders only allowlisted layouts, tokens, and variants. Existing portfolios receive a stable default design until regenerated.

**Tech Stack:** .NET 10, ASP.NET Core, EF Core/Npgsql, Mscc.GenerativeAI, React 19, TypeScript, Vite, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-11-10-ai-generated-student-portfolios-design.md`

## Global Constraints

- Never execute model-generated HTML, JSX, JavaScript, or CSS; render only validated design-spec values through React components.
- Use project material as the primary evidence; never invent personal contributions, outcomes, metrics, clients, awards, or skills.
- Use existing project covers only; retain the current 5 MiB per-image and 12 MiB aggregate image limits and storage URL ownership checks.
- Generate once and persist; public portfolio reads must never call Gemini or randomize a design.
- Keep the Gemini model configurable; record model, input/output token counts, and latency without logging prompt text, images, or personal content.
- The development editor must disclose that selected profile/project text and covers are sent to Gemini and explain that free-tier prompts may be used to improve Google products.
- Do not seed duplicate projects in the Neon development database.

## Review Focus

- Missing or malformed design fields must render with the safe default design; pin this in Task 4's legacy/default-layout verification.
- Unknown layout, color, typography, or image-treatment values must never reach CSS/render logic; pin rejection/fallback in Task 2's schema validation and Task 4's invalid-spec check.
- A model response must not add unselected project IDs or omit selected projects; pin exact ID-set validation in Task 2's response validation.
- Private or non-owned projects must not leak through generation, save, revision, or public reads; pin ownership/privacy scenarios in Task 3's API verification.
- A revision must preserve unrelated copy and composition, and save/publish must persist the previewed spec; pin these in Tasks 3 and 5's editor/API verification.

---

### Task 1: Persisted design contract and compatibility

**Files:**
- Modify: `backend/Models/Portfolio.cs`
- Modify: `backend/Data/AppDbContext.cs`
- Create: `backend/Dtos/Responses/PortfolioDesignSpecDto.cs`
- Modify: `backend/Dtos/Responses/PortfolioAiDraftDto.cs`
- Modify: `backend/Dtos/Responses/PortfolioResponseDto.cs`
- Modify: `backend/Dtos/Requests/SavePortfolioRequestDto.cs`
- Create: EF migration under `backend/Migrations/` and update `AppDbContextModelSnapshot.cs`
- Modify: `backend/Controllers/PortfolioController.cs`

**Interfaces:**
- Produce `PortfolioDesignSpecDto` with `Version`, `Direction`, `HeroLayout`, ordered `Sections`, `Typography`, `Colors`, `ImageTreatment`, and per-project `CardVariant`; enum-like values are strings validated against allowlists.
- Persist the spec as `Portfolio.DesignSpecJson` in a PostgreSQL `jsonb` column. API DTOs carry a typed `DesignSpec` object.
- Existing rows with null/empty design data map to one deterministic `classic-editorial` default spec.

- [x] Add the typed DTO and deterministic default-spec factory in a focused portfolio design-spec file.
- [x] Add nullable JSONB persistence and the matching EF migration; preserve existing rows without rewriting their copy.
- [x] Include `DesignSpec` in AI-draft, save-request, and portfolio-response contracts; map legacy rows to the default in `ToResponse`.
- [x] Build backend with `dotnet build backend/backend.csproj --no-restore`; expect successful compilation and only already-known package audit warnings if NuGet remains unreachable.
- [x] Inspect the generated migration and confirm it only adds the nullable design JSONB column.

### Task 2: Complete and validated Gemini generation

**Files:**
- Modify: `backend/Services/PortfolioAiDraftService.cs`
- Modify: `backend/Interfaces/IPortfolioAiDraftService.cs`
- Modify: `backend/Dtos/Responses/PortfolioAiDraftDto.cs`
- Modify: `backend/Program.cs`
- Modify: `backend/appsettings.example.json` (model setting only; no secrets)

**Interfaces:**
- `GenerateAsync(ApplicationUser user, IReadOnlyCollection<Project> projects) -> Task<PortfolioAiDraftDto>` returns copy, one project draft per selected project, validated design spec, model ID, nullable input/output token counts, generation latency, and image counts.
- `ReviseAsync(PortfolioAiDraftDto currentDraft, string instruction) -> Task<PortfolioAiDraftDto>` accepts only the existing draft and a bounded instruction; Gemini returns a typed sparse change set, and the service merges only those fields into the validated draft so fields outside the requested patch remain byte-for-byte unchanged.
- Read model name from `Gemini:PortfolioModel`, defaulting to the existing `gemini-2.5-flash-lite` value.

- [x] Define JSON schema enums, limits, version, section ordering, and all allowlisted variants in `PortfolioDesignSpecDto`; use a safe default when optional design properties are absent.
- [x] Update the generation prompt to produce complete copy and a distinct layout spec, treating images/project text as untrusted evidence and preserving the exact sentinel for unsupported individual contributions.
- [x] Validate response size, required copy, design version/enums, duplicate/extra/missing project IDs, and per-field length limits before returning; reject structurally invalid output with a recoverable service error.
- [x] Capture provider usage metadata and elapsed time when available; never log model input or personal/project content. Keep model ID available when token usage is absent.
- [x] Add bounded request timeouts/retry behavior only for transient provider rate limits; do not retry invalid output or make unbounded calls.
- [x] Build backend; confirm model selection/default and the typed response contract by code/SDK inspection. Leave live Gemini calls for the user's local testing.

### Task 3: Ownership-safe API generation, revision, and persistence

**Files:**
- Modify: `backend/Controllers/PortfolioController.cs`
- Modify: `backend/Dtos/Requests/PortfolioAiDraftRequestDto.cs` or add a revision request DTO under `backend/Dtos/Requests/`
- Modify: `backend/Dtos/Requests/SavePortfolioRequestDto.cs`
- Modify: `backend/Dtos/Responses/PortfolioResponseDto.cs`

**Interfaces:**
- Keep `POST /api/portfolios/me/ai-draft` authenticated and ownership-checked; return the full draft including `DesignSpec` and usage metadata.
- Add authenticated `POST /api/portfolios/me/ai-revision` with `{ draft, instruction }`; enforce a short maximum instruction length and the existing authenticated rate-limit policy.
- `PUT /api/portfolios/me` persists the submitted validated design spec along with text and project drafts; public `GET /api/portfolios/{slug}` returns saved spec only.

- [x] Add bounded revision request validation and route it to `ReviseAsync` without fetching or transmitting new profile/project material.
- [x] Validate submitted design specs server-side against the same allowlists before saving; reject invalid specs rather than storing arbitrary values.
- [x] Preserve existing user ownership checks, 1–12 project limit, private-project publication restriction, slug uniqueness, and selected-project response filtering.
- [x] Keep generation failure behavior recoverable and preserve the existing saved portfolio on generation/revision errors.
- [ ] Build backend and review API flows for generation, revision, save, reopen, publish, public-read, and ownership/privacy rejection. Leave live Gemini calls for the user’s local testing.

### Task 4: Safe React design-spec renderer

**Files:**
- Create: `agora-frontend/src/features/portfolio/types.ts`
- Create: `agora-frontend/src/features/portfolio/PortfolioRenderer.tsx`
- Modify: `agora-frontend/src/pages/PublicPortfolioPage.tsx`

**Interfaces:**
- `Portfolio` API type includes `designSpec`; renderer accepts the saved portfolio and renders validated allowlisted values only.
- Support at least three materially different compositions using section ordering, hero structure, project-card layout, typography, and image treatment; avoid palette-only variants.
- Unknown/missing spec versions and values resolve to the deterministic `classic-editorial` default.

- [x] Define frontend types and runtime normalization for the backend spec, including defaults for legacy and partial responses.
- [x] Implement React components for supported hero, section, and project-card layouts; map colors, typography, and image treatment to allowlisted CSS classes/styles.
- [x] Replace the fixed public composition with the spec renderer while retaining public project links, privacy-filtered data, responsive behavior, and accessible headings/alt text.
- [x] Run `npm run build` from `agora-frontend`.
- [ ] Manually inspect desktop and mobile rendering with three specs plus a legacy response and confirm refreshes render identically (Task 6).

### Task 5: Generate-preview-revise editor flow and disclosure

**Files:**
- Modify: `agora-frontend/src/pages/PortfolioEditorPage.tsx`
- Modify: `agora-frontend/src/features/portfolio/types.ts`
- Modify: `backend/Controllers/PortfolioController.cs` to preserve request project order on save
- Reuse: `agora-frontend/src/features/portfolio/PortfolioRenderer.tsx`

**Interfaces:**
- Editor state holds the complete generated draft including its design spec and project copy; save sends that exact previewed spec.
- Initial generation uses `POST /portfolios/me/ai-draft`; targeted revisions use `POST /portfolios/me/ai-revision`.
- A concise disclosure appears before generation and states that selected profile/project text and current project covers are sent to Gemini; on the free tier, Google may use prompts to improve its products.

- [x] Make selected projects plus a single generate action the primary flow; keep slug and publish controls, but remove manual writing as a prerequisite.
- [x] Show generation/revision loading, recoverable errors, image availability counts, and a preview rendered by the same component used publicly.
- [x] Add a bounded natural-language revision field; apply successful revisions to preview state only until the student explicitly saves/publishes.
- [x] Include generated design spec and per-project copy in `PUT /api/portfolios/me`; persist projects in request order and reopen saved data from `GET /api/portfolios/me` without regenerating.
- [x] Run `npm run build` and backend build.
- [ ] Manually verify disclosure, revisions, failure preservation, and save/reopen/public rendering (Task 6).

### Task 6: End-to-end development verification

**Files:**
- No new files unless a defect found in Tasks 1–5.

- [x] Apply the new migration only to the configured Neon development database; confirm the migration status and existing project row count before and after are unchanged (7 rows).
- [x] Build backend and frontend, then run both locally using the existing dev configuration without exposing or committing credentials.
- [ ] Verify two distinct selected project sets produce clearly different saved compositions, refresh/public views stay stable, legacy portfolios use the default, and non-owned/private project protections still hold. Live generation/revision is left for the user’s local test.
- [ ] Inspect the editor preview and public portfolio visually at desktop/mobile widths with three design specs and a legacy response. The Computer Use runtime could not initialize, so visual inspection is deferred to the user’s local test.
- [ ] Review changed files for credentials, prompt logging, raw model markup, unbounded retries, or unallowlisted values; leave the branch ready for the user to test locally.
