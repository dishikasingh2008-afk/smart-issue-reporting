export type Role = 'STUDENT' | 'ADMIN';
export type IssueStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  reportedIssueCount?: number;
}

export interface StatusHistoryEntry {
  id: string;
  oldStatus: IssueStatus | null;
  newStatus: IssueStatus;
  comment: string | null;
  createdAt: string;
  changedBy: { id: string; name: string; role: Role };
}

export interface Issue {
  id: string;
  displayId: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  priorityReason: string | null;
  status: IssueStatus;
  building: string;
  floor: string;
  room?: string | null;
  area?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl?: string | null;
  reporterId: string;
  reporter?: { id: string; name: string; email: string };
  assignedToId?: string | null;
  assignedTo?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  statusHistory?: StatusHistoryEntry[];
  upvoteCount?: number;
  hasUpvoted?: boolean;
  rating?: Rating | null;
}

export interface Rating {
  id: string;
  issueId: string;
  studentId: string;
  stars: number;
  comment: string | null;
  createdAt: string;
}

export interface DuplicateMatch {
  id: string;
  displayId: string;
  title: string;
  status: IssueStatus;
  building: string;
  floor: string;
  upvoteCount: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  credits: number;
  issuesResolved: number;
  upvotesGiven: number;
  ratingsGiven: number;
  badges: string[];
}

export interface PollOptionResult {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface Poll {
  id: string;
  question: string;
  isActive: boolean;
  createdAt: string;
  totalVotes: number;
  hasVoted: boolean;
  votedOptionId: string | null;
  options: PollOptionResult[];
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  issue?: { id: string; title: string } | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
