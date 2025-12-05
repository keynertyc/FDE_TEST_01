import apiClient from '../lib/api-client';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  Comment,
  CreateCommentDto,
  DashboardStats,
} from '../types';

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  searchUsers: async (email: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/auth/search', {
      params: { email },
    });
    return response.data;
  },
};

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects');
    return response.data;
  },

  getOne: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

export const commentsApi = {
  getAll: async (projectId: string): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/projects/${projectId}/comments`);
    return response.data;
  },

  create: async (projectId: string, data: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/projects/${projectId}/comments`, data);
    return response.data;
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/dashboard');
    return response.data;
  },
};
