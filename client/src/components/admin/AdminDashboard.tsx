import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Users,
  Settings,
  Store,
  Bell,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Building2,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  X,
  Filter,
  MessageSquare,
  LogOut,
  Database,
  Sliders,
  Tag,
  Star
} from 'lucide-react';
import { AdminProduct, AdminOrder, CustomerProfile, DirectInquiry, CarouselSlide, DiscountCode, CustomerFeedback } from '../../types/admin';
import { api } from '../../services/api';
import { AdminOverview } from './AdminOverview';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminInventory } from './AdminInventory';
import { AdminCustomers } from './AdminCustomers';
import { AdminMessages } from './AdminMessages';
import { AdminSettings } from './AdminSettings';
import { AdminCarousel } from './AdminCarousel';
import { AdminDiscounts } from './AdminDiscounts';
import { AdminFeedback } from './AdminFeedback';
import { OrderDetailModal } from './OrderDetailModal';
import { ProductFormModal } from './ProductFormModal';
import { ProductDetailViewModal } from './ProductDetailViewModal';
import { CarouselSlideModal } from './CarouselSlideModal';
import { DiscountCodeModal } from './DiscountCodeModal';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onLogout?: () => void;
  currency?: 'PKR' | 'USD';
  onCurrencyToggle?: () => void;
}

export type AdminTab = 'overview' | 'orders' | 'products' | 'carousel' | 'discounts' | 'feedback' | 'inventory' | 'customers' | 'messages' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Database connection & sync telemetry
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [isSyncingDb, setIsSyncingDb] = useState<boolean>(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [inquiries, setInquiries] = useState<DirectInquiry[]>([]);

  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<AdminProduct | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Carousel Modal state
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [editingCarouselSlide, setEditingCarouselSlide] = useState<CarouselSlide | null>(null);

  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);

  // Customer Feedback & Testimonials state
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);

  // Fetch all admin collections from the configured backend API.
  const fetchAllDataFromMongo = async (silent = false) => {
    if (!silent) setIsSyncingDb(true);
    const results = await Promise.allSettled([
      api.getProducts(), api.getOrders(), api.getInquiries(), api.getCustomers(),
      api.getCarouselSlides(), api.getDiscounts(), api.getFeedbacks(), api.checkHealth(),
    ] as const);
    const [prodsRes, ordsRes, inqsRes, custsRes, carouselRes, discountsRes, feedbacksRes, healthRes] = results;
    setProducts(prodsRes.status === 'fulfilled' ? prodsRes.value : []);
    setOrders(ordsRes.status === 'fulfilled' ? ordsRes.value : []);
    setInquiries(inqsRes.status === 'fulfilled' ? inqsRes.value : []);
    setCustomers(custsRes.status === 'fulfilled' ? custsRes.value : []);
    setCarouselSlides(carouselRes.status === 'fulfilled' ? carouselRes.value : []);
    setDiscounts(discountsRes.status === 'fulfilled' ? discountsRes.value : []);
    setFeedbacks(feedbacksRes.status === 'fulfilled' ? feedbacksRes.value : []);
    setIsDbConnected(healthRes.status === 'fulfilled' && healthRes.value.database?.status === 'connected');
    const failed = results.filter((result) => result.status === 'rejected');
    if (!silent) {
      showToast(failed.length ? `Backend sync failed for ${failed.length} request(s)` : 'Backend data refreshed');
    }
    setIsSyncingDb(false);
  };

  const reportApiError = (action: string, error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown API error';
    console.error(`[API] ${action} failed:`, error);
    showToast(`${action} failed: ${message}`);
    void fetchAllDataFromMongo(true);
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      await api.deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      showToast('Customer feedback removed');
    } catch (err) {
      showToast(`Could not delete feedback: ${(err as Error).message}`);
    }
  };

  // Initial load from MongoDB on mount
  useEffect(() => {
    fetchAllDataFromMongo(true);
  }, []);

  // Real-time listener for incoming storefront inquiries and orders
  useEffect(() => {
    const handleNewInquiryEvent = (e: any) => {
      if (e.detail) {
        setInquiries((prev) => [e.detail, ...prev.filter((i) => i.id !== e.detail.id)]);
        setSelectedInquiryId(e.detail.id);
        showToast(`New Direct Message received from ${e.detail.name}!`);
      }
    };

    const handleNewOrderEvent = (e: any) => {
      if (e.detail) {
        setOrders((prev) => [e.detail, ...prev.filter((o) => o.id !== e.detail.id)]);
        showToast(`New Bridal Order #${e.detail.orderNumber} received from ${e.detail.customerName}!`);
      }
    };

    window.addEventListener('ahk_new_inquiry', handleNewInquiryEvent);
    window.addEventListener('ahk_new_order', handleNewOrderEvent);
    return () => {
      window.removeEventListener('ahk_new_inquiry', handleNewInquiryEvent);
      window.removeEventListener('ahk_new_order', handleNewOrderEvent);
    };
  }, []);

  // Show toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Order Handlers connected to MongoDB
  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    try {
      const saved = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((order) => order.id === saved.id ? saved : order));
      if (selectedOrder?.id === saved.id) setSelectedOrder(saved);
      showToast(`Order status updated to "${saved.status}"`);
    } catch (err) {
      reportApiError('Order status update', err);
    }
  };

  const handleUpdateOrderTracking = async (orderId: string, updatedTracking: any) => {
    try {
      const saved = await api.updateOrderTracking(orderId, updatedTracking);
      setOrders((prev) => prev.map((order) => order.id === saved.id ? saved : order));
      if (selectedOrder?.id === saved.id) setSelectedOrder(saved);
      showToast('Delivery tracking updated');
    } catch (err) {
      reportApiError('Order tracking update', err);
    }
  };

  // Product Handlers connected to MongoDB
  const handleSaveProduct = async (prod: AdminProduct) => {
    const exists = products.some((p) => p.id === prod.id);
    try {
      const saved = await api.saveProduct(prod);
      setProducts((prev) => exists ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev]);
      setIsProductFormOpen(false);
      setEditingProduct(null);
      showToast(exists ? `Updated ensemble: "${saved.name}"` : `Added bridal ensemble: "${saved.name}"`);
      window.dispatchEvent(new CustomEvent('ahk_products_updated', { detail: saved }));
    } catch (err) {
      reportApiError('Product save', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const target = products.find((p) => p.id === productId);
    try {
      await api.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast(`Removed "${target?.name || 'Product'}" from catalog`);
      window.dispatchEvent(new CustomEvent('ahk_products_updated', { detail: { id: productId, deleted: true } }));
    } catch (err) {
      reportApiError('Product deletion', err);
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    const updatedStock = Math.max(0, newStock);
    try {
      const saved = await api.updateProductStock(productId, updatedStock);
      setProducts((prev) => prev.map((p) => p.id === saved.id ? saved : p));
      showToast(`Inventory stock adjusted to ${saved.stock}`);
      window.dispatchEvent(new CustomEvent('ahk_products_updated', { detail: { id: productId, stock: updatedStock } }));
    } catch (err) {
      reportApiError('Stock update', err);
    }
  };

  // Direct Inquiry Handlers connected to MongoDB
  const handleUpdateInquiryStatus = async (inquiryId: string, status: DirectInquiry['status']) => {
    try {
      const saved = await api.updateInquiryStatus(inquiryId, status);
      setInquiries((prev) => prev.map((inquiry) => inquiry.id === saved.id ? saved : inquiry));
      showToast(`Inquiry status updated to "${saved.status}"`);
    } catch (err) {
      reportApiError('Inquiry status update', err);
    }
  };

  const handleUpdateInquiryNotes = async (inquiryId: string, notes: string) => {
    try {
      const saved = await api.updateInquiryNotes(inquiryId, notes);
      setInquiries((prev) => prev.map((inquiry) => inquiry.id === saved.id ? saved : inquiry));
      showToast('Admin notes saved');
    } catch (err) {
      reportApiError('Inquiry notes update', err);
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    const target = inquiries.find((i) => i.id === inquiryId);
    try {
      await api.deleteInquiry(inquiryId);
      setInquiries((prev) => prev.filter((i) => i.id !== inquiryId));
      showToast(`Removed inquiry #${target?.ticketNumber || ''}`);
    } catch (err) {
      reportApiError('Inquiry deletion', err);
    }
  };

  // ==================== CAROUSEL SLIDES HANDLERS ====================
  const handleSaveCarouselSlide = async (slide: CarouselSlide) => {
    const isEdit = carouselSlides.some((s) => s.id === slide.id);
    if (isEdit) {
      try {
        const saved = await api.updateCarouselSlide(slide.id, slide);
        setCarouselSlides((prev) => prev.map((item) => item.id === saved.id ? saved : item));
        showToast(`Updated carousel slide: "${saved.title}"`);
      } catch (err) {
        reportApiError('Carousel update', err);
        return;
      }
    } else {
      try {
        const saved = await api.saveCarouselSlide(slide);
        setCarouselSlides((prev) => [...prev, saved]);
        showToast(`Added carousel slide: "${saved.title}"`);
      } catch (err) {
        reportApiError('Carousel save', err);
        return;
      }
    }
    setIsCarouselModalOpen(false);
    setEditingCarouselSlide(null);
  };

  const handleDeleteCarouselSlide = async (slideId: string) => {
    const target = carouselSlides.find((s) => s.id === slideId);
    try {
      await api.deleteCarouselSlide(slideId);
      setCarouselSlides((prev) => prev.filter((s) => s.id !== slideId));
      showToast(`Deleted carousel slide "${target?.title || ''}"`);
    } catch (err) {
      reportApiError('Carousel deletion', err);
    }
  };

  const handleToggleCarouselStatus = async (slide: CarouselSlide) => {
    const newStatus: 'Active' | 'Draft' = slide.status === 'Draft' ? 'Active' : 'Draft';
    try {
      const saved = await api.updateCarouselSlideOrder(slide.id, slide.order, newStatus);
      setCarouselSlides((prev) => prev.map((item) => item.id === saved.id ? saved : item));
      showToast(`Slide "${saved.title}" is now ${saved.status}`);
    } catch (err) {
      reportApiError('Carousel status update', err);
    }
  };

  const handleMoveCarouselOrder = async (slide: CarouselSlide, direction: 'up' | 'down') => {
    const sorted = [...carouselSlides].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const currentIndex = sorted.findIndex((s) => s.id === slide.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentItem = { ...sorted[currentIndex] };
    const targetItem = { ...sorted[targetIndex] };

    const currentOrder = currentItem.order ?? currentIndex + 1;
    const targetOrder = targetItem.order ?? targetIndex + 1;

    currentItem.order = targetOrder;
    targetItem.order = currentOrder;

    try {
      const savedItems = await Promise.all([
        api.updateCarouselSlideOrder(currentItem.id, currentItem.order),
        api.updateCarouselSlideOrder(targetItem.id, targetItem.order),
      ]);
      const savedById = new Map(savedItems.map((item): [string, CarouselSlide] => [item.id, item]));
      setCarouselSlides((prev) => prev.map((item) => savedById.get(item.id) || item));
      showToast(`Reordered "${slide.title}"`);
    } catch (err) {
      reportApiError('Carousel reorder', err);
    }
  };

  // ==================== DISCOUNT / PROMO CODES HANDLERS ====================
  const handleSaveDiscount = async (discount: DiscountCode) => {
    const isEdit = discounts.some((d) => d.id === discount.id);
    if (isEdit) {
      try {
        const saved = await api.updateDiscount(discount.id, discount);
        setDiscounts((prev) => prev.map((item) => item.id === saved.id ? saved : item));
        showToast(`Updated promo code: "${saved.code}"`);
      } catch (err) {
        reportApiError('Discount update', err);
        return;
      }
    } else {
      try {
        const saved = await api.saveDiscount(discount);
        setDiscounts((prev) => [saved, ...prev]);
        showToast(`Created promo code: "${saved.code}"`);
      } catch (err) {
        reportApiError('Discount save', err);
        return;
      }
    }
    setIsDiscountModalOpen(false);
    setEditingDiscount(null);
  };

  const handleDeleteDiscount = async (discountId: string) => {
    const target = discounts.find((d) => d.id === discountId);
    try {
      await api.deleteDiscount(discountId);
      setDiscounts((prev) => prev.filter((d) => d.id !== discountId));
      showToast(`Deleted promo code "${target?.code || ''}"`);
    } catch (err) {
      reportApiError('Discount deletion', err);
    }
  };

  const handleToggleDiscountStatus = async (discount: DiscountCode) => {
    const newStatus: 'Active' | 'Inactive' = discount.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const saved = await api.updateDiscount(discount.id, { status: newStatus });
      setDiscounts((prev) => prev.map((item) => item.id === saved.id ? saved : item));
      showToast(`Code "${saved.code}" is now ${saved.status}`);
    } catch (err) {
      reportApiError('Discount status update', err);
    }
  };

  // Calculate live counts
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const newInquiriesCount = inquiries.filter((i) => i.status === 'New').length;
  const inKargahCount = orders.filter((o) => o.status === 'In Kargah' || o.status === 'Quality Check').length;

  return (
    <div className="min-h-screen bg-[#0D0B0E] text-[#ECE5D8] flex flex-col font-sans selection:bg-[#C5A059] selection:text-[#180E12]">
      {/* Top Admin Header / Operation Command Strip */}
      <header className="sticky top-0 z-40 bg-[#161217]/95 backdrop-blur-md border-b border-[#2C222A] px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Identity & Location Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7A0C1E] to-[#4A0E17] border border-[#C5A059]/40 flex items-center justify-center text-[#E5C378] font-serif font-black shadow-md">
                AHK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-bold text-base tracking-wider text-white">
                    AHK BRIDAL STUDIO
                  </h1>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#C5A059]/15 text-[#E5C378] border border-[#C5A059]/30 font-semibold tracking-wider">
                    Admin Portal
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span className="flex items-center gap-1 text-[#C5A059]">
                    <MapPin className="w-3 h-3 text-[#E5C378]" />
                    Dolmen Mall Tariq Road (Shop G-32)
                  </span>
                  <span className="text-stone-600">•</span>
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Karachi Flagship Open (11am - 10pm)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Navigation to Customer Storefront */}
          <div className="flex items-center gap-3">
            {/* Backend database status badge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1A141C] border border-[#3A2D37] text-xs">
              <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-stone-400 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5 text-[#C5A059]" />
                  <span>MongoDB</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold mt-0.5">
                  {isDbConnected ? 'Connected (ahk_bridal_studio)' : 'Connecting...'}
                </span>
              </div>
              <button
                onClick={() => fetchAllDataFromMongo(false)}
                disabled={isSyncingDb}
                className="ml-1 p-1 rounded hover:bg-[#2C222A] text-stone-400 hover:text-white transition-colors"
                title="Sync live data directly from MongoDB"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingDb ? 'animate-spin text-[#C5A059]' : ''}`} />
              </button>
            </div>

            {/* Currency selector toggle */}
            <div className="hidden sm:flex items-center bg-[#221B23] border border-[#3A2D37] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setCurrency('PKR')}
                className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                  currency === 'PKR' ? 'bg-[#7A0C1E] text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                PKR (Rs)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                  currency === 'USD' ? 'bg-[#7A0C1E] text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>

            {/* Notification Menu */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg bg-[#221B23] border border-[#3A2D37] text-stone-300 hover:text-white transition-colors"
                title="Notifications & Alerts"
              >
                <Bell className="w-4 h-4" />
                {(lowStockCount > 0 || pendingOrdersCount > 0 || newInquiriesCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C5A059] text-[#180E12] font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                    {lowStockCount + pendingOrdersCount + newInquiriesCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1D171F] border border-[#3A2D37] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2C222A]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-300 font-mono">
                      Atelier Alerts ({lowStockCount + pendingOrdersCount + newInquiriesCount})
                    </span>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-stone-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
                    {/* New Direct Messages Alert */}
                    {newInquiriesCount > 0 && (
                      <div
                        onClick={() => {
                          setActiveTab('messages');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs cursor-pointer hover:bg-emerald-950/60 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{newInquiriesCount} New Direct Messages</span>
                        </div>
                        <p className="text-[11px] text-emerald-200/80 mt-1">
                          From {inquiries.find((i) => i.status === 'New')?.name} regarding {inquiries.find((i) => i.status === 'New')?.inquiryType}.
                        </p>
                      </div>
                    )}

                    {lowStockCount > 0 && (
                      <div
                        onClick={() => {
                          setActiveTab('inventory');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs cursor-pointer hover:bg-amber-950/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{lowStockCount} Products Need Restock</span>
                        </div>
                        <p className="text-[11px] text-amber-200/80 mt-1">
                          Items like Meena Bazaar Ivory & Noor Mahal have 2 or fewer units left in studio.
                        </p>
                      </div>
                    )}
                    {pendingOrdersCount > 0 && (
                      <div
                        onClick={() => {
                          setActiveTab('orders');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-lg bg-[#7A0C1E]/20 border border-[#7A0C1E]/40 text-[#F5C2C7] text-xs cursor-pointer hover:bg-[#7A0C1E]/30 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-[#FF9EAA]">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{pendingOrdersCount} New Bridal Orders Pending</span>
                        </div>
                        <p className="text-[11px] text-[#F5C2C7]/80 mt-1">
                          Awaiting stylist fitting confirmation or deposit verification.
                        </p>
                      </div>
                    )}
                    <div className="p-2 rounded bg-[#161217] text-[11px] text-stone-400">
                      Master Kargah active: 18 bridal lehengas under zardozi needlework.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Return to Live Boutique Storefront */}
            <button
              onClick={onBackToStore}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#E5C378] text-[#180E12] font-semibold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </button>

            {/* Lock & Log Out Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25151A] hover:bg-rose-950/80 border border-rose-900/50 text-rose-300 font-semibold text-xs transition-all shadow-sm cursor-pointer"
                title="Log Out and Lock Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Admin Layout: Sidebar + Workspace */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#141015] border-r border-[#2C222A] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Quick Status Pill */}
            <div className="p-3 rounded-xl bg-[#1C161D] border border-[#2F2430]">
              <div className="text-[11px] font-mono uppercase text-[#C5A059] tracking-wider font-semibold">
                Dolmen Mall Flagship
              </div>
              <div className="text-xs text-stone-300 mt-1">
                Kargah Capacity: <span className="font-mono font-bold text-white">88%</span>
              </div>
              <div className="w-full bg-[#2A202B] rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-gradient-to-r from-[#C5A059] to-[#7A0C1E] h-full w-[88%]" />
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#7A0C1E] text-white shadow-md'
                    : 'text-stone-300 hover:bg-[#1E1720] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 text-[#E5C378]" />
                  <span>Overview & Metrics</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'orders'
                    ? 'bg-[#7A0C1E] text-white shadow-md'
                    : 'text-stone-300 hover:bg-[#1E1720] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-[#E5C378]" />
                  <span>Order Management</span>
                </div>
                {orders.length > 0 && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'products'
                    ? 'bg-[#7A0C1E] text-white shadow-md'
                    : 'text-stone-300 hover:bg-[#1E1720] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-[#E5C378]" />
                  <span>Product Catalog</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#2A202B] text-stone-300">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('carousel')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'carousel'
                    ? 'bg-[#7A0C1E] text-white shadow-md'
                    : 'text-stone-300 hover:bg-[#1E1720] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-[#E5C378]" />
                  <span>Pictures Carousel</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#2A202B] text-[#E5C378]">
                  {carouselSlides.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('discounts')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'discounts'
                    ? 'bg-[#7A0C1E] text-white shadow-md'
                    : 'text-stone-300 hover:bg-[#1E1720] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-[#E5C378]" />
                  <span>Promo & Discounts</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#2A202B] text-emerald-400 font-bold">
                  {discounts.filter((d) => d.status === 'Active').length} Active
                </span>
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'feedback'
                    ? 'bg-[#7A0C1E] text-white shadow-md'
                    : 'text-stone-300 hover:bg-[#1E1720] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-[#E5C378]" />
                  <span>Testimonials & Reviews</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#2A202B] text-[#E5C378]">
                  {feedbacks.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-[#7A0C1E] text-white shadow-md'
                    : 'text-stone-300 hover:bg-[#1E1720] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Boxes className="w-4 h-4 text-[#E5C378]" />
                  <span>Inventory & Stock</span>
                </div>
                {lowStockCount > 0 && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    {lowStockCount} Low
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'customers'
                    ? 'bg-[#7A0C1E] text-white shadow-md'
                    : 'text-stone-300 hover:bg-[#1E1720] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#E5C378]" />
                  <span>Brides & Clients</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#2A202B] text-stone-300">
                  {customers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'messages'
                    ? 'bg-[#7A0C1E] text-white shadow-md'
                    : 'text-stone-300 hover:bg-[#1E1720] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-[#E5C378]" />
                  <span>Direct Messages</span>
                </div>
                {newInquiriesCount > 0 ? (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold animate-pulse">
                    {newInquiriesCount} New
                  </span>
                ) : (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#2A202B] text-stone-300">
                    {inquiries.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#7A0C1E] text-white shadow-md'
                    : 'text-stone-300 hover:bg-[#1E1720] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-[#E5C378]" />
                  <span>Dolmen Mall Studio</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Quick Support / Contact Karigar Desk */}
          <div className="mt-6 pt-4 border-t border-[#2C222A] space-y-2">
            <div className="text-[11px] font-mono text-stone-400">Official Direct Line</div>
            <a
              href="https://wa.me/923222586576"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-stone-300 hover:text-[#25D366] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="font-mono">+92 322 2586576</span>
            </a>
            <div className="text-[10px] text-stone-500">
              Shop # G-32, Dolmen Mall Tariq Road, Karachi
            </div>
          </div>
        </aside>

        {/* Workspace Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl">
          {activeTab === 'overview' && (
            <AdminOverview
              products={products}
              orders={orders}
              customers={customers}
              inquiries={inquiries}
              currency={currency}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onAddNewProduct={() => {
                setEditingProduct(null);
                setIsProductFormOpen(true);
              }}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              currency={currency}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onUpdateStatus={handleUpdateOrderStatus}
              onAddNewOrder={(newOrd) => {
                setOrders((prev) => [newOrd, ...prev]);
                showToast(`Manual order #${newOrd.orderNumber} created!`);
              }}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              products={products}
              currency={currency}
              onAddNewProduct={() => {
                setEditingProduct(null);
                setIsProductFormOpen(true);
              }}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setIsProductFormOpen(true);
              }}
              onViewProduct={(p) => setViewingProduct(p)}
              onDeleteProduct={handleDeleteProduct}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {activeTab === 'carousel' && (
            <AdminCarousel
              slides={carouselSlides}
              products={products}
              currency={currency}
              onAddNewSlide={() => {
                setEditingCarouselSlide(null);
                setIsCarouselModalOpen(true);
              }}
              onEditSlide={(slide) => {
                setEditingCarouselSlide(slide);
                setIsCarouselModalOpen(true);
              }}
              onDeleteSlide={handleDeleteCarouselSlide}
              onToggleStatus={handleToggleCarouselStatus}
              onMoveOrder={handleMoveCarouselOrder}
              onViewStorefront={onBackToStore}
            />
          )}

          {activeTab === 'discounts' && (
            <AdminDiscounts
              discounts={discounts}
              currency={currency}
              onAddNewDiscount={() => {
                setEditingDiscount(null);
                setIsDiscountModalOpen(true);
              }}
              onEditDiscount={(discount) => {
                setEditingDiscount(discount);
                setIsDiscountModalOpen(true);
              }}
              onDeleteDiscount={handleDeleteDiscount}
              onToggleStatus={handleToggleDiscountStatus}
            />
          )}

          {activeTab === 'feedback' && (
            <AdminFeedback
              feedbacks={feedbacks}
              onDeleteFeedback={handleDeleteFeedback}
            />
          )}

          {activeTab === 'inventory' && (
            <AdminInventory
              products={products}
              currency={currency}
              onUpdateStock={handleUpdateStock}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setIsProductFormOpen(true);
              }}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers
              customers={customers}
              orders={orders}
              currency={currency}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
            />
          )}

          {activeTab === 'messages' && (
            <AdminMessages
              inquiries={inquiries}
              onUpdateStatus={handleUpdateInquiryStatus}
              onUpdateNotes={handleUpdateInquiryNotes}
              onDeleteInquiry={handleDeleteInquiry}
              selectedInquiryId={selectedInquiryId}
              onSelectInquiry={(id) => setSelectedInquiryId(id)}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              currency={currency}
              onCurrencyToggle={() => setCurrency((c) => (c === 'PKR' ? 'USD' : 'PKR'))}
            />
          )}
        </main>
      </div>

      {/* Order Detail & Delivery Tracking Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          currency={currency}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(status) => handleUpdateOrderStatus(selectedOrder.id, status)}
          onUpdateTracking={(tracking) => handleUpdateOrderTracking(selectedOrder.id, tracking)}
        />
      )}

      {/* Add / Edit Product Modal */}
      {isProductFormOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsProductFormOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* View Product Details Modal */}
      {viewingProduct && (
        <ProductDetailViewModal
          product={viewingProduct}
          currency={currency}
          onClose={() => setViewingProduct(null)}
          onEdit={() => {
            setEditingProduct(viewingProduct);
            setViewingProduct(null);
            setIsProductFormOpen(true);
          }}
        />
      )}

      {/* Add / Edit Carousel Slide Modal */}
      {isCarouselModalOpen && (
        <CarouselSlideModal
          slide={editingCarouselSlide}
          products={products}
          onClose={() => {
            setIsCarouselModalOpen(false);
            setEditingCarouselSlide(null);
          }}
          onSave={handleSaveCarouselSlide}
        />
      )}

      {/* Add / Edit Discount Code Modal */}
      {isDiscountModalOpen && (
        <DiscountCodeModal
          discount={editingDiscount}
          onClose={() => {
            setIsDiscountModalOpen(false);
            setEditingDiscount(null);
          }}
          onSave={handleSaveDiscount}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#1A141C] border border-[#C5A059]/40 text-[#FAF8F5] shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
