import apiClient, { ApiResponse } from '@/lib/api-client';
import { Foundation, WishlistItem } from './public.service';
import { User } from './auth.service';

export interface CreatePledgeRequest {
  wishlist_item_id: number;
  quantity_pledged: number;
  donor_item_description: string;
  delivery_method: 'self_delivery' | 'courier_service' | 'foundation_pickup';
  courier_company_name?: string;
  tracking_number?: string;
  pickup_address_details?: string;
  pickup_preferred_datetime?: string;
}

export interface Pledge {
  id: number;
  wishlist_item_id: number;
  foundation_id: number;
  donor_id: number;
  quantity_pledged: number;
  donor_item_description: string;
  delivery_method: 'self_delivery' | 'courier_service' | 'foundation_pickup';
  courier_company_name?: string;
  tracking_number?: string;
  pickup_address_details?: string;
  pickup_preferred_datetime?: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'cancelled' | 'received';
  pledged_at?: string;
  approved_at?: string;
  rejected_at?: string;
  received_at?: string;
  cancelled_at?: string;
  wishlist_item?: WishlistItem;
  foundation?: Foundation;
}

export interface UpdateTrackingRequest {
  courier_company_name: string;
  tracking_number: string;
}

export interface Favorite {
  favorite_id: number;
  added_at: string;
  foundation?: Foundation;
}

export interface CreateFavoriteRequest {
  foundation_id: number;
}

export interface CreateReviewRequest {
  rating: number;
  review_text: string;
  anonymous: boolean;
}

export interface Review {
  id: number;
  pledge_id: number;
  donor_id: number;
  foundation_id: number;
  rating: number;
  review_text: string;
  anonymous: boolean;
  status: 'pending_approval' | 'approved' | 'rejected';
  created_at: string;
}

class DonorService {
  // Pledges
  async createPledge(data: CreatePledgeRequest): Promise<ApiResponse<{ pledge: Pledge }>> {
    return await apiClient.post('/api/donor/pledges', data);
  }

  async getMyPledges(): Promise<ApiResponse<{ pledges: Pledge[] }>> {
    return await apiClient.get('/api/donor/pledges');
  }

  async getPledgeById(pledgeId: string | number): Promise<ApiResponse<{ pledge: Pledge }>> {
    return await apiClient.get(`/api/donor/pledges/${pledgeId}`);
  }

  async cancelPledge(pledgeId: string | number): Promise<ApiResponse> {
    return await apiClient.patch(`/api/donor/pledges/${pledgeId}/cancel`);
  }

  async updateTracking(pledgeId: string | number, data: UpdateTrackingRequest): Promise<ApiResponse> {
    return await apiClient.patch(`/api/donor/pledges/${pledgeId}/tracking`, data);
  }

  // Favorites
  async addFavorite(data: CreateFavoriteRequest): Promise<ApiResponse<{ favorite: Favorite }>> {
    return await apiClient.post('/api/donor/favorites', data);
  }

  async getFavorites(): Promise<ApiResponse<Favorite[]>> {
    return await apiClient.get('/api/donor/favorites');
  }

  async removeFavorite(foundationId: string | number): Promise<ApiResponse> {
    return await apiClient.delete(`/api/donor/favorites/${foundationId}`);
  }

  // Reviews
  async createReview(pledgeId: string | number, data: CreateReviewRequest): Promise<ApiResponse<{ review: Review }>> {
    return await apiClient.post(`/api/donor/pledges/${pledgeId}/reviews`, data);
  }
}

export const donorService = new DonorService();
export default donorService;