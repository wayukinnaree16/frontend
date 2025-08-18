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
  user?: User;
  user_account_status?: string; // Add this line
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
  admin_remarks?: string; // Add this line
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

export interface DonatedItem {
  donation_id: number;
  item_name: string;
  quantity: number;
  status: 'pending' | 'delivered';
  donor_id: number;
  foundation_id: number;
  created_at: string;
  admin_notes?: string;
  donor: {
    user_id: number;
    full_name: string;
    email: string;
  };
  foundation: {
    foundation_id: number;
    name: string;
  };
}

export interface CreateDonationRequest {
  item_name: string;
  quantity: number;
  donor_id: number;
  foundation_id: number;
  status?: 'pending' | 'approved' | 'rejected' | 'delivered';
}

export interface UpdateDonatedItemStatusRequest {
  status: 'pending' | 'delivered';
  admin_notes?: string;
}

export interface FoundationType {
  type_id: number;
  name: string;
  description?: string;
}

export interface CreateFoundationTypeRequest {
  name: string;
  description?: string;
}

export interface UpdateFoundationTypeRequest {
  name?: string;
  description?: string;
}

export interface ItemCategory {
  category_id: number;
  name: string;
  description?: string;
}

export interface CreateItemCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateItemCategoryRequest {
  name?: string;
  description?: string;
}

class AdminService {
  // Foundation Types
  async getAllFoundationTypes(): Promise<ApiResponse<FoundationType[]>> {
    return await apiClient.get('/api/admin/foundation-types');
  }

  async createFoundationType(data: CreateFoundationTypeRequest): Promise<ApiResponse<{ foundation_type: FoundationType }>> {
    return await apiClient.post('/api/admin/foundation-types', data);
  }

  async updateFoundationType(foundationTypeId: number, data: UpdateFoundationTypeRequest): Promise<ApiResponse<{ foundation_type: FoundationType }>> {
    return await apiClient.put(`/api/admin/foundation-types/${foundationTypeId}`, data);
  }

  async deleteFoundationType(foundationTypeId: number): Promise<ApiResponse> {
    return await apiClient.delete(`/api/admin/foundation-types/${foundationTypeId}`);
  }

  // Item Categories
  async getAllItemCategories(): Promise<ApiResponse<ItemCategory[]>> {
    return await apiClient.get('/api/admin/item-categories');
  }

  async createItemCategory(data: CreateItemCategoryRequest): Promise<ApiResponse<{ item_category: ItemCategory }>> {
    return await apiClient.post('/api/admin/item-categories', data);
  }

  async updateItemCategory(itemCategoryId: number, data: UpdateItemCategoryRequest): Promise<ApiResponse<{ item_category: ItemCategory }>> {
    return await apiClient.put(`/api/admin/item-categories/${itemCategoryId}`, data);
  }

  async deleteItemCategory(itemCategoryId: number): Promise<ApiResponse> {
    return await apiClient.delete(`/api/admin/item-categories/${itemCategoryId}`);
  }

  // Users
  async getAllUsers(params?: { page?: number; limit?: number }): Promise<ApiResponse<{ users: AdminUser[] } & PaginationResponse<AdminUser[]>>> {
    return await apiClient.get('/api/admin/users', params);
  }

  async getUserById(userId: string | number): Promise<ApiResponse<AdminUser>> {
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

  async getAllFoundations(params?: { page?: number; limit?: number }): Promise<ApiResponse<{ foundations: Foundation[] } & PaginationResponse<Foundation[]>>> {
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
    // Transform the data to match backend expectations
    const backendData = {
      verification_status_by_admin: data.status,
      admin_remarks: data.review_notes
    };
    return await apiClient.patch(`/api/admin/foundations/documents/${documentId}/review`, backendData);
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

  // Donations
  async getDonationStatistics(): Promise<ApiResponse<{ totalPledges: number; totalDonations: number; totalAmountPledged: number; totalAmountDonated: number }>> {
    return await apiClient.get('/api/admin/donations/statistics');
  }

  // Donated Items
  async getAllDonatedItems(params?: { status?: string }): Promise<ApiResponse<DonatedItem[]>> {
    return await apiClient.get('/api/admin/donations/items', { params });
  }

  async updateDonatedItemStatus(donationId: number, data: UpdateDonatedItemStatusRequest): Promise<ApiResponse> {
    return await apiClient.patch(`/api/admin/donations/items/${donationId}/status`, data);
  }

  async createDonation(data: CreateDonationRequest): Promise<ApiResponse<{ donation: DonatedItem }>> {
    return await apiClient.post('/api/admin/donations/items', data);
  }



}

export const adminService = new AdminService();
export default adminService;
