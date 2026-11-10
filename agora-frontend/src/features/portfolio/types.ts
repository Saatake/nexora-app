const directions = ['classic-editorial', 'studio-grid', 'project-spotlight'] as const;
const heroLayouts = ['stacked', 'split', 'feature'] as const;
const sectionKinds = ['about', 'skills', 'projects'] as const;
const typographyOptions = ['editorial', 'modern', 'mono'] as const;
const colorOptions = ['forest', 'ocean', 'sunset'] as const;
const imageTreatments = ['natural', 'cover', 'monochrome'] as const;
const cardVariants = ['standard', 'feature', 'compact'] as const;

export type PortfolioProjectCard = {
  projectId: number;
  cardVariant: typeof cardVariants[number];
};

export type PortfolioDesignSpec = {
  version: 1;
  direction: typeof directions[number];
  heroLayout: typeof heroLayouts[number];
  sections: readonly (typeof sectionKinds[number])[];
  typography: typeof typographyOptions[number];
  colors: typeof colorOptions[number];
  imageTreatment: typeof imageTreatments[number];
  projectCards: readonly PortfolioProjectCard[];
};

export type PortfolioProject = {
  id: number;
  title: string;
  summary: string;
  contribution?: string | null;
  visualSummary?: string | null;
  description: string;
  category: string;
  thematicArea: string;
  imageUrl?: string | null;
  githubLink?: string | null;
  fileUrl?: string | null;
};

export type Portfolio = {
  name: string;
  course: string;
  photoUrl?: string | null;
  slug: string;
  headline: string;
  bio: string;
  skills: string[];
  theme: string;
  isPublished: boolean;
  projects: PortfolioProject[];
  designSpec?: PortfolioDesignSpec | null;
};

export type PortfolioDraft = {
  headline: string;
  bio: string;
  skills: string[];
  designSpec: PortfolioDesignSpec;
  projects: Array<{
    projectId: number;
    summary: string;
    contribution: string;
    visualSummary: string;
  }>;
};

export type PortfolioAiDraft = PortfolioDraft & {
  modelId: string;
  inputTokenCount: number | null;
  outputTokenCount: number | null;
  generationLatencyMs: number;
  imagesAnalyzed: number;
  imagesUnavailable: number;
};

const defaultDesignSpec: PortfolioDesignSpec = {
  version: 1,
  direction: 'classic-editorial',
  heroLayout: 'stacked',
  sections: sectionKinds,
  typography: 'editorial',
  colors: 'forest',
  imageTreatment: 'natural',
  projectCards: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAllowed<T extends string>(value: unknown, options: readonly T[]): value is T {
  return options.some((option) => option === value);
}

export function normalizePortfolioDesignSpec(value: unknown): PortfolioDesignSpec {
  if (!isRecord(value)) return defaultDesignSpec;

  const { version, direction, heroLayout, sections, typography, colors, imageTreatment, projectCards } = value;
  if (
    version !== defaultDesignSpec.version ||
    !isAllowed(direction, directions) ||
    !isAllowed(heroLayout, heroLayouts) ||
    !isAllowed(typography, typographyOptions) ||
    !isAllowed(colors, colorOptions) ||
    !isAllowed(imageTreatment, imageTreatments) ||
    !Array.isArray(sections) ||
    sections.length !== sectionKinds.length ||
    new Set(sections).size !== sections.length ||
    !Array.isArray(projectCards) ||
    projectCards.length > 12
  ) return defaultDesignSpec;

  const normalizedSections: PortfolioDesignSpec['sections'][number][] = [];
  for (const section of sections) {
    if (!isAllowed(section, sectionKinds)) return defaultDesignSpec;
    normalizedSections.push(section);
  }

  const normalizedCards: PortfolioProjectCard[] = [];
  const projectIds = new Set<number>();
  for (const card of projectCards) {
    if (!isRecord(card)) return defaultDesignSpec;
    const { projectId, cardVariant } = card;
    if (
      typeof projectId !== 'number' ||
      !Number.isInteger(projectId) ||
      projectId <= 0 ||
      projectId > 2_147_483_647 ||
      projectIds.has(projectId) ||
      !isAllowed(cardVariant, cardVariants)
    ) return defaultDesignSpec;
    projectIds.add(projectId);
    normalizedCards.push({ projectId, cardVariant });
  }

  return { version, direction, heroLayout, sections: normalizedSections, typography, colors, imageTreatment, projectCards: normalizedCards };
}
