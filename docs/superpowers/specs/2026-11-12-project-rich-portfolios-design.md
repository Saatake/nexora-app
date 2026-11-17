# Rich project evidence in student portfolios

## Intent

Make AI-generated student portfolios feel specific to each person and their actual work by using the richer project form: individual and collaborator contributions, ordered text/image/video/document/link blocks, and cover images. Portfolio pages should present these materials as part of a designed editorial composition, not as identical project cards with extra attachments.

## Product decisions

- Project content is the primary evidence for both generated copy and visual choices; profile data remains supporting context.
- The AI may summarize a member's role/contribution only from that member's saved fields. If the portfolio owner has no saved individual contribution, use the existing “Ainda não informada pelo autor” state; never substitute another collaborator's contribution.
- Use project cover images and a bounded number of project image blocks as multimodal evidence. Keep the existing per-image 5 MiB and aggregate 12 MiB limits and storage ownership checks.
- Include saved project blocks in the portfolio response and render supported media directly in the public page. A YouTube block is visibly labeled “Vídeo pitch” and embedded only when its URL resolves to an allowed YouTube video ID. Other links remain ordinary safe external links.
- Project blocks and contributor roles are preserved in their stored order and content. Missing/invalid optional items are skipped without breaking the portfolio.
- Expand the approved React design system with materially different visual directions and media treatments. The model selects validated enums and per-project variants; React never executes generated markup or CSS.
- Saved portfolios remain stable across visits. Existing portfolio JSON without new optional design fields resolves through deterministic defaults.
- Private project filtering and project ownership checks remain unchanged. Public portfolios expose media only for projects already allowed by the existing public visibility rules.

## Distinct visual directions

Add two directions to the existing three:

- `field-notes`: narrow editorial column, strong typographic hierarchy, fine separators and media integrated between text sections.
- `gallery-led`: broad asymmetric media composition, image/video prominence and concise project copy.

Add a validated `mediaLayout` choice (`inline`, `gallery`, `feature`) so media composition can vary independently from palette. Keep existing directions, hero layouts, palettes, typography, image treatment, and card variants valid for legacy portfolios.

## Safety and limits

- AI receives bounded plain text, selected member role/contribution, and media references. User-provided text and images are untrusted evidence, never instructions.
- Image downloads use only project-owned storage URLs and existing byte limits. Do not fetch arbitrary project URLs for AI analysis.
- Public embed URLs are built from a validated YouTube video ID; never render arbitrary iframe URLs.
- Sanitize protocols before rendering links. Do not render HTML from project blocks or AI output.
- No new Gemini call on portfolio page views; generation remains on explicit user request and existing rate limits.

## Acceptance criteria

- AI evidence includes ordered project block text/captions/URLs, owner contribution/role, collaborator names/roles/contributions, and selected image evidence while respecting size and ownership limits.
- API draft, save/reopen, and public portfolio responses preserve content blocks and contributor information for selected projects.
- Portfolio renderer supports image, YouTube pitch, document, link, and text blocks with responsive, accessible fallbacks.
- YouTube is clearly identified as the pitch and only a validated YouTube ID can be embedded.
- At least five materially different top-level compositions are available; media layout and card variants create visible differences beyond palette alone.
- Missing blocks, unknown optional values, unsafe URLs, and legacy responses fall back or disappear safely without breaking the page.
- Tests cover happy paths and failure cases; frontend and backend builds pass.
