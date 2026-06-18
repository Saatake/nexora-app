export type UserProfile = {
  id: string;
  name: string;
  email: string;
  course: string;
  bio?: string;
  photoUrl?: string;
  interests?: string;
  roleType: string;
  projectCount?: number;
  averageGrade?: number;
  totalViews?: number;
};

export type ProfileProject = {
  id: number;
  title: string;
  category: string;
  averageGrade?: number | null;
  createdAt: string;
  isPrivate?: boolean;
};

export type EditData = {
  name: string;
  course: string;
  bio: string;
  photoUrl: string;
  interests: string;
};
