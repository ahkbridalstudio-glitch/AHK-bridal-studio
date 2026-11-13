import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  Check,
  Percent,
  DollarSign,
  Calendar,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { DiscountCode } from '../../types/admin';

interface AdminDiscountsProps {
  discounts: DiscountCode[];
  currency: 'PKR' | 'USD';
  onAddNewDiscount: () => void;
  onEditDiscount: (discount: DiscountCode) => void;
  onDeleteDiscount: (discountId: string) => void;
  onToggleStatus: (discount: DiscountCode) => void;
}

export const AdminDiscounts: React.FC<AdminDiscountsProps> = ({
  discounts,
  currency,
  onAddNewDiscount,
  onEditDiscount,
  onDeleteDiscount,
  onToggleStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingDiscountId, setDeletingDiscountId] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredDiscounts = discounts.filter((disc) => {
    const matchesSearch =
      disc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disc.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || disc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = discounts.filter((d) => d.status === 'Active').length;
  const totalAppliedCount = discounts.reduce((acc, d) => acc + (d.usageCount || 0), 0);

  const confirmDelete = (id: string) => {
    onDeleteDiscount(id);
    setDeletingDiscountId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-[#C5A059] tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Storefront Promotions & Vouchers</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Promo & Discount Codes
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Create, configure, and manage coupon codes that brides can apply at checkout for instant order discounts.
          </p>
        </div>

        <button
          onClick={onAddNewDiscount}
          className="px-4 py-2 bg-gradient-to-r from-[#C5A059] to-[#E5C378] hover:brightness-110 text-[#180E12] font-bold text-xs rounded-lg shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Promo Code</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1C161D] border border-[#2F2430]">
          <div className="text-[11px] font-mono text-stone-400 uppercase">Total Codes</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">{discounts.length}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Configured in MongoDB</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1C161D] border border-[#2F2430]">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Active / Redeemable</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-300 mt-1">{activeCount}</div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Live at checkout</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1C161D] border border-[#2F2430]">
          <div className="text-[11px] font-mono text-[#C5A059] uppercase">Times Redeemed</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#E5C378] mt-1">{totalAppliedCount}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Applied on bridal orders</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1C161D] border border-[#2F2430]">
          <div className="text-[11px] font-mono text-stone-400 uppercase">Payment Method</div>
          <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Cash on Delivery (COD)</span>
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Sole checkout gateway</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#1C161D] border border-[#2F2430] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search promo codes by code (e.g. AHKROYAL10) or description..."
            className="w-full bg-[#140F15] border border-[#3A2D37] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Status:</span>
          </span>
          {(['All', 'Active', 'Inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-[#7A0C1E] text-white shadow-sm font-semibold'
                  : 'bg-[#140F15] text-stone-400 hover:text-white border border-[#2F2430]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Discount Codes Grid */}
      {filteredDiscounts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1C161D] border border-[#2F2430] space-y-3">
          <Tag className="w-12 h-12 text-[#C5A059] mx-auto opacity-50" />
          <h3 className="font-serif text-lg text-white">No Promo Codes Found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {searchQuery
              ? `No codes match "${searchQuery}". Try a different search term.`
              : 'Create your first promo code so brides can enjoy special savings at checkout.'}
          </p>
          <button
            onClick={onAddNewDiscount}
            className="px-4 py-2 bg-[#7A0C1E] hover:bg-[#961228] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Code</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiscounts.map((disc) => {
            const isActive = disc.status === 'Active';
            const isPercentage = disc.discountType === 'percentage';
            const isFreeCOD = disc.discountType === 'free_cod';

            return (
              <div
                key={disc.id}
                className={`rounded-xl overflow-hidden bg-[#181219] border transition-all duration-300 flex flex-col justify-between group ${
                  isActive
                    ? 'border-[#332631] hover:border-[#C5A059]/60 shadow-lg'
                    : 'border-stone-800/60 opacity-70'
                }`}
              >
                {/* Top Banner with Code Badge */}
                <div className="p-4 border-b border-[#291F28] bg-[#140E15] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-[#251B24] border border-[#C5A059]/40 text-[#E5C378] font-mono font-bold text-sm tracking-wider flex items-center gap-1.5">
                      <span>{disc.code}</span>
                      <button
                        onClick={() => handleCopyCode(disc.code)}
                        className="text-stone-400 hover:text-white transition-colors"
                        title="Copy promo code"
                      >
                        {copiedCode === disc.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#7A0C1E]/40 text-[#FF9EAA] border border-[#7A0C1E]/60">
                      {isFreeCOD ? 'FREE COD' : isPercentage ? `${disc.value}% OFF` : `PKR ${disc.value.toLocaleString()} OFF`}
                    </span>
                  </div>

                  {/* Status Toggle Switch */}
                  <button
                    onClick={() => onToggleStatus(disc)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all shadow-sm ${
                      isActive
                        ? 'bg-emerald-500/80 hover:bg-emerald-600 text-black'
                        : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                    }`}
                    title="Click to toggle Active / Inactive"
                  >
                    {disc.status}
                  </button>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3 flex-1">
                  <p className="text-xs text-stone-300 leading-relaxed font-medium">
                    {disc.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-[#291F28] text-xs">
                    <div className="flex items-center justify-between text-stone-400">
                      <span>Minimum Order:</span>
                      <span className="font-mono text-stone-200 font-semibold">
                        {disc.minOrderPKR ? `PKR ${disc.minOrderPKR.toLocaleString()}` : 'None (All Orders)'}
                      </span>
                    </div>

                    {isPercentage && disc.maxDiscountPKR ? (
                      <div className="flex items-center justify-between text-stone-400">
                        <span>Max Cap:</span>
                        <span className="font-mono text-stone-200 font-semibold">
                          PKR {disc.maxDiscountPKR.toLocaleString()}
                        </span>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between text-stone-400">
                      <span>Redemptions:</span>
                      <span className="font-mono text-[#E5C378] font-bold">
                        {disc.usageCount || 0} times
                        {disc.usageLimit ? ` / ${disc.usageLimit}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-stone-400">
                      <span>Expiry:</span>
                      <span className="text-stone-300 text-[11px]">
                        {disc.expiresAt ? new Date(disc.expiresAt).toLocaleDateString() : 'Never (Unlimited)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-4 py-3 bg-[#130E14] border-t border-[#291F28] flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 font-mono">
                    ID: {disc.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditDiscount(disc)}
                      className="px-3 py-1.5 rounded-lg bg-[#221B23] hover:bg-[#332734] text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Edit discount parameters"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingDiscountId(disc.id)}
                      className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition-colors"
                      title="Delete this promo code"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDiscountId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181219] border border-[#3A2D37] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-white">Delete Promo Code?</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to permanently delete this discount code? Brides will no longer be able to apply it at checkout.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingDiscountId(null)}
                className="px-4 py-2 rounded-lg bg-[#221B23] hover:bg-[#332734] text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deletingDiscountId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg"
              >
                Yes, Delete Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
