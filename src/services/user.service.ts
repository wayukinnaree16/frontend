import apiClient, { ApiResponse } from '@/lib/api-client';
import { User } from './auth.service';

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_image_url?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

class UserService {
  async getMyProfile(): Promise<ApiResponse<User>> {
    return await apiClient.get('/api/users/me');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> {
    return await apiClient.put('/api/users/me', data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    return await apiClient.put('/api/users/me/change-password', data);
  }
}

export const userService = new UserService();
export default userService;