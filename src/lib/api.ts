import type { ApiResponse, PaginatedResponse } from '@/types';

const API_BASE = '/api';

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'An error occurred',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function getProducts(params?: {
  category?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  bestSeller?: boolean;
  search?: string;
}): Promise<ApiResponse<PaginatedResponse<any>>> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.featured) searchParams.set('featured', 'true');
  if (params?.bestSeller) searchParams.set('bestSeller', 'true');
  if (params?.search) searchParams.set('search', params.search);

  return fetchApi(`/products?${searchParams.toString()}`);
}

export async function getProduct(slug: string): Promise<ApiResponse<any>> {
  return fetchApi(`/products/${slug}`);
}

export async function getCategories(): Promise<ApiResponse<any[]>> {
  return fetchApi('/categories');
}

export async function getBanners(): Promise<ApiResponse<any[]>> {
  return fetchApi('/banners');
}

export async function getTestimonials(): Promise<ApiResponse<any[]>> {
  return fetchApi('/testimonials');
}

export async function getOffers(): Promise<ApiResponse<any[]>> {
  return fetchApi('/offers');
}

export async function validateCoupon(code: string, subtotal: number): Promise<ApiResponse<any>> {
  return fetchApi('/coupons', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
}

export async function createOrder(orderData: any): Promise<ApiResponse<any>> {
  return fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function createGiftOrder(giftData: any): Promise<ApiResponse<any>> {
  return fetchApi('/gifts', {
    method: 'POST',
    body: JSON.stringify(giftData),
  });
}

// Auth APIs
export async function login(email: string, password: string): Promise<ApiResponse<any>> {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(userData: any): Promise<ApiResponse<any>> {
  return fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}
