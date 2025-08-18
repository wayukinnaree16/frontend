import apiClient, { ApiResponse } from '@/lib/api-client';

/**
 * Foundation Type (public API)
 * Matches payload:
 * {
 *   "statusCode": 200,
 *   "data": [{ "type_id": 8, "name": "…", "description": "…" }, ...],
 *   "message": "Foundation types listed successfully",
 *   "success": true
 * }
 */
export interface FoundationType {
  type_id: number;
  name: string;
  description: string;
}

/** Full response shape for GET /api/public/foundations/types */
export interface FoundationTypeResponse {
  statusCode: number;
  data: FoundationType[];
  message: string;
  success: boolean;
}

export interface Foundation {
  foundation_id: number;
  foundation_name: string;
  logo_url?: string;
  history_mission: string;
  foundation_type?: FoundationType;
  foundation_type_id?: number;
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
  verified_at?: string;
  verified_by_admin_id?: number;
  verification_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemCategory {
  id: number;
  name: string;
  description?: string;
  icon_url?: string;
}

export interface WishlistItem {
  wishlist_item_id: number; // Changed from 'id' to 'wishlist_item_id'
  item_name: string; // Changed from 'title' to 'item_name'
  description_detail: string; // Changed from 'description' to 'description_detail'
  quantity_needed: number;
  quantity_received: number;
  quantity_unit: string; // Added quantity_unit
  urgency_level: 'normal' | 'urgent' | 'very_urgent'; // Changed from 'priority_level' and updated types
  status: 'open_for_donation' | 'fulfilled' | 'expired';
  example_image_url?: string; // Changed from 'images' to 'example_image_url'
  foundation?: Foundation;
  foundation_id?: number;
  category?: ItemCategory;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FoundationListParams extends PaginationParams {
  name?: string;
  type_id?: number;
  province?: string;
  sort_by?: 'foundation_name' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface WishlistItemsParams extends PaginationParams {
  foundation_id?: number;
  category_id?: number;
  status?: 'open_for_donation' | 'fulfilled' | 'expired';
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  data?: T;
}

class PublicService {
  // Foundation Types
  /**
   * Prefer using this method for strong typing of the full response envelope.
   */
  async getFoundationTypesResponse(): Promise<ApiResponse<FoundationTypeResponse>> {
    return await apiClient.get('/api/public/foundations/types');
  }

  /**
   * Backward-compatible convenience that returns only the array of types.
   * Keeps existing callers working; they still receive FoundationType[].
   */
  async getFoundationTypes(): Promise<ApiResponse<FoundationType[]>> {
    const envelope = await apiClient.get<ApiResponse<FoundationTypeResponse>>('/api/public/foundations/types');
    const payload = envelope as unknown as FoundationTypeResponse;
    const list = Array.isArray(payload?.data) ? payload.data : [];
    return {
      statusCode: payload?.statusCode,
      success: payload?.success,
      message: payload?.message,
      data: list,
    } as ApiResponse<FoundationType[]>;
  }

  // Foundations
  async getFoundations(params?: FoundationListParams): Promise<ApiResponse<{ foundations: Foundation[] } & PaginationResponse<Foundation[]>>> {
    return await apiClient.get('/api/public/foundations', params);
  }

  async getFoundationById(foundationId: string | number): Promise<ApiResponse<Foundation>> {
    return await apiClient.get(`/api/public/foundations/${foundationId}`);
  }

  // Item Categories
  async getItemCategories(): Promise<ApiResponse<ItemCategory[]>> {
    return await apiClient.get('/api/public/item-categories');
  }

  // Wishlist Items
  async getWishlistItems(params?: WishlistItemsParams): Promise<ApiResponse<{ wishlistItems: WishlistItem[] } & PaginationResponse<WishlistItem[]>>> {
    return await apiClient.get('/api/public/wishlist-items', params);
  }

  // Public view with existing business constraints (open_for_donation + active + verified)
  async getWishlistItemById(wishlistItemId: string | number): Promise<ApiResponse<{ wishlist_item: WishlistItem }>> {
    return await apiClient.get(`/api/public/wishlist-items/${wishlistItemId}`);
  }
}

export const publicService = new PublicService();
export default publicService;
