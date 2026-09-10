export type NotificationType =
  | 'MentorshipRequest'
  | 'MentorshipAccepted'
  | 'MentorshipRejected'
  | 'MentorshipRevoked'
  | 'GoalCreated'
  | 'GoalSubmitted'
  | 'GoalReviewed'
  | 'MentorshipMessage'
  | 'ProjectUpdated';

export type AppNotification = {
  id: number;
  type: NotificationType;
  typeName: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  senderPhotoUrl?: string | null;
};
