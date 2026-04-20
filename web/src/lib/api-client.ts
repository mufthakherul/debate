import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      withCredentials: true, // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet, try to refresh token
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !(originalRequest as any)._retry
        ) {
          (originalRequest as any)._retry = true;

          try {
            const { data } = await this.client.post('/auth/refresh');
            this.setAccessToken(data.token);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${data.token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear token and redirect to login
            this.clearAccessToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  clearAccessToken() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
  }

  // Auth endpoints
  async register(email: string, username: string, password: string) {
    const { data } = await this.client.post('/auth/register', {
      email,
      username,
      password,
    });
    this.setAccessToken(data.token);
    return data;
  }

  async login(username: string, password: string) {
    const { data } = await this.client.post('/auth/login', {
      username,
      password,
    });
    this.setAccessToken(data.token);
    return data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearAccessToken();
    }
  }

  async refresh() {
    const { data } = await this.client.post('/auth/refresh');
    this.setAccessToken(data.token);
    return data;
  }

  // Debate endpoints
  async getDebates(params?: { status?: string; isPublic?: boolean }) {
    const { data } = await this.client.get('/debates', { params });
    return data;
  }

  async getDebate(id: string) {
    const { data } = await this.client.get(`/debates/${id}`);
    return data;
  }

  async createDebate(debateData: {
    title: string;
    description?: string;
    topicId?: string;
    isPublic?: boolean;
  }) {
    const { data } = await this.client.post('/debates', debateData);
    return data;
  }

  async updateDebate(
    id: string,
    debateData: {
      title?: string;
      description?: string;
      topicId?: string;
      isPublic?: boolean;
    }
  ) {
    const { data } = await this.client.put(`/debates/${id}`, debateData);
    return data;
  }

  async deleteDebate(id: string) {
    const { data } = await this.client.delete(`/debates/${id}`);
    return data;
  }

  async updateDebateStatus(
    id: string,
    status: string,
    scheduledAt?: string
  ) {
    const { data } = await this.client.patch(`/debates/${id}/status`, {
      status,
      scheduledAt,
    });
    return data;
  }

  // Topic endpoints
  async getTopics(params?: { category?: string; difficulty?: string }) {
    const { data } = await this.client.get('/topics', { params });
    return data;
  }

  async getTopic(id: string) {
    const { data } = await this.client.get(`/topics/${id}`);
    return data;
  }

  async createTopic(topicData: {
    title: string;
    description?: string;
    category?: string;
    difficulty?: string;
  }) {
    const { data } = await this.client.post('/topics', topicData);
    return data;
  }

  // Score endpoints
  async submitScore(scoreData: {
    debateId: string;
    participantId: string;
    category: string;
    score: number;
    maxScore: number;
    weight?: number;
    feedback?: string;
    isPublic?: boolean;
  }) {
    const { data } = await this.client.post('/scores', scoreData);
    return data;
  }

  async getAggregatedScores(debateId: string) {
    const { data } = await this.client.get(
      `/scores/debate/${debateId}/aggregated`
    );
    return data;
  }

  // Notification endpoints
  async getNotifications(unreadOnly?: boolean) {
    const { data } = await this.client.get('/notifications', {
      params: { unreadOnly },
    });
    return data;
  }

  async markNotificationRead(id: string) {
    const { data } = await this.client.patch(`/notifications/${id}/read`);
    return data;
  }

  async markAllNotificationsRead() {
    const { data } = await this.client.post('/notifications/mark-all-read');
    return data;
  }
}

export const apiClient = new ApiClient();
