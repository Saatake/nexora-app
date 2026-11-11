import { validateProjectContentBlock, type ProjectContentBlockDraft } from './projectContent.ts';

export type ProjectSubmissionInput = {
  title: string;
  category: string;
  description: string;
  tags: string[];
  authorContribution: string;
  collaborators: Array<{ id: string; name?: string; contribution?: string }>;
  contentBlocks: ProjectContentBlockDraft[];
  githubLink: string;
  fileUrl: string;
};

export const createProjectSubmission = (input: ProjectSubmissionInput) => {
  const errors = input.contentBlocks.map(validateProjectContentBlock).filter(Boolean);
  if (input.contentBlocks.length > 30) errors.push('Um projeto pode ter no máximo 30 blocos de conteúdo.');
  if (errors.length) throw new Error(errors[0] ?? 'Revise os conteúdos do projeto.');

  return {
    title: input.title.trim(),
    category: input.category,
    description: input.description,
    selectedTags: [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))],
    authorContribution: input.authorContribution.trim(),
    collaborators: input.collaborators.map(({ id, contribution }) => ({ id, contribution: contribution?.trim() || null })),
    collaboratorIds: input.collaborators.map(({ id }) => id),
    contentBlocks: input.contentBlocks.map(({ type, text, url, caption, sortOrder }) => ({
      type,
      text: text?.trim() || null,
      url: url?.trim() || null,
      caption: caption?.trim() || null,
      sortOrder,
    })),
    githubLink: input.githubLink.trim(),
    fileUrl: input.fileUrl.trim(),
  };
};
