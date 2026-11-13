import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Check,
  Ruler,
  Tag,
  Palette,
  ArrowRight,
  ShieldCheck,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { BridalProduct, BridalSize, CustomSizeMeasurements, getProductColors } from '../types/bridal';
import { SizeGuideModal } from './SizeGuideModal';
import { CustomSizeMeasurementForm } from './CustomSizeMeasurementForm';

interface AddToCartOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: BridalProduct | null;
  onConfirmAdd: (configuredProduct: BridalProduct, directOrder?: boolean) => void;
}

export const AddToCartOptionsModal: React.FC<AddToCartOptionsModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirmAdd,
}) => {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedSize, setSelectedSize] = useState<BridalSize | 'Customize Size'>('M');
  const [customMeasurements, setCustomMeasurements] = useState<CustomSizeMeasurements>({
    shoulder: '',
    bust: '',
    hips: '',
    daman: '',
    armhole: '',
  });
  const [showMeasurementErrors, setShowMeasurementErrors] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');

  const colors = getProductColors(product);
  const hasMultipleColors = colors.length > 1;

  const availableSizes: BridalSize[] = (
    product?.availableSizes && product.availableSizes.length > 0
      ? product.availableSizes
      : ['S', 'M', 'L', 'XL']
  );

  // Synchronize defaults whenever product opens
  useEffect(() => {
    if (product) {
      setShowMeasurementErrors(false);
      // Pick default size
      if (product.selectedSize === 'Customize Size') {
        setSelectedSize('Customize Size');
        if (product.customMeasurements) {
          setCustomMeasurements(product.customMeasurements);
        }
      } else if (product.selectedSize && availableSizes.includes(product.selectedSize as BridalSize)) {
        setSelectedSize(product.selectedSize as BridalSize);
      } else if (availableSizes.includes('M')) {
        setSelectedSize('M');
      } else if (availableSizes.length > 0) {
        setSelectedSize(availableSizes[0]);
      }

      // Pick default color if multiple colors available
      const pColors = getProductColors(product);
      if (pColors.length > 1) {
        setSelectedColor(product.selectedColor || pColors[0]);
      } else if (pColors.length === 1) {
        setSelectedColor(pColors[0]);
      } else {
        setSelectedColor(product.colorway || '');
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Discount calculation
  const hasDiscount = Boolean(
    product.isDiscounted || (product.discountPercent && product.discountPercent > 0)
  );
  const discountPercent = product.discountPercent || 0;

  const basePricePKR = product.originalPricePKR && product.originalPricePKR > 0
    ? product.originalPricePKR
    : product.pricePKR;

  const basePriceUSD = product.originalPriceUSD && product.originalPriceUSD > 0
    ? product.originalPriceUSD
    : product.priceUSD;

  const activePricePKR = hasDiscount && discountPercent > 0
    ? (product.discountPricePKR && product.discountPricePKR > 0
        ? product.discountPricePKR
        : Math.round(basePricePKR * (1 - discountPercent / 100)))
    : product.pricePKR;

  const activePriceUSD = hasDiscount && discountPercent > 0
    ? (product.discountPriceUSD && product.discountPriceUSD > 0
        ? product.discountPriceUSD
        : Math.round(basePriceUSD * (1 - discountPercent / 100)))
    : product.priceUSD;

  const savingsPKR = hasDiscount ? Math.max(0, basePricePKR - activePricePKR) : 0;
  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;

  const isCustomSize = selectedSize === 'Customize Size';
  const isCustomComplete = Boolean(
    customMeasurements.shoulder.trim() &&
    customMeasurements.bust.trim() &&
    customMeasurements.hips.trim() &&
    customMeasurements.daman.trim() &&
    customMeasurements.armhole.trim()
  );

  // Selected size specifications quick preview
  const currentSizeSpecs = selectedSize !== 'Customize Size' ? {
    S: 'Shoulder: 14" · Bust: 18" · Waist: 16" · Hip: 18" · Daman: 20" · Arm-Hole: 7"',
    M: 'Shoulder: 15" · Bust: 20" · Waist: 18" · Hip: 20" · Daman: 22" · Arm-Hole: 8"',
    L: 'Shoulder: 16" · Bust: 22" · Waist: 19" · Hip: 21" · Daman: 23" · Arm-Hole: 9"',
    XL: 'Shoulder: 17" · Bust: 24" · Waist: 20" · Hip: 22" · Daman: 24" · Arm-Hole: 9"',
  }[selectedSize as BridalSize] : null;

  const handleConfirm = (directOrder = false) => {
    // If Custom Size is selected, ensure all 5 fields are filled
    if (isCustomSize && !isCustomComplete) {
      setShowMeasurementErrors(true);
      return;
    }

    const configured: BridalProduct = {
      ...product,
      pricePKR: activePricePKR,
      priceUSD: activePriceUSD,
      originalPricePKR: basePricePKR,
      originalPriceUSD: basePriceUSD,
      discountPercent: hasDiscount ? discountPercent : 0,
      isDiscounted: hasDiscount,
      selectedSize: selectedSize,
      customMeasurements: isCustomSize ? customMeasurements : undefined,
      selectedColor: hasMultipleColors ? selectedColor : (colors[0] || product.colorway || ''),
    };

    onConfirmAdd(configured, directOrder);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="bg-[#FAF8F5] border border-[#D5C2AD] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="p-5 sm:p-6 bg-[#360810] text-[#FAF8F5] border-b border-[#54131D] flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#E5C378]">
                <Sparkles className="w-3.5 h-3.5 text-[#E5C378]" />
                <span>Custom Atelier Fit & Options</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF8F5]">
                Select Your Size {hasMultipleColors ? '& Color' : ''}
              </h2>
              <p className="text-xs text-[#E0D2C3] font-mono">
                Please select your bridal size {hasMultipleColors ? 'and colorway' : ''} before adding to cart
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors relative z-10 cursor-pointer"
              aria-label="Close options"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Outfit Preview Snippet */}
            <div className="p-3 bg-white rounded-2xl border border-[#E3D6C8] shadow-xs flex items-center gap-3">
              <div className="relative w-16 h-20 shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-20 rounded-xl object-cover object-top border border-[#DECDBB]"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center p-1 text-center">
                    <span className="text-[8px] font-mono font-bold text-white uppercase leading-tight">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1 text-left">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#997A3D]">
                  <span>{product.occasion}</span>
                  {product.fabric && (
                    <>
                      <span>·</span>
                      <span>{product.fabric}</span>
                    </>
                  )}
                </div>
                <h4 className="font-serif text-sm sm:text-base font-bold text-[#360810] line-clamp-1">
                  {product.name}
                </h4>
                <div className="flex items-baseline gap-2 pt-0.5">
                  {hasDiscount && (
                    <span className="text-xs font-mono text-stone-400 line-through">
                      PKR {basePricePKR.toLocaleString()}
                    </span>
                  )}
                  <span className={`font-mono text-sm sm:text-base font-bold ${
                    hasDiscount ? 'text-[#991B1B]' : 'text-[#4A0E17]'
                  }`}>
                    PKR {activePricePKR.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#991B1B] text-white">
                      -{discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ==================== 1. SIZE SELECTION (Always Asked) ==================== */}
            <div className="p-4 bg-[#F7F2EC] rounded-2xl border border-[#DECDBB] space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-[#C5A059]" />
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#360810]">
                    1. Select Bridal Size: *
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-[#4A0E17] hover:text-[#7A0C1E] font-mono font-bold underline underline-offset-4 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Size Guide (Inch)</span>
                </button>
              </div>

              {/* S, M, L, XL Tiles */}
              <div className="grid grid-cols-4 gap-2.5">
                {(['S', 'M', 'L', 'XL'] as BridalSize[]).map((sizeKey) => {
                  const isAvailable = availableSizes.includes(sizeKey);
                  const isCurrent = selectedSize === sizeKey;
                  return (
                    <button
                      key={sizeKey}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedSize(sizeKey);
                        setShowMeasurementErrors(false);
                      }}
                      className={`py-3 px-2 rounded-xl text-center font-mono transition-all cursor-pointer border ${
                        !isAvailable
                          ? 'opacity-35 bg-stone-100 border-stone-200 cursor-not-allowed'
                          : isCurrent
                          ? 'bg-[#4A0E17] text-white border-[#C5A059] shadow-md ring-2 ring-[#C5A059]'
                          : 'bg-white text-[#360810] border-[#D5C2AD] hover:border-[#C5A059] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="text-sm sm:text-base font-bold flex items-center justify-center gap-1">
                        <span>{sizeKey}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-[#E5C378]" />}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-[#E5C378]' : 'text-stone-500'}`}>
                        {sizeKey === 'S' && '18" Bust'}
                        {sizeKey === 'M' && '20" Bust'}
                        {sizeKey === 'L' && '22" Bust'}
                        {sizeKey === 'XL' && '24" Bust'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Customize Size Tile */}
              <button
                type="button"
                onClick={() => setSelectedSize('Customize Size')}
                className={`w-full p-3 rounded-xl border text-left font-mono transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCustomSize
                    ? 'bg-[#360810] text-[#FAF8F5] border-[#C5A059] shadow-md ring-2 ring-[#C5A059]'
                    : 'bg-white text-[#360810] border-[#D5C2AD] hover:border-[#C5A059] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCustomSize ? 'bg-[#C5A059] text-[#1C1417]' : 'bg-[#FAF0E1] text-[#7A0C1E]'
                  }`}>
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold tracking-wide">Customize Size</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isCustomSize ? 'bg-[#FAF0E1] text-[#7A0C1E]' : 'bg-[#FAF8F5] text-[#997A3D] border border-[#DECDBB]'
                      }`}>
                        Made-to-Measure
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isCustomSize ? 'text-[#E5C378]' : 'text-stone-500'}`}>
                      Shoulder, Bust, Hips, Daman & Armhole in inches
                    </p>
                  </div>
                </div>
                {isCustomSize ? (
                  <Check className="w-5 h-5 text-[#E5C378] shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                )}
              </button>

              {/* Conditional Measurement Form or Standard Size Specs */}
              {isCustomSize ? (
                <CustomSizeMeasurementForm
                  measurements={customMeasurements}
                  onChange={setCustomMeasurements}
                  showErrors={showMeasurementErrors}
                />
              ) : (
                /* Measurement summary for selected size */
                <div className="p-2.5 bg-white rounded-xl border border-[#E3D6C8] text-[11px] font-mono text-[#5C4942]">
                  <span className="text-[#997A3D] font-bold">Size {selectedSize} Specs: </span>
                  <span className="text-[#360810] font-semibold">{currentSizeSpecs}</span>
                </div>
              )}
            </div>

            {/* ==================== 2. COLOR SELECTION ==================== */}
            {/* IMPORTANT NOTE: As requested, it asks about color ONLY for products with multiple colors */}
            {hasMultipleColors && (
              <div className="p-4 bg-[#F7F2EC] rounded-2xl border border-[#DECDBB] space-y-3 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#360810]">
                      2. Select Outfit Colorway: *
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#997A3D]">
                    {colors.length} shades available
                  </span>
                </div>

                {/* Color Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {colors.map((colorName, cIdx) => {
                    const isSelected = selectedColor === colorName;
                    return (
                      <button
                        key={`opt-col-${colorName}-${cIdx}`}
                        type="button"
                        onClick={() => setSelectedColor(colorName)}
                        className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-[#360810] text-[#FAF8F5] border-[#C5A059] shadow-md ring-2 ring-[#C5A059]'
                            : 'bg-white text-[#360810] border-[#D5C2AD] hover:border-[#C5A059] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <span className="font-semibold line-clamp-1">{colorName}</span>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-[#E5C378] shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] font-mono text-[#78655E]">
                  Selected shade: <span className="font-bold text-[#360810]">{selectedColor}</span>
                </div>
              </div>
            )}

            {/* Single Colorway Display (informative, no question prompted) */}
            {!hasMultipleColors && (product.colorway || (colors.length === 1 && colors[0])) && (
              <div className="px-3.5 py-2 bg-[#F2EDE6] rounded-xl border border-[#DECDBB] text-xs text-[#68554E] flex items-center justify-between font-mono">
                <span>Ensemble Colorway:</span>
                <span className="font-bold text-[#360810]">
                  {colors[0] || product.colorway}
                </span>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="p-4 sm:p-5 bg-[#F5EFEB] border-t border-[#E8DCCB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-left font-mono text-xs text-[#5C4942]">
              <div>
                Size: <span className="font-bold text-[#360810]">{selectedSize}</span>
                {isCustomSize && (
                  <span className={`ml-1.5 font-semibold text-[11px] ${isCustomComplete ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ({isCustomComplete ? '5 Measurements Saved' : 'Measurements Required'})
                  </span>
                )}
              </div>
              {hasMultipleColors && (
                <div>Color: <span className="font-bold text-[#360810]">{selectedColor}</span></div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  handleConfirm(false);
                }}
                className={`flex-1 sm:flex-none py-3 px-5 text-xs uppercase tracking-wider font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed border border-stone-300'
                    : 'bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] cursor-pointer'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#E5C378]" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  handleConfirm(true);
                }}
                className={`flex-1 sm:flex-none py-3 px-5 text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                  isOutOfStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed border border-stone-300'
                    : 'bg-[#C5A059] hover:bg-[#B38728] text-[#1C1417] cursor-pointer'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#1C1417]" />
                <span>{isOutOfStock ? 'Unavailable' : 'Order Now (COD)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Reference Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        selectedSize={selectedSize}
        onSelectSize={(s) => setSelectedSize(s)}
      />
    </>
  );
};
