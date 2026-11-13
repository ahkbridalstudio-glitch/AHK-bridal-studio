import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToMongoDB, getDatabaseStatus } from './src/server/db';
import {
  ProductModel,
  OrderModel,
  InquiryModel,
  CustomerModel,
  CarouselSlideModel,
  DiscountCodeModel,
  FeedbackModel
} from './src/server/models';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse CLI port if passed by dev server (e.g. --port 3000)
const portArgIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : undefined;
const configuredPort = process.env.PORT || process.env.DEFAULT_APP_PORT;
const PORT = cliPort || (configuredPort ? parseInt(configuredPort, 10) : 3000);
const isProduction = process.env.NODE_ENV === 'production';

const SHOP_CATEGORIES = {
  collections: [
    { slug: 'luxury', name: 'Luxury', description: 'Exceptional couture pieces, selected for their artistry, materials, and finish.' },
    { slug: 'best-selling', name: 'Best Selling', description: 'The designs customers return to and recommend.' },
    { slug: 'formals', name: 'Formals', description: 'Refined formalwear for celebrations and special occasions.' },
    { slug: 'new-arrivals', name: 'New Arrivals', description: 'The latest designs added to the collection.' },
    { slug: 'sale', name: 'Sale', description: 'Current reduced-price designs from the collection.' },
  ],
  styles: [
    { slug: 'kurta-set', name: 'Kurta Set', description: 'An elegant kurta paired with a considered trouser and dupatta.' },
    { slug: 'pishwas', name: 'Pishwas', description: 'A flowing, panelled silhouette with heirloom finishing.' },
    { slug: 'maxi', name: 'Maxi', description: 'A graceful long-form silhouette for evening occasions.' },
    { slug: 'garara', name: 'Garara', description: 'A statement flared trouser paired with a beautifully detailed top.' },
    { slug: 'lehenga', name: 'Lehenga', description: 'A full skirt and couture blouse finished with refined handwork.' },
    { slug: 'sharara', name: 'Sharara', description: 'A fluid, wide-leg silhouette with coordinated couture layers.' },
  ],
};

const slugifyProductName = (name: string) => name
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const collectionSlugs = new Set(SHOP_CATEGORIES.collections.map(({ slug }) => slug));
const styleSlugs = new Set(SHOP_CATEGORIES.styles.map(({ slug }) => slug));

function normalizeProductData(input: Record<string, any>, existing?: Record<string, any>) {
  const product = { ...existing, ...input };
  const requestedCollections = Array.isArray(product.collections) ? product.collections : [];
  const collections = [...new Set(requestedCollections.filter((slug: unknown): slug is string => typeof slug === 'string' && collectionSlugs.has(slug)))];
  const shouldBeOnSale = Boolean(product.isDiscounted || collections.includes('sale'));
  const durationDays = Math.max(1, Math.min(365, Number(product.discountDurationDays) || 7));
  if (shouldBeOnSale) {
    const durationChanged = existing && Number(existing.discountDurationDays) !== durationDays;
    if (!existing || !existing.isDiscounted || !existing.discountEndsAt || durationChanged) {
      const startedAt = new Date();
      product.discountStartedAt = startedAt.toISOString();
      product.discountEndsAt = new Date(startedAt.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    }
    product.discountDurationDays = durationDays;
  } else {
    product.discountStartedAt = '';
    product.discountEndsAt = '';
  }
  product.isDiscounted = shouldBeOnSale;
  product.isBestSelling = Boolean(product.isBestSelling || collections.includes('best-selling'));
  product.isNewArrival = Boolean(product.isNewArrival || collections.includes('new-arrivals'));
  product.collections = collections.filter((slug) => !['sale', 'best-selling', 'new-arrivals'].includes(slug));
  product.styleCategory = typeof product.styleCategory === 'string' && styleSlugs.has(product.styleCategory) ? product.styleCategory : '';
  if (product.name) product.slug = slugifyProductName(product.name) || product.id;
  return product;
}

function isSaleActive(product: Record<string, any>) {
  return Boolean(product.isDiscounted && (!product.discountEndsAt || new Date(product.discountEndsAt).getTime() > Date.now()));
}

function withCurrentSaleStatus<T extends Record<string, any>>(product: T) {
  const expired = Boolean(product.isDiscounted && !isSaleActive(product));
  return {
    ...product,
    isDiscounted: isSaleActive(product),
    ...(expired ? {
      pricePKR: product.originalPricePKR || product.pricePKR,
      priceUSD: product.originalPriceUSD || product.priceUSD,
      discountPercent: 0,
      discountPricePKR: 0,
      discountPriceUSD: 0,
    } : {}),
    slug: product.slug || slugifyProductName(product.name) || product.id,
  };
}

// Body Parser Middleware (with generous payload limit for base64 bridal photos)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ==================== REST API ENDPOINTS ====================

// Health & Database Telemetry
app.get('/api/health', (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'ok',
    environment: isProduction ? 'production' : 'development',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(SHOP_CATEGORIES);
});

// --- PRODUCTS API ---
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, any> = {};
    const collection = String(req.query.collection || '');
    const styleCategory = String(req.query.styleCategory || '');
    const search = String(req.query.search || '').trim();

    if (collection === 'sale') {
      filter.isDiscounted = true;
      filter.$or = [{ discountEndsAt: '' }, { discountEndsAt: { $exists: false } }, { discountEndsAt: { $gt: new Date().toISOString() } }];
    }
    else if (collection === 'best-selling') filter.$or = [{ isBestSelling: true }, { totalSold: { $gt: 0 } }];
    else if (collection === 'new-arrivals') filter.isNewArrival = true;
    else if (collection) filter.collections = collection;
    if (styleCategory) filter.styleCategory = styleCategory;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$and = [
        ...(filter.$or ? [{ $or: filter.$or }] : []),
        { $or: [
          { name: { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } },
          { fabric: { $regex: escaped, $options: 'i' } },
          { silhouette: { $regex: escaped, $options: 'i' } },
          { collections: { $regex: escaped, $options: 'i' } },
          { styleCategory: { $regex: escaped, $options: 'i' } },
        ] },
      ];
      delete filter.$or;
    }
    const products = await ProductModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json(products.map((product) => withCurrentSaleStatus(product)));
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to retrieve products from MongoDB' });
  }
});

app.get('/api/products/slug/:slug', async (req: Request, res: Response) => {
  try {
    let product = await ProductModel.findOne({ slug: req.params.slug }).lean();
    if (!product) {
      const byId = await ProductModel.findOne({ id: req.params.slug }).lean();
      if (byId) product = byId;
    }
    if (!product) {
      const candidates = await ProductModel.find({}).lean();
      product = candidates.find((candidate) => slugifyProductName(candidate.name) === req.params.slug) || null;
    }
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(withCurrentSaleStatus(product));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await FeedbackModel.find({ productId: req.params.id, status: 'Approved' }).sort({ createdAt: -1 }).lean();
    res.json(reviews);
  } catch (error: any) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ error: 'Failed to retrieve product reviews' });
  }
});

app.post('/api/products/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { customerName, rating, review, photos = [] } = req.body || {};
    if (!customerName?.trim() || !review?.trim()) return res.status(400).json({ error: 'Your name and review are required' });
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ error: 'Choose a rating from 1 to 5 stars' });
    if (!Array.isArray(photos) || photos.length > 3 || photos.some((photo: unknown) => typeof photo !== 'string' || !/^data:image\/(?:jpeg|png|webp);base64,/i.test(photo) || photo.length > 4_300_000) || photos.reduce((sum: number, photo: string) => sum + photo.length, 0) > 11_700_000) {
      return res.status(400).json({ error: 'Upload up to 3 JPG, PNG, or WebP photos with a combined size of 8 MB or less' });
    }
    const product = await ProductModel.findOne({ id: req.params.id }).select('id').lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const created = await FeedbackModel.create({
      id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productId: req.params.id,
      customerName: customerName.trim().slice(0, 100),
      rating: Number(rating),
      review: review.trim().slice(0, 3000),
      photos,
      status: 'Approved',
      isVerifiedBride: false,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(created);
  } catch (error: any) {
    console.error('Error submitting product review:', error);
    res.status(500).json({ error: 'Failed to submit product review' });
  }
});

app.delete('/api/products/:id/reviews/:reviewId', async (req: Request, res: Response) => {
  try {
    const deleted = await FeedbackModel.findOneAndDelete({ id: req.params.reviewId, productId: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Product review not found' });
    res.json({ message: 'Product review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product review:', error);
    res.status(500).json({ error: 'Failed to delete product review' });
  }
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(withCurrentSaleStatus(product.toObject()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const productData = { ...req.body };
    if (!productData.id) {
      productData.id = `prod-${Date.now()}`;
    }
    const normalized = normalizeProductData(productData);
    const updated = await ProductModel.findOneAndUpdate(
      { id: normalized.id },
      { $set: normalized },
      { upsert: true, returnDocument: 'after' }
    );
    res.status(201).json(updated);
  } catch (error: any) {
    console.error('Error saving product to MongoDB:', error);
    res.status(500).json({ error: 'Failed to save product in MongoDB' });
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const existing = await ProductModel.findOne({ id: req.params.id }).lean();
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const normalized = normalizeProductData({ ...req.body, id: req.params.id }, existing as Record<string, any>);
    const updated = await ProductModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: normalized },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const result = await ProductModel.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product removed from MongoDB catalog', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/products/:id/stock', async (req: Request, res: Response) => {
  try {
    const { stock } = req.body;
    const updated = await ProductModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { stock: Math.max(0, Number(stock)) } },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- ORDERS API ---
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders from MongoDB' });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    if (!orderData.id) {
      orderData.id = `ord-${Date.now()}`;
    }
    if (!orderData.orderNumber) {
      orderData.orderNumber = `AHK-2026-${Math.floor(100 + Math.random() * 900)}`;
    }
    orderData.createdAt = new Date().toISOString();
    orderData.updatedAt = new Date().toISOString();

    const cityClean = String(orderData.shippingAddress?.city || '').trim().toLowerCase();
    const hasFreeKarachiCOD = cityClean === 'karachi' || cityClean === 'khi' || cityClean.includes('karachi');
    let shippingFeePKR = hasFreeKarachiCOD ? 0 : 350;
    const orderSubtotalPKR = Math.max(0, Number(orderData.subtotalPKR) || 0);
    let discountAmountPKR = 0;
    orderData.freeCODApplied = false;

    if (orderData.discountCode) {
      const normalizedCode = String(orderData.discountCode).trim().toUpperCase();
      const discount = await DiscountCodeModel.findOne({ code: normalizedCode });
      if (!discount || discount.status !== 'Active') return res.status(400).json({ error: 'This coupon is invalid or inactive.' });
      if (discount.expiresAt && new Date(discount.expiresAt).getTime() < Date.now()) return res.status(400).json({ error: 'This coupon has expired.' });
      if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return res.status(400).json({ error: 'This coupon has reached its usage limit.' });
      if (discount.minOrderPKR && orderSubtotalPKR < discount.minOrderPKR) return res.status(400).json({ error: `This coupon requires a minimum order of PKR ${discount.minOrderPKR.toLocaleString()}.` });

      orderData.discountCode = normalizedCode;
      if (discount.discountType === 'free_cod') {
        shippingFeePKR = 0;
        orderData.freeCODApplied = true;
      } else if (discount.discountType === 'percentage') {
        discountAmountPKR = Math.round(orderSubtotalPKR * Number(discount.value) / 100);
        if (discount.maxDiscountPKR > 0) discountAmountPKR = Math.min(discountAmountPKR, discount.maxDiscountPKR);
      } else {
        discountAmountPKR = Math.min(Number(discount.value) || 0, orderSubtotalPKR);
      }
    } else {
      orderData.discountCode = '';
    }

    orderData.shippingFeePKR = shippingFeePKR;
    orderData.discountAmountPKR = discountAmountPKR;
    orderData.discountAmountUSD = Math.round(discountAmountPKR / 278);
    orderData.totalPKR = Math.max(0, orderSubtotalPKR - discountAmountPKR) + shippingFeePKR;
    orderData.totalUSD = Math.round(orderData.totalPKR / 278);

    const newOrder = await OrderModel.create(orderData);

    const customerEmail = String(orderData.customerEmail || '').trim().toLowerCase();
    if (customerEmail) {
      await CustomerModel.findOneAndUpdate(
        { email: customerEmail },
        {
          $set: {
            name: orderData.customerName,
            phone: orderData.customerPhone,
            city: orderData.shippingAddress?.city || '',
            country: orderData.shippingAddress?.country || 'Pakistan',
            lastOrderDate: orderData.createdAt,
          },
          $setOnInsert: { id: `cust-${Date.now()}`, email: customerEmail },
          $inc: { totalOrders: 1, totalSpendPKR: Number(orderData.totalPKR) || 0 },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      ).catch((customerError) => {
        console.error('Order was created, but customer summary could not be updated:', customerError);
      });
    }

    // If order used a discount code, increment its usage count in MongoDB
    if (orderData.discountCode) {
      await DiscountCodeModel.findOneAndUpdate(
        { code: orderData.discountCode.toUpperCase().trim() },
        { $inc: { usageCount: 1 } }
      ).catch(() => {});
    }

    // Automatically decrement stock of ordered items in MongoDB
    if (Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        const prodId = item.productId || item.id;
        const qty = Math.max(1, Number(item.quantity) || 1);
        if (prodId) {
          const prod = await ProductModel.findOne({ id: prodId });
          if (prod) {
            const newStock = Math.max(0, (prod.stock ?? 1) - qty);
            await ProductModel.findOneAndUpdate(
              { id: prodId },
              { $set: { stock: newStock }, $inc: { totalSold: qty } }
            ).catch(() => {});
          }
        }
      }
    }

    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error('Error creating order in MongoDB:', error);
    res.status(500).json({ error: 'Failed to create order in MongoDB' });
  }
});

app.put('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await OrderModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/tracking', async (req: Request, res: Response) => {
  try {
    const { deliveryTracking } = req.body;
    const updated = await OrderModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { deliveryTracking, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await OrderModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- INQUIRIES / DIRECT MESSAGES API ---
app.get('/api/inquiries', async (req: Request, res: Response) => {
  try {
    const inquiries = await InquiryModel.find({}).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries from MongoDB' });
  }
});

app.post('/api/inquiries', async (req: Request, res: Response) => {
  try {
    const inqData = req.body;
    if (!inqData.id) inqData.id = `inq-${Date.now()}`;
    if (!inqData.ticketNumber) inqData.ticketNumber = `NA-${Math.floor(10000 + Math.random() * 90000)}`;
    if (!inqData.createdAt) inqData.createdAt = new Date().toISOString();
    if (!inqData.status) inqData.status = 'New';

    const newInquiry = await InquiryModel.create(inqData);
    res.status(201).json(newInquiry);
  } catch (error: any) {
    console.error('Error creating inquiry in MongoDB:', error);
    res.status(500).json({ error: 'Failed to save direct inquiry in MongoDB' });
  }
});

app.patch('/api/inquiries/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updateObj: any = { status };
    if (status === 'Replied') {
      updateObj.repliedAt = new Date().toISOString();
    }
    const updated = await InquiryModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateObj },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Inquiry not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/inquiries/:id/notes', async (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    const updated = await InquiryModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { adminNotes: notes } },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Inquiry not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inquiries/:id', async (req: Request, res: Response) => {
  try {
    const result = await InquiryModel.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ message: 'Inquiry removed from database', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- CUSTOMERS API ---
app.get('/api/customers', async (req: Request, res: Response) => {
  try {
    const customers = await CustomerModel.find({}).sort({ totalSpendPKR: -1 });
    res.json(customers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers from MongoDB' });
  }
});

// --- CAROUSEL SLIDES API ---
app.get('/api/carousel', async (req: Request, res: Response) => {
  try {
    const slides = await CarouselSlideModel.find({}).sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (error: any) {
    console.error('Error fetching carousel slides:', error);
    res.status(500).json({ error: 'Failed to fetch carousel slides from MongoDB' });
  }
});

app.post('/api/carousel', async (req: Request, res: Response) => {
  try {
    const slideData = req.body;
    if (!slideData.id) {
      slideData.id = `slide-${Date.now()}`;
    }
    if (slideData.order === undefined) {
      const highest = await CarouselSlideModel.findOne({}).sort({ order: -1 });
      slideData.order = (highest?.order || 0) + 1;
    }
    slideData.createdAt = new Date().toISOString();
    const newSlide = await CarouselSlideModel.create(slideData);
    res.status(201).json(newSlide);
  } catch (error: any) {
    console.error('Error creating carousel slide:', error);
    res.status(500).json({ error: error.message || 'Failed to create carousel slide' });
  }
});

app.put('/api/carousel/:id', async (req: Request, res: Response) => {
  try {
    const updated = await CarouselSlideModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Carousel slide not found' });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating carousel slide:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/carousel/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await CarouselSlideModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Carousel slide not found' });
    res.json({ message: 'Carousel slide deleted successfully', id: req.params.id });
  } catch (error: any) {
    console.error('Error deleting carousel slide:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/carousel/:id/order', async (req: Request, res: Response) => {
  try {
    const { order, status } = req.body;
    const updatePayload: any = {};
    if (order !== undefined) updatePayload.order = Number(order);
    if (status !== undefined) updatePayload.status = status;

    const updated = await CarouselSlideModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Carousel slide not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- DISCOUNT / PROMO CODES API ---
app.get('/api/discounts', async (req: Request, res: Response) => {
  try {
    const discounts = await DiscountCodeModel.find({}).sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error: any) {
    console.error('Error fetching discounts from MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch discounts from MongoDB' });
  }
});

app.post('/api/discounts', async (req: Request, res: Response) => {
  try {
    const codeData = req.body;
    if (!codeData.id) {
      codeData.id = `disc-${Date.now()}`;
    }
    if (codeData.code) {
      codeData.code = codeData.code.trim().toUpperCase();
    }
    codeData.createdAt = new Date().toISOString();

    const existing = await DiscountCodeModel.findOne({ code: codeData.code });
    if (existing) {
      return res.status(400).json({ error: `Promo code "${codeData.code}" already exists` });
    }

    const newDiscount = await DiscountCodeModel.create(codeData);
    res.status(201).json(newDiscount);
  } catch (error: any) {
    console.error('Error creating discount code in MongoDB:', error);
    res.status(500).json({ error: error.message || 'Failed to create discount code' });
  }
});

app.put('/api/discounts/:id', async (req: Request, res: Response) => {
  try {
    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
    }

    const updated = await DiscountCodeModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Discount code not found' });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating discount code in MongoDB:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/discounts/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await DiscountCodeModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Discount code not found' });
    res.json({ message: 'Discount code deleted successfully', id: req.params.id });
  } catch (error: any) {
    console.error('Error deleting discount code in MongoDB:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/discounts/validate', async (req: Request, res: Response) => {
  try {
    const code = String(req.body.code || '');
    const subtotalPKR = req.body.subtotalPKR;
    if (!code.trim()) {
      return res.status(400).json({ valid: false, message: 'Please enter a discount or promo code' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const discount = await DiscountCodeModel.findOne({ code: normalizedCode });

    if (!discount) {
      return res.status(404).json({ valid: false, message: `Promo code "${normalizedCode}" is invalid` });
    }

    if (discount.status !== 'Active') {
      return res.status(400).json({ valid: false, message: `Promo code "${normalizedCode}" is currently inactive` });
    }

    if (discount.expiresAt) {
      const expiry = new Date(discount.expiresAt);
      if (expiry < new Date()) {
        return res.status(400).json({ valid: false, message: `Promo code "${normalizedCode}" has expired` });
      }
    }

    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return res.status(400).json({ valid: false, message: `Promo code "${normalizedCode}" usage limit reached` });
    }

    const orderAmount = Number(subtotalPKR) || 0;
    if (discount.minOrderPKR && orderAmount < discount.minOrderPKR) {
      return res.status(400).json({
        valid: false,
        message: `Promo code "${normalizedCode}" requires a minimum order of PKR ${discount.minOrderPKR.toLocaleString()}`
      });
    }

    let discountAmountPKR = 0;
    if (discount.discountType === 'free_cod') {
      discountAmountPKR = 0;
    } else if (discount.discountType === 'percentage') {
      discountAmountPKR = Math.round((orderAmount * discount.value) / 100);
      if (discount.maxDiscountPKR && discount.maxDiscountPKR > 0) {
        discountAmountPKR = Math.min(discountAmountPKR, discount.maxDiscountPKR);
      }
    } else {
      discountAmountPKR = Math.min(discount.value, orderAmount);
    }

    const finalTotalPKR = Math.max(0, orderAmount - discountAmountPKR);
    const discountAmountUSD = Math.round(discountAmountPKR / 278);

    res.json({
      valid: true,
      code: discount.code,
      discountType: discount.discountType,
      value: discount.value,
      freeCOD: discount.discountType === 'free_cod',
      discountAmountPKR,
      discountAmountUSD,
      finalTotalPKR,
      description: discount.description,
      message: discount.discountType === 'free_cod'
        ? 'Free COD applied successfully!'
        : `${discount.discountType === 'percentage' ? `${discount.value}%` : `PKR ${discount.value.toLocaleString()}`} discount applied successfully!`
    });
  } catch (error: any) {
    console.error('Error validating discount code:', error);
    res.status(500).json({ valid: false, message: 'Failed to validate discount code' });
  }
});


// --- CUSTOMER FEEDBACK & TESTIMONIALS API ---
app.get('/api/feedback', async (req: Request, res: Response) => {
  try {
    const feedbacks = await FeedbackModel.find({
      id: { $nin: ['fb-1', 'fb-2', 'fb-3', 'fb-4'] },
    }).sort({ createdAt: -1 }).lean();
    res.json(feedbacks);
  } catch (error: any) {
    console.error('Error fetching feedback from MongoDB:', error);
    res.status(500).json({ error: 'Failed to retrieve feedbacks' });
  }
});

app.post('/api/feedback', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `fb-${Date.now()}`;
    }
    if (!data.customerName || !data.review) {
      return res.status(400).json({ error: 'Customer name and review are required' });
    }
    data.rating = Math.min(5, Math.max(1, Number(data.rating) || 5));
    data.status = 'Pending';
    data.isVerifiedBride = false;
    data.createdAt = new Date().toISOString();

    const created = await FeedbackModel.create(data);
    res.status(201).json(created);
  } catch (error: any) {
    console.error('Error submitting feedback to MongoDB:', error);
    res.status(500).json({ error: 'Failed to save feedback in MongoDB' });
  }
});

app.delete('/api/feedback/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await FeedbackModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted successfully', id: req.params.id });
  } catch (error: any) {
    console.error('Error deleting feedback from MongoDB:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== VITE & FRONTEND INTEGRATION ====================

async function setupServer() {
  const databaseConnected = await connectToMongoDB();
  if (!databaseConnected) {
    console.warn('[Server] MongoDB is unavailable; database API requests will fail until it is reachable.');
  }

  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));

  if (isProduction && hasDist) {
    // Production mode: Serve compiled assets
    console.log(`[Server] Serving production static assets from ${distPath}`);
    app.use(express.static(distPath));

    // Handle SPA client routing (skip API routes)
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development mode or fallback: Mount Vite middleware
    console.log(`[Server] Mounting Vite middleware (isProduction: ${isProduction}, hasDist: ${hasDist})...`);
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, 'localhost', () => {
    console.log(`[Server] AHK Bridal Studio API listening on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${isProduction ? 'production' : 'development'}`);
  });

  // Handle termination signals cleanly
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('[Server] Process terminated.');
      process.exit(0);
    });
  });
}

setupServer().catch((err) => {
  console.error('[Server] Fatal server startup error:', err);
});
