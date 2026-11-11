import { validateProjectContentBlock, type ProjectContentBlockDraft } from './projectContent.ts';

export type ProjectSubmissionInput = {
  title: string;
  category: string;
  description: string;
  tags: string[];
  authorContribution: string;
  authorRole?: string;
  collaborators: Array<{ id: string; name?: string; role?: string; contribution?: string }>;
  contentBlocks: ProjectContentBlockDraft[];
  githubLink: string;
  fileUrl: string;
};

export const createProjectSubmission = (input: ProjectSubmissionInput) => {
  const errors = input.contentBlocks.map(validateProjectContentBlock).filter(Boolean);
  if (input.contentBlocks.length > 30) errors.push('Um projeto pode ter no máximo 30 blocos de conteúdo.');
  if (input.contentBlocks.filter((block) => block.type === 'YouTube').length > 1) errors.push('Um projeto pode ter apenas um vídeo pitch.');
  if (errors.length) throw new Error(errors[0] ?? 'Revise os conteúdos do projeto.');

  return {
    title: input.title.trim(),
    category: input.category,
    description: input.description,
    selectedTags: [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))],
    authorContribution: input.authorContribution.trim(),
    authorRole: input.authorRole?.trim() || null,
    collaborators: input.collaborators.map(({ id, role, contribution }) => ({ id, role: role?.trim() || null, contribution: contribution?.trim() || null })),
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
