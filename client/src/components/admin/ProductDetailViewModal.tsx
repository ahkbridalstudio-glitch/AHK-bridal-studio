import React, { useEffect, useState } from 'react';
import { X, Sparkles, Edit2, Boxes, Clock, CheckCircle2, ShieldCheck, Tag, Star, Trash2, LoaderCircle } from 'lucide-react';
import { AdminProduct, ProductReview } from '../../types/admin';
import { api } from '../../services/api';

interface ProductDetailViewModalProps {
  product: AdminProduct;
  currency: 'PKR' | 'USD';
  onClose: () => void;
  onEdit: () => void;
}

export const ProductDetailViewModal: React.FC<ProductDetailViewModalProps> = ({
  product,
  currency,
  onClose,
  onEdit,
}) => {
  const formatAmount = (pkr: number, usd: number) => {
    if (currency === 'USD') return `$${usd.toLocaleString()}`;
    return `PKR ${pkr.toLocaleString()}`;
  };

  const isLowStock = product.stock <= product.lowStockThreshold;
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    let active = true;
    api.getProductReviews(product.id).then((items) => active && setReviews(items)).catch((error: Error) => active && setReviewError(error.message)).finally(() => active && setReviewsLoading(false));
    return () => { active = false; };
  }, [product.id]);

  const deleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this product review? This cannot be undone.')) return;
    try {
      await api.deleteProductReview(product.id, reviewId);
      setReviews((current) => current.filter((item) => item.id !== reviewId));
      setReviewError('');
    } catch (error) {
      setReviewError((error as Error).message || 'Could not delete this review.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#141015] border border-[#3A2D37] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left text-white">
        {/* Header */}
        <div className="p-5 bg-[#1A141D] border-b border-[#2C222A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#241A25] text-[#E5C378] border border-[#3E2E40]">
              {product.sku}
            </span>
            <span className="text-xs font-mono uppercase text-stone-400">
              {product.occasion} Ceremony
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5A059] text-[#180E12] font-semibold text-xs hover:bg-[#d8b065] transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Ensemble</span>
            </button>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Preview with Multiple Pictures support */}
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden border border-[#2F2430] aspect-[3/4] bg-[#1E1720]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Multiple Pictures Gallery Strip */}
              {Array.isArray(product.images) && product.images.length > 1 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Product view ${i + 1}`}
                      className="w-14 h-16 rounded-lg object-cover border border-[#2F2430] shrink-0"
                    />
                  ))}
                </div>
              ) : product.secondaryImage ? (
                <div className="flex items-center gap-2">
                  <img
                    src={product.secondaryImage}
                    alt="Secondary craft"
                    className="w-16 h-16 rounded-lg object-cover border border-[#2F2430]"
                  />
                  <span className="text-[11px] font-mono text-stone-400">
                    Hand-embroidered zardozi detail preview
                  </span>
                </div>
              ) : null}
            </div>

            {/* Product Meta */}
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-2xl text-white">{product.name}</h3>
                {product.urduName && (
                  <div className="font-serif text-[#C5A059] text-base mt-0.5">
                    {product.urduName}
                  </div>
                )}
                <div className="text-xs text-stone-400 mt-1 font-mono">{product.silhouette}</div>
              </div>

              {/* Price & Stock Card with Discount Handling */}
              <div className="p-4 rounded-xl bg-[#1C161F] border border-[#2C222A] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-stone-400">
                    {product.isDiscounted ? 'Special Sale Price' : 'Base Price'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-mono font-bold text-[#E5C378]">
                      {formatAmount(product.pricePKR, product.priceUSD)}
                    </span>
                    {product.isDiscounted && product.discountPercent && product.discountPercent > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#991B1B] text-white">
                        -{product.discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  {product.isDiscounted && product.originalPricePKR && (
                    <div className="text-xs font-mono text-stone-500 line-through">
                      Regular: {formatAmount(product.originalPricePKR, product.originalPriceUSD || 0)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-stone-400">
                    Studio Stock
                  </div>
                  <div
                    className={`text-lg font-mono font-bold ${
                      isLowStock ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {product.stock} Units
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#221A23]">
                  <span className="text-stone-400">Fabric Base:</span>
                  <span className="text-white font-medium">{product.fabric || 'Pure Base Fabric'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#221A23]">
                  <span className="text-stone-400">Couture Colorway:</span>
                  <span className="text-white font-medium">{product.colorway || 'Signature Atelier Palette'}</span>
                </div>
                {product.availableColors && product.availableColors.length > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-[#221A23]">
                    <span className="text-stone-400">Available Colorways:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {product.availableColors.map((c) => (
                        <span
                          key={c}
                          className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#211B24] text-[#E5C378] border border-[#3E2E42]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-[#221A23]">
                  <span className="text-stone-400">Available Sizes (AHK Studio):</span>
                  <div className="flex items-center gap-1">
                    {(product.availableSizes && product.availableSizes.length > 0
                      ? product.availableSizes
                      : ['S', 'M', 'L', 'XL']
                    ).map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#271E2B] text-[#E5C378] border border-[#3E2E42]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#221A23]">
                  <span className="text-stone-400">Delivery Lead Time:</span>
                  <span className="font-mono text-white">{product.deliveryWeeks || 8} Weeks Handcrafted</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#221A23]">
                  <span className="text-stone-400">Lifetime Sales:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {product.totalSold || 0} Orders Placed
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="font-serif font-bold text-sm text-stone-200">Ensemble Narrative</h5>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Craft Details (Optional) */}
              {product.craftDetails && (
                <div>
                  <h5 className="font-serif font-bold text-sm text-stone-200">
                    Technique & Workmanship
                  </h5>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    {product.craftDetails}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Inclusions */}
          {product.inclusions && product.inclusions.length > 0 && (
            <div className="p-4 rounded-xl bg-[#1C161F] border border-[#2C222A]">
              <h5 className="font-serif font-bold text-sm text-white mb-2">
                What’s Included in This Trousseau Ensemble
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-stone-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <section className="rounded-xl border border-[#3A2D37] bg-[#1C161F] p-4 sm:p-5" aria-labelledby="admin-product-reviews-title">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C222A] pb-3">
              <div><h4 id="admin-product-reviews-title" className="font-serif text-lg text-white">Product Reviews</h4><p className="mt-1 text-xs text-stone-400">Review customer ratings and remove inappropriate or fake submissions.</p></div>
              <span className="rounded-full bg-[#271E2B] px-3 py-1 text-xs text-[#E5C378]">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
            </div>
            {reviewsLoading ? <div className="flex min-h-24 items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin text-[#E5C378]"/></div>
              : reviewError && reviews.length === 0 ? <p role="alert" className="mt-4 text-sm text-red-300">{reviewError}</p>
              : reviews.length === 0 ? <p className="py-5 text-sm text-stone-400">This product has no customer reviews yet.</p>
              : <div className="mt-3 divide-y divide-[#2C222A]">{reviews.map((review) => <article key={review.id} className="py-4 first:pt-2 last:pb-1">
                <div className="flex items-start justify-between gap-3"><div><h5 className="text-sm font-semibold text-stone-100">{review.customerName}</h5><time className="mt-1 block text-[11px] text-stone-500" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time></div><div className="flex items-center gap-2"><span className="flex" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={12} className={index < review.rating ? 'fill-[#E5C378] text-[#E5C378]' : 'text-stone-600'}/>)}</span><button type="button" onClick={() => void deleteReview(review.id)} aria-label={`Delete review by ${review.customerName}`} className="rounded p-2 text-red-300 transition hover:bg-red-950/50 hover:text-red-200"><Trash2 size={15}/></button></div></div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-300">{review.review}</p>
                {!!review.photos?.length && <div className="mt-3 flex gap-2">{review.photos.map((photo, index) => <img key={index} src={photo} alt={`Review photo ${index + 1}`} className="h-14 w-14 rounded-lg border border-[#3A2D37] object-cover"/>)}</div>}
              </article>)}</div>}
            {reviewError && reviews.length > 0 && <p role="alert" className="mt-3 text-sm text-red-300">{reviewError}</p>}
          </section>
        </div>
      </div>
    </div>
  );
};
