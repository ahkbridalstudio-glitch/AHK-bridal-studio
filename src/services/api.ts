import {
  AdminProduct,
  AdminOrder,
  CustomerProfile,
  DirectInquiry,
  CarouselSlide,
  DiscountCode,
  CustomerFeedback,
  ProductReview,
} from '../types/admin';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const getCache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlightGets = new Map<string, Promise<unknown>>();

export function invalidateApiCache() {
  getCache.clear();
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const cacheKey = `${method}:${endpoint}`;
  if (method === 'GET') {
    const cached = getCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value as T;
    const inFlight = inFlightGets.get(cacheKey);
    if (inFlight) return inFlight as Promise<T>;
  } else {
    invalidateApiCache();
  }

  const run = async () => {
  const { headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');
  if (requestOptions.body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  try {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let message = response.statusText;
    if (contentType.includes('application/json')) {
      const body = await response.json().catch(() => null);
      message = body?.error || body?.message || message;
    } else {
      message = (await response.text().catch(() => '')) || message;
    }
    throw new Error(`API ${response.status}: ${message}`);
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json() as T;
  if (method === 'GET') getCache.set(cacheKey, { value: data, expiresAt: Date.now() + 15_000 });
  return data;
  } finally {
    if (method !== 'GET') invalidateApiCache();
  }
  };

  if (method !== 'GET') return run();
  const promise = run();
  inFlightGets.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    inFlightGets.delete(cacheKey);
  }
}

const idPath = (id: string) => encodeURIComponent(id);

export interface ShopCategory {
  slug: string;
  name: string;
  description: string;
}

export interface ShopCategories {
  collections: ShopCategory[];
  styles: ShopCategory[];
}

export interface ProductFilters {
  collection?: string;
  styleCategory?: string;
  search?: string;
}

function productQuery(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const api = {
  getProducts: (filters?: ProductFilters) => request<AdminProduct[]>(`/products${productQuery(filters)}`),
  getProductBySlug: (slug: string) => request<AdminProduct>(`/products/slug/${encodeURIComponent(slug)}`),
  getProductReviews: (productId: string) => request<ProductReview[]>(`/products/${idPath(productId)}/reviews`),
  submitProductReview: (productId: string, review: Pick<ProductReview, 'customerName' | 'rating' | 'review'> & { photos: string[] }) => request<ProductReview>(`/products/${idPath(productId)}/reviews`, {
    method: 'POST', body: JSON.stringify(review),
  }),
  deleteProductReview: (productId: string, reviewId: string) => request<{ message: string }>(`/products/${idPath(productId)}/reviews/${idPath(reviewId)}`, { method: 'DELETE' }),
  getCategories: () => request<ShopCategories>('/categories'),
  saveProduct: (product: AdminProduct) => request<AdminProduct>('/products', {
    method: 'POST', body: JSON.stringify(product),
  }),
  updateProduct: (id: string, product: Partial<AdminProduct>) => request<AdminProduct>(`/products/${idPath(id)}`, {
    method: 'PUT', body: JSON.stringify(product),
  }),
  deleteProduct: (id: string) => request<{ message: string }>(`/products/${idPath(id)}`, { method: 'DELETE' }),
  updateProductStock: (id: string, stock: number) => request<AdminProduct>(`/products/${idPath(id)}/stock`, {
    method: 'PATCH', body: JSON.stringify({ stock }),
  }),

  getOrders: () => request<AdminOrder[]>('/orders'),
  createOrder: (order: AdminOrder) => request<AdminOrder>('/orders', {
    method: 'POST', body: JSON.stringify(order),
  }),
  updateOrderStatus: (id: string, status: string) => request<AdminOrder>(`/orders/${idPath(id)}/status`, {
    method: 'PUT', body: JSON.stringify({ status }),
  }),
  updateOrderTracking: (id: string, deliveryTracking: AdminOrder['deliveryTracking']) => request<AdminOrder>(`/orders/${idPath(id)}/tracking`, {
    method: 'PUT', body: JSON.stringify({ deliveryTracking }),
  }),
  deleteOrder: (id: string) => request<{ success: boolean }>(`/orders/${idPath(id)}`, { method: 'DELETE' }),

  getInquiries: () => request<DirectInquiry[]>('/inquiries'),
  submitInquiry: (inquiry: DirectInquiry) => request<DirectInquiry>('/inquiries', {
    method: 'POST', body: JSON.stringify(inquiry),
  }),
  updateInquiryStatus: (id: string, status: DirectInquiry['status']) => request<DirectInquiry>(`/inquiries/${idPath(id)}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  }),
  updateInquiryNotes: (id: string, notes: string) => request<DirectInquiry>(`/inquiries/${idPath(id)}/notes`, {
    method: 'PATCH', body: JSON.stringify({ notes }),
  }),
  deleteInquiry: (id: string) => request<{ message: string }>(`/inquiries/${idPath(id)}`, { method: 'DELETE' }),

  getCustomers: () => request<CustomerProfile[]>('/customers'),

  getCarouselSlides: () => request<CarouselSlide[]>('/carousel'),
  saveCarouselSlide: (slide: CarouselSlide) => request<CarouselSlide>('/carousel', {
    method: 'POST', body: JSON.stringify(slide),
  }),
  updateCarouselSlide: (id: string, slide: Partial<CarouselSlide>) => request<CarouselSlide>(`/carousel/${idPath(id)}`, {
    method: 'PUT', body: JSON.stringify(slide),
  }),
  deleteCarouselSlide: (id: string) => request<{ message: string }>(`/carousel/${idPath(id)}`, { method: 'DELETE' }),
  updateCarouselSlideOrder: (id: string, order?: number, status?: string) => request<CarouselSlide>(`/carousel/${idPath(id)}/order`, {
    method: 'PATCH', body: JSON.stringify({ order, status }),
  }),

  getDiscounts: () => request<DiscountCode[]>('/discounts'),
  saveDiscount: (discount: DiscountCode) => request<DiscountCode>('/discounts', {
    method: 'POST', body: JSON.stringify(discount),
  }),
  updateDiscount: (id: string, discount: Partial<DiscountCode>) => request<DiscountCode>(`/discounts/${idPath(id)}`, {
    method: 'PUT', body: JSON.stringify(discount),
  }),
  deleteDiscount: (id: string) => request<{ message: string }>(`/discounts/${idPath(id)}`, { method: 'DELETE' }),
  validateDiscount: (code: string, subtotalPKR: number) => request<{
    valid: boolean;
    code?: string;
    discountType?: 'percentage' | 'fixed' | 'free_cod';
    freeCOD?: boolean;
    value?: number;
    discountAmountPKR?: number;
    discountAmountUSD?: number;
    finalTotalPKR?: number;
    description?: string;
    message: string;
  }>('/discounts/validate', {
    method: 'POST', body: JSON.stringify({ code, subtotalPKR }),
  }),

  getFeedbacks: () => request<CustomerFeedback[]>('/feedback'),
  submitFeedback: (feedback: Partial<CustomerFeedback>) => request<CustomerFeedback>('/feedback', {
    method: 'POST', body: JSON.stringify(feedback),
  }),
  deleteFeedback: (id: string) => request<{ message: string }>(`/feedback/${idPath(id)}`, { method: 'DELETE' }),

  checkHealth: () => request<{ status: string; database: { status: string; database: string } }>('/health'),
};
