import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Sliders, Eye, Clock, ArrowRight, ShoppingBag, Check, Search, X, RotateCcw, Tag, Ruler, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { BridalProduct, OccasionType, getProductColors } from '../types/bridal';

interface CollectionShowcaseProps {
  products?: BridalProduct[];
  onSelectProduct: (product: BridalProduct) => void;
  onCustomizeProduct: (product: BridalProduct) => void;
  onAddToCart: (product: BridalProduct) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const CollectionShowcase: React.FC<CollectionShowcaseProps> = ({
  products = [],
  onSelectProduct,
  onCustomizeProduct,
  onAddToCart,
  searchQuery: externalSearchQuery,
  onSearchChange,
}) => {
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [internalSearchQuery, setInternalSearchQuery] = useState(externalSearchQuery || '');

  // Synchronize with external query if provided
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setInternalSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const handleSearchChange = (query: string) => {
    setInternalSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  // Filter products by occasion and search query
  const filteredProducts = products.filter((product) => {
    // Occasion match
    const matchesOccasion = selectedOccasion === 'All' || product.occasion === selectedOccasion;
    if (!matchesOccasion) return false;

    // Search query match
    const query = internalSearchQuery.trim().toLowerCase();
    if (!query) return true;

    const matchName = product.name?.toLowerCase().includes(query) ?? false;
    const matchUrdu = product.urduName?.toLowerCase().includes(query) ?? false;
    const matchFabric = product.fabric?.toLowerCase().includes(query) ?? false;
    const matchOccasionText = product.occasion?.toLowerCase().includes(query) ?? false;
    const matchSilhouette = product.silhouette?.toLowerCase().includes(query) ?? false;
    const matchColorway = product.colorway?.toLowerCase().includes(query) ?? false;
    const matchDescription = product.description?.toLowerCase().includes(query) ?? false;
    const matchEmbroidery = product.embroidery?.some((e) => e.toLowerCase().includes(query)) ?? false;

    return (
      matchName ||
      matchUrdu ||
      matchFabric ||
      matchOccasionText ||
      matchSilhouette ||
      matchColorway ||
      matchDescription ||
      matchEmbroidery
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.pricePKR - b.pricePKR;
    if (sortBy === 'price-desc') return b.pricePKR - a.pricePKR;
    return 0;
  });

  const handleQuickAdd = (product: BridalProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 2000);
  };

  const handleResetFilters = () => {
    handleSearchChange('');
    setSelectedOccasion('All');
  };

  return (
    <section id="collection" className="py-16 lg:py-24 bg-[#FAF8F5] border-b border-[#E8DCCB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#997A3D] font-medium">
              <span>Grand Wedding Catalog</span>
              <span aria-hidden="true">·</span>
              <span>2026 Collection</span>
            </div>
           <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#360810] font-normal tracking-tight">
              Curated Imperial Bridal Suits
            </h2>
            <p className="text-sm sm:text-base text-[#68554E] leading-relaxed">
              From the iconic crimson Barat jora crusted in gold dabka to luminous pastel Walima gowns and vibrant Mehndi angrakhas—each suit is an heirloom ready to order or customize.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-start md:self-end text-xs shrink-0">
            <span className="text-[#78655E]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F5EFEB] border border-[#D5C2AD] rounded-md px-3 py-1.5 text-xs text-[#360810] font-medium focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
            >
              <option value="featured">Featured Heirlooms</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Search Bar & Filter Controls Bar */}
        <div className="bg-[#F7F2EC] border border-[#E8DCCB] rounded-xl p-3 sm:p-4 mb-8 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Direct Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#997A3D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={internalSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search collection (e.g., velvet, barat, zardozi, red)..."
                className="w-full bg-white text-xs text-[#360810] placeholder:text-[#917E76] rounded-lg pl-9 pr-8 py-2 border border-[#DECDBB] focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059] shadow-xs"
              />
              {internalSearchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#917E76] hover:text-[#4A0E17] rounded-full"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Count & Clear Search status */}
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
              <span className="font-mono text-[#78655E] text-[11px]">
                Showing <strong className="text-[#4A0E17] font-bold">{sortedProducts.length}</strong> of {products.length} heirlooms
              </span>
              {(internalSearchQuery || selectedOccasion !== 'All') && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#8C2333] hover:text-[#4A0E17] transition-colors ml-1 px-2 py-1 rounded bg-[#FAF0E1] border border-[#DECDBB]"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Occasion Filter Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pt-2 border-t border-[#E8DCCB]/60">
            {(['All', 'Barat', 'Walima', 'Mehndi', 'Nikah'] as OccasionType[]).map((occ) => {
              const isActive = selectedOccasion === occ;
              return (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasion(occ)}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-medium uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#4A0E17] text-[#FAF8F5] shadow-xs font-semibold'
                      : 'text-[#68554E] hover:text-[#4A0E17] hover:bg-[#EFE7DE]'
                  }`}
                >
                  {occ === 'All' ? 'All Occasions' : `${occ} Ceremony`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty Search State */}
        {sortedProducts.length === 0 && (
          <div className="py-16 px-4 bg-white rounded-2xl border border-dashed border-[#D5C2AD] text-center max-w-lg mx-auto my-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF0E1] text-[#7A0C1E] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-semibold text-[#360810]">
                No matching bridal heirlooms found
              </h3>
              <p className="text-xs text-[#78655E] max-w-sm mx-auto leading-relaxed">
                We could not find any bridal outfits matching &ldquo;{internalSearchQuery}&rdquo; {selectedOccasion !== 'All' ? `under ${selectedOccasion}` : ''}.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#4A0E17] hover:bg-[#681421] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Show All Bridal Outfits
              </button>
            </div>
          </div>
        )}


        {/* 3-Column Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProducts.map((product) => (
            <ProductCardItem
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onQuickAdd={handleQuickAdd}
              isRecentlyAdded={recentlyAddedId === product.id}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

interface ProductCardItemProps {
  product: BridalProduct;
  onSelectProduct: (product: BridalProduct) => void;
  onAddToCart: (product: BridalProduct) => void;
  onQuickAdd: (product: BridalProduct, e: React.MouseEvent) => void;
  isRecentlyAdded: boolean;
}

const ProductCardItem: React.FC<ProductCardItemProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  onQuickAdd,
  isRecentlyAdded,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Collect all available pictures
  const pictures = React.useMemo(() => {
    const list: string[] = [];
    if (product.image) {
      list.push(product.image);
    }
    if (product.secondaryImage) {
      list.push(product.secondaryImage);
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      list.push(...product.images.filter(Boolean));
    }
    const unique = Array.from(new Set(list.filter(Boolean)));
    return unique.length > 0 ? unique : [product.image].filter(Boolean);
  }, [product.image, product.secondaryImage, product.images]);

  const colors = getProductColors(product);
  const hasMultipleColors = colors.length > 1;
  const hasMultiplePictures = pictures.length > 1;
  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;

  // Automatically cycle through pictures every 5.5 seconds (5-6s) smoothly (not on hover)
  useEffect(() => {
    if (pictures.length <= 1) return;

    // Organic stagger offset so cards across the catalog don't switch on the exact same millisecond
    let hash = 0;
    const str = product.id || product.name || '';
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
    }
    const initialDelay = Math.abs(hash % 1500); // 0-1500ms stagger

    let intervalId: any = null;
    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        setCurrentImgIndex((prev) => (prev + 1) % pictures.length);
      }, 5500); // Smooth transition every 5.5 seconds (5-6 seconds)
    }, initialDelay);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [pictures.length, product.id, product.name]);

  // Safe active image index
  const activeImage = pictures[currentImgIndex % pictures.length] || product.image;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % pictures.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + pictures.length) % pictures.length);
  };

  const selectImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex(index);
  };

  // Pricing calculations
  const isDiscounted = Boolean(product.isDiscounted || (product.discountPercent && product.discountPercent > 0));
  const discountPct = product.discountPercent || 0;
  const originalPkr = product.originalPricePKR && product.originalPricePKR > 0 ? product.originalPricePKR : product.pricePKR;
  const originalUsd = product.originalPriceUSD && product.originalPriceUSD > 0 ? product.originalPriceUSD : product.priceUSD;
  const salePkr = isDiscounted && discountPct > 0
    ? (product.discountPricePKR && product.discountPricePKR > 0 ? product.discountPricePKR : Math.round(originalPkr * (1 - discountPct / 100)))
    : product.pricePKR;
  const saleUsd = isDiscounted && discountPct > 0
    ? (product.discountPriceUSD && product.discountPriceUSD > 0 ? product.discountPriceUSD : Math.round(originalUsd * (1 - discountPct / 100)))
    : product.priceUSD;
  const savingsPkr = isDiscounted ? Math.max(0, originalPkr - salePkr) : 0;
  const sizes = product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes : ['S', 'M', 'L', 'XL'];

  const preparedProduct: BridalProduct = {
    ...product,
    pricePKR: salePkr,
    priceUSD: saleUsd,
    originalPricePKR: originalPkr,
    originalPriceUSD: originalUsd,
    discountPercent: isDiscounted ? discountPct : 0,
    isDiscounted,
    image: activeImage,
    selectedColor: colors[currentImgIndex % colors.length] || product.selectedColor || undefined,
  };

  return (
    <div
      className={`group bg-[#FAF8F5] rounded-xl overflow-hidden border transition-all hover:shadow-xl flex flex-col justify-between ${
        isDiscounted ? 'border-[#F87171]/50 hover:border-[#991B1B]' : 'border-[#E0D2C3] hover:border-[#C5A059]'
      }`}
    >
      {/* Product Card Image with Seamless Cross-fade Color Transition */}
      <div 
        onClick={() => onSelectProduct(preparedProduct)}
        className="relative aspect-[4/5] bg-[#E8DDD1] overflow-hidden cursor-pointer select-none"
      >
        {/* Layered images with smooth 900ms crossfade transition */}
        {pictures.map((picUrl, pIdx) => {
          const isVisible = pIdx === (currentImgIndex % pictures.length);
          return (
            <img
              key={`card-img-${product.id}-${pIdx}`}
              src={picUrl}
              alt={`${product.name} - shade ${pIdx + 1}`}
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-900 ease-in-out group-hover:scale-105 ${
                isVisible
                  ? 'opacity-100 z-10 scale-100'
                  : 'opacity-0 z-0 scale-102 pointer-events-none'
              }`}
            />
          );
        })}

        {/* Subtle scrim overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity z-10 pointer-events-none" />

        {/* Central OUT OF STOCK Image Stamp */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] flex items-center justify-center z-15 pointer-events-none">
            <div className="bg-[#4A0E17]/95 text-white font-mono font-bold text-xs uppercase tracking-widest px-3.5 py-1.5 rounded-md border-2 border-[#C5A059] shadow-2xl flex items-center gap-2 transform -rotate-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>OUT OF STOCK</span>
            </div>
          </div>
        )}

        {/* Badges on Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-20">
          {/* Out of Stock Label */}
          {isOutOfStock && (
            <div className="bg-[#991B1B] text-white px-2.5 py-1 rounded text-[11px] font-mono tracking-wider uppercase font-bold shadow-md border border-white/30 flex items-center gap-1.5 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>OUT OF STOCK</span>
            </div>
          )}

          {/* Occasion Tag */}
          <div className="bg-[#FAF8F5]/90 backdrop-blur-sm text-[#4A0E17] px-2.5 py-1 rounded text-[11px] font-mono tracking-wider uppercase font-semibold">
            {product.occasion}
          </div>

          {/* Multiple Colors Transition Badge */}
          {hasMultipleColors && (
            <div className="bg-[#1A0307]/85 backdrop-blur-sm text-[#E5C378] px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border border-[#C5A059]/40 flex items-center gap-1 shadow-xs transition-all duration-300">
              <Palette className="w-2.5 h-2.5 text-[#E5C378] animate-pulse" />
              <span>{colors.length} Colorways</span>
            </div>
          )}

          {/* Special Discount Ribbon Badge */}
          {isDiscounted && (
            <div className="bg-[#991B1B] text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase shadow-md flex items-center gap-1 border border-white/20 animate-in fade-in">
              <Tag className="w-2.5 h-2.5 text-[#E5C378]" />
              <span>-{discountPct}% OFF</span>
            </div>
          )}
        </div>

        {/* Urdu Name Stamp */}
        <div className="absolute top-3 right-3 text-[#FAF8F5]/90 text-sm font-serif font-bold z-20 drop-shadow">
          {product.urduName}
        </div>

        {/* Inline Card Carousel Controls (for items with multiple pictures/colors) */}
        {hasMultiplePictures && (
          <>
            {/* Left Prev Arrow */}
            <button
              onClick={prevImage}
              aria-label="Previous picture"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-[#4A0E17] text-[#FAF8F5] border border-white/30 backdrop-blur-sm transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-md cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-[#E5C378]" />
            </button>

            {/* Right Next Arrow */}
            <button
              onClick={nextImage}
              aria-label="Next picture"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-[#4A0E17] text-[#FAF8F5] border border-white/30 backdrop-blur-sm transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-md cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-[#E5C378]" />
            </button>

            {/* Bottom Dots Indicator */}
            <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
              <div className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm flex items-center gap-1.5 border border-white/20">
                {pictures.map((_, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={(e) => selectImage(pIdx, e)}
                    className={`transition-all rounded-full cursor-pointer ${
                      pIdx === (currentImgIndex % pictures.length)
                        ? 'w-4 h-1.5 bg-[#E5C378]'
                        : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Picture ${pIdx + 1} of ${pictures.length}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Hover Quick View (if only 1 picture) */}
        {!hasMultiplePictures && (
          <div className="absolute bottom-4 inset-x-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="py-2 px-4 bg-[#FAF8F5]/95 text-[#360810] text-xs font-semibold uppercase tracking-wider rounded-md shadow-sm flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>View Ensemble Details</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Metadata & Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2 text-left">
          {/* Clean unboxed metadata with separators */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#8C766C] font-mono uppercase tracking-wider">
            {product.fabric && <span>{product.fabric}</span>}
            {product.silhouette && (
              <>
                <span aria-hidden="true">·</span>
                <span>{product.silhouette}</span>
              </>
            )}
          </div>

          <h3 
            onClick={() => onSelectProduct(preparedProduct)}
            className="font-serif text-lg font-semibold text-[#360810] group-hover:text-[#7A0C1E] transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Multiple Colors Available Row with Active Highlight & Smooth Transition Triggers */}
          {hasMultipleColors && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-mono uppercase text-[#917E76] flex items-center gap-1">
                <Palette className="w-3 h-3 text-[#C5A059]" />
                <span>Colors:</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {colors.map((colorName, idx) => {
                  const isCurrent = idx === (currentImgIndex % colors.length);
                  return (
                    <button
                      type="button"
                      key={`card-col-${product.id}-${colorName}-${idx}`}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        if (idx < pictures.length) setCurrentImgIndex(idx);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (idx < pictures.length) setCurrentImgIndex(idx);
                      }}
                      className={`px-2.5 py-0.5 text-[10px] font-mono capitalize rounded-md border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-[#360810] text-[#E5C378] border-[#C5A059] shadow-xs font-semibold ring-1 ring-[#C5A059]/50 scale-105'
                          : 'bg-[#FAF4ED] text-[#4A0E17] border-[#E4D5C5] hover:border-[#C5A059] hover:bg-[#F3E8DB]'
                      }`}
                      title={`Transition to ${colorName}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                          isCurrent ? 'bg-[#E5C378]' : 'bg-[#C5A059]'
                        }`}
                      />
                      <span>{colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Sizes Pills */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] font-mono uppercase text-[#917E76]">Sizes:</span>
            <div className="flex items-center gap-1">
              {sizes.map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-0.5 bg-[#F2EDE6] text-[#360810] text-[10px] font-mono font-bold rounded border border-[#E0D2C3]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#68554E] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Add to Cart / Order Row */}
        <div className="pt-3 border-t border-[#E8DCCB] space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="text-left space-y-0.5">
              <div className="text-[10px] uppercase tracking-wider text-[#917E76]">
                {isDiscounted ? 'Special Sale Price' : 'Price (PKR / USD)'}
              </div>
              
              <div className="flex items-baseline gap-2">
                {isDiscounted && (
                  <span className="text-xs font-mono text-stone-400 line-through">
                    PKR {originalPkr.toLocaleString()}
                  </span>
                )}
                <span className={`font-mono text-sm sm:text-base font-bold tabular-nums ${
                  isDiscounted ? 'text-[#991B1B]' : 'text-[#4A0E17]'
                }`}>
                  PKR {salePkr.toLocaleString()}
                </span>
                <span className="text-xs font-normal text-stone-500">
                  (${saleUsd})
                </span>
              </div>

              {isDiscounted && (
                <div className="text-[10px] font-mono text-emerald-700 font-semibold">
                  Save PKR {savingsPkr.toLocaleString()} ({discountPct}% OFF)
                </div>
              )}
            </div>
          </div>

          {/* Explicit Add to Cart Button */}
          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              if (isOutOfStock) {
                e.stopPropagation();
                return;
              }
              onQuickAdd(preparedProduct, e);
            }}
            className={`w-full py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 ${
              isOutOfStock
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed border border-stone-300 shadow-none'
                : isDiscounted
                ? 'bg-[#991B1B] hover:bg-[#7F1D1D] text-[#FAF8F5] cursor-pointer'
                : 'bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] cursor-pointer'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isRecentlyAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-[#E5C378]" />
                <span>Add to Cart & Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
