# Project Showcase Content Design

## Intent

Make Ágora project pages useful across courses by letting students present evidence in the form that fits the work: writing, images, YouTube video, PDF, or an external link. Keep the existing professor evaluation flow and old project records working.

## Goals

- Let a student build a project page from ordered, typed content blocks: text, image, YouTube video, document, and link.
- Use the existing file storage for image and PDF uploads; keep videos hosted on YouTube and embed them safely in project details.
- Capture the author's and each collaborator's contribution.
- Offer broader project formats while preserving the existing category values.
- Replace comma-separated free typing in the new form with searchable, canonical tag choices. Include selected tags in project search.
- Keep the existing cover, PDF, GitHub, and text fields readable for legacy project records.

## Non-goals

- Uploading or transcoding video files.
- Building a general-purpose page editor, drag-and-drop canvas, or arbitrary HTML/embed support.
- Letting users create global tags directly; new tag suggestions can be added to the catalog later.
- Changing professor evaluation, project privacy, or the AI portfolio workflow in this branch.

## Approaches

1. **Typed content blocks (chosen):** the author adds predefined blocks and orders them. Each block type has a focused input and renderer. This gives flexibility without asking students to design a page from scratch.
2. **One fixed form with every media field:** simpler to build, but every course sees irrelevant fields and project pages become repetitive.
3. **Free-form HTML or arbitrary embeds:** flexible, but unsafe to render and difficult to validate, edit, and search.

## Interaction

The create/edit flow keeps core project details structured, then offers an “Adicionar conteúdo” menu. The student adds a text section, one or more images, a YouTube link, a PDF, or an external link; can add an optional caption; and can move blocks up or down. Image selection supports multiple files. YouTube URLs are parsed and embedded with the privacy-enhanced YouTube host; arbitrary iframe HTML is never accepted.

The author enters their own contribution and a contribution for each selected collaborator. Project format and thematic area are separate. Tags come from a searchable catalog, are stored with canonical spelling, and are searchable in the feed. Existing category enum values and stored free-text tags remain readable.

## Data and API

- Add a `ProjectContentBlock` child record with type, text or URL, optional caption, and sort order.
- Add author contribution to `Project` and contribution text to `ProjectCollaborator`.
- Add new project format enum members without changing existing numeric values.
- Accept typed blocks and selected catalog tags in create/update requests while retaining existing request fields for older clients.
- Validate block count, required text/URL, safe HTTPS URLs, YouTube host/video ID, and tag membership on the server.
- Return blocks and canonical tags in project responses. Keep legacy `ImageUrl`, `FileUrl`, and `GithubLink` behavior.

## Constraints

- Use React and ASP.NET Core already in the repository.
- Persist blocks relationally using EF Core and a migration.
- Do not send project information to Gemini as part of this feature.
- Unsupported or unsafe media URLs must fail validation rather than render.

## Open to implementation

- The initial controlled tag catalog is a curated set spanning technology, humanities, health, business, environment, and arts; its terms can grow without changing the project schema.
- Image and PDF blocks use existing Azure storage routes, with a dedicated image route if needed for multiple content images.
- Content blocks are optional, so legacy API clients and minimal project submissions continue to work.
