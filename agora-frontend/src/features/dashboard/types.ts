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
