import React, { useState } from 'react';
import {
  X,
  Truck,
  MapPin,
  Calendar,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Printer,
  Edit2,
  Check,
  Tag
} from 'lucide-react';
import { AdminOrder, OrderStatus, CourierPartner, DeliveryTracking } from '../../types/admin';

interface OrderDetailModalProps {
  order: AdminOrder;
  currency: 'PKR' | 'USD';
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
  onUpdateTracking: (tracking: DeliveryTracking) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  currency,
  onClose,
  onUpdateStatus,
  onUpdateTracking,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'measurements'>('overview');
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isEditingCourier, setIsEditingCourier] = useState(false);
  
  // Editable courier fields
  const [editCourier, setEditCourier] = useState<CourierPartner>(order.deliveryTracking.courier);
  const [editTrackingNum, setEditTrackingNum] = useState(order.deliveryTracking.trackingNumber);
  const [editEstDate, setEditEstDate] = useState(order.deliveryTracking.estimatedDelivery);

  const formatAmount = (pkr: number, usd: number) => {
    if (currency === 'USD') return `$${usd.toLocaleString()}`;
    return `PKR ${pkr.toLocaleString()}`;
  };

  const copyTracking = () => {
    navigator.clipboard?.writeText(order.deliveryTracking.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Advance tracking stage
  const handleAdvanceMilestone = () => {
    const tracking = { ...order.deliveryTracking };
    const currIdx = tracking.currentMilestoneIndex;

    if (currIdx < tracking.milestones.length - 1) {
      const nextIdx = currIdx + 1;
      const updatedMilestones = tracking.milestones.map((m, i) => {
        if (i < nextIdx) return { ...m, completed: true, current: false };
        if (i === nextIdx) {
          return {
            ...m,
            completed: false,
            current: true,
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          };
        }
        return { ...m, completed: false, current: false };
      });

      // Automatically update order status if reached specific milestone
      let newOrderStatus: OrderStatus = order.status;
      if (nextIdx === 2) newOrderStatus = 'In Kargah';
      if (nextIdx === 3) newOrderStatus = 'Quality Check';
      if (nextIdx === 4) newOrderStatus = 'Ready to Ship';
      if (nextIdx === tracking.milestones.length - 1) newOrderStatus = 'In Transit';

      onUpdateTracking({
        ...tracking,
        currentMilestoneIndex: nextIdx,
        milestones: updatedMilestones,
      });

      if (newOrderStatus !== order.status) {
        onUpdateStatus(newOrderStatus);
      }
    } else {
      // Final delivery completed
      const updatedMilestones = tracking.milestones.map((m) => ({
        ...m,
        completed: true,
        current: false,
      }));
      onUpdateTracking({
        ...tracking,
        deliveredDate: new Date().toISOString().slice(0, 10),
        milestones: updatedMilestones,
      });
      onUpdateStatus('Delivered');
    }
  };

  // Save courier edits
  const handleSaveCourierDetails = () => {
    onUpdateTracking({
      ...order.deliveryTracking,
      courier: editCourier,
      trackingNumber: editTrackingNum,
      estimatedDelivery: editEstDate,
    });
    setIsEditingCourier(false);
  };

  const statusList: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'In Kargah',
    'Quality Check',
    'Ready to Ship',
    'In Transit',
    'Delivered',
    'Cancelled',
  ];

  // WhatsApp prefilled message with sanitized country-coded number
  const rawWaDigits = order.customerWhatsApp.replace(/[^0-9]/g, '');
  const cleanWaNumber = rawWaDigits.startsWith('0') && rawWaDigits.length >= 10 
    ? `92${rawWaDigits.slice(1)}` 
    : (rawWaDigits.startsWith('3') && rawWaDigits.length === 10 ? `92${rawWaDigits}` : rawWaDigits);
  const whatsappUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    `Salam ${order.customerName}, this is AHK Bridal Studio (Dolmen Mall Tariq Road). Regarding your bridal ensemble #${order.orderNumber}: your order status is now "${order.status}" and tracking is active under ${order.deliveryTracking.courier} (${order.deliveryTracking.trackingNumber}). Estimated delivery is ${order.deliveryTracking.estimatedDelivery}. Please let us know if you need any assistance!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#141015] border border-[#3A2D37] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-left text-white">
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 bg-[#1A141D] border-b border-[#2C222A] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7A0C1E] to-[#4A0E17] border border-[#C5A059]/40 flex items-center justify-center text-[#E5C378] font-mono font-bold text-sm">
              AHK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-white">
                  Order #{order.orderNumber}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : order.status === 'In Transit'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : order.status === 'In Kargah'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
                <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span className="text-[#C5A059]">{order.channel}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-mono font-bold transition-colors"
              title="Message Bride on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Bride</span>
            </a>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg bg-[#251C28] border border-[#3A2D37] text-stone-300 hover:text-white transition-colors"
              title="Print Order / Atelier Slip"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#251C28] border border-[#3A2D37] text-stone-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 bg-[#161217] border-b border-[#2C222A] flex items-center gap-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#C5A059] text-[#E5C378]'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Ensemble & Payment
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'tracking'
                ? 'border-[#C5A059] text-[#E5C378]'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery & Kargah Tracking</span>
          </button>
          <button
            onClick={() => setActiveTab('measurements')}
            className={`py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'measurements'
                ? 'border-[#C5A059] text-[#E5C378]'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Bridal Sizing & Specs
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW & ITEMS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Order Status Changer Control */}
              <div className="p-4 rounded-2xl bg-[#1C161E] border border-[#2F2431] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-mono uppercase text-stone-400">
                    Live Order Status Control
                  </div>
                  <div className="text-xs text-stone-300 mt-0.5">
                    Update current stage in atelier production or courier delivery
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(e.target.value as OrderStatus)}
                    className="bg-[#271E29] border border-[#443346] rounded-xl px-4 py-2 text-xs font-mono font-bold text-[#E5C378] focus:outline-none focus:border-[#C5A059] cursor-pointer"
                  >
                    {statusList.map((st) => (
                      <option key={st} value={st} className="bg-[#18131A] text-stone-200">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Card */}
              <div className="p-5 rounded-2xl bg-[#1A141C] border border-[#2C222A] space-y-4">
                <h4 className="font-serif font-bold text-base text-white">
                  Commissioned Bridal Ensembles
                </h4>

                <div className="divide-y divide-[#281F2B]">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-20 rounded-xl object-cover border border-[#3A2D37] shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif font-bold text-sm text-white">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              (Order #{order.orderNumber})
                            </span>
                          </div>

                          <div className="text-xs text-stone-400 mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[#C5A059]">{item.sku}</span>
                            <span>•</span>
                            <span>{item.fabric}</span>
                            <span>•</span>
                            <span>{item.occasion}</span>
                            {item.color && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1D252C] text-[#93C5FD] border border-[#2B3A44]">
                                Color: {item.color}
                              </span>
                            )}
                            {item.discountPercent && item.discountPercent > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#991B1B] text-white">
                                -{item.discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Selected Size Option & Customized Measurements */}
                          <div className="mt-2.5">
                            {item.size === 'Customize Size' || item.customMeasurements ? (
                              <div className="p-3 rounded-xl bg-[#221721] border border-[#C5A059]/40 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#E5C378]">
                                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                                    <span>Selected Size: Customize Size (Made-to-Measure)</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                                    5 Client Measurements Saved
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono">
                                  <div className="bg-[#181119] p-2 rounded-lg border border-[#3A2D37] text-center">
                                    <span className="text-[10px] text-stone-400 block uppercase">Shoulder</span>
                                    <span className="text-xs font-bold text-[#FAF8F5]">
                                      {item.customMeasurements?.shoulder || '—'}"
                                    </span>
                                  </div>
                                  <div className="bg-[#181119] p-2 rounded-lg border border-[#3A2D37] text-center">
                                    <span className="text-[10px] text-stone-400 block uppercase">Bust</span>
                                    <span className="text-xs font-bold text-[#FAF8F5]">
                                      {item.customMeasurements?.bust || '—'}"
                                    </span>
                                  </div>
                                  <div className="bg-[#181119] p-2 rounded-lg border border-[#3A2D37] text-center">
                                    <span className="text-[10px] text-stone-400 block uppercase">Hips</span>
                                    <span className="text-xs font-bold text-[#FAF8F5]">
                                      {item.customMeasurements?.hips || '—'}"
                                    </span>
                                  </div>
                                  <div className="bg-[#181119] p-2 rounded-lg border border-[#3A2D37] text-center">
                                    <span className="text-[10px] text-stone-400 block uppercase">Daman</span>
                                    <span className="text-xs font-bold text-[#FAF8F5]">
                                      {item.customMeasurements?.daman || '—'}"
                                    </span>
                                  </div>
                                  <div className="bg-[#181119] p-2 rounded-lg border border-[#3A2D37] text-center">
                                    <span className="text-[10px] text-stone-400 block uppercase">Armhole</span>
                                    <span className="text-xs font-bold text-[#FAF8F5]">
                                      {item.customMeasurements?.armhole || '—'}"
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 p-2 rounded-lg bg-[#201822] border border-[#332435]">
                                <span className="text-xs font-mono text-stone-300">Selected Size Option:</span>
                                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#2C1D2A] text-[#E5C378] border border-[#442D42]">
                                  Standard Size: {item.size || 'M'}
                                </span>
                              </div>
                            )}
                          </div>

                          {item.customizationSummary && !item.customMeasurements && (
                            <p className="text-[11px] text-stone-300 mt-2 italic bg-[#221A24] p-2 rounded-lg border border-[#342736]">
                              Custom Atelier: {item.customizationSummary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right sm:shrink-0 font-mono">
                        <div className="text-xs text-stone-400">Qty: {item.quantity}</div>
                        <div className="font-bold text-white text-sm mt-0.5">
                          {formatAmount(item.pricePKR * item.quantity, item.priceUSD * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client & Address Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bride / Customer */}
                <div className="p-5 rounded-2xl bg-[#1A141C] border border-[#2C222A]">
                  <div className="text-[11px] font-mono uppercase text-[#C5A059] font-semibold">
                    Bride & Contact Details
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="font-bold text-white text-sm">{order.customerName}</div>
                    <div className="text-stone-300 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <a href={`tel:${order.customerPhone}`} className="hover:underline font-mono">
                        {order.customerPhone}
                      </a>
                    </div>
                    <div className="text-stone-300 flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline font-mono text-[#25D366]"
                      >
                        {order.customerWhatsApp}
                      </a>
                    </div>
                    {order.weddingDate && (
                      <div className="text-stone-300 flex items-center gap-2 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Wedding Ceremony: {order.weddingDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping & Payment Summary */}
                <div className="p-5 rounded-2xl bg-[#1A141C] border border-[#2C222A]">
                  <div className="text-[11px] font-mono uppercase text-[#C5A059] font-semibold">
                    Delivery Destination & Payment
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="text-stone-200 font-medium">
                      {order.shippingAddress.isBoutiquePickup
                        ? 'Shop G-32, Dolmen Mall Tariq Road Flagship (Boutique Pickup)'
                        : order.shippingAddress.street}
                    </div>
                    <div className="text-stone-400">
                      {order.shippingAddress.city}, {order.shippingAddress.country}
                    </div>
                    <div className="pt-2 border-t border-[#261E28] space-y-1.5">
                      <div className="flex justify-between text-stone-300">
                        <span>Subtotal:</span>
                        <span className="font-mono text-stone-200">{formatAmount(order.subtotalPKR || order.totalPKR, Math.round((order.subtotalPKR || order.totalPKR) / 280))}</span>
                      </div>
                      {order.discountCode && (
                        <div className="flex justify-between text-emerald-400">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>Promo ({order.discountCode}):</span>
                          </span>
                          <span className="font-mono font-bold">
                            -{formatAmount(order.discountAmountPKR || 0, order.discountAmountUSD || 0)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-stone-300">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-[#C5A059]" />
                          <span>COD Delivery Charges:</span>
                        </span>
                        <span className="font-mono font-semibold">
                          {(order.shippingFeePKR ?? 0) === 0 ? (
                            <span className="text-emerald-400">Free COD (Karachi Rs. 0)</span>
                          ) : (
                            <span className="text-amber-400">
                              +Rs. {(order.shippingFeePKR ?? 350).toLocaleString()} ({order.shippingAddress?.city || 'Outside Karachi'})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span>Payment Method:</span>
                        <span className="font-mono text-[#E5C378] font-semibold">{order.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span>Payment Status:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-[#261E28]">
                        <span>Payable Amount:</span>
                        <span className="font-mono text-[#E5C378]">
                          {formatAmount(order.totalPKR, order.totalUSD)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE DELIVERY & KARGAH TRACKING */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              {/* Courier Banner & Edit Controls */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1E1620] to-[#161217] border border-[#3A2D37] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059]">
                    <Truck className="w-4 h-4" />
                    <span>Courier Partner & Tracking Code</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-lg font-serif font-bold text-white">
                      {order.deliveryTracking.courier}
                    </span>
                    <span className="font-mono text-sm px-2.5 py-0.5 rounded bg-[#2A202C] text-[#E5C378] border border-[#3F2E42]">
                      {order.deliveryTracking.trackingNumber}
                    </span>
                    <button
                      onClick={copyTracking}
                      className="p-1 text-stone-400 hover:text-white"
                      title="Copy Tracking #"
                    >
                      {copiedTracking ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-stone-400">
                    Estimated Arrival:{' '}
                    <strong className="text-white font-mono">
                      {order.deliveryTracking.estimatedDelivery}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditingCourier(!isEditingCourier)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#281F2A] hover:bg-[#382B3B] text-stone-200 text-xs font-mono transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingCourier ? 'Cancel Edit' : 'Edit Courier'}</span>
                  </button>

                  <button
                    onClick={handleAdvanceMilestone}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7A0C1E] to-[#921025] hover:brightness-110 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>Advance to Next Stage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Edit Courier Form */}
              {isEditingCourier && (
                <div className="p-4 rounded-xl bg-[#201822] border border-[#3D2C3D] space-y-3">
                  <div className="text-xs font-mono uppercase text-[#E5C378] font-bold">
                    Edit Courier & Delivery Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1">
                        Carrier
                      </label>
                      <select
                        value={editCourier}
                        onChange={(e) => setEditCourier(e.target.value as CourierPartner)}
                        className="w-full bg-[#181219] border border-[#3A2D37] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="AHK Concierge (Karachi Direct)">
                          AHK Concierge (Karachi)
                        </option>
                        <option value="TCS Express">TCS Express</option>
                        <option value="Leopards Courier">Leopards Courier</option>
                        <option value="DHL Express Global">DHL Express Global</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        value={editTrackingNum}
                        onChange={(e) => setEditTrackingNum(e.target.value)}
                        className="w-full bg-[#181219] border border-[#3A2D37] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1">
                        Estimated Delivery Date
                      </label>
                      <input
                        type="date"
                        value={editEstDate}
                        onChange={(e) => setEditEstDate(e.target.value)}
                        className="w-full bg-[#181219] border border-[#3A2D37] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleSaveCourierDetails}
                      className="px-4 py-1.5 rounded-lg bg-[#C5A059] text-[#180E12] font-mono font-bold text-xs hover:bg-[#d8b065]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Visual 5-Milestone Stepper Timeline */}
              <div className="p-6 rounded-2xl bg-[#1A141C] border border-[#2C222A]">
                <h4 className="font-serif font-bold text-base text-white mb-6">
                  Artisan Kargah & Delivery Milestones
                </h4>

                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#2C222A]">
                  {order.deliveryTracking.milestones.map((m, idx) => {
                    const isCompleted = m.completed;
                    const isCurrent = m.current;

                    return (
                      <div key={idx} className="relative group">
                        {/* Milestone Circle Indicator */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-black font-bold'
                              : isCurrent
                              ? 'bg-[#7A0C1E] text-white border-2 border-[#C5A059] animate-pulse ring-4 ring-[#7A0C1E]/30'
                              : 'bg-[#251C26] text-stone-500 border border-[#3A2D37]'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>

                        {/* Milestone Content */}
                        <div
                          className={`p-4 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-[#221824] border-[#C5A059]/40 shadow-lg'
                              : 'bg-[#18131A] border-[#291F2B]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span
                              className={`font-semibold text-xs ${
                                isCurrent ? 'text-[#E5C378]' : isCompleted ? 'text-white' : 'text-stone-400'
                              }`}
                            >
                              {m.title}
                            </span>
                            <span className="font-mono text-[10px] text-stone-400">{m.date}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-1">
                            <MapPin className="w-3 h-3 text-[#C5A059]" />
                            <span>{m.location}</span>
                          </div>

                          {m.description && (
                            <p className="text-[11px] text-stone-300 mt-2 bg-[#120E14] p-2 rounded-lg border border-[#251D28]">
                              {m.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BRIDAL SIZING & SPECS */}
          {activeTab === 'measurements' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#1A141C] border border-[#2C222A] space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-white">
                      Bespoke Tailoring & Measurements
                    </h4>
                    <p className="text-xs text-stone-400">
                      Order #{order.orderNumber} · Customer: {order.customerName}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#7A0C1E]/30 text-[#E5C378] border border-[#C5A059]/30">
                    Master Karigar Fitting Specs
                  </span>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, idx) => {
                    const isCustom = item.size === 'Customize Size' || Boolean(item.customMeasurements);
                    return (
                      <div
                        key={`m-item-${item.id || idx}`}
                        className="p-4 rounded-xl bg-[#201822] border border-[#2F2430] space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#2D212F]">
                          <div>
                            <div className="font-serif font-bold text-white text-sm">
                              {item.title}
                            </div>
                            <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                              Order Ref: #{order.orderNumber} · SKU: {item.sku}
                            </div>
                          </div>

                          <div>
                            {isCustom ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#7A0C1E]/40 text-[#E5C378] border border-[#C5A059]/50">
                                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                                <span>Size Option: Customize Size</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#2A1F2D] text-stone-300 border border-[#443346]">
                                Selected Option: Standard Size {item.size || 'M'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* If Customize Size was selected */}
                        {isCustom && item.customMeasurements ? (
                          <div className="space-y-2">
                            <div className="text-[11px] font-mono text-[#E5C378] font-bold uppercase tracking-wider flex items-center justify-between">
                              <span>Client Submitted Measurements (Inches):</span>
                              <span className="text-emerald-400 font-semibold text-[10px]">✓ All 5 Fields Required & Verified</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                              <div className="p-3 rounded-xl bg-[#171119] border border-[#3A2D37] text-center">
                                <div className="text-[10px] font-mono text-stone-400 uppercase">Shoulder</div>
                                <div className="text-base font-bold text-white font-mono mt-1">
                                  {item.customMeasurements.shoulder || '—'}"
                                </div>
                                <div className="text-[9px] text-stone-500 font-mono mt-0.5">Back seam-to-seam</div>
                              </div>

                              <div className="p-3 rounded-xl bg-[#171119] border border-[#3A2D37] text-center">
                                <div className="text-[10px] font-mono text-stone-400 uppercase">Bust</div>
                                <div className="text-base font-bold text-white font-mono mt-1">
                                  {item.customMeasurements.bust || '—'}"
                                </div>
                                <div className="text-[9px] text-stone-500 font-mono mt-0.5">Fullest circumference</div>
                              </div>

                              <div className="p-3 rounded-xl bg-[#171119] border border-[#3A2D37] text-center">
                                <div className="text-[10px] font-mono text-stone-400 uppercase">Hips</div>
                                <div className="text-base font-bold text-white font-mono mt-1">
                                  {item.customMeasurements.hips || '—'}"
                                </div>
                                <div className="text-[9px] text-stone-500 font-mono mt-0.5">Fullest circumference</div>
                              </div>

                              <div className="p-3 rounded-xl bg-[#171119] border border-[#3A2D37] text-center">
                                <div className="text-[10px] font-mono text-stone-400 uppercase">Daman</div>
                                <div className="text-base font-bold text-white font-mono mt-1">
                                  {item.customMeasurements.daman || '—'}"
                                </div>
                                <div className="text-[9px] text-stone-500 font-mono mt-0.5">Flare hem width</div>
                              </div>

                              <div className="p-3 rounded-xl bg-[#171119] border border-[#3A2D37] text-center">
                                <div className="text-[10px] font-mono text-stone-400 uppercase">Armhole</div>
                                <div className="text-base font-bold text-white font-mono mt-1">
                                  {item.customMeasurements.armhole || '—'}"
                                </div>
                                <div className="text-[9px] text-stone-500 font-mono mt-0.5">Curved armhole</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Standard Size Selected */
                          <div className="p-3 rounded-xl bg-[#171119] border border-[#2E2230] text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-stone-300">
                              <span className="font-mono text-[11px] text-[#C5A059] uppercase font-bold">
                                Standard Ready-to-Wear Size Specs (Inches):
                              </span>
                              <span className="font-mono font-bold text-white">Size {item.size || 'M'}</span>
                            </div>
                            <p className="text-[11px] text-stone-400 font-mono">
                              {item.size === 'S' && 'Shoulder: 14" · Bust: 18" · Waist: 16" · Hip: 18" · Daman: 20" · Arm-Hole: 7"'}
                              {item.size === 'M' && 'Shoulder: 15" · Bust: 20" · Waist: 18" · Hip: 20" · Daman: 22" · Arm-Hole: 8"'}
                              {item.size === 'L' && 'Shoulder: 16" · Bust: 22" · Waist: 19" · Hip: 21" · Daman: 23" · Arm-Hole: 9"'}
                              {item.size === 'XL' && 'Shoulder: 17" · Bust: 24" · Waist: 20" · Hip: 22" · Daman: 24" · Arm-Hole: 9"'}
                              {!['S', 'M', 'L', 'XL'].includes(item.size || '') && 'Standard studio fitting profile with 2-inch complimentary side margins.'}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {order.items[0]?.measurements?.notes && (
                  <div className="p-3 rounded-xl bg-[#221824] border border-[#3A2D37] text-xs">
                    <span className="font-mono text-[#C5A059] uppercase font-bold block mb-1">
                      Artisan Fitting Instruction:
                    </span>
                    <span className="text-stone-300">{order.items[0].measurements.notes}</span>
                  </div>
                )}

                {order.notes && (
                  <div className="p-3 rounded-xl bg-[#1C151F] border border-[#2B202D] text-xs">
                    <span className="font-mono text-stone-400 uppercase font-semibold block mb-1">
                      General Order Notes:
                    </span>
                    <span className="text-stone-300">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#18131A] border-t border-[#2C222A] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-stone-400 font-mono text-[11px]">
            Dolmen Mall Karachi Flagship Desk • Tel: +92 322 2586576
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#281F2B] hover:bg-[#382B3C] text-stone-200 font-mono text-xs transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
