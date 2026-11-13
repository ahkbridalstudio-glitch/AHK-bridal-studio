import mongoose, { Schema } from 'mongoose';

// Product Schema
const ProductSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, index: true, sparse: true },
    collections: { type: [String], default: [], index: true },
    styleCategory: { type: String, default: '', index: true },
    isBestSelling: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    name: { type: String, required: true },
    urduName: { type: String, default: '' },
    occasion: { type: String, required: true },
    category: { type: String, default: 'Barat' },
    pricePKR: { type: Number, required: true },
    priceUSD: { type: Number, required: true },
    isDiscounted: { type: Boolean, default: false },
    discountDurationDays: { type: Number, default: 0 },
    discountStartedAt: { type: String, default: '' },
    discountEndsAt: { type: String, default: '' },
    discountPercent: { type: Number, default: 0 },
    discountPricePKR: { type: Number, default: 0 },
    discountPriceUSD: { type: Number, default: 0 },
    originalPricePKR: { type: Number, default: 0 },
    originalPriceUSD: { type: Number, default: 0 },
    availableSizes: { type: [String], default: ['S', 'M', 'L', 'XL'] },
    availableColors: { type: [String], default: [] },
    leadTimeWeeks: { type: Number, default: 8 },
    deliveryWeeks: { type: Number, default: 8 },
    image: { type: String, required: true },
    secondaryImage: { type: String, default: '' },
    images: { type: [String], default: [] },
    gallery: { type: [String], default: [] },
    fabric: { type: String, default: '' },
    silhouette: { type: String, default: '' },
    embroidery: { type: [String], default: [] },
    inclusions: { type: [String], default: [] },
    craftDetails: { type: String, default: '' },
    colorway: { type: String, default: '' },
    stock: { type: Number, default: 3 },
    lowStockThreshold: { type: Number, default: 2 },
    status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active' },
    sku: { type: String, required: true },
    description: { type: String, default: '' },
    zariType: { type: String, default: 'Real 24k Gold Dabka' },
    historicalOrigin: { type: String, default: 'Mughal Imperial Royal Kargah' },
    curatorNotes: { type: String, default: '' },
    totalSold: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 12 },
    defaultCustomState: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// Order Schema
const OrderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerWhatsApp: { type: String, required: true },
    weddingDate: { type: String },
    shippingAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      provinceState: { type: String, default: '' },
      country: { type: String, default: 'Pakistan' },
      postalCode: { type: String, default: '' },
      isBoutiquePickup: { type: Boolean, default: false }
    },
    items: { type: [Schema.Types.Mixed], default: [] },
    subtotalPKR: { type: Number, required: true },
    taxPKR: { type: Number, default: 0 },
    shippingFeePKR: { type: Number, default: 0 },
    discountCode: { type: String, default: '' },
    discountAmountPKR: { type: Number, default: 0 },
    discountAmountUSD: { type: Number, default: 0 },
    freeCODApplied: { type: Boolean, default: false },
    totalPKR: { type: Number, required: true },
    totalUSD: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In Kargah', 'Quality Check', 'Ready to Ship', 'In Transit', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    paymentStatus: {
      type: String,
      default: 'Cash on Delivery (Pending)'
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery (COD)'
    },
    deliveryTracking: {
      courier: { type: String, default: 'TCS Express' },
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
      dispatchedDate: { type: String },
      estimatedDelivery: { type: String, default: 'In 6-8 weeks' },
      deliveredDate: { type: String },
      milestones: { type: [Schema.Types.Mixed], default: [] },
      currentMilestoneIndex: { type: Number, default: 0 }
    },
    notes: { type: String, default: '' },
    channel: {
      type: String,
      enum: ['Online Storefront', 'Dolmen Mall Karachi Flagship', 'WhatsApp Bridal Concierge'],
      default: 'Online Storefront'
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// Inquiry / Direct Message Schema
const InquirySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    ticketNumber: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    cityCountry: { type: String, default: 'Pakistan' },
    weddingDate: { type: String },
    inquiryType: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['New', 'Read', 'Replied', 'Archived'],
      default: 'New'
    },
    priority: {
      type: String,
      enum: ['Rush', 'High', 'Normal'],
      default: 'Normal'
    },
    adminNotes: { type: String, default: '' },
    repliedAt: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// Customer Schema
const CustomerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, default: '' },
    country: { type: String, default: 'Pakistan' },
    totalOrders: { type: Number, default: 0 },
    totalSpendPKR: { type: Number, default: 0 },
    weddingDate: { type: String },
    status: { type: String, enum: ['VIP Bride', 'Active Client', 'Inquiry'], default: 'Active Client' },
    lastOrderDate: { type: String, default: () => new Date().toISOString() },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

// Carousel Slide Schema
const CarouselSlideSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, default: '' },
    title: { type: String, required: true },
    urduTitle: { type: String, default: '' },
    occasion: { type: String, required: true },
    fabric: { type: String, required: true },
    image: { type: String, required: true },
    secondaryImage: { type: String, default: '' },
    embroidery: { type: [String], default: [] },
    pricePKR: { type: Number, default: 0 },
    priceUSD: { type: Number, default: 0 },
    description: { type: String, default: '' },
    colorway: { type: String, default: '' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Draft'], default: 'Active' },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// Discount / Promo Code Schema
const DiscountCodeSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ['percentage', 'fixed', 'free_cod'], default: 'percentage' },
    value: { type: Number, required: true },
    minOrderPKR: { type: Number, default: 0 },
    maxDiscountPKR: { type: Number, default: 0 },
    description: { type: String, default: '' },
    expiresAt: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    usageCount: { type: Number, default: 0 },
    usageLimit: { type: Number },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// Customer Feedback & Testimonials Schema
const FeedbackSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, default: '', index: true },
    customerName: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    occasion: { type: String, default: 'Barat' },
    ensembleName: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    review: { type: String, required: true },
    photos: { type: [String], default: [] },
    status: { type: String, enum: ['Approved', 'Pending', 'Archived'], default: 'Approved' },
    isVerifiedBride: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

export const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const InquiryModel = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
export const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
export const CarouselSlideModel = mongoose.models.CarouselSlide || mongoose.model('CarouselSlide', CarouselSlideSchema);
export const DiscountCodeModel = mongoose.models.DiscountCode || mongoose.model('DiscountCode', DiscountCodeSchema);
export const FeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);


