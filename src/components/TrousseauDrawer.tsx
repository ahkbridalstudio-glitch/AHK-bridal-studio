import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Send,
  Tag,
  Banknote,
  Truck,
  Percent,
  Check,
  AlertCircle,
  HelpCircle,
  MapPin,
  Phone,
  MessageCircle
} from 'lucide-react';
import { TrousseauItem } from '../types/bridal';
import { AdminOrder } from '../types/admin';
import { api } from '../services/api';
import { calculateCodFee, getCodFeeDetails, isKarachiLocation, OUTSIDE_KARACHI_COD_FEE_PKR } from '../utils/codPricing';

interface TrousseauDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: TrousseauItem[];
  onRemoveItem: (id: string) => void;
  onClearTrousseau: () => void;
  onOpenAtelier: () => void;
}

type Currency = 'PKR' | 'USD' | 'GBP' | 'AED';

const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number }> = {
  PKR: { symbol: 'PKR', rate: 1 },
  USD: { symbol: '$', rate: 1 / 280 },
  GBP: { symbol: '£', rate: 1 / 355 },
  AED: { symbol: 'AED', rate: 1 / 76 },
};

const POPULAR_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Sialkot',
  'Quetta',
  'Other'
];

interface AppliedPromo {
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_cod';
  value: number;
  discountAmountPKR: number;
  discountAmountUSD: number;
  description?: string;
  message: string;
  freeCOD?: boolean;
}

export const TrousseauDrawer: React.FC<TrousseauDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearTrousseau,
  onOpenAtelier,
}) => {
  const [currency, setCurrency] = useState<Currency>('PKR');
  const [isOrdering, setIsOrdering] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1); // Step 1: Delivery Address, Step 2: Payment & Review (COD)
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [placedTotalPKR, setPlacedTotalPKR] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Checkout address & contact fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Karachi');
  const [weddingDate, setWeddingDate] = useState('');
  const [addressError, setAddressError] = useState('');

  // Discount & Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPKR = items.reduce((sum, item) => sum + item.pricePKR * item.quantity, 0);
  const discountAmountPKR = appliedPromo ? appliedPromo.discountAmountPKR : 0;
  const subtotalAfterDiscountPKR = Math.max(0, totalPKR - discountAmountPKR);
  const codFeePKR = appliedPromo?.freeCOD ? 0 : calculateCodFee(city);
  const finalTotalPKR = subtotalAfterDiscountPKR + codFeePKR;

  const formatPrice = (pkr: number) => {
    const { symbol, rate } = CURRENCY_RATES[currency];
    const converted = Math.round(pkr * rate);
    if (currency === 'PKR') {
      return `PKR ${converted.toLocaleString()}`;
    }
    return `${symbol} ${converted.toLocaleString()} ${currency !== 'USD' && currency !== 'GBP' ? currency : ''}`;
  };

  // Validate and apply promo code
  const handleApplyPromoCode = async (codeToTry?: string) => {
    const code = (codeToTry || promoInput).trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsValidatingPromo(true);
    setPromoError(null);
    setPromoSuccessMsg(null);

    try {
      const res = await api.validateDiscount(code, totalPKR);
      if (res.valid) {
        const discountAmount = res.discountAmountPKR || 0;
        setAppliedPromo({
          code: res.code || code,
          discountType: res.discountType || 'percentage',
          value: res.value || 0,
          discountAmountPKR: discountAmount,
          discountAmountUSD: res.discountAmountUSD || Math.round(discountAmount / 280),
          freeCOD: res.freeCOD,
          description: res.description,
          message: res.message || 'Promo code applied successfully!'
        });
        setPromoSuccessMsg(res.message || `Code "${code}" applied!`);
        setPromoInput('');
      } else {
        setAppliedPromo(null);
        setPromoError(res.message || `Promo code "${code}" is invalid or expired`);
      }
    } catch (err: any) {
      setPromoError('Could not validate discount code. Please try again.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
    setPromoSuccessMsg(null);
    setPromoInput('');
  };

  // Validation before moving to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setAddressError('Please enter your full name');
      return;
    }
    if (!customerEmail.trim()) {
      setAddressError('Please enter your email address');
      return;
    }
    if (!phone.trim()) {
      setAddressError('Please enter your WhatsApp or contact phone number');
      return;
    }
    if (!streetAddress.trim()) {
      setAddressError('Please enter your street / house delivery address');
      return;
    }
    if (!city.trim()) {
      setAddressError('Please select or specify your delivery city');
      return;
    }
    setAddressError('');
    setCheckoutStep(2);
  };

  // Complete Order (Cash on Delivery)
  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    setAddressError('');
    const orderNumber = `AHK-COD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAdminOrder: AdminOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: phone.trim(),
      customerWhatsApp: phone.trim(),
      weddingDate: weddingDate || undefined,
      shippingAddress: {
        street: streetAddress.trim(),
        city: city.trim(),
        provinceState: city.toLowerCase().includes('karachi') ? 'Sindh' : 'Pakistan',
        country: 'Pakistan',
        isBoutiquePickup: false
      },
      items: items.map((item) => ({
        id: item.id,
        productId: (item as any).productId || item.id,
        title: item.title,
        sku: `AHK-BRD-${Math.floor(10 + Math.random() * 89)}`,
        occasion: item.occasion,
        fabric: item.fabric,
        image: item.image,
        pricePKR: item.pricePKR,
        priceUSD: item.priceUSD,
        originalPricePKR: item.originalPricePKR,
        discountPercent: item.discountPercent,
        size: item.size || 'M',
        customMeasurements: item.customMeasurements,
        color: item.color,
        quantity: item.quantity,
        customizationSummary: item.customMeasurements
          ? `Custom Size: Shoulder ${item.customMeasurements.shoulder}", Bust ${item.customMeasurements.bust}", Hips ${item.customMeasurements.hips}", Daman ${item.customMeasurements.daman}", Armhole ${item.customMeasurements.armhole}"${item.color ? ` · Color: ${item.color}` : ''}`
          : item.customDetails
          ? `Bespoke ${item.customDetails.silhouette} on ${item.customDetails.fabric}`
          : item.size
          ? `Size: ${item.size}${item.color ? ` · Color: ${item.color}` : ''} (AHK Bridal Standard)`
          : undefined
      })),
      subtotalPKR: totalPKR,
      taxPKR: 0,
      shippingFeePKR: codFeePKR,
      discountCode: appliedPromo?.code,
      discountAmountPKR: discountAmountPKR,
      discountAmountUSD: Math.round(discountAmountPKR / 280),
      freeCODApplied: Boolean(appliedPromo?.freeCOD),
      totalPKR: finalTotalPKR,
      totalUSD: Math.round(finalTotalPKR / 280),
      status: 'Pending',
      paymentStatus: 'Cash on Delivery (Pending)',
      paymentMethod: 'Cash on Delivery (COD)',
      deliveryTracking: {
        courier: 'TCS Express',
        trackingNumber: `TCS-COD-${Math.floor(100000 + Math.random() * 900000)}`,
        trackingUrl: 'https://www.tcsexpress.com/tracking',
        estimatedDelivery: isKarachiLocation(city) ? '24 to 48 hours (Karachi Express)' : '3 to 5 business days',
        currentMilestoneIndex: 0,
        milestones: [
          {
            title: 'Order Confirmed (Cash on Delivery)',
            location: 'AHK Dolmen Mall Tariq Road Flagship',
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            completed: true,
            current: true,
            description: `Cash on Delivery order registered. Delivery Charges: ${codFeePKR === 0 ? 'Free COD (Karachi Rs. 0)' : `Rs. ${codFeePKR} COD (${city})`}.`
          },
          {
            title: 'Quality Inspection & Heirloom Packing',
            location: 'Karachi Central Studio',
            date: 'Est. 24 hours',
            completed: false,
            current: false
          },
          {
            title: 'Dispatched via Insured Courier',
            location: 'TCS Express Logistic Hub',
            date: isKarachiLocation(city) ? 'Est. 24 hours' : 'Est. 2-3 days',
            completed: false,
            current: false
          },
          {
            title: 'Doorstep Delivery & Cash Collection',
            location: `${streetAddress}, ${city}`,
            date: isKarachiLocation(city) ? 'Est. 1-2 days' : 'Est. 3-5 days',
            completed: false,
            current: false,
            description: `Customer inspects package and pays exact cash of ${formatPrice(finalTotalPKR)} (including ${codFeePKR === 0 ? 'Free COD' : `Rs. ${codFeePKR} COD fee`}) to courier.`
          }
        ]
      },
      notes: `Cash on Delivery (COD) Order. Destination: ${streetAddress}, ${city}. Delivery Fee: ${codFeePKR === 0 ? 'Free COD (Karachi Rs. 0)' : `Rs. ${codFeePKR} COD (${city} - Outside Karachi)`}. Phone: ${phone}. ${appliedPromo ? `Promo applied: ${appliedPromo.code} (-PKR ${discountAmountPKR.toLocaleString()})` : 'No promo code'}.`,
      channel: 'Online Storefront'
    };

    // Save the order through the configured backend API.
    try {
      const createdOrder = await api.createOrder(newAdminOrder);
      window.dispatchEvent(new CustomEvent('ahk_new_order', { detail: createdOrder }));
      setPlacedOrderNumber(createdOrder.orderNumber);
      setPlacedTotalPKR(createdOrder.totalPKR);
      setIsSubmitting(false);
      setOrderConfirmed(true);
    } catch (err) {
      setAddressError(`Could not place your order: ${(err as Error).message}`);
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    onClearTrousseau();
    setOrderConfirmed(false);
    setIsOrdering(false);
    setCheckoutStep(1);
    setAppliedPromo(null);
    setPromoError(null);
    setPromoSuccessMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div
        className="w-full max-w-lg bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#D5C2AD] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8DCCB] flex items-center justify-between bg-[#FDFBF7]">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#997A3D]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>
                {orderConfirmed
                  ? 'Order Receipt'
                  : isOrdering
                  ? `Simple Checkout · Step ${checkoutStep} of 2`
                  : 'Bridal Trousseau & Cart'}
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#360810] font-bold">
              {orderConfirmed
                ? 'Order Confirmed!'
                : isOrdering
                ? checkoutStep === 1
                  ? 'Delivery Address'
                  : 'Payment & Review'
                : `Your Trousseau (${items.reduce((s, i) => s + i.quantity, 0)})`}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFE7DE] hover:bg-[#E0D2C3] text-[#4A0E17] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Currency Bar & Checkout Step Progress */}
        <div className="px-6 py-2 bg-[#F5EFEB] border-b border-[#E8DCCB] flex items-center justify-between text-xs">
          {isOrdering && !orderConfirmed ? (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 text-xs font-semibold ${
                  checkoutStep === 1 ? 'text-[#4A0E17]' : 'text-emerald-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                    checkoutStep === 1
                      ? 'bg-[#4A0E17] text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {checkoutStep > 1 ? '✓' : '1'}
                </span>
                <span>Address</span>
              </div>
              <div className="w-6 h-0.5 bg-[#D5C2AD]" />
              <div
                className={`flex items-center gap-1.5 text-xs font-semibold ${
                  checkoutStep === 2 ? 'text-[#4A0E17]' : 'text-stone-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                    checkoutStep === 2
                      ? 'bg-[#4A0E17] text-white'
                      : 'bg-[#D5C2AD] text-stone-600'
                  }`}
                >
                  2
                </span>
                <span>Payment (COD)</span>
              </div>
            </div>
          ) : (
            <span className="text-[#78655E] text-xs font-medium">Boutique Currency:</span>
          )}

          <div className="flex items-center gap-1">
            {(['PKR', 'USD', 'GBP', 'AED'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  currency === c
                    ? 'bg-[#4A0E17] text-[#FAF8F5] font-semibold'
                    : 'text-[#68554E] hover:text-[#4A0E17]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-left">
          {orderConfirmed ? (
            /* ==================== CONFIRMATION VIEW ==================== */
            <div className="py-6 space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <div className="text-center space-y-1.5">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-bold">
                  Order Ref #{placedOrderNumber}
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#360810]">
                  Order Placed via Cash on Delivery
                </h3>
                <p className="text-xs text-[#68554E] max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-bold text-[#360810]">{customerName}</span>! Your order is registered in our master studio. You do not need to pay anything right now.
                </p>
              </div>

              {/* COD Payment Highlight Box */}
              <div className="p-4 bg-gradient-to-br from-[#F5EFEB] to-[#FAF8F5] rounded-xl border border-[#C5A059]/50 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4A0E17] uppercase tracking-wider pb-2 border-b border-[#E0D2C3]">
                  <Banknote className="w-4 h-4 text-[#C5A059]" />
                  <span>Payment Method: Cash on Delivery (COD)</span>
                </div>

                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-stone-600">Total Payable upon Doorstep Delivery:</span>
                  <span className="font-mono text-xl font-bold text-[#4A0E17]">
                    {formatPrice(placedTotalPKR)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pay in cash after parcel inspection</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-normal pl-5">
                    Our courier will bring your sealed AHK Bridal box to {streetAddress}, {city}. Please keep exact cash of {formatPrice(placedTotalPKR)} ready.
                  </p>
                </div>

                <div className="text-xs text-[#5C4942] space-y-1.5 pt-1 font-mono">
                  <div>Delivery Destination: <span className="text-stone-800 font-sans font-medium">{streetAddress}, {city}</span></div>
                  <div>COD Delivery Charges: <span className={`font-bold ${isKarachiLocation(city) ? 'text-emerald-700' : 'text-[#8C2333]'}`}>
                    {isKarachiLocation(city) ? 'Free COD (Karachi Rs. 0)' : `Rs. ${OUTSIDE_KARACHI_COD_FEE_PKR} COD (${city} - Outside Karachi)`}
                  </span></div>
                  <div>Contact Phone: <span className="text-stone-800 font-mono font-medium">{phone}</span></div>
                  <div>Total Ensembles: <span className="text-stone-800 font-sans font-medium">{items.length} Suits</span></div>
                  {appliedPromo && (
                    <div className="text-emerald-700">
                      Promo Code Applied: <span className="font-bold">{appliedPromo.code}</span> (Saved {formatPrice(appliedPromo.discountAmountPKR)})
                    </div>
                  )}

                  {/* Itemized summary of sizes & custom measurements */}
                  <div className="pt-2 border-t border-[#DECDBB] space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#8C7A72] block">Items in this Order:</span>
                    {items.map((it) => (
                      <div key={`cf-${it.id}`} className="p-2 bg-white rounded-lg border border-[#DECDBB] space-y-0.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[#360810]">{it.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            it.size === 'Customize Size' || it.customMeasurements
                              ? 'bg-[#FAF0E1] text-[#7A0C1E] border border-[#C5A059]'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {it.size === 'Customize Size' || it.customMeasurements ? 'Custom Size' : `Size: ${it.size}`}
                          </span>
                        </div>
                        {it.customMeasurements && (
                          <div className="text-[10px] text-[#5C4942]">
                            Measurements: Shld {it.customMeasurements.shoulder}" · Bust {it.customMeasurements.bust}" · Hips {it.customMeasurements.hips}" · Daman {it.customMeasurements.daman}" · Armhole {it.customMeasurements.armhole}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* WhatsApp Support Assistance */}
              <div className="p-3.5 bg-white rounded-xl border border-[#E0D2C3] flex items-center justify-between gap-3">
                <div className="text-xs text-stone-700">
                  <div className="font-bold text-[#360810] flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Need immediate size verification?</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Our Karachi Master Karigar is online 24/7 on WhatsApp.
                  </div>
                </div>
                <a
                  href={`https://wa.me/923360333585?text=${encodeURIComponent(
                    `Assalam o Alaikum! I just placed Cash on Delivery order #${placedOrderNumber} on AHK Bridal Studio for ${customerName} in ${city}. Total: PKR ${placedTotalPKR.toLocaleString()}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1.5 shadow"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-3 bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs uppercase tracking-wider font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Done & Return to Boutique
              </button>
            </div>
          ) : isOrdering ? (
            /* ==================== CHECKOUT STEPS VIEW ==================== */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* STEP 1: DELIVERY ADDRESS */}
              {checkoutStep === 1 && (
                <form onSubmit={handleProceedToStep2} className="space-y-4">
                  {/* Location-based COD Policy Banner */}
                  <div className="p-3 bg-[#FAF0E1]/70 rounded-xl border border-[#C5A059]/40 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                      <div className="text-xs text-[#5C4942] flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#360810]">Location-Based Cash on Delivery (COD)</span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            isKarachiLocation(city)
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-[#8C2333] border-amber-300'
                          }`}>
                            {isKarachiLocation(city) ? 'Free COD (Rs. 0)' : '+Rs. 350 COD'}
                          </span>
                        </div>
                        <div className="mt-1.5 grid grid-cols-2 gap-2 text-[11px]">
                          <div className={`p-2 rounded-lg border transition-all ${
                            isKarachiLocation(city)
                              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-semibold shadow-xs'
                              : 'bg-white/80 border-[#E0D2C3] text-stone-600'
                          }`}>
                            <span className="block text-[10px] uppercase font-mono tracking-wider text-stone-500">Karachi</span>
                            <span className="text-emerald-700 font-bold">Free COD (Rs. 0)</span>
                          </div>
                          <div className={`p-2 rounded-lg border transition-all ${
                            !isKarachiLocation(city)
                              ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-semibold shadow-xs'
                              : 'bg-white/80 border-[#E0D2C3] text-stone-600'
                          }`}>
                            <span className="block text-[10px] uppercase font-mono tracking-wider text-stone-500">Outside Karachi</span>
                            <span className="text-[#8C2333] font-bold">Rs. 350 COD Charges</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {addressError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{addressError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-bold mb-1">
                      Bride's Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#E0D2C3] text-xs text-[#360810] focus:ring-2 focus:ring-[#4A0E17]/30 focus:border-[#4A0E17] outline-none shadow-sm"
                      placeholder="e.g. Mahira Ali Khan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-bold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#E0D2C3] text-xs text-[#360810] focus:ring-2 focus:ring-[#4A0E17]/30 focus:border-[#4A0E17] outline-none shadow-sm"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* WhatsApp / Phone */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-bold mb-1">
                      WhatsApp / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#E0D2C3] text-xs font-mono text-[#360810] focus:ring-2 focus:ring-[#4A0E17]/30 focus:border-[#4A0E17] outline-none shadow-sm"
                      placeholder="+92 300 1234567 or 0321 8847291"
                    />
                    <span className="text-[10px] text-[#8C7A72] mt-0.5 block">
                      Courier will call this number before arriving for cash collection.
                    </span>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-bold mb-1">
                      Complete Street / House Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-[#E0D2C3] text-xs text-[#360810] focus:ring-2 focus:ring-[#4A0E17]/30 focus:border-[#4A0E17] outline-none shadow-sm resize-none"
                      placeholder="House / Apartment #, Street Name, Block / Sector, Landmark"
                    />
                  </div>

                  {/* City Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs uppercase tracking-wider text-[#78655E] font-bold">
                        City of Delivery *
                      </label>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all ${
                        isKarachiLocation(city)
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-[#8C2333] border-amber-300'
                      }`}>
                        {isKarachiLocation(city) ? 'Karachi: Free COD (Rs. 0)' : 'Outside Karachi: +Rs. 350 COD'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {POPULAR_CITIES.map((c) => {
                        const isKhi = c === 'Karachi';
                        const isSelected = city === c || (c === 'Karachi' && isKarachiLocation(city) && city.toLowerCase() === 'karachi');
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCity(c === 'Other' ? '' : c)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#4A0E17] text-white border-[#4A0E17] shadow-xs'
                                : 'bg-white text-[#68554E] border-[#E0D2C3] hover:border-[#4A0E17]'
                            }`}
                          >
                            <span>{c}</span>
                            <span className={`text-[9px] font-mono ${
                              isSelected
                                ? 'text-[#E5C378]'
                                : isKhi
                                ? 'text-emerald-700 font-bold'
                                : 'text-stone-400'
                            }`}>
                              {isKhi ? 'Rs. 0' : '+350'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#E0D2C3] text-xs text-[#360810] focus:ring-2 focus:ring-[#4A0E17]/30 focus:border-[#4A0E17] outline-none"
                      placeholder="Enter city (e.g. Karachi, Lahore, Islamabad, Rawalpindi)"
                    />

                    {/* Dynamic Real-time Delivery Fee Feedback */}
                    <div className={`mt-1.5 p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      isKarachiLocation(city)
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/90 border-amber-200 text-amber-950'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <Truck className={`w-3.5 h-3.5 ${isKarachiLocation(city) ? 'text-emerald-600' : 'text-[#C5A059]'}`} />
                        <span>
                          {isKarachiLocation(city) ? (
                            <>Delivery within <strong>Karachi</strong>: Complimentary Doorstep COD</>
                          ) : (
                            <>Delivery to <strong>{city.trim() || 'Outside Karachi'}</strong>: Rs. 350 COD charges applied</>
                          )}
                        </span>
                      </div>
                      <span className={`font-mono font-bold text-xs ${isKarachiLocation(city) ? 'text-emerald-700' : 'text-[#8C2333]'}`}>
                        {isKarachiLocation(city) ? 'Free (Rs. 0)' : '+Rs. 350 COD'}
                      </span>
                    </div>
                  </div>

                  {/* Wedding Date (Optional) */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1 flex items-center justify-between">
                      <span>Wedding / Event Date (Optional)</span>
                      <span className="text-[10px] text-stone-400 lowercase font-mono">optional</span>
                    </label>
                    <input
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#E0D2C3] text-xs font-mono text-[#360810] focus:ring-2 focus:ring-[#4A0E17]/30 focus:border-[#4A0E17] outline-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOrdering(false)}
                      className="w-1/3 py-2.5 px-3 bg-[#EFE7DE] hover:bg-[#E5DBD0] text-[#4A0E17] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 px-3 bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E5C378]" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: PROMO CODE & CASH ON DELIVERY (COD) PAYMENT */}
              {checkoutStep === 2 && (
                <div className="space-y-4">
                  {addressError && (
                    <div role="alert" className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{addressError}</span>
                    </div>
                  )}
                  {/* Summary of destination */}
                  <div className="p-3 bg-white rounded-xl border border-[#E0D2C3] flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-[#8C7A72]">Delivering To</div>
                      <div className="font-bold text-[#360810]">{customerName} · {phone}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{streetAddress}, {city}</div>
                    </div>
                    <button
                      onClick={() => setCheckoutStep(1)}
                      className="text-xs text-[#4A0E17] font-bold underline hover:text-[#681421] cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Order Ensembles Review */}
                  <div className="p-3 bg-white rounded-xl border border-[#E0D2C3] space-y-2 text-xs">
                    <div className="text-[10px] uppercase font-mono text-[#8C7A72] font-bold">
                      Order Ensembles ({items.length})
                    </div>
                    <div className="space-y-2 divide-y divide-[#EFE7DE]">
                      {items.map((item) => (
                        <div key={`chk-${item.id}`} className="pt-1.5 first:pt-0 space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-serif font-bold text-[#360810]">{item.title}</span>
                            <span className="font-mono font-semibold text-[#4A0E17]">{formatPrice(item.pricePKR * item.quantity)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono">
                            <span className={`px-1.5 py-0.5 rounded border font-bold ${
                              item.size === 'Customize Size' || item.customMeasurements
                                ? 'bg-[#FAF0E1] text-[#7A0C1E] border-[#C5A059]'
                                : 'bg-[#FAF8F5] text-[#4A0E17] border-[#DECDBB]'
                            }`}>
                              {item.size === 'Customize Size' || item.customMeasurements ? 'Custom Size' : `Size: ${item.size}`}
                            </span>
                            {item.color && (
                              <span className="text-stone-500">Color: {item.color}</span>
                            )}
                            <span className="text-stone-400">Qty: {item.quantity}</span>
                          </div>
                          {item.customMeasurements && (
                            <div className="text-[10px] font-mono text-[#5C4942] bg-[#FAF8F5] p-1.5 rounded border border-[#DECDBB]">
                              <span className="font-bold text-[#4A0E17]">Measurements: </span>
                              <span>Shld {item.customMeasurements.shoulder}" · Bust {item.customMeasurements.bust}" · Hips {item.customMeasurements.hips}" · Dmn {item.customMeasurements.daman}" · Arm {item.customMeasurements.armhole}"</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ==================== 1. DISCOUNT / PROMO CODE FIELD ==================== */}
                  <div className="p-4 bg-white rounded-xl border border-[#E0D2C3] shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#360810]">
                        <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Discount / Promo Code</span>
                      </div>
                      {appliedPromo && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>

                    {appliedPromo ? (
                      /* Applied promo chip */
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                              {appliedPromo.code}
                            </span>
                            <span className="text-xs font-bold text-emerald-800">
                              {appliedPromo.freeCOD || appliedPromo.discountType === 'free_cod'
                                ? 'Free COD Applied'
                                : appliedPromo.discountType === 'percentage'
                                ? `${appliedPromo.value}% Discount Applied`
                                : `Flat PKR ${appliedPromo.value.toLocaleString()} Discount`}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700">
                            Saved {formatPrice(appliedPromo.discountAmountPKR)} on your order!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove promo code"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Promo Code Input & Apply Button */
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={promoInput}
                              onChange={(e) => {
                                setPromoInput(e.target.value.toUpperCase());
                                setPromoError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleApplyPromoCode();
                                }
                              }}
                              placeholder="Enter coupon code (e.g. AHKROYAL10)"
                              className="w-full pl-9 pr-3 py-2 bg-stone-50 rounded-lg border border-[#E0D2C3] text-xs font-mono uppercase text-[#360810] focus:bg-white focus:ring-2 focus:ring-[#4A0E17]/30 focus:border-[#4A0E17] outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplyPromoCode()}
                            disabled={isValidatingPromo || !promoInput.trim()}
                            className="px-4 py-2 bg-[#4A0E17] hover:bg-[#681421] disabled:opacity-50 text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                          >
                            {isValidatingPromo ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span>Apply</span>
                            )}
                          </button>
                        </div>

                        {promoError && (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-xs flex items-center gap-1.5 animate-in fade-in">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{promoError}</span>
                          </div>
                        )}

                        {promoSuccessMsg && (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>{promoSuccessMsg}</span>
                          </div>
                        )}

                        {/* Popular Promo Suggestions */}
                        <div className="pt-1 flex items-center flex-wrap gap-1.5 text-[11px] text-[#8C7A72]">
                          <span>Suggested codes:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPromoInput('AHKROYAL10');
                              handleApplyPromoCode('AHKROYAL10');
                            }}
                            className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#FAF0E1] text-[#4A0E17] border border-[#C5A059]/40 rounded hover:bg-[#4A0E17] hover:text-white transition-colors cursor-pointer"
                          >
                            AHKROYAL10 (10% Off)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPromoInput('BRIDAL50K');
                              handleApplyPromoCode('BRIDAL50K');
                            }}
                            className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#FAF0E1] text-[#4A0E17] border border-[#C5A059]/40 rounded hover:bg-[#4A0E17] hover:text-white transition-colors cursor-pointer"
                          >
                            BRIDAL50K (50k Off)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ==================== 2. PAYMENT METHOD: CASH ON DELIVERY (COD) ONLY ==================== */}
                  <div className="p-4 bg-white rounded-xl border-2 border-[#4A0E17] shadow-md space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#4A0E17] text-[#FAF8F5] text-[10px] uppercase font-bold px-3 py-0.5 rounded-bl-lg tracking-wider">
                      Sole Payment Method
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FAF0E1] to-[#F5EFEB] border border-[#C5A059] flex items-center justify-center text-[#4A0E17] shrink-0 mt-0.5 shadow-sm">
                        <Banknote className="w-5 h-5 text-[#4A0E17]" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-serif font-bold text-sm text-[#360810]">
                            Cash on Delivery (COD)
                          </h4>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ Verified & Active
                          </span>
                        </div>
                        <p className="text-xs text-[#5C4942] leading-relaxed">
                          Pay cash to the courier at your doorstep upon receiving and inspecting your package. No credit card or online payment required.
                        </p>
                      </div>
                    </div>

                    {/* Reassurance points */}
                    <div className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E8DCCB] text-[11px] text-[#5C4942] space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>100% Doorstep Payment:</strong> Pay in cash when courier arrives.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Open & Inspect:</strong> Verify handcrafted quality before courier departure.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Express Delivery:</strong> {isKarachiLocation(city) ? 'Free COD Delivery within Karachi.' : 'Rs. 350 Doorstep COD Delivery.'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ==================== 3. ORDER FINANCIAL BREAKDOWN ==================== */}
                  <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#E0D2C3] space-y-2 text-xs">
                    <div className="flex justify-between text-[#68554E]">
                      <span>Ensembles Subtotal ({items.length} items):</span>
                      <span className="font-mono font-semibold text-[#360810]">{formatPrice(totalPKR)}</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-800 font-medium">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          <span>Promo Discount ({appliedPromo.code}):</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-700">
                          -{formatPrice(discountAmountPKR)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[#68554E]">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>COD Delivery Charges ({city || 'Outside Karachi'}):</span>
                      </span>
                      {codFeePKR === 0 ? (
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          FREE COD (Rs. 0)
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-[#8A1526] bg-[#8A1526]/10 px-2 py-0.5 rounded border border-[#8A1526]/20">
                          +{formatPrice(codFeePKR)}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between text-[#68554E]">
                      <span>Payment Method:</span>
                      <span className="font-semibold text-[#4A0E17]">Cash on Delivery (COD)</span>
                    </div>

                    <div className="pt-2 border-t border-[#E0D2C3] flex justify-between items-baseline">
                      <div>
                        <span className="font-serif text-sm font-bold text-[#360810] block">
                          Total Payable to Courier:
                        </span>
                        <span className="text-[10px] text-[#8C7A72]">
                          (Due in cash upon doorstep delivery)
                        </span>
                      </div>
                      <span className="font-serif text-xl font-bold text-[#4A0E17]">
                        {formatPrice(finalTotalPKR)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      className="w-1/3 py-3 px-3 bg-[#EFE7DE] hover:bg-[#E5DBD0] text-[#4A0E17] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteOrder}
                      disabled={isSubmitting}
                      className="w-2/3 py-3 px-4 bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs uppercase tracking-wider font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Placing Order...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#E5C378]" />
                          <span>Confirm Order (COD)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : items.length === 0 ? (
            /* ==================== EMPTY TROUSSEAU VIEW ==================== */
            <div className="py-16 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-[#C5A059] mx-auto opacity-60" />
              <div className="space-y-1">
                <p className="font-serif text-lg text-[#360810]">Your Trousseau is Empty</p>
                <p className="text-xs text-[#78655E] max-w-xs mx-auto">
                  Explore our curated bridal collection or discover heirloom ensembles in our royal couture gallery.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAtelier();
                }}
                className="px-5 py-2.5 bg-[#4A0E17] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-lg hover:bg-[#681421] transition-colors cursor-pointer"
              >
                Explore Couture Gallery
              </button>
            </div>
          ) : (
            /* ==================== CART ITEMS VIEW ==================== */
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white rounded-xl border border-[#E0D2C3] shadow-sm flex items-start gap-3 justify-between"
                >
                  {/* Item Image Thumbnail if present */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-16 rounded-lg object-cover object-top border border-[#DECDBB] shrink-0"
                    />
                  )}

                  <div className="space-y-1 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#997A3D]">
                      <span>{item.occasion}</span>
                      <span>·</span>
                      <span>{item.type === 'custom' ? 'Custom Atelier' : 'Catalog'}</span>
                      {item.size && (
                        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                          item.size === 'Customize Size' || item.customMeasurements
                            ? 'bg-[#FAF0E1] text-[#7A0C1E] border-[#C5A059]'
                            : 'bg-[#FAF8F5] text-[#4A0E17] border-[#E0D2C3]'
                        }`}>
                          {item.size === 'Customize Size' || item.customMeasurements ? 'Custom Size' : `Size: ${item.size}`}
                        </span>
                      )}
                      {item.color && (
                        <span className="px-1.5 py-0.5 bg-[#FAF8F5] text-[#7A0C1E] font-bold rounded border border-[#E0D2C3]">
                          Color: {item.color}
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif text-sm font-semibold text-[#360810]">
                      {item.title}
                    </h4>

                    {/* Custom Measurements Display */}
                    {item.customMeasurements && (
                      <div className="p-2 bg-[#FAF8F5] rounded-lg border border-[#DECDBB] text-[10px] font-mono text-[#5C4942] space-y-1 my-1">
                        <div className="font-bold text-[#4A0E17] uppercase tracking-wider flex items-center justify-between">
                          <span>Custom Size (Inches):</span>
                          <span className="text-emerald-700 font-semibold">✓ 5 Fields</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-0.5 text-[#360810]">
                          <div className="bg-white p-1 rounded border border-[#E8DCCB] text-center">
                            <span className="text-[#8C7A72] block text-[9px]">Shoulder</span>
                            <span className="font-bold">{item.customMeasurements.shoulder}"</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-[#E8DCCB] text-center">
                            <span className="text-[#8C7A72] block text-[9px]">Bust</span>
                            <span className="font-bold">{item.customMeasurements.bust}"</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-[#E8DCCB] text-center">
                            <span className="text-[#8C7A72] block text-[9px]">Hips</span>
                            <span className="font-bold">{item.customMeasurements.hips}"</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-[#E8DCCB] text-center">
                            <span className="text-[#8C7A72] block text-[9px]">Daman</span>
                            <span className="font-bold">{item.customMeasurements.daman}"</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-[#E8DCCB] text-center">
                            <span className="text-[#8C7A72] block text-[9px]">Armhole</span>
                            <span className="font-bold">{item.customMeasurements.armhole}"</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.customDetails && (
                      <div className="text-[11px] text-[#68554E] space-y-0.5">
                        <div>Fabric: {item.customDetails.fabric}</div>
                        <div>Zari: {item.customDetails.metalTone}</div>
                        <div>Coverage: {item.customDetails.embroideryDensity}%</div>
                      </div>
                    )}

                    {/* Price with Discount calculation */}
                    <div className="flex items-baseline gap-1.5 pt-1">
                      {item.originalPricePKR && item.originalPricePKR > item.pricePKR && (
                        <span className="font-mono text-[11px] text-stone-400 line-through">
                          {formatPrice(item.originalPricePKR)}
                        </span>
                      )}
                      <span className="font-mono text-xs font-bold text-[#4A0E17]">
                        {formatPrice(item.pricePKR)}
                      </span>
                      {item.originalPricePKR && item.originalPricePKR > item.pricePKR && (
                        <span className="text-[9px] font-mono font-bold bg-[#FEE2E2] text-[#991B1B] px-1 rounded">
                          -{item.discountPercent || Math.round((1 - item.pricePKR / item.originalPricePKR) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary & Proceed to Checkout (Visible when items > 0 and not in ordering mode) */}
        {items.length > 0 && !orderConfirmed && !isOrdering && (
          <div className="p-5 sm:p-6 border-t border-[#E8DCCB] bg-[#F5EFEB] space-y-3.5">
            {/* Quick Promo Preview in Cart */}
            {appliedPromo ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                <span className="flex items-center gap-1.5 font-bold">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Promo {appliedPromo.code} applied (-{formatPrice(discountAmountPKR)})</span>
                </span>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-stone-400 hover:text-rose-600 font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Promo code (e.g. AHKROYAL10)"
                  className="flex-1 px-3 py-1.5 bg-white border border-[#E0D2C3] rounded-lg text-xs font-mono uppercase text-[#360810] outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleApplyPromoCode()}
                  disabled={isValidatingPromo || !promoInput.trim()}
                  className="px-3 py-1.5 bg-[#4A0E17] hover:bg-[#681421] disabled:opacity-50 text-[#FAF8F5] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}

            {promoError && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{promoError}</span>
              </p>
            )}

            <div className="space-y-1.5 text-xs text-left">
              <div className="flex justify-between text-[#68554E]">
                <span>Ensembles Subtotal:</span>
                <span className="font-mono font-semibold text-[#360810]">{formatPrice(totalPKR)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Promo Discount:</span>
                  <span className="font-mono font-bold text-emerald-700">-{formatPrice(discountAmountPKR)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#68554E]">
                <span>Payment Method:</span>
                <span className="font-semibold text-emerald-800">Cash on Delivery (COD)</span>
              </div>
              <div className="flex justify-between items-center text-[#68554E]">
                <span>COD Delivery:</span>
                <span className="font-medium text-xs text-[#68554E]">
                  Free in Karachi · Rs. 350 Other Cities
                </span>
              </div>
              <div className="pt-2 border-t border-[#E0D2C3] flex justify-between items-baseline">
                <span className="font-serif text-base font-semibold text-[#360810]">Estimated Total:</span>
                <span className="font-serif text-xl font-bold text-[#4A0E17]">{formatPrice(finalTotalPKR)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOrdering(true);
                setCheckoutStep(1);
              }}
              className="w-full py-3 px-4 bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs uppercase tracking-wider font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout (Cash on Delivery)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#78655E]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Certified 100% Pure Silk & Doorstep Cash on Delivery</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
