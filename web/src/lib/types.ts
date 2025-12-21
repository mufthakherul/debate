export type Role = 'USER' | 'MODERATOR' | 'ADMIN';

export type DebateStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ParticipantRole = 'DEBATER' | 'JUDGE' | 'TIMEKEEPER' | 'MODERATOR';

export type TeamSide = 'AFFIRMATIVE' | 'NEGATIVE' | 'NEUTRAL';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type NotificationType =
  | 'DEBATE_INVITATION'
  | 'DEBATE_STARTING'
  | 'DEBATE_COMPLETED'
  | 'SCORE_SUBMITTED'
  | 'ROLE_ASSIGNED'
  | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  createdAt: string;
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty: DifficultyLevel;
  createdAt: string;
  updatedAt: string;
}

export interface DebateParticipant {
  id: string;
  userId: string;
  debateId: string;
  role: ParticipantRole;
  teamSide: TeamSide;
  user?: User;
  createdAt: string;
}

export interface DebateRound {
  id: string;
  debateId: string;
  order: number;
  type: string;
  durationSeconds: number;
  createdAt: string;
}

export interface Debate {
  id: string;
  title: string;
  description?: string;
  status: DebateStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  isPublic: boolean;
  creatorId: string;
  creator?: User;
  topicId?: string;
  topic?: Topic;
  participants?: DebateParticipant[];
  rounds?: DebateRound[];
  createdAt: string;
  updatedAt: string;
}

export interface Score {
  id: string;
  debateId: string;
  judgeId: string;
  participantId: string;
  category: string;
  score: number;
  maxScore: number;
  weight: number;
  feedback?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  payload: any;
  isRead: boolean;
  createdAt: string;
}
