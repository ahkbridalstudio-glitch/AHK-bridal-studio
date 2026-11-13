import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  X,
  ShoppingBag,
  Eye,
  MessageCircle,
  Sparkles,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { BridalProduct } from '../types/bridal';
import { CarouselSlide } from '../types/admin';
import { api } from '../services/api';

interface BridalPictureCarouselProps {
  slides?: CarouselSlide[];
  products?: BridalProduct[];
  onSelectProduct?: (product: BridalProduct) => void;
  onAddToCart?: (product: BridalProduct) => void;
  onExploreCollection?: () => void;
}

export const BridalPictureCarousel: React.FC<BridalPictureCarouselProps> = ({
  slides: propSlides,
  products: propProducts,
  onSelectProduct,
  onAddToCart,
  onExploreCollection,
}) => {
  const [internalSlides, setInternalSlides] = useState<CarouselSlide[]>(propSlides || []);

  // Sync with propSlides if provided
  useEffect(() => {
    if (propSlides && propSlides.length > 0) {
      setInternalSlides(propSlides);
    }
  }, [propSlides]);

  // Fetch from MongoDB API on mount if no prop passed
  useEffect(() => {
    if (!propSlides || propSlides.length === 0) {
      api.getCarouselSlides()
      .then((fetched) => {
          if (Array.isArray(fetched)) setInternalSlides(fetched);
        })
        .catch((err) => {
          console.warn('[Carousel] Could not fetch slides from MongoDB:', err);
        });
    }
  }, [propSlides]);

  // Filter out any slides marked as 'Draft', or derive from database products
  const activeSlides = React.useMemo<CarouselSlide[]>(() => {
    const list = internalSlides.filter((s) => s.status !== 'Draft');
    if (list.length > 0) return list;
    if (propProducts && propProducts.length > 0) {
      return propProducts.slice(0, 8).map((p, idx): CarouselSlide => ({
        id: `slide-${p.id || idx}`,
        productId: p.id,
        title: p.name,
        urduTitle: p.urduName || 'شاہی عروسی شاہکار',
        occasion: p.occasion,
        fabric: p.fabric || 'Pure Katan Raw Silk',
        image: p.image,
        secondaryImage: p.secondaryImage || (p.images && p.images[0]) || p.image,
        embroidery: p.embroidery || [],
        pricePKR: p.pricePKR,
        priceUSD: p.priceUSD,
        description: p.description || p.name,
        colorway: p.colorway || 'Imperial Red & Antique Gold',
      }));
    }
    return [];
  }, [internalSlides, propProducts]);

  const totalSlides = activeSlides.length;

  // Cloned slides for infinite seamless looping: [clone of last, ...real slides, clone of first]
  const displaySlides = React.useMemo(() => {
    if (totalSlides === 0) return [];
    const first = activeSlides[0];
    const last = activeSlides[totalSlides - 1];
    return [
      { ...last, _cloneKey: 'clone-last' },
      ...activeSlides.map((s, idx) => ({ ...s, _cloneKey: `real-${s.id || idx}` })),
      { ...first, _cloneKey: 'clone-first' }
    ];
  }, [activeSlides, totalSlides]);

  const [trackIndex, setTrackIndex] = useState(1); // 1 = first real slide
  const [withTransition, setWithTransition] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  const SLIDE_DURATION = 5000; // 5 seconds per slide

  // Active logical slide index (0 to totalSlides - 1)
  const logicalIndex = trackIndex === 0
    ? totalSlides - 1
    : trackIndex === totalSlides + 1
    ? 0
    : trackIndex - 1;

  const currentSlide = activeSlides[logicalIndex] || activeSlides[0];

  // Re-enable CSS transition after instantaneous reset
  useEffect(() => {
    if (!withTransition) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [withTransition]);

  const nextSlide = useCallback(() => {
    setWithTransition(true);
    setTrackIndex((prev) => prev + 1);
    setProgressPercent(0);
  }, []);

  const prevSlide = useCallback(() => {
    setWithTransition(true);
    setTrackIndex((prev) => prev - 1);
    setProgressPercent(0);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setWithTransition(true);
    setTrackIndex(index + 1);
    setProgressPercent(0);
  }, []);

  // When transition ends on the slider track
  const handleTransitionEnd = () => {
    if (trackIndex >= totalSlides + 1) {
      // Reached clone of first slide -> seamlessly reset to real first slide (index 1) with 0ms transition
      setWithTransition(false);
      setTrackIndex(1);
    } else if (trackIndex <= 0) {
      // Reached clone of last slide -> seamlessly reset to real last slide with 0ms transition
      setWithTransition(false);
      setTrackIndex(totalSlides);
    }
  };

  // Handle Autoplay & Progress Ring
  useEffect(() => {
    if (!isPlaying || isHovered || isDragging || lightboxOpen) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const increment = (stepMs / SLIDE_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, isHovered, isDragging, lightboxOpen, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') setLightboxOpen(false);
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
        return;
      }
      if (isHovered) {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, lightboxOpen, nextSlide, prevSlide]);

  // Touch & Drag Handling for Silky Smooth Swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    const diff = e.touches[0].clientX - dragStartX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (dragStartX !== null) {
      if (dragOffset < -60) {
        nextSlide();
      } else if (dragOffset > 60) {
        prevSlide();
      }
    }
    setDragStartX(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartX === null || !isDragging) return;
    const diff = e.clientX - dragStartX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (dragStartX !== null && isDragging) {
      if (dragOffset < -80) {
        nextSlide();
      } else if (dragOffset > 80) {
        prevSlide();
      }
    }
    setDragStartX(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  // WhatsApp quick inquiry handler
  const handleWhatsAppInquiry = (slide: CarouselSlide) => {
    const text = encodeURIComponent(
      `As-salamu alaykum AHK Bridal Studio! I am interested in inquiring about ${slide.title} (${slide.urduTitle}) for ${slide.occasion}. Please share availability and bespoke fitting dates at Dolmen Mall Tariq Road.`
    );
    window.open(`https://wa.me/923360333585?text=${text}`, '_blank');
  };

  // Safely resolve complete BridalProduct object for any slide with full inclusions & details
  const getSlideProduct = (slide: CarouselSlide): BridalProduct => {
    const foundInProps = (propProducts || []).find(
      (p) =>
        (slide.productId && p.id === slide.productId) ||
        p.id === slide.id ||
        (slide.title && p.name && p.name.toLowerCase() === slide.title.toLowerCase())
    );
    if (foundInProps) return foundInProps;
    return {
      id: slide.id || `carousel-${Date.now()}`,
      name: slide.title,
      urduName: slide.urduTitle || 'شاہی عروسی شاہکار',
      occasion: (slide.occasion as any) || 'Barat',
      silhouette: 'Royal Barat Lehenga',
      pricePKR: slide.pricePKR || 850000,
      priceUSD: slide.priceUSD || 3050,
      image: slide.image,
      secondaryImage: slide.secondaryImage || slide.image,
      fabric: (slide.fabric as any) || 'Pure Katan Raw Silk',
      embroidery: Array.isArray(slide.embroidery) && slide.embroidery.length > 0 ? slide.embroidery : ['Zardozi & Naqshi', 'Real 24k Gold Dabka'],
      colorway: slide.colorway || 'Imperial Red & Antique Gold',
      description: slide.description || slide.title,
      craftDetails: 'Handcrafted by fourth-generation Pakistani master karigars on traditional wooden kargahs in Karachi & Lahore.',
      inclusions: [
        'Hand-worked Embellished Skirt / Lehenga',
        'Couture Hand-embroidered Choli',
        'Dual Dupatta (Head Veil + Drape) with Kiran',
        'Velvet Potli Pouch & Garment Preservation Bag'
      ],
      deliveryWeeks: 8
    };
  };

  if (totalSlides === 0) {
    return null;
  }

  return (
    <section
      id="gallery"
      className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-[#FAF8F5] via-[#F4ECE3] to-[#FAF8F5] border-b border-[#E2D5C5] relative overflow-hidden select-none"
    >
      <div id="atelier" className="absolute -top-16 pointer-events-none" />
      {/* Background Subtle Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
          <circle cx="500" cy="500" r="450" fill="none" stroke="#4A0E17" strokeWidth="6" />
          <path
            d="M500,100 C600,300 700,400 900,500 C700,600 600,700 500,900 C400,700 300,600 100,500 C300,400 400,300 500,100 Z"
            fill="none"
            stroke="#4A0E17"
            strokeWidth="3"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#997A3D] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Grand Royal Couture Gallery</span>
            <span aria-hidden="true">·</span>
            <span>Atelier Karigari</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#360810] font-normal tracking-tight text-balance">
            Heirloom Bridal Masterpieces
          </h2>

          <p className="text-sm sm:text-base text-[#68554E] leading-relaxed max-w-2xl mx-auto">
            Immerse yourself in our cinematic gallery of hand-beaten dabka, pure katan silks, Banarasi jamawars, and shimmering tissue ensembles crafted by master karigars.
          </p>
        </div>

        {/* Main Carousel Wrapper */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            if (isDragging) handleMouseUp();
          }}
          className="relative rounded-2xl overflow-hidden bg-[#2D070E] shadow-2xl border border-[#D5C2AD] transition-all"
        >
          {/* Top Controls Bar */}
          <div className="absolute top-4 inset-x-4 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none">
            {/* Slide Index Badge */}
            <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#1A0307]/80 backdrop-blur-md border border-[#C5A059]/40 text-[#FAF8F5] text-xs font-mono tracking-wider flex items-center gap-2 shadow-lg">
              <span className="text-[#E5C378] font-bold">0{logicalIndex + 1}</span>
              <span className="text-stone-400">/</span>
              <span className="text-stone-300">0{totalSlides}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
            </div>

            {/* Right Action Icons (Play/Pause, Fullscreen Lightbox) */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 sm:p-2.5 rounded-full bg-[#1A0307]/80 backdrop-blur-md border border-[#C5A059]/40 text-[#E5C378] hover:text-white hover:bg-[#360810] transition-colors shadow-lg cursor-pointer"
                title={isPlaying ? 'Pause Autoplay' : 'Resume Autoplay'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={() => {
                  setLightboxZoom(1);
                  setLightboxOpen(true);
                }}
                className="p-2 sm:p-2.5 rounded-full bg-[#1A0307]/80 backdrop-blur-md border border-[#C5A059]/40 text-[#E5C378] hover:text-white hover:bg-[#360810] transition-colors shadow-lg cursor-pointer"
                title="View Fullscreen High-Res Image"
                aria-label="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Picture Slides Track with Infinite Seamless Looping */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`relative w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/10] overflow-hidden cursor-grab ${
              isDragging ? 'cursor-grabbing' : ''
            }`}
          >
            <div
              onTransitionEnd={handleTransitionEnd}
              className="flex w-full h-full transition-transform ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                transform: `translateX(calc(-${trackIndex * 100}% + ${dragOffset}px))`,
                transitionDuration: isDragging || !withTransition ? '0ms' : '750ms'
              }}
            >
              {displaySlides.map((slide, idx) => {
                const slideProduct = getSlideProduct(slide);
                const isOutOfStock = typeof slideProduct?.stock === 'number' && slideProduct.stock <= 0;

                return (
                  <div key={slide._cloneKey || idx} className="relative min-w-full w-full h-full shrink-0 overflow-hidden">
                    {/* Background Image */}
                    <img
                      src={slide.image}
                      alt={slide.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top sm:object-center select-none pointer-events-none"
                      loading={idx <= 2 ? 'eager' : 'lazy'}
                    />

                    {/* Central OUT OF STOCK Stamp for Carousel Slide */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] flex items-center justify-center z-15 pointer-events-none">
                        <div className="bg-[#4A0E17]/95 text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-widest px-4 py-2 rounded-md border-2 border-[#C5A059] shadow-2xl flex items-center gap-2 transform -rotate-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span>OUT OF STOCK</span>
                        </div>
                      </div>
                    )}

                    {/* Editorial Gradient Scrim Overlay for Perfect Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A0307] via-[#1A0307]/40 to-[#1A0307]/10" />
                    <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#1A0307]/80 via-transparent to-transparent" />

                    {/* Slide Content Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 lg:p-12 z-20 text-[#FAF8F5]">
                      <div className="max-w-2xl space-y-3 sm:space-y-4">
                        {/* Meta Tags: Occasion & Urdu Calligraphy */}
                        <div className="flex flex-wrap items-center gap-3">
                          {isOutOfStock && (
                            <span className="px-3 py-1 rounded bg-[#991B1B] text-white border border-white/30 text-xs font-mono font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 animate-in fade-in">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>OUT OF STOCK</span>
                            </span>
                          )}
                          <span className="px-3 py-1 rounded bg-[#C5A059]/20 border border-[#C5A059]/50 text-[#E5C378] text-xs font-semibold uppercase tracking-wider">
                            {slide.occasion}
                          </span>
                          <span className="font-serif text-lg sm:text-2xl text-[#E5C378] tracking-widest font-normal">
                            {slide.urduTitle}
                          </span>
                        </div>

                      {/* Main Title */}
                      <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#FAF8F5] leading-tight font-normal drop-shadow-md">
                        {slide.title}
                      </h3>

                      {/* Description & Fabric */}
                      <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
                        {slide.description}
                      </p>

                      {/* Embroidery & Details */}
                      {Array.isArray(slide.embroidery) && slide.embroidery.length > 0 && (
                        <div className="hidden sm:flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-300">
                          <span className="text-[#C5A059] font-medium">Crafted with:</span>
                          {slide.embroidery.map((emb, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-white/10 text-stone-200 text-[11px] border border-white/10"
                            >
                              {emb}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions Strip */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {slide.pricePKR && (
                          <div className="mr-2">
                            <div className="font-mono text-lg sm:text-2xl font-bold text-[#E5C378]">
                              PKR {slide.pricePKR.toLocaleString()}
                            </div>
                            {slide.priceUSD && (
                              <div className="text-[11px] text-stone-300 font-mono">
                                Approx. ${slide.priceUSD.toLocaleString()} USD
                              </div>
                            )}
                          </div>
                        )}

                        {onAddToCart && (
                          <button
                            disabled={isOutOfStock}
                            onClick={() => {
                              if (isOutOfStock) return;
                              onAddToCart(slideProduct);
                            }}
                            className={`px-5 py-2.5 text-xs uppercase tracking-wider font-bold rounded shadow-lg transition-transform flex items-center gap-2 ${
                              isOutOfStock
                                ? 'bg-stone-300 text-stone-600 cursor-not-allowed border border-stone-400'
                                : 'bg-[#C5A059] hover:bg-[#d6af63] text-[#24050A] active:scale-95 cursor-pointer'
                            }`}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Trousseau'}</span>
                          </button>
                        )}

                        {onSelectProduct && (
                          <button
                            onClick={() => onSelectProduct(slideProduct)}
                            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs uppercase tracking-wider font-semibold rounded backdrop-blur-sm transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-[#E5C378]" />
                            <span>View Details</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleWhatsAppInquiry(slide)}
                          className="px-4 py-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs uppercase tracking-wider font-semibold rounded backdrop-blur-sm transition-colors flex items-center gap-2 cursor-pointer"
                          title="Direct WhatsApp Consultation with Bridal Stylist"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp Karigar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-[#1A0307]/70 hover:bg-[#4A0E17] text-[#FAF8F5] border border-[#C5A059]/50 shadow-xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5C378]" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-[#1A0307]/70 hover:bg-[#4A0E17] text-[#FAF8F5] border border-[#C5A059]/50 shadow-xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5C378]" />
          </button>

          {/* Autoplay Progress Line at Bottom */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30">
            <div
              className="h-full bg-gradient-to-r from-[#997A3D] via-[#C5A059] to-[#E5C378] transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom Bar: Dots Pagination & View Complete Collection Option (Ensemble preview removed as requested) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          {/* Subtle slide dot indicators */}
          <div className="flex items-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === logicalIndex
                    ? 'w-8 h-2.5 bg-gradient-to-r from-[#7A0C1E] to-[#C5A059] shadow-sm'
                    : 'w-2.5 h-2.5 bg-[#D5C2AD] hover:bg-[#997A3D]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* View Complete Collection Option */}
          {onExploreCollection && (
            <button
              onClick={onExploreCollection}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all border border-[#C5A059]/40 cursor-pointer"
            >
              <span>View Complete Collection</span>
              <ChevronRight className="w-4 h-4 text-[#E5C378]" />
            </button>
          )}
        </div>
      </div>

      {/* High-Resolution Lightbox Zoom Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 backdrop-blur-md animate-fadeIn">
          {/* Lightbox Header */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white z-20">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-[#E5C378]">
                  {currentSlide.occasion}
                </span>
                <span className="text-stone-400">·</span>
                <span className="font-serif text-lg text-[#E5C378]">{currentSlide.urduTitle}</span>
              </div>
              <h4 className="font-serif text-lg sm:text-xl text-white font-medium">{currentSlide.title}</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxZoom((prev) => Math.min(prev + 0.3, 2.5))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLightboxZoom((prev) => Math.max(prev - 0.3, 0.8))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLightboxZoom(1)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-[#7A0C1E] hover:bg-[#961228] text-white transition-colors ml-2"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image */}
          <div className="relative flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden my-4">
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-[#4A0E17] text-white border border-white/20 transition-transform hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-[#E5C378]" />
            </button>

            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-300 select-none"
              style={{ transform: `scale(${lightboxZoom})` }}
            />

            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-[#4A0E17] text-white border border-white/20 transition-transform hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 text-[#E5C378]" />
            </button>
          </div>

          {/* Lightbox Bottom Footer */}
          <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 text-xs text-stone-300 border-t border-white/15 pt-3 z-20">
            <div className="flex items-center gap-4">
              <span>{currentSlide.fabric}</span>
              <span>·</span>
              <span>{currentSlide.colorway}</span>
              <span>·</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleWhatsAppInquiry(currentSlide)}
                className="px-4 py-1.5 rounded bg-[#25D366] text-black font-semibold flex items-center gap-1.5 hover:bg-[#20ba59] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Atelier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
