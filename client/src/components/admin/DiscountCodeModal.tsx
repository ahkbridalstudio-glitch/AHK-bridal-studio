import React, { useState } from 'react';
import {
  X,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  AlertCircle,
  Check,
  Sparkles,
  Info,
  Truck,
} from 'lucide-react';
import { DiscountCode } from '../../types/admin';

interface DiscountCodeModalProps {
  discount: DiscountCode | null; // null for new code
  onClose: () => void;
  onSave: (discount: DiscountCode) => void;
}

export const DiscountCodeModal: React.FC<DiscountCodeModalProps> = ({
  discount,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(discount);

  // Form states
  const [code, setCode] = useState(discount?.code || '');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'free_cod'>(
    discount?.discountType || 'percentage'
  );
  const [value, setValue] = useState<number>(discount?.value ?? 10);
  const [minOrderPKR, setMinOrderPKR] = useState<number>(discount?.minOrderPKR ?? 100000);
  const [maxDiscountPKR, setMaxDiscountPKR] = useState<number>(discount?.maxDiscountPKR ?? 150000);
  const [description, setDescription] = useState(discount?.description || '');
  const [expiresAt, setExpiresAt] = useState(
    discount?.expiresAt ? discount.expiresAt.slice(0, 10) : ''
  );
  const [status, setStatus] = useState<'Active' | 'Inactive'>(discount?.status || 'Active');
  const [usageLimit, setUsageLimit] = useState<number | ''>(discount?.usageLimit ?? '');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      setValidationError('Please enter a valid promo code (e.g. AHKROYAL10).');
      return;
    }

    if (discountType !== 'free_cod' && value <= 0) {
      setValidationError('Discount value must be greater than zero.');
      return;
    }

    if (discountType === 'percentage' && value > 100) {
      setValidationError('Percentage discount cannot exceed 100%.');
      return;
    }

    const updatedDiscount: DiscountCode = {
      id: discount?.id || `disc-${Date.now()}`,
      code: cleanCode,
      discountType,
      value: discountType === 'free_cod' ? 0 : Number(value),
      minOrderPKR: Number(minOrderPKR) || 0,
      maxDiscountPKR: discountType === 'percentage' ? Number(maxDiscountPKR) || 0 : undefined,
      description: description.trim() || `${cleanCode} special bridal discount`,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      status,
      usageCount: discount?.usageCount || 0,
      usageLimit: usageLimit !== '' ? Number(usageLimit) : undefined,
      createdAt: discount?.createdAt || new Date().toISOString()
    };

    onSave(updatedDiscount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-[#181219] border border-[#3A2D37] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 text-stone-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#2C222A] bg-[#140E15] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#7A0C1E]/30 border border-[#7A0C1E]/50 text-[#C5A059]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                {isEditing ? `Edit Promo Code: ${discount?.code}` : 'Create New Promo / Discount Code'}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Configure discount parameters applied by brides at checkout.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#221B23] hover:bg-[#332734] text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Code Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-400 block mb-1">
                Discount / Promo Code <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase().replace(/\s+/g, ''));
                    setValidationError('');
                  }}
                  placeholder="e.g. AHKROYAL10"
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2.5 text-xs text-[#E5C378] font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block">Brides type this code during checkout</span>
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Discount Type</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    discountType === 'percentage'
                      ? 'bg-[#7A0C1E] border-[#C5A059] text-white shadow-sm'
                      : 'bg-[#1F1721] border-[#3A2D37] text-stone-400 hover:text-white'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5 text-[#E5C378]" />
                  <span>Percentage (%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    discountType === 'fixed'
                      ? 'bg-[#7A0C1E] border-[#C5A059] text-white shadow-sm'
                      : 'bg-[#1F1721] border-[#3A2D37] text-stone-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-[#E5C378]" />
                  <span>Fixed PKR (Rs)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setDiscountType('free_cod'); setValue(0); }}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${discountType === 'free_cod' ? 'bg-[#7A0C1E] border-[#C5A059] text-white shadow-sm' : 'bg-[#1F1721] border-[#3A2D37] text-stone-400 hover:text-white'}`}
                >
                  <Truck className="w-3.5 h-3.5 text-[#E5C378]" />
                  <span>Free COD</span>
                </button>
              </div>
            </div>
          </div>

          {/* Discount Value & Minimum Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {discountType !== 'free_cod' && <div>
              <label className="text-xs text-stone-400 block mb-1">
                {discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (PKR)'}{' '}
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={discountType === 'percentage' ? 100 : 10000000}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder={discountType === 'percentage' ? '10' : '50000'}
                className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-[#E5C378] font-mono font-bold focus:outline-none focus:border-[#C5A059]"
              />
            </div>}

            <div>
              <label className="text-xs text-stone-400 block mb-1">Minimum Order Value (PKR)</label>
              <input
                type="number"
                min="0"
                step="5000"
                value={minOrderPKR}
                onChange={(e) => setMinOrderPKR(Number(e.target.value))}
                placeholder="100000"
                className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#C5A059]"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">Set 0 for no minimum</span>
            </div>

            {discountType === 'percentage' && (
              <div>
                <label className="text-xs text-stone-400 block mb-1">Max Discount Cap (PKR)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={maxDiscountPKR}
                  onChange={(e) => setMaxDiscountPKR(Number(e.target.value))}
                  placeholder="150000"
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#C5A059]"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Max savings limit (optional)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-stone-400 block mb-1">Promo Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 10% Royal Festive Wedding Discount for new brides"
              className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Expiry Date, Usage Limit, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#2A202B]">
            <div>
              <label className="text-xs text-stone-400 block mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Total Usage Limit (Optional)</label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Unlimited"
                className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
              >
                <option value="Active">Active (Redeemable)</option>
                <option value="Inactive">Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#2A202B] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-[#221B23] hover:bg-[#332734] text-stone-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#E5C378] hover:brightness-110 text-[#180E12] text-xs font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Promo Changes' : 'Create Promo Code'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
