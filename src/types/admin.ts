import { BridalProduct, OccasionType, SilhouetteType, FabricType } from './bridal';

export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'In Kargah' 
  | 'Quality Check' 
  | 'Ready to Ship' 
  | 'In Transit' 
  | 'Delivered' 
  | 'Cancelled';

export type CourierPartner = 
  | 'TCS Express' 
  | 'Leopards Courier' 
  | 'DHL Express Global' 
  | 'AHK Concierge (Karachi Direct)';

export interface TrackingMilestone {
  title: string;
  location: string;
  date: string;
  completed: boolean;
  current: boolean;
  description?: string;
}

export interface DeliveryTracking {
  courier: CourierPartner;
  trackingNumber: string;
  trackingUrl: string;
  dispatchedDate?: string;
  estimatedDelivery: string;
  deliveredDate?: string;
  milestones: TrackingMilestone[];
  currentMilestoneIndex: number;
}

export interface OrderItem {
  id: string;
  productId?: string;
  title: string;
  sku: string;
  occasion: string;
  fabric: string;
  image?: string;
  pricePKR: number;
  priceUSD: number;
  originalPricePKR?: number;
  originalPriceUSD?: number;
  discountPercent?: number;
  size?: string;
  color?: string;
  quantity: number;
  customizationSummary?: string;
  customMeasurements?: {
    shoulder: string;
    bust: string;
    hips: string;
    daman: string;
    armhole: string;
  };
  measurements?: {
    bust?: string;
    waist?: string;
    hips?: string;
    length?: string;
    shoulder?: string;
    daman?: string;
    armhole?: string;
    notes?: string;
  };
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerWhatsApp: string;
  weddingDate?: string;
  shippingAddress: {
    street: string;
    city: string;
    provinceState: string;
    country: string;
    postalCode?: string;
    isBoutiquePickup?: boolean;
  };
  items: OrderItem[];
  subtotalPKR: number;
  taxPKR: number;
  shippingFeePKR: number;
  discountCode?: string;
  discountAmountPKR?: number;
  discountAmountUSD?: number;
  freeCODApplied?: boolean;
  totalPKR: number;
  totalUSD: number;
  status: OrderStatus;
  paymentStatus: 'Cash on Delivery (Pending)' | 'Paid on Delivery' | 'Paid' | '50% Kargah Deposit' | 'Pending Cash on Fitting' | 'Refunded';
  paymentMethod: 'Cash on Delivery (COD)' | 'Bank Transfer' | 'Credit/Debit Card' | 'Cash at Dolmen Mall' | 'Western Union / Wire';
  deliveryTracking: DeliveryTracking;
  notes?: string;
  channel: 'Online Storefront' | 'Dolmen Mall Karachi Flagship' | 'WhatsApp Bridal Concierge';
}

export interface AdminProduct extends BridalProduct {
  slug?: string;
  collections?: string[];
  styleCategory?: string;
  isBestSelling?: boolean;
  isNewArrival?: boolean;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  category: OccasionType;
  status: 'Active' | 'Draft' | 'Archived';
  createdAt: string;
  totalSold: number;
  rating: number;
  reviewCount: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  totalOrders: number;
  totalSpendPKR: number;
  weddingDate?: string;
  status: 'VIP Bride' | 'Active Client' | 'Inquiry';
  lastOrderDate: string;
  notes: string;
}

export interface DashboardMetrics {
  totalRevenuePKR: number;
  totalRevenueUSD: number;
  revenueGrowthPct: number;
  totalOrders: number;
  ordersGrowthPct: number;
  pendingOrders: number;
  inProductionOrders: number;
  totalProducts: number;
  lowStockCount: number;
  totalStockValuePKR: number;
  averageOrderValuePKR: number;
  kargahArtisanCapacityPct: number;
}

export interface DirectInquiry {
  id: string;
  ticketNumber: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  cityCountry: string;
  weddingDate?: string;
  inquiryType: string;
  message: string;
  status: 'New' | 'Read' | 'Replied' | 'Archived';
  priority: 'Rush' | 'High' | 'Normal';
  adminNotes?: string;
  repliedAt?: string;
}

export interface CarouselSlide {
  id: string;
  productId?: string;
  title: string;
  urduTitle: string;
  occasion: string;
  fabric: string;
  image: string;
  secondaryImage?: string;
  embroidery: string[];
  pricePKR?: number;
  priceUSD?: number;
  description: string;
  colorway: string;
  order?: number;
  status?: 'Active' | 'Draft';
  createdAt?: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_cod';
  value: number; // percentage (e.g. 10 for 10%) or fixed PKR (e.g. 50000)
  minOrderPKR?: number;
  maxDiscountPKR?: number; // max cap for percentage discounts
  description: string;
  expiresAt?: string;
  status: 'Active' | 'Inactive';
  usageCount: number;
  usageLimit?: number;
  createdAt: string;
}

export interface CustomerFeedback {
  id: string;
  productId?: string;
  photos?: string[];
  customerName: string;
  email?: string;
  phone?: string;
  city?: string;
  occasion: string;
  ensembleName?: string;
  rating: number; // 1-5
  review: string;
  status: 'Approved' | 'Pending' | 'Archived';
  isVerifiedBride: boolean;
  createdAt: string;
}

export interface ProductReview extends CustomerFeedback {
  productId: string;
  photos: string[];
}


