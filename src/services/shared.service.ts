import apiClient, { ApiResponse } from '@/lib/api-client';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: number;
  created_at: string;
  read_at?: string;
}

export interface InternalMessage {
  id: number;
  sender_user_id: number;
  recipient_user_id: number;
  subject: string;
  message_content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateMessageRequest {
  recipient_user_id: number;
  subject: string;
  message_content: string;
  message_type: string;
}

export interface Conversation {
  other_user: {
    id: number;
    first_name: string;
    last_name: string;
    profile_image_url?: string;
  };
  last_message: InternalMessage;
  unread_count: number;
}

export interface ConversationDetail {
  other_user: {
    id: number;
    first_name: string;
    last_name: string;
    profile_image_url?: string;
  };
  messages: InternalMessage[];
}

class SharedService {
  // Notifications
  async getNotifications(): Promise<ApiResponse<{ notifications: Notification[] }>> {
    return await apiClient.get('/api/notifications');
  }

  async markNotificationAsRead(notificationId: string | number): Promise<ApiResponse> {
    return await apiClient.patch(`/api/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ updated_count: number }>> {
    return await apiClient.patch('/api/notifications/mark-all-as-read');
  }

  // Messages
  async sendMessage(data: CreateMessageRequest): Promise<ApiResponse<{ internal_message: InternalMessage }>> {
    return await apiClient.post('/api/messages', data);
  }

  async getConversations(): Promise<ApiResponse<{ conversations: Conversation[] }>> {
    return await apiClient.get('/api/messages/conversations');
  }

  async getConversation(otherUserId: string | number): Promise<ApiResponse<{ conversation: ConversationDetail }>> {
    return await apiClient.get(`/api/messages/conversation/${otherUserId}`);
  }

  async uploadImage(file: File): Promise<ApiResponse<{ imageUrl: string; originalName: string; size: number; mimetype: string }>> {
    // Align field name with backend conventions (used in profile PUT): 'logo_file'
    const formData = new FormData();
    formData.append('logo_file', file, file.name);

    return await apiClient.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const sharedService = new SharedService();
export default sharedService;
