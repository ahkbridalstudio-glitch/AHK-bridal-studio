import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  ShoppingBag,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Tag,
  Percent,
  ShieldCheck,
  Palette,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { BridalProduct, BridalSize, CustomSizeMeasurements, AHK_SIZE_GUIDE, getProductColors } from '../types/bridal';
import { SizeGuideModal } from './SizeGuideModal';
import { CustomSizeMeasurementForm } from './CustomSizeMeasurementForm';

interface ProductDetailModalProps {
  product: BridalProduct | null;
  onClose: () => void;
  onCustomize?: (product: BridalProduct) => void;
  onAddToTrousseau: (product: BridalProduct) => void;
  onOrderNow: (product: BridalProduct) => void;
  onContactStylist: (productName: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToTrousseau,
  onOrderNow,
  onContactStylist,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Available sizes according to AHK Bridal Studio Size Guide
  const availableSizes: BridalSize[] = (
    product?.availableSizes && product.availableSizes.length > 0
      ? product.availableSizes
      : ['S', 'M', 'L', 'XL']
  );

  const [selectedSize, setSelectedSize] = useState<BridalSize | 'Customize Size'>(
    availableSizes.includes('M') ? 'M' : availableSizes[0] || 'M'
  );
  const [customMeasurements, setCustomMeasurements] = useState<CustomSizeMeasurements>({
    shoulder: '',
    bust: '',
    hips: '',
    daman: '',
    armhole: '',
  });
  const [showMeasurementErrors, setShowMeasurementErrors] = useState(false);

  const colors = getProductColors(product);
  const hasMultipleColors = colors.length > 1;

  const [selectedColor, setSelectedColor] = useState<string>(
    product?.selectedColor || (colors.length > 0 ? colors[0] : (product?.colorway || ''))
  );

  // Keep state synced if product changes
  useEffect(() => {
    if (product) {
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

  if (!product) return null;

  // Gather all available product pictures (deduplicated)
  const rawImages: string[] = (
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image, ...(product.secondaryImage ? [product.secondaryImage] : [])]
  ).filter(Boolean);
  const allImages: string[] = Array.from(new Set(rawImages));

  const activeImage = allImages[selectedImageIndex] || product.image;

  const inclusions = Array.isArray(product.inclusions) && product.inclusions.length > 0
    ? product.inclusions
    : [];

  const craftDetails = product.craftDetails || '';

  const deliveryWeeks = product.deliveryWeeks || (product as any).leadTimeWeeks || 8;
  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;

  // Discount calculation
  const hasDiscount = Boolean(
    product.isDiscounted || (product.discountPercent && product.discountPercent > 0)
  );
  const discountPercent = product.discountPercent || 0;
  
  // Regular prices
  const basePricePKR = product.originalPricePKR && product.originalPricePKR > 0
    ? product.originalPricePKR
    : (typeof product.pricePKR === 'number' ? product.pricePKR : 0);

  const basePriceUSD = product.originalPriceUSD && product.originalPriceUSD > 0
    ? product.originalPriceUSD
    : (typeof product.priceUSD === 'number' ? product.priceUSD : Math.round(basePricePKR / 280));

  // Active discounted prices
  const activePricePKR = hasDiscount && discountPercent > 0
    ? (product.discountPricePKR && product.discountPricePKR > 0
        ? product.discountPricePKR
        : Math.round(basePricePKR * (1 - discountPercent / 100)))
    : (typeof product.pricePKR === 'number' ? product.pricePKR : basePricePKR);

  const activePriceUSD = hasDiscount && discountPercent > 0
    ? (product.discountPriceUSD && product.discountPriceUSD > 0
        ? product.discountPriceUSD
        : Math.round(basePriceUSD * (1 - discountPercent / 100)))
    : (typeof product.priceUSD === 'number' ? product.priceUSD : basePriceUSD);

  const savingsPKR = hasDiscount ? Math.max(0, basePricePKR - activePricePKR) : 0;
  const savingsUSD = hasDiscount ? Math.max(0, basePriceUSD - activePriceUSD) : 0;

  const isCustomSize = selectedSize === 'Customize Size';
  const isCustomComplete = Boolean(
    customMeasurements.shoulder.trim() &&
    customMeasurements.bust.trim() &&
    customMeasurements.hips.trim() &&
    customMeasurements.daman.trim() &&
    customMeasurements.armhole.trim()
  );

  // Selected size measurements quick guide for tooltip/badge
  const currentSizeSpecs = selectedSize !== 'Customize Size' ? {
    S: 'Shoulder: 14" · Bust: 18" · Waist: 16" · Hip: 18" · Daman: 20" · Arm-Hole: 7"',
    M: 'Shoulder: 15" · Bust: 20" · Waist: 18" · Hip: 20" · Daman: 22" · Arm-Hole: 8"',
    L: 'Shoulder: 16" · Bust: 22" · Waist: 19" · Hip: 21" · Daman: 23" · Arm-Hole: 9"',
    XL: 'Shoulder: 17" · Bust: 24" · Waist: 20" · Hip: 22" · Daman: 24" · Arm-Hole: 9"',
  }[selectedSize as BridalSize] : null;

  const preparedProduct: BridalProduct = {
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

  const handleAdd = () => {
    if (isCustomSize && !isCustomComplete) {
      setShowMeasurementErrors(true);
      return;
    }
    onAddToTrousseau(preparedProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleDirectOrder = () => {
    if (isCustomSize && !isCustomComplete) {
      setShowMeasurementErrors(true);
      return;
    }
    onClose();
    onOrderNow(preparedProduct);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div 
          className="relative bg-[#FAF8F5] rounded-3xl max-w-4xl w-full border border-[#D5C2AD] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Left Column: Image Gallery with Multi-picture support */}
            <div className="md:col-span-5 bg-[#1C1417] relative flex flex-col justify-between">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-900">
                {/* Layered images with smooth cross-fade transition */}
                {allImages.map((imgUrl, i) => {
                  const isCur = i === (selectedImageIndex % allImages.length);
                  return (
                    <img
                      key={`modal-img-${product.id}-${i}`}
                      src={imgUrl}
                      alt={`${product.name} - shade ${i + 1}`}
                      referrerPolicy="no-referrer"
                      className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-in-out ${
                        isCur
                          ? 'opacity-100 z-10 scale-100'
                          : 'opacity-0 z-0 scale-105 pointer-events-none'
                      }`}
                    />
                  );
                })}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />

                {/* Central OUT OF STOCK Image Stamp */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] flex items-center justify-center z-15 pointer-events-none">
                    <div className="bg-[#4A0E17]/95 text-white font-mono font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-md border-2 border-[#C5A059] shadow-2xl flex items-center gap-2 transform -rotate-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>OUT OF STOCK</span>
                    </div>
                  </div>
                )}

                {/* Top Left Floating Ribbon: Out of Stock or Discount */}
                {isOutOfStock ? (
                  <div className="absolute top-3 left-3 z-20 bg-[#991B1B] text-white px-3 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 border border-white/30 animate-in fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>OUT OF STOCK</span>
                  </div>
                ) : hasDiscount ? (
                  <div className="absolute top-3 left-3 z-10 bg-[#991B1B] text-white px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase shadow-md flex items-center gap-1 border border-white/20">
                    <Tag className="w-3 h-3 text-[#E5C378]" />
                    <span>-{discountPercent}% OFF</span>
                  </div>
                ) : null}

                {/* Navigation arrows if multiple images */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-mono text-[#E5C378] z-10">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Strip for Multiple Pictures */}
              {allImages.length > 1 && (
                <div className="p-2.5 bg-[#140E10] border-t border-[#2D2124] flex items-center gap-2 overflow-x-auto">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={`modal-thumb-${product.id}-${idx}`}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-12 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-[#C5A059] ring-2 ring-[#C5A059]/40 scale-105'
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Full Craftsmanship, Size Selector & Order Spec */}
            <div className="md:col-span-7 p-6 sm:p-8 space-y-5 max-h-[88vh] overflow-y-auto">
              
              {/* Discount Highlight Header Banner if on sale */}
              {hasDiscount && (
                <div className="p-3 bg-[#FDF2F2] border border-[#F87171]/40 rounded-xl flex items-center justify-between text-left text-xs animate-in fade-in">
                  <div className="flex items-center gap-2 text-[#991B1B] font-bold">
                    <span className="w-6 h-6 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-[11px] shrink-0 font-mono">
                      %
                    </span>
                    <div>
                      <div>Special Studio Discount: {discountPercent}% OFF</div>
                      <div className="text-[10px] font-normal text-stone-600 font-mono">
                        Save PKR {savingsPKR.toLocaleString()} (${savingsUSD.toLocaleString()} USD) on this heirloom
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-[#991B1B] text-white text-[10px] font-mono font-bold rounded uppercase shrink-0">
                    Limited Time
                  </span>
                </div>
              )}

              {/* Title & Metadata */}
              <div className="space-y-2 text-left">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#997A3D]">
                  <span>{product.occasion || 'Barat'} Heirloom</span>
                  {product.silhouette && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{product.silhouette}</span>
                    </>
                  )}
                  {product.fabric && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{product.fabric}</span>
                    </>
                  )}
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#360810] font-semibold">
                    {product.name}
                  </h2>
                  {product.urduName && (
                    <span className="font-serif text-xl text-[#997A3D] font-bold shrink-0">
                      {product.urduName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-[#78655E] pt-0.5">
                  <span className="font-mono">Handcrafted in {deliveryWeeks} Weeks</span>
                  {product.colorway && (
                    <>
                      <span>·</span>
                      <span className="text-[#5C4942]">{product.colorway}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-xs sm:text-sm text-[#5C4942] leading-relaxed text-left">
                  {product.description}
                </p>
              )}

              {/* Size Selection Section with AHK Bridal Studio Size Guide */}
              <div className="p-4 bg-[#F7F2EC] rounded-2xl border border-[#DECDBB] space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#360810]">
                      Select Bridal Size:
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

                {/* Size Radio Tiles: S, M, L, XL */}
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
                        className={`py-2.5 px-2 rounded-xl text-center font-mono transition-all cursor-pointer border ${
                          !isAvailable
                            ? 'opacity-35 bg-stone-100 border-stone-200 cursor-not-allowed'
                            : isCurrent
                            ? 'bg-[#4A0E17] text-white border-[#C5A059] shadow-md ring-2 ring-[#C5A059]'
                            : 'bg-white text-[#360810] border-[#D5C2AD] hover:border-[#C5A059]'
                        }`}
                      >
                        <div className="text-sm font-bold flex items-center justify-center gap-1">
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
                    <div className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0" />
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
                  <div className="p-2.5 bg-white/80 rounded-xl border border-[#E3D6C8] text-[11px] font-mono text-[#5C4942]">
                    <div className="text-[10px] uppercase text-[#997A3D] font-bold">
                      Size {selectedSize} Tailoring Specs (Inches):
                    </div>
                    <div className="mt-0.5 text-[#360810] font-semibold">
                      {currentSizeSpecs}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Selection Section (ONLY shown if multiple colors are available) */}
              {hasMultipleColors && (
                <div className="p-4 bg-[#F7F2EC] rounded-2xl border border-[#DECDBB] space-y-3 text-left animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#C5A059]" />
                      <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#360810]">
                        Select Outfit Colorway:
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#997A3D]">
                      {colors.length} shades available
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {colors.map((colorName, cIdx) => {
                      const isSelected = selectedColor === colorName;
                      return (
                        <button
                          key={`modal-col-${colorName}-${cIdx}`}
                          type="button"
                          onClick={() => {
                            setSelectedColor(colorName);
                            const colorIdx = colors.indexOf(colorName);
                            if (colorIdx >= 0 && colorIdx < allImages.length) {
                              setSelectedImageIndex(colorIdx);
                            }
                          }}
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
                    Chosen shade: <span className="font-bold text-[#360810]">{selectedColor}</span>
                  </div>
                </div>
              )}

              {/* Craft Details Box (Optional) */}
              {craftDetails && (
                <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#E0D2C3] space-y-2 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#4A0E17] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Heirloom Craftsmanship Notes</span>
                  </div>
                  <p className="text-xs text-[#68554E] leading-relaxed">
                    {craftDetails}
                  </p>
                </div>
              )}

              {/* Inclusions List (Optional) */}
              {inclusions && inclusions.length > 0 && (
                <div className="space-y-2 text-left">
                  <div className="text-xs uppercase tracking-wider text-[#78655E] font-medium">
                    Ensemble Inclusions
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C4942]">
                    {inclusions.map((inc, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price & Action Module */}
              <div className="pt-5 border-t border-[#E8DCCB] space-y-4">
                <div className="flex items-end justify-between">
                  <div className="text-left space-y-0.5">
                    <div className="text-[10px] uppercase tracking-wider text-[#917E76]">
                      {hasDiscount ? 'Special Sale Price (PKR)' : 'Price (PKR)'}
                    </div>

                    <div className="flex items-baseline gap-2">
                      {hasDiscount && (
                        <span className="text-sm font-mono text-stone-400 line-through">
                          PKR {basePricePKR.toLocaleString()}
                        </span>
                      )}
                      <span className={`font-serif text-2xl sm:text-3xl font-bold ${
                        hasDiscount ? 'text-[#991B1B]' : 'text-[#4A0E17]'
                      }`}>
                        PKR {activePricePKR.toLocaleString()}
                      </span>
                    </div>

                    {hasDiscount && (
                      <div className="text-[11px] font-mono text-emerald-700 font-semibold">
                        You save PKR {savingsPKR.toLocaleString()} ({discountPercent}% OFF)
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="text-[10px] uppercase tracking-wider text-[#917E76]">International USD</div>
                    <div className="flex items-baseline justify-end gap-1.5">
                      {hasDiscount && (
                        <span className="text-xs font-mono text-stone-400 line-through">
                          ${basePriceUSD.toLocaleString()}
                        </span>
                      )}
                      <span className="font-mono text-base font-semibold text-[#68554E]">
                        ${activePriceUSD.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Studio Stock Inventory Status */}
                {isOutOfStock ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-900 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      <span className="font-bold">Currently Out of Stock in Studio Inventory</span>
                    </div>
                    <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-semibold">0 Available</span>
                  </div>
                ) : typeof product.stock === 'number' && product.stock <= 2 ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Low Stock Notice</span>
                    </div>
                    <span className="font-bold">Only {product.stock} {product.stock === 1 ? 'piece' : 'pieces'} remaining in stock</span>
                  </div>
                ) : null}

                {/* Action Buttons: Add to Cart & Direct Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    disabled={isOutOfStock}
                    onClick={isOutOfStock ? undefined : handleAdd}
                    className={`py-3.5 px-4 text-xs uppercase tracking-wider font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                      isOutOfStock
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                        : 'bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] cursor-pointer'
                    }`}
                  >
                    {isOutOfStock ? (
                      <span>Out of Stock</span>
                    ) : added ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>In Cart (Size {selectedSize})</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#E5C378]" />
                        <span>Add to Cart (Size {selectedSize})</span>
                      </>
                    )}
                  </button>

                  <button
                    disabled={isOutOfStock}
                    onClick={isOutOfStock ? undefined : handleDirectOrder}
                    className={`py-3.5 px-4 text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                      isOutOfStock
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                        : 'bg-[#C5A059] hover:bg-[#B38728] text-[#1C1417] cursor-pointer'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#1C1417]" />
                    <span>{isOutOfStock ? 'Item Unavailable' : `Order Now (Size ${selectedSize})`}</span>
                  </button>
                </div>

                <div className="pt-1 text-center">
                  <button
                    onClick={() => {
                      onClose();
                      onContactStylist(`Inquiry regarding ordering: ${product.name} (Size ${selectedSize})`);
                    }}
                    className="text-xs text-[#78655E] hover:text-[#4A0E17] underline underline-offset-4 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Questions about custom sizing or delivery timeline? Contact Us</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal Popup */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        selectedSize={selectedSize}
        onSelectSize={(s) => setSelectedSize(s)}
      />
    </>
  );
};
