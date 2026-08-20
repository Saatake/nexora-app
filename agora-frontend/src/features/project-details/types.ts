export type AiReview = {
  relevance: number;
  quality: number;
  methodology: number;
  presentation: number;
  innovation: number;
  average: number;
  feedback: string;
};

export type BadgeProfessor = {
  id: string;
  name: string;
  awardedAt: string;
};

export type ProjectBadge = {
  badge: string;
  count: number;
  professors: BadgeProfessor[];
};

export type Collaborator = {
  id: string;
  name: string;
  photoUrl?: string | null;
  course?: string | null;
};

export type Project = {
  id: number;
  title: string;
  description: string;
  summary?: string | null;
  thematicArea: string;
  thematicAreaName: string;
  tags?: string | null;
  advisor?: string | null;
  teamMembers?: string | null;
  githubLink: string;
  fileUrl: string;
  imageUrl?: string | null;
  category: string;
  authorId: string;
  authorName: string;
  authorRoleType?: string;
  viewCount: number;
  downloadCount: number;
  averageGrade?: number | null;
  communityAverage?: number | null;
  communityCount: number;
  professorAverage?: number | null;
  professorCount: number;
  createdAt: string;
  collaborators?: Collaborator[];
  badges?: ProjectBadge[];
};

export type Evaluation = {
  id: number;
  relevance: number;
  quality: number;
  methodology: number;
  presentation: number;
  innovation: number;
  average: number;
  theoreticalFoundation?: number | null;
  academicContribution?: number | null;
  executionFeasibility?: number | null;
  technicalAverage?: number | null;
  feedback: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: string;
  createdAt: string;
};

export type Comment = {
  id: number;
  text: string;
  authorName: string;
  authorId: string;
  authorRoleType?: string;
  createdAt: string;
};

export type EvaluationFormData = {
  relevance: number;
  quality: number;
  methodology: number;
  presentation: number;
  innovation: number;
  theoreticalFoundation?: number;
  academicContribution?: number;
  executionFeasibility?: number;
  feedback: string;
};
