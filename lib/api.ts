import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFeatureFlagInput {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
}

export interface UpdateFeatureFlagInput {
  name?: string;
  description?: string;
  enabled?: boolean;
}

export interface User {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  attributes: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  user_id?: string;
  email?: string;
  name?: string;
  attributes?: Record<string, any>;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  attributes?: Record<string, any>;
}

export interface Experiment {
  id: string;
  flag_id: string;
  name: string;
  description: string | null;
  variant_a_percentage: number;
  variant_b_percentage: number;
  status: 'draft' | 'running' | 'paused' | 'completed';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExperimentInput {
  flag_id: string;
  name: string;
  description?: string;
  variant_a_percentage?: number;
  variant_b_percentage?: number;
  status?: 'draft' | 'running' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
}

export interface UpdateExperimentInput {
  name?: string;
  description?: string;
  variant_a_percentage?: number;
  variant_b_percentage?: number;
  status?: 'draft' | 'running' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
}

export interface UserFlagAssignment {
  id: string;
  user_id: string;
  flag_id: string;
  enabled: boolean;
  created_at: string;
}

export interface DashboardSummary {
  summary: {
    totalFlags: number;
    enabledFlags: number;
    totalUsers: number;
    totalAssignments: number;
    totalExperiments: number;
    eventsLast7Days: number;
  };
  topFlags: Array<{
    id: string;
    key: string;
    name: string;
    event_count: number;
    unique_users: number;
  }>;
}

// Feature Flags API
export const featureFlagsApi = {
  getAll: () => api.get<FeatureFlag[]>('/flags'),
  getById: (id: string) => api.get<FeatureFlag>(`/flags/${id}`),
  create: (data: CreateFeatureFlagInput) => api.post<FeatureFlag>('/flags', data),
  update: (id: string, data: UpdateFeatureFlagInput) => api.put<FeatureFlag>(`/flags/${id}`, data),
  delete: (id: string) => api.delete(`/flags/${id}`),
};

// Users API
export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserInput) => api.post<User>('/users', data),
  update: (id: string, data: UpdateUserInput) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getUserFlags: (userId: string) => api.get<UserFlagAssignment[]>(`/users/${userId}/flags`),
  assignFlag: (userId: string, flagId: string, enabled: boolean = true) =>
    api.post<UserFlagAssignment>(`/users/${userId}/flags/${flagId}`, { enabled }),
  removeFlag: (userId: string, flagId: string) =>
    api.delete(`/users/${userId}/flags/${flagId}`),
};

// Experiments API
export const experimentsApi = {
  getAll: () => api.get<Experiment[]>('/experiments'),
  getById: (id: string) => api.get<Experiment>(`/experiments/${id}`),
  getByFlagId: (flagId: string) => api.get<Experiment[]>(`/experiments/flag/${flagId}`),
  create: (data: CreateExperimentInput) => api.post<Experiment>('/experiments', data),
  update: (id: string, data: UpdateExperimentInput) => api.put<Experiment>(`/experiments/${id}`, data),
  delete: (id: string) => api.delete(`/experiments/${id}`),
  getAssignments: (experimentId: string) => api.get(`/experiments/${experimentId}/assignments`),
  assignUser: (experimentId: string, userId: string) => api.post(`/experiments/${experimentId}/assign/${userId}`),
  evaluateFlag: (flagId: string, userId: string) => api.get(`/flags/${flagId}/evaluate/${userId}`),
};

// Metrics API
export const metricsApi = {
  getDashboard: () => api.get<DashboardSummary>('/metrics/dashboard'),
  getMetrics: (flagId?: string) => {
    if (flagId) {
      return api.get(`/metrics/flags/${flagId}`);
    }
    return api.get('/metrics');
  },
  trackEvent: (data: {
    flag_id: string;
    user_id?: string;
    event_type: string;
    metadata?: Record<string, any>;
  }) => api.post('/metrics/events', data),
};

export default api;

