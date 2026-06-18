export type AiReview = {
  relevance: number;
  quality: number;
  methodology: number;
  presentation: number;
  innovation: number;
  average: number;
  feedback: string;
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
  course?: string | null;
  area?: string | null;
  advisor?: string | null;
  teamMembers?: string | null;
  githubLink: string;
  fileUrl: string;
  imageUrl?: string | null;
  category: string;
  authorId: string;
  authorName: string;
  viewCount: number;
  downloadCount: number;
  averageGrade?: number | null;
  createdAt: string;
  collaborators?: Collaborator[];
};

export type Evaluation = {
  id: number;
  relevance: number;
  quality: number;
  methodology: number;
  presentation: number;
  innovation: number;
  average: number;
  feedback: string;
  professorId: string;
  professorName: string;
  createdAt: string;
};

export type Comment = {
  id: number;
  text: string;
  authorName: string;
  authorId: string;
  createdAt: string;
};

export type EvaluationFormData = {
  relevance: number;
  quality: number;
  methodology: number;
  presentation: number;
  innovation: number;
  feedback: string;
};
