import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AdminProduct } from '../../types/admin';
import { getProductSlug } from '../../utils/productSlug';

interface ProductGridProps {
  products: AdminProduct[];
  emptyTitle?: string;
  emptyDescription?: string;
  wishlistIds?: string[];
  onToggleWishlist?: (id: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  emptyTitle = 'No pieces found',
  emptyDescription = 'Check back soon for new additions to the collection.',
  wishlistIds = [],
  onToggleWishlist,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const pageCount = Math.ceil(products.length / pageSize);
  useEffect(() => setPage((current) => current === 1 ? current : 1), [products]);

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-[#E8DCCB] bg-white/70 px-6 py-16 text-center">
        <Sparkles className="mx-auto mb-4 h-6 w-6 text-[#C5A059]" />
        <h2 className="font-serif text-2xl text-[#360810]">{emptyTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#78655E]">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.slice((page - 1) * pageSize, page * pageSize).map((product, index) => {
        const productUrl = `/product/${getProductSlug(product)}`;
        const gallery = [...new Set([product.image, product.secondaryImage, ...(product.images || [])].filter((image): image is string => Boolean(image)))];
        const discounted = Boolean(product.isDiscounted || (product.discountPercent && product.discountPercent > 0));
        const price = discounted ? product.discountPricePKR || product.pricePKR : product.pricePKR;
        const compareAt = discounted ? product.originalPricePKR || product.pricePKR : undefined;
        return (
          <motion.article key={product.id} initial={{ opacity: 0, y: 22, scale: 0.985 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.42, delay: Math.min(index * 0.035, 0.28), ease: 'easeOut' }} whileHover={{ y: -4 }} className="group overflow-hidden rounded-xl border border-[#E8DCCB] bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
            <ProductCardGallery productName={product.name} gallery={gallery} productUrl={productUrl} discounted={discounted} wishlisted={wishlistIds.includes(product.id)} onToggleWishlist={onToggleWishlist ? () => onToggleWishlist(product.id) : undefined} />
            {product.availableColors && product.availableColors.length > 1 && <div className="flex gap-1.5 overflow-x-auto px-3 pt-2 sm:px-4" aria-label="Available colors">{product.availableColors.map((color) => <span key={color} className="shrink-0 rounded-full border border-[#E8DCCB] bg-[#FAF8F5] px-2 py-1 text-[9px] text-[#68554E]">{color}</span>)}</div>}
            <div className="space-y-2 p-3 sm:p-4">
              <Link to={productUrl} className="block font-serif text-sm font-semibold text-[#360810] hover:text-[#8C2333] sm:text-base">{product.name}</Link>
              <p className="line-clamp-1 text-[11px] text-[#78655E]">{product.fabric || product.silhouette || product.styleCategory || 'Couture piece'}</p>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono text-xs">
                <span className="font-bold text-[#4A0E17]">PKR {price.toLocaleString()}</span>
                {compareAt && compareAt > price && <span className="text-[10px] text-stone-400 line-through">PKR {compareAt.toLocaleString()}</span>}
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
    {pageCount > 1 && <nav aria-label="Product pages" className="mt-9 flex items-center justify-center gap-5">
      <button type="button" onClick={() => { setPage((current) => Math.max(1, current - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page === 1} aria-label="Previous page" className="rounded-full border border-[#E8DCCB] bg-white p-2.5 text-[#4A0E17] disabled:cursor-not-allowed disabled:opacity-35"><ArrowLeft size={18}/></button>
      <span className="text-sm text-[#78655E]">Page {page} of {pageCount}</span>
      <button type="button" onClick={() => { setPage((current) => Math.min(pageCount, current + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page === pageCount} aria-label="Next page" className="rounded-full border border-[#E8DCCB] bg-white p-2.5 text-[#4A0E17] disabled:cursor-not-allowed disabled:opacity-35"><ArrowRight size={18}/></button>
    </nav>}
    </>
  );
};

function ProductCardGallery({ productName, gallery, productUrl, discounted, wishlisted, onToggleWishlist }: { productName: string; gallery: string[]; productUrl: string; discounted: boolean; wishlisted: boolean; onToggleWishlist?: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    if (gallery.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % gallery.length), 4000);
    return () => window.clearInterval(timer);
  }, [gallery.length]);
  const image = gallery[activeIndex];
  return <div className="relative">
    <Link to={productUrl} className="relative block aspect-[4/5] overflow-hidden bg-[#EFE7DE]">
      <AnimatePresence mode="wait" initial={false}>{image ? <motion.img key={`${activeIndex}-${image}`} src={image} alt={productName} initial={{ opacity: 0, x: 12, scale: 1.015 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.24, ease: 'easeOut' }} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-sm text-[#917E76]">Image unavailable</div>}</AnimatePresence>
    </Link>
    {discounted && <span className="absolute left-3 top-3 rounded-full bg-[#7A0C1E] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Sale</span>}
    {onToggleWishlist && <button type="button" aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'} onClick={onToggleWishlist} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF8F5]/95 text-[#7A0C1E] shadow"><Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} /></button>}
    {gallery.length > 1 && <>
      <button type="button" aria-label={`Previous image for ${productName}`} onClick={() => setActiveIndex((index) => (index - 1 + gallery.length) % gallery.length)} className="absolute left-2 top-1/2 rounded-full bg-[#FAF8F5]/90 p-1.5 text-[#4A0E17] shadow"><ArrowLeft size={15}/></button>
      <button type="button" aria-label={`Next image for ${productName}`} onClick={() => setActiveIndex((index) => (index + 1) % gallery.length)} className="absolute right-2 top-1/2 rounded-full bg-[#FAF8F5]/90 p-1.5 text-[#4A0E17] shadow"><ArrowRight size={15}/></button>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">{gallery.map((src, index) => <button key={`${src}-${index}`} type="button" aria-label={`Show image ${index + 1}`} onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />)}</div>
    </>}
  </div>;
}
