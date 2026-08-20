export type DashboardStats = {
  projectCount: number;
  averageGrade: number;
  totalViews: number;
};

export type GradeEvolution = {
  month: string;
  average: number;
};

export type CriteriaAverage = {
  relevance: number;
  quality: number;
  methodology: number;
  presentation: number;
  innovation: number;
};

export type DashboardCharts = {
  gradeEvolution: GradeEvolution[];
  criteriaAverage: CriteriaAverage;
};

export type DashboardProject = {
  id: number;
  title: string;
  description: string;
  category: string;
  averageGrade?: number | null;
  viewCount: number;
  createdAt: string;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type PendingProject = {
  id: number;
  title: string;
  summary?: string;
  thematicAreaName: string;
  authorName: string;
  communityAverage?: number | null;
  communityCount: number;
  imageUrl?: string;
  createdAt: string;
};

export type FeaturedProject = {
  id: number;
  title: string;
  summary?: string;
  thematicAreaName: string;
  authorName: string;
  averageGrade?: number | null;
  evaluationCount: number;
  imageUrl?: string;
  badges: { badge: string; count: number }[];
};

export type ProfessorDashboard = {
  evaluationsGiven: number;
  areasCount: number;
  pendingCount: number;
  pendingProjects: PendingProject[];
  featuredProjects: FeaturedProject[];
};
};
