# AI-generated student portfolios

## Intent

Let a student choose projects and receive a complete portfolio draft without writing the introduction, project summaries, or layout by hand. The projects are the primary source for the student's presentation. The result should feel intentionally designed for that student, remain stable when reopened, and take only light, optional revision before publishing.

The development database is Neon. Its existing project records are already persisted; the current public feed returned seven projects, and the database is at the latest migration. Seeding replacement projects is outside this change.

## Goals

- Generate the portfolio's overall presentation and copy in one request: headline, profile summary, project summaries, skills/themes grounded in the project data, and an individualized visual composition.
- Use project descriptions, current summaries, categories, tags, existing cover images, and available member/collaborator data as primary evidence. Profile fields are supporting context.
- Make portfolios visually distinct through section order, composition, typography and color tokens, image treatment, and project-card styles—not color alone.
- Let the student request small changes in plain language and preview them before saving or publishing.
- Persist the generated content and design so views do not invoke Gemini and the page does not change between visits.
- Keep Gemini model selection and usage measurement configurable so the app can start on the existing low-cost model and be moved to a billed tier or a newer model later.

## Non-goals

- Arbitrary AI-generated HTML, JSX, JavaScript, or CSS.
- Generating new artwork or replacing the project images in this first version.
- Adding project image galleries, video uploads, or a per-member contribution form; those remain follow-up work.
- Payments, subscriptions, or portfolio service tiers.
- Making AI-generated claims about a student's personal contribution when the stored data does not support them.

## Constraints and current state

- The current API's `POST /api/portfolios/me/ai-draft` returns text fields and per-project summaries; the public React page has one composition and three color palettes.
- Projects can store title, summary, description, category, thematic area, tags, team-member text, collaborator IDs, and a cover image URL. They do not store each member's role or contribution.
- Up to 12 selected projects and existing cover images are sent to Gemini. The current implementation has image byte limits and an allowlist for project-owned storage URLs.
- The current service uses `gemini-2.5-flash-lite`. Estimate for its paid standard rate is roughly USD $0.001–$0.002 per typical five-project generation and $0.0025–$0.0046 for a large twelve-project request; actual usage must be measured from token counts. This estimate excludes generated artwork, which is out of scope.
- The user explicitly chose to allow real student data in the development build while using the current free Gemini tier. Google's pricing page says free-tier prompts may be used to improve products, while paid-tier prompts are not. The generation UI must disclose that selected profile/project text and existing project cover images are sent to Gemini and explain the free-tier data-use condition before the call.

## Approaches considered

1. **Let Gemini return arbitrary web code.** This permits the broadest visual freedom, but creates security, accessibility, responsive-layout, debugging, and maintenance risks. The server cannot safely trust or execute model-generated markup.
2. **Let Gemini generate a versioned design specification, then render it with a rich React component system.** The model chooses the content, visual direction, section arrangement, typography/color tokens, image treatment, and project presentation variants. React validates and renders the specification using approved components. This is the selected approach: it allows meaningful variety while keeping pages predictable and safe.
3. **Have Gemini select from a few fixed templates.** This is easiest to maintain, but would repeat the same page structures and fall short of the request for each portfolio to have its own design.

## Selected design

### Generation and rendering

The editor keeps project selection and reduces the manual writing flow to a single “Gerar meu portfólio” action. The generation request uses project evidence first and profile data only as context. It returns a complete preview object with:

- Copy for the person and each selected project.
- A versioned `designSpec` describing a named visual direction, a hero composition, section order, section layouts, typography and color tokens, project-card variants, and how existing project covers are placed or cropped.
- A short explanation of the visual direction for the editor, not necessarily public page copy.

The frontend renders the spec with React components and validates every enum, token, URL, and size. It never executes model-generated code. A safe default layout is used if a non-critical design field is missing; invalid content/schema returns a recoverable generation error and preserves the previous saved portfolio.

The spec is stored with a schema version and reused by the public page. Opening or refreshing the portfolio never generates or randomizes a new design. Variety comes from the model's composition decisions and the controlled component variants, not random changes at render time.

### Content and contribution accuracy

Project material is the main evidence for the student's overall story. The model may describe project work and patterns visible in the provided data, but must not invent personal actions, impact metrics, clients, awards, or skills. Collaborator/team-member data can provide context, but membership alone is not proof of a specific role. If an individual contribution is not supported, the draft says it needs confirmation and leaves a small optional revision path. New structured contribution fields are explicitly deferred.

### Revisions

The student sees a preview with a small natural-language revision box, such as “deixe a abertura mais formal” or “destaque primeiro o projeto de pesquisa”. A revision is scoped to the requested content/design section, validated with the same schema, and previewed before it replaces the current draft. Saving/publishing remains an explicit action. Directly editing every generated paragraph is not the primary workflow.

### Persistence and API

Extend the existing portfolio save/read flow to persist the generated content plus the versioned design specification. Store project-specific copy in the portfolio-project relationship. Public portfolio responses include the design spec and generated project content. Generation and revision endpoints remain authenticated and ownership-checked; only selected projects owned by the user may be included. The existing public route renders saved data only.

The precise storage shape (JSONB design spec and typed content columns) is a builder decision as long as the schema is validated, versioned, and migration-backed. Preserve backwards compatibility for existing portfolios by mapping them to a default design spec until regenerated.

### Cost, throughput, and privacy

Use one multimodal Gemini call for an initial complete generation; do not call Gemini on page views. Revisions should send only the existing spec plus the requested scope where practical. Keep the model name in configuration. Record model ID, input token count, output token count, and latency without logging project text, images, or personal content. Enforce per-user request limits, handle 429 responses with bounded backoff, and expose generation state/errors in the editor. The database stores the result, not the Gemini key.

For this development iteration, real data is permitted on the free tier by the user's explicit decision. The generation UI must state that project/profile text and cover images leave Ágora for Gemini and that Google may use free-tier prompts to improve products. Revisit billing and customer-facing data terms before broad production rollout.

### Project media and security

Use existing covers only in this iteration; keep current image byte limits and storage URL ownership checks. The server validates the model response against an allowlisted schema and theme/component tokens. Treat project text and images as untrusted data, not instructions. Never render raw HTML or model-produced executable code.

## Acceptance criteria

- Selecting projects and generating once yields a complete portfolio preview containing the student's introduction, project-specific copy, and a saved visual composition.
- Two different project sets can produce visibly distinct compositions beyond palette changes, while all output is rendered by React components.
- The generated page remains identical across refreshes and public views until the student requests a revision or regenerates it.
- A small revision changes only its requested scope and is previewed before save/publish.
- Unsupported personal contributions are not fabricated.
- Existing portfolios render through a safe default design spec; project ownership/privacy rules remain enforced.
- Gemini token usage can be measured without storing the prompt or project content in logs.
- The current Neon development database is not seeded with duplicate demo data.

## Open implementation choices

- The exact list of React layout primitives and variants.
- Whether the design spec is a JSONB field on `Portfolio` or a versioned related record.
- The shape of revision requests and the strongest structured-output mode supported by the current Gemini SDK.
- The exact UI balance between a natural-language revision box and a few one-click options.
