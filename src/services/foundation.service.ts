import apiClient, { ApiResponse } from '@/lib/api-client';
import { Foundation, WishlistItem, ItemCategory } from './public.service';
import { User } from './auth.service';

export interface UpdateFoundationProfileRequest {
  foundation_name: string;
  logo_url?: string;
  history_mission: string;
  foundation_type_id: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code?: string;
  country?: string;
  gmaps_embed_url?: string;
  contact_phone: string;
  contact_email: string;
  website_url?: string;
  social_media_links?: Record<string, string>;
  license_number?: string;
  accepts_pickup_service?: boolean;
  pickup_service_area?: string;
  pickup_contact_info?: string;
}

export interface CreateWishlistItemRequest {
  // Align with backend validator (foundationWishlistItemSchema)
  item_name: string;
  description_detail: string;
  quantity_needed: number;
  quantity_unit: string;
  category_id: number;
  // Backend expects urgency_level: 'normal' | 'urgent' | 'very_urgent'
  urgency_level?: 'normal' | 'urgent' | 'very_urgent';
  status?: 'open_for_donation' | 'temporarily_closed' | 'fulfilled' | 'archived';
  example_image_url?: string; // Single URL supported by backend; multiple can be handled by using first image
}

export interface UpdateWishlistItemRequest {
  title?: string;
  description?: string;
  quantity_needed?: number;
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  expiry_date?: string;
  images?: string[];
  quantity_unit?: string; // Added quantity_unit
}

export interface ReceivedPledge {
  id: number;
  wishlist_item: WishlistItem;
  donor: User;
  quantity_pledged: number;
  donor_item_description: string;
  delivery_method: string;
  courier_company_name?: string;
  tracking_number?: string;
  status: string;
  pledged_at: string;
}

export interface ApprovePledgeRequest {
  approval_message?: string;
}

export interface RejectPledgeRequest {
  rejection_reason_by_foundation: string;
}

export interface CreateDocumentRequest {
  document_type: string;
  document_url: string;
  document_name: string;
  expiry_date?: string;
  description?: string;
}

export interface Document {
  id: number;
  document_type: string;
  document_url: string;
  document_name: string;
  expiry_date?: string;
  description?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  foundation_id: number;
  created_at: string;
}

class FoundationService {
  // Foundation Profile
  async getMyProfile(): Promise<ApiResponse<Foundation>> {
    return await apiClient.get('/api/foundation/profile/me');
  }

  async updateProfile(data: FormData): Promise<ApiResponse<Foundation>> {
    return await apiClient.put('/api/foundation/profile/me', data);
  }

  // Wishlist Items
  async createWishlistItem(data: CreateWishlistItemRequest): Promise<ApiResponse<{ wishlist_item: WishlistItem }>> {
    return await apiClient.post('/api/foundation/wishlist-items', data);
  }

  async getMyWishlistItems(): Promise<ApiResponse<{ wishlist_items: WishlistItem[] }>> {
    return await apiClient.get('/api/foundation/wishlist-items');
  }

  async getWishlistItemById(wishlistItemId: string | number): Promise<ApiResponse<{ wishlist_item: WishlistItem }>> {
    return await apiClient.get(`/api/foundation/wishlist-items/${wishlistItemId}`);
  }

  async updateWishlistItem(wishlistItemId: string | number, data: UpdateWishlistItemRequest): Promise<ApiResponse<{ wishlist_item: WishlistItem }>> {
    return await apiClient.put(`/api/foundation/wishlist-items/${wishlistItemId}`, data);
  }

  async deleteWishlistItem(wishlistItemId: string | number): Promise<ApiResponse> {
    return await apiClient.delete(`/api/foundation/wishlist-items/${wishlistItemId}`);
  }

  // Pledges
  async getReceivedPledges(): Promise<ApiResponse<{ pledges: ReceivedPledge[] }>> {
    return await apiClient.get('/api/foundation/pledges/received');
  }

  async approvePledge(pledgeId: string | number): Promise<ApiResponse> {
    return await apiClient.patch(`/api/foundation/pledges/${pledgeId}/approve`);
  }

  async rejectPledge(pledgeId: string | number, data: RejectPledgeRequest): Promise<ApiResponse> {
    return await apiClient.patch(`/api/foundation/pledges/${pledgeId}/reject`, data);
  }

  async confirmReceipt(pledgeId: string | number): Promise<ApiResponse> {
    return await apiClient.patch(`/api/foundation/pledges/${pledgeId}/confirm-receipt`);
  }

  // Documents
  async uploadDocument(data: CreateDocumentRequest): Promise<ApiResponse<{ document: Document }>> {
    return await apiClient.post('/api/foundation/documents', data);
  }

  async getMyDocuments(): Promise<ApiResponse<{ documents: Document[] }>> {
    return await apiClient.get('/api/foundation/documents');
  }

  async deleteDocument(documentId: string | number): Promise<ApiResponse> {
    return await apiClient.delete(`/api/foundation/documents/${documentId}`);
  }
}

export const foundationService = new FoundationService();
export default foundationService;
