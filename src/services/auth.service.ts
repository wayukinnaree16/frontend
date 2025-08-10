import apiClient, { ApiResponse } from '@/lib/api-client';

export interface User {
  user_id?: number;
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_image_url?: string;
  user_type: 'donor' | 'foundation_admin' | 'system_admin';
  is_email_verified?: boolean;
  account_status?: string;
  agreed_to_terms_at?: string;
  agreed_to_privacy_at?: string;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_image_url?: string;
  user_type: 'donor' | 'foundation_admin' | 'system_admin';
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  new_password: string;
}

export interface ForceResetPasswordRequest {
  email: string;
  new_password: string;
}

class AuthService {
  async register(data: RegisterRequest): Promise<ApiResponse<{ user: User }>> {
    return await apiClient.post('/api/auth/register', data);
  }

  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', data);
    
    // Store token and user in localStorage
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/api/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response;
    } catch (error) {
      // Clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }

  async requestPasswordReset(data: ResetPasswordRequest): Promise<ApiResponse> {
    return await apiClient.post('/api/auth/request-password-reset', data);
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<ApiResponse> {
    return await apiClient.post('/api/auth/update-password', data);
  }

  async forceResetPassword(data: ForceResetPasswordRequest): Promise<ApiResponse> {
    return await apiClient.post('/api/auth/force-reset-password', data);
  }

  // Helper methods
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export default authService;