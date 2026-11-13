import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Truck,
  Eye,
  Calendar,
  Phone,
  MessageCircle,
  MapPin,
  ChevronDown,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Building2,
  X
} from 'lucide-react';
import { AdminOrder, OrderStatus, CourierPartner } from '../../types/admin';
import { calculateCodFee, isKarachiLocation } from '../../utils/codPricing';

interface AdminOrdersProps {
  orders: AdminOrder[];
  currency: 'PKR' | 'USD';
  onSelectOrder: (order: AdminOrder) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onAddNewOrder: (order: AdminOrder) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  currency,
  onSelectOrder,
  onUpdateStatus,
  onAddNewOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New manual order form state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('+92 3');
  const [newCustomerCity, setNewCustomerCity] = useState('Karachi');
  const [newSuitTitle, setNewSuitTitle] = useState('The Shahbano Imperial Lehnga (Barat)');
  const [newPricePKR, setNewPricePKR] = useState(850000);
  const [newCourier, setNewCourier] = useState<CourierPartner>('AHK Concierge (Karachi Direct)');
  const [newChannel, setNewChannel] = useState<'Dolmen Mall Karachi Flagship' | 'WhatsApp Bridal Concierge' | 'Online Storefront'>('Dolmen Mall Karachi Flagship');
  const [newNotes, setNewNotes] = useState('Dolmen Mall Tariq Road walk-in fitting appointment');

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerPhone.includes(searchQuery) ||
      ord.shippingAddress.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.deliveryTracking.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || ord.status === statusFilter;
    const matchesChannel = channelFilter === 'All' || ord.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const formatAmount = (pkr: number, usd: number) => {
    if (currency === 'USD') return `$${usd.toLocaleString()}`;
    return `PKR ${pkr.toLocaleString()}`;
  };

  const statusOptions: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'In Kargah',
    'Quality Check',
    'Ready to Ship',
    'In Transit',
    'Delivered',
    'Cancelled',
  ];

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    const newOrder: AdminOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `AHK-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: newCustomerName,
      customerEmail: `${newCustomerName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      customerPhone: newCustomerPhone,
      customerWhatsApp: newCustomerPhone,
      weddingDate: '2026-12-25',
      shippingAddress: {
        street: 'Dolmen Mall Studio Collection / Delivery',
        city: newCustomerCity,
        provinceState: 'Sindh',
        country: 'Pakistan',
        isBoutiquePickup: newCustomerCity === 'Karachi',
      },
      items: [
        {
          id: `item-${Date.now()}`,
          title: newSuitTitle,
          sku: 'AHK-MANUAL-01',
          occasion: 'Barat',
          fabric: 'Pure Katan Raw Silk',
          pricePKR: Number(newPricePKR),
          priceUSD: Math.round(Number(newPricePKR) / 279),
          quantity: 1,
          customizationSummary: 'Dolmen Mall in-person styling consultation',
        },
      ],
      subtotalPKR: Number(newPricePKR),
      taxPKR: 0,
      shippingFeePKR: calculateCodFee(newCustomerCity),
      totalPKR: Number(newPricePKR) + calculateCodFee(newCustomerCity),
      totalUSD: Math.round((Number(newPricePKR) + calculateCodFee(newCustomerCity)) / 279),
      status: 'Confirmed',
      paymentStatus: '50% Kargah Deposit',
      paymentMethod: 'Cash at Dolmen Mall',
      deliveryTracking: {
        courier: newCourier,
        trackingNumber: `AHK-MAN-${Math.floor(1000 + Math.random() * 9000)}`,
        trackingUrl: 'https://ahkbridal.com/track',
        estimatedDelivery: '2026-11-30',
        currentMilestoneIndex: 0,
        milestones: [
          {
            title: 'Order Commissioned at Dolmen Mall',
            location: 'Shop G-32, Dolmen Mall Tariq Road',
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            completed: true,
            current: true,
            description: 'Measurement recorded by master karigar',
          },
          {
            title: 'Khaka Pattern Stenciling',
            location: 'AHK Craft Center',
            date: 'Est. in 3 days',
            completed: false,
            current: false,
          },
          {
            title: 'Zardozi Embroidery In Progress',
            location: 'AHK Craft Center',
            date: 'Est. in 3 weeks',
            completed: false,
            current: false,
          },
          {
            title: 'Boutique Fitting Trial',
            location: 'Shop G-32, Dolmen Mall Tariq Road',
            date: 'Est. in 6 weeks',
            completed: false,
            current: false,
          },
        ],
      },
      notes: newNotes,
      channel: newChannel,
    };

    onAddNewOrder(newOrder);
    setIsNewOrderModalOpen(false);
    setNewCustomerName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Manual Order Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-[#C5A059] tracking-wider">
            Order Lifecycle & Courier Dispatch
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Bridal Orders & Delivery Tracking
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Track bridal suit embroidery progression, quality inspection approvals, and courier dispatches.
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7A0C1E] to-[#4A0E17] border border-[#C5A059]/40 text-[#FAF8F5] font-semibold text-xs shadow-lg hover:brightness-110 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#E5C378]" />
          <span>Record In-Store / Manual Order</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-xl bg-[#161217] border border-[#2C222A] space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Bride Name, Phone, City, Tracking code..."
              className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sales Channel Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-mono whitespace-nowrap">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="All">All Channels</option>
              <option value="Online Storefront">Online Storefront</option>
              <option value="Dolmen Mall Karachi Flagship">Dolmen Mall Karachi Flagship</option>
              <option value="WhatsApp Bridal Concierge">WhatsApp Concierge</option>
            </select>
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-stone-500 mr-2 text-[11px] uppercase">Status:</span>
          {['All', ...statusOptions].map((status) => {
            const count =
              status === 'All' ? orders.length : orders.filter((o) => o.status === status).length;
            const isSelected = statusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#C5A059] text-[#180E12] font-bold shadow-sm'
                    : 'bg-[#1F1721] text-stone-300 hover:bg-[#2A1F2D]'
                }`}
              >
                {status} <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="rounded-2xl bg-[#161217] border border-[#2C222A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A141C] border-b border-[#2C222A] text-[11px] font-mono uppercase text-stone-400 tracking-wider">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Bride / Client Profile</th>
                <th className="py-3.5 px-4">Ensemble Items</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4">Courier Tracking</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#201822] text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-500 font-mono text-xs">
                    No bridal orders match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const firstItem = order.items[0];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#1E1720]/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectOrder(order)}
                    >
                      {/* Order ID & Date */}
                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-[#E5C378] group-hover:underline">
                          {order.orderNumber}
                        </div>
                        <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-stone-500" />
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Client Profile */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{order.customerName}</div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-[#C5A059]" />
                          <span>
                            {order.shippingAddress.city},{' '}
                            {order.shippingAddress.country === 'Pakistan' ? 'PK' : order.shippingAddress.country}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-stone-500 mt-0.5">
                          {order.customerPhone}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4">
                        <div className="text-stone-200 font-medium max-w-xs truncate">
                          {firstItem?.title}
                        </div>
                        <div className="text-[10px] font-mono text-stone-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {firstItem?.size && (
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              firstItem.size === 'Customize Size' || firstItem.customMeasurements
                                ? 'bg-[#7A0C1E]/50 text-[#E5C378] border border-[#C5A059]/40'
                                : 'bg-[#201822] text-stone-300 border border-[#302432]'
                            }`}>
                              {firstItem.size === 'Customize Size' || firstItem.customMeasurements
                                ? 'Custom Size (5 Meas)'
                                : `Size: ${firstItem.size}`}
                            </span>
                          )}
                          <span>
                            {order.items.length > 1
                              ? `+ ${order.items.length - 1} more`
                              : `${firstItem?.fabric || ''}`}
                          </span>
                        </div>
                      </td>

                      {/* Sales Channel */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-[#201822] text-stone-300 border border-[#302432]">
                          {order.channel === 'Dolmen Mall Karachi Flagship'
                            ? 'Dolmen Mall G-32'
                            : order.channel === 'WhatsApp Bridal Concierge'
                            ? 'WhatsApp Desk'
                            : 'Online Store'}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-4">
                        <div className="text-[11px] font-medium text-stone-200">
                          {order.paymentStatus}
                        </div>
                        <div className="text-[10px] font-mono text-stone-500">
                          {order.paymentMethod}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        <div>{formatAmount(order.totalPKR, order.totalUSD)}</div>
                        {order.discountCode && (
                          <div className="text-[10px] font-mono font-normal text-emerald-400 mt-0.5">
                            🏷️ {order.discountCode}
                          </div>
                        )}
                        <div className="text-[10px] font-mono font-normal mt-0.5">
                          {(order.shippingFeePKR ?? 0) === 0 ? (
                            <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                              🚚 Free COD (Khi)
                            </span>
                          ) : (
                            <span className="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                              📦 +Rs. {(order.shippingFeePKR ?? 350).toLocaleString()} COD
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td
                        className="py-4 px-4"
                        onClick={(e) => e.stopPropagation()} // don't open modal when changing dropdown
                      >
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onUpdateStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`text-[10px] font-mono font-bold uppercase rounded-full px-2.5 py-1 border transition-colors cursor-pointer focus:outline-none ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : order.status === 'In Transit'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : order.status === 'In Kargah'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : order.status === 'Quality Check'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : order.status === 'Ready to Ship'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : order.status === 'Cancelled'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-stone-500/20 text-stone-300 border-stone-500/40'
                          }`}
                        >
                          {statusOptions.map((opt) => (
                            <option
                              key={opt}
                              value={opt}
                              className="bg-[#1A141C] text-stone-200 py-1"
                            >
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Courier Tracking */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-stone-300 font-mono text-[11px]">
                          <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>{order.deliveryTracking.courier}</span>
                        </div>
                        <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                          {order.deliveryTracking.trackingNumber}
                        </div>
                        <div className="text-[9px] text-stone-500">
                          Est: {order.deliveryTracking.estimatedDelivery}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#271E29] hover:bg-[#7A0C1E] text-stone-200 hover:text-white font-mono text-xs transition-colors"
                        >
                          Manage & Track
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual / In-Store Order Creation Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#18131A] border border-[#3A2D37] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsNewOrderModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059] uppercase">
              <Building2 className="w-4 h-4" /> Dolmen Mall Karachi Flagship
            </div>
            <h3 className="font-serif font-bold text-xl text-white mt-1">
              Record In-Store / Bespoke Order
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Manually register bridal order taken in person at Shop G-32 or through WhatsApp desk.
            </p>

            <form onSubmit={handleCreateManualOrder} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-300 mb-1">
                  Bride / Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Alizeh Shah"
                  className="w-full bg-[#201822] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-300 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="+92 322 2586576"
                    className="w-full bg-[#201822] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-300 mb-1">
                    City / Country
                  </label>
                  <input
                    type="text"
                    value={newCustomerCity}
                    onChange={(e) => setNewCustomerCity(e.target.value)}
                    placeholder="Karachi"
                    className="w-full bg-[#201822] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                  <span className="text-[10px] font-mono mt-1 block">
                    {isKarachiLocation(newCustomerCity) ? (
                      <span className="text-emerald-400">✓ Free COD Delivery (Karachi)</span>
                    ) : (
                      <span className="text-amber-400">📦 +Rs. 350 COD Delivery ({newCustomerCity || 'Outside Karachi'})</span>
                    )}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-300 mb-1">
                  Ensemble / Suit Title
                </label>
                <input
                  type="text"
                  value={newSuitTitle}
                  onChange={(e) => setNewSuitTitle(e.target.value)}
                  className="w-full bg-[#201822] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-300 mb-1">
                    Agreed Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={newPricePKR}
                    onChange={(e) => setNewPricePKR(Number(e.target.value))}
                    className="w-full bg-[#201822] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-300 mb-1">
                    Delivery Partner
                  </label>
                  <select
                    value={newCourier}
                    onChange={(e) => setNewCourier(e.target.value as CourierPartner)}
                    className="w-full bg-[#201822] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="AHK Concierge (Karachi Direct)">AHK Concierge (Karachi)</option>
                    <option value="TCS Express">TCS Express</option>
                    <option value="Leopards Courier">Leopards Courier</option>
                    <option value="DHL Express Global">DHL Express Global</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-300 mb-1">
                  Order Channel
                </label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as any)}
                  className="w-full bg-[#201822] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Dolmen Mall Karachi Flagship">
                    Dolmen Mall Karachi Flagship (Shop G-32)
                  </option>
                  <option value="WhatsApp Bridal Concierge">WhatsApp Concierge Desk</option>
                  <option value="Online Storefront">Online Storefront</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-300 mb-1">
                  Stylist Notes & Fitting Specs
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#201822] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2C222A]">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#241A23] text-stone-300 text-xs font-mono hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#7A0C1E] hover:bg-[#921025] text-white text-xs font-bold font-mono transition-colors shadow-md"
                >
                  Confirm & Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
