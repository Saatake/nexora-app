export type MentorshipStatus =
  | 'PendingApproval'
  | 'Active'
  | 'Rejected'
  | 'Revoked'
  | 'Completed';

export type MentorshipGoalStatus =
  | 'Pending'
  | 'Submitted'
  | 'Approved'
  | 'NeedsRevision';

export type MentorshipGoal = {
  id: number;
  mentorshipId: number;
  title: string;
  description: string;
  dueDate?: string | null;
  status: MentorshipGoalStatus;
  statusName: string;
  professorFeedback?: string | null;
  studentSubmissionNote?: string | null;
  createdAt: string;
  completedAt?: string | null;
  reviewedAt?: string | null;
};

export type MentorshipMessage = {
  id: number;
  mentorshipId: number;
  senderId: string;
  senderName: string;
  senderPhotoUrl?: string | null;
  senderRole: string;
  content: string;
  createdAt: string;
};

export type Mentorship = {
  id: number;
  projectId: number;
  projectTitle: string;
  professorId: string;
  professorName: string;
  professorPhotoUrl?: string | null;
  professorCourse?: string | null;
  studentAuthorId: string;
  studentAuthorName: string;
  status: MentorshipStatus;
  statusName: string;
  initiatedBy: 'Professor' | 'Student';
  initiatedByName: string;
  requestMessage?: string | null;
  requestedAt: string;
  acceptedAt?: string | null;
  endedAt?: string | null;
  totalGoals: number;
  pendingReviewGoals: number;
  completedGoals: number;
  goals: MentorshipGoal[];
};
