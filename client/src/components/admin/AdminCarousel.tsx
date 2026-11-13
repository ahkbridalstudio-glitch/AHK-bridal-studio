import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { CarouselSlide, AdminProduct } from '../../types/admin';

interface AdminCarouselProps {
  slides: CarouselSlide[];
  products: AdminProduct[];
  currency: 'PKR' | 'USD';
  onAddNewSlide: () => void;
  onEditSlide: (slide: CarouselSlide) => void;
  onDeleteSlide: (slideId: string) => void;
  onToggleStatus: (slide: CarouselSlide) => void;
  onMoveOrder: (slide: CarouselSlide, direction: 'up' | 'down') => void;
  onViewStorefront?: () => void;
}

export const AdminCarousel: React.FC<AdminCarouselProps> = ({
  slides,
  products,
  currency,
  onAddNewSlide,
  onEditSlide,
  onDeleteSlide,
  onToggleStatus,
  onMoveOrder,
  onViewStorefront,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Draft'>('All');
  const [deletingSlideId, setDeletingSlideId] = useState<string | null>(null);

  const formatAmount = (pkr?: number, usd?: number) => {
    if (!pkr) return 'Bespoke Quote';
    if (currency === 'USD' && usd) return `$${usd.toLocaleString()}`;
    return `PKR ${pkr.toLocaleString()}`;
  };

  // Filter slides
  const filteredSlides = [...slides]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((slide) => {
      const matchesSearch =
        slide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (slide.urduTitle && slide.urduTitle.includes(searchQuery)) ||
        slide.occasion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slide.fabric.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || slide.status === statusFilter || (!slide.status && statusFilter === 'Active');

      return matchesSearch && matchesStatus;
    });

  const activeCount = slides.filter((s) => s.status !== 'Draft').length;
  const draftCount = slides.filter((s) => s.status === 'Draft').length;

  const confirmDelete = (id: string) => {
    onDeleteSlide(id);
    setDeletingSlideId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-[#C5A059] tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grand Royal Couture Carousel</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Storefront Pictures Carousel
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Control the pictures, titles, Urdu calligraphy names, occasions, and prices showcased in the smooth storefront carousel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onViewStorefront && (
            <button
              onClick={onViewStorefront}
              className="px-3.5 py-2 bg-[#221B23] hover:bg-[#332734] text-stone-300 hover:text-white border border-[#3A2D37] rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Preview Carousel</span>
            </button>
          )}

          <button
            onClick={onAddNewSlide}
            className="px-4 py-2 bg-gradient-to-r from-[#C5A059] to-[#E5C378] hover:brightness-110 text-[#180E12] font-bold text-xs rounded-lg shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Carousel Slide</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1C161D] border border-[#2F2430]">
          <div className="text-[11px] font-mono text-stone-400 uppercase">Total Slides</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">{slides.length}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Configured in MongoDB</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1C161D] border border-[#2F2430]">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Live on Storefront</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-300 mt-1">{activeCount}</div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Rotating in 5s timer</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1C161D] border border-[#2F2430]">
          <div className="text-[11px] font-mono text-amber-400 uppercase">Drafts / Hidden</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-amber-300 mt-1">{draftCount}</div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">Not shown publicly</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1C161D] border border-[#2F2430]">
          <div className="text-[11px] font-mono text-[#C5A059] uppercase">Catalog Linked</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#E5C378] mt-1">
            {slides.filter((s) => s.productId).length}
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">With Add to Cart actions</div>
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
            placeholder="Search slides by title, urdu name, occasion, or fabric..."
            className="w-full bg-[#140F15] border border-[#3A2D37] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Status:</span>
          </span>
          {(['All', 'Active', 'Draft'] as const).map((st) => (
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

      {/* Carousel Slides List */}
      {filteredSlides.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1C161D] border border-[#2F2430] space-y-3">
          <ImageIcon className="w-12 h-12 text-[#C5A059] mx-auto opacity-50" />
          <h3 className="font-serif text-lg text-white">No Carousel Slides Found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {searchQuery
              ? `No slides match "${searchQuery}". Try clearing search filters.`
              : 'Add your first picture slide to show in the grand royal storefront carousel.'}
          </p>
          <button
            onClick={onAddNewSlide}
            className="px-4 py-2 bg-[#7A0C1E] hover:bg-[#961228] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slide Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlides.map((slide, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredSlides.length - 1;
            const isActive = slide.status !== 'Draft';

            return (
              <div
                key={slide.id}
                className={`rounded-xl overflow-hidden bg-[#181219] border transition-all duration-300 flex flex-col justify-between group ${
                  isActive ? 'border-[#332631] hover:border-[#C5A059]/60 shadow-lg' : 'border-amber-900/30 opacity-75'
                }`}
              >
                {/* Image Banner Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Order Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-[#C5A059]/40 text-[#E5C378] text-xs font-mono font-bold">
                    Slide #{slide.order ?? index + 1}
                  </div>

                  {/* Status Badge */}
                  <button
                    onClick={() => onToggleStatus(slide)}
                    className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all shadow-md ${
                      isActive
                        ? 'bg-emerald-500/80 hover:bg-emerald-600 text-black'
                        : 'bg-amber-500/80 hover:bg-amber-600 text-black'
                    }`}
                    title="Click to toggle Active / Draft"
                  >
                    {isActive ? 'Active' : 'Draft'}
                  </button>

                  {/* Floating Urdu Title on Image */}
                  <div className="absolute bottom-2.5 inset-x-3 flex items-end justify-between text-white">
                    <span className="px-2 py-0.5 rounded bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#E5C378] text-[10px] font-semibold uppercase tracking-wider">
                      {slide.occasion}
                    </span>
                    <span className="font-serif text-lg text-[#E5C378] tracking-widest font-normal drop-shadow">
                      {slide.urduTitle}
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-base font-bold text-white group-hover:text-[#E5C378] transition-colors leading-snug">
                      {slide.title}
                    </h3>
                    <p className="text-xs text-stone-300 font-medium truncate">
                      {slide.fabric}
                      {slide.colorway ? ` · ${slide.colorway}` : ''}
                    </p>
                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                      {slide.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Specs & Pricing */}
                  <div className="pt-2 border-t border-[#291F28] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-mono font-bold text-[#E5C378]">
                        {formatAmount(slide.pricePKR, slide.priceUSD)}
                      </div>
                    </div>

                    {slide.embroidery && slide.embroidery.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {slide.embroidery.slice(0, 3).map((emb, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-[#251B24] text-[10px] text-stone-300 border border-[#3A2D37]"
                          >
                            {emb}
                          </span>
                        ))}
                        {slide.embroidery.length > 3 && (
                          <span className="text-[10px] text-stone-500 self-center">
                            +{slide.embroidery.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-4 py-3 bg-[#130E14] border-t border-[#291F28] flex items-center justify-between gap-2">
                  {/* Sequence Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onMoveOrder(slide, 'up')}
                      disabled={isFirst}
                      className="p-1.5 rounded bg-[#1C161D] hover:bg-[#2F2430] disabled:opacity-30 disabled:cursor-not-allowed text-stone-400 hover:text-white transition-colors"
                      title="Move slide earlier in rotation"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveOrder(slide, 'down')}
                      disabled={isLast}
                      className="p-1.5 rounded bg-[#1C161D] hover:bg-[#2F2430] disabled:opacity-30 disabled:cursor-not-allowed text-stone-400 hover:text-white transition-colors"
                      title="Move slide later in rotation"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit and Delete Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditSlide(slide)}
                      className="px-3 py-1.5 rounded-lg bg-[#221B23] hover:bg-[#332734] text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Edit slide details & picture"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingSlideId(slide.id)}
                      className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition-colors"
                      title="Delete this carousel slide"
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
      {deletingSlideId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181219] border border-[#3A2D37] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-white">Delete Carousel Slide?</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to permanently delete this picture slide from the storefront carousel? This action will remove it from MongoDB.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingSlideId(null)}
                className="px-4 py-2 rounded-lg bg-[#221B23] hover:bg-[#332734] text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deletingSlideId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg"
              >
                Yes, Delete Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
