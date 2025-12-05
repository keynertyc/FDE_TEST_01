export const UserRole = {
  ADMIN: 'admin',
  CLIENT: 'client',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export const ProjectStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  clientId: string | null;
  createdById: string;
  client?: User;
  createdBy?: User;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  projectId: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  recentProjects?: Project[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  status?: ProjectStatus;
  clientId?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  clientId?: string | null;
}

export interface CreateCommentDto {
  content: string;
}
