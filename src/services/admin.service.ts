import apiClient, { ApiResponse } from '@/lib/api-client';
import { User } from './auth.service';
import { Foundation, PaginationResponse } from './public.service';

export interface AdminUser extends User {
  account_status: string;
  last_login_at?: string;
}

export interface UpdateUserStatusRequest {
  account_status: 'active' | 'suspended';
}

export interface PendingFoundation extends Foundation {
  admin_user: User;
}

export interface ApproveFoundationRequest {
  approval_message?: string;
}

export interface RejectFoundationRequest {
  rejection_reason: string;
  admin_notes?: string;
}

export interface Document {
  id: number;
  document_type: string;
  document_url: string;
  document_name: string;
  expiry_date?: string;
  description?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
}

export interface ReviewDocumentRequest {
  status: 'approved' | 'rejected';
  review_notes?: string;
}

export interface ContentPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  is_published: boolean;
  page_type: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContentPageRequest {
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  is_published: boolean;
  page_type: string;
}

export interface UpdateContentPageRequest {
  title?: string;
  content?: string;
  meta_description?: string;
  is_published?: boolean;
}

export interface PendingReview {
  id: number;
  rating: number;
  review_text: string;
  anonymous: boolean;
  status: 'pending_approval' | 'approved' | 'rejected';
  created_at: string;
  donor: User;
  foundation: Foundation;
  pledge: {
    id: number;
    quantity_pledged: number;
  };
}

export interface ReviewReviewRequest {
  admin_review_remarks?: string;
}

class AdminService {
  // Users
  async getAllUsers(params?: { page?: number; limit?: number }): Promise<ApiResponse<{ users: AdminUser[] } & PaginationResponse<AdminUser[]>>> {
    return await apiClient.get('/api/admin/users', params);
  }

  async getUserById(userId: string | number): Promise<ApiResponse<{ user: AdminUser }>> {
    return await apiClient.get(`/api/admin/users/${userId}`);
  }

  async updateUserStatus(userId: string | number, data: UpdateUserStatusRequest): Promise<ApiResponse> {
    return await apiClient.patch(`/api/admin/users/${userId}/status`, data);
  }

  // Foundations
  async getPendingFoundations(): Promise<ApiResponse<{ foundations: PendingFoundation[] }>> {
    // ไม่ต้องส่ง params ใด ๆ
    return await apiClient.get('/api/admin/foundations/pending-verification');
  }

  async getAllFoundations(params?: { page?: number; limit?: number }): Promise<ApiResponse<{ foundations: Foundation[] }>> {
    return await apiClient.get('/api/admin/foundations', params);
  }

  async getFoundationById(foundationId: string | number): Promise<ApiResponse<{ foundation: Foundation }>> {
    return await apiClient.get(`/api/admin/foundations/${foundationId}`);
  }

  async approveFoundation(foundationId: string | number): Promise<ApiResponse> {
    return await apiClient.patch(`/api/admin/foundations/${foundationId}/approve-account`);
  }

  async rejectFoundation(foundationId: string | number, data: RejectFoundationRequest): Promise<ApiResponse> {
    return await apiClient.patch(`/api/admin/foundations/${foundationId}/reject-account`, data);
  }

  async getFoundationDocuments(foundationId: string | number): Promise<ApiResponse<{ documents: Document[] }>> {
    return await apiClient.get(`/api/admin/foundations/${foundationId}/documents`);
  }

  async reviewDocument(documentId: string | number, data: ReviewDocumentRequest): Promise<ApiResponse> {
    return await apiClient.patch(`/api/admin/foundations/documents/${documentId}/review`, data);
  }

  // Content Pages
  async createContentPage(data: CreateContentPageRequest): Promise<ApiResponse<{ content_page: ContentPage }>> {
    return await apiClient.post('/api/admin/content-pages', data);
  }

  async getAllContentPages(): Promise<ApiResponse<{ content_pages: ContentPage[] }>> {
    return await apiClient.get('/api/admin/content-pages');
  }

  async getContentPage(pageIdOrSlug: string | number): Promise<ApiResponse<{ content_page: ContentPage }>> {
    return await apiClient.get(`/api/admin/content-pages/${pageIdOrSlug}`);
  }

  async updateContentPage(pageIdOrSlug: string | number, data: UpdateContentPageRequest): Promise<ApiResponse<{ content_page: ContentPage }>> {
    return await apiClient.put(`/api/admin/content-pages/${pageIdOrSlug}`, data);
  }

  async deleteContentPage(pageIdOrSlug: string | number): Promise<ApiResponse> {
    return await apiClient.delete(`/api/admin/content-pages/${pageIdOrSlug}`);
  }

  // Reviews
  async getPendingReviews(): Promise<ApiResponse<{ reviews: PendingReview[] }>> {
    return await apiClient.get('/api/admin/reviews/pending-approval');
  }

  async approveReview(reviewId: string | number, data?: ReviewReviewRequest): Promise<ApiResponse> {
    return await apiClient.patch(`/api/admin/reviews/${reviewId}/approve`, data);
  }

  async rejectReview(reviewId: string | number, data: ReviewReviewRequest): Promise<ApiResponse> {
    return await apiClient.patch(`/api/admin/reviews/${reviewId}/reject`, data);
  }
}

export const adminService = new AdminService();
export default adminService;