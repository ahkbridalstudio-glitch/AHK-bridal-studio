import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ImagePlus, LoaderCircle, Star, X } from 'lucide-react';
import { api } from '../../services/api';
import { ProductReview } from '../../types/admin';

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read that image.'));
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    api.getProductReviews(productId).then((items) => active && setReviews(items)).catch((error: Error) => active && setLoadError(error.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [productId]);

  async function handlePhotos(event: ChangeEvent<HTMLInputElement>) {
    setPhotoError('');
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length + photos.length > 3) {
      setPhotoError('You can add up to 3 photos.');
      return;
    }
    if (files.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024)) {
      setPhotoError('Use JPG, PNG, or WebP photos up to 3 MB each.');
      return;
    }
    if ([...files, ...photos].reduce((sum, file) => sum + (typeof file === 'string' ? Math.ceil(file.length * 0.75) : file.size), 0) > 8 * 1024 * 1024) {
      setPhotoError('The combined photo size must be 8 MB or less.');
      return;
    }
    try {
      const selected = await Promise.all(files.map(readImage));
      setPhotos((current) => [...current, ...selected]);
    } catch (error) {
      setPhotoError((error as Error).message);
    }
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const created = await api.submitProductReview(productId, { customerName, rating, review, photos });
      setReviews((current) => [created, ...current]);
      setCustomerName('');
      setRating(5);
      setReview('');
      setPhotos([]);
      setFormOpen(false);
    } catch (error) {
      setSubmitError((error as Error).message || 'Could not submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const average = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0;

  return <section className="mt-16 border-t border-[#E8DCCB] pt-10" aria-labelledby="product-reviews-title">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[.22em] text-[#997A3D]">Bride experiences</p>
        <h2 id="product-reviews-title" className="mt-2 font-serif text-3xl text-[#360810]">Reviews {reviews.length > 0 && <span className="text-lg text-[#78655E]">({reviews.length})</span>}</h2>
        {reviews.length > 0 && <p className="mt-2 flex items-center gap-2 text-sm text-[#68554E]"><Star size={15} className="fill-[#B38728] text-[#B38728]"/> {average.toFixed(1)} out of 5</p>}
      </div>
      <button type="button" onClick={() => { setSubmitError(''); setFormOpen(true); }} className="rounded bg-[#4A0E17] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#671625]">Write a review</button>
    </div>

    {loading ? <div className="flex min-h-36 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#7A0C1E]" aria-label="Loading reviews"/></div>
      : loadError ? <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">Could not load reviews: {loadError}</p>
      : reviews.length === 0 ? <p className="mt-6 rounded-lg border border-dashed border-[#DCCBB8] p-6 text-sm text-[#78655E]">No reviews yet. Share your experience with this piece.</p>
      : <div className="mt-7 grid gap-4 md:grid-cols-2">{reviews.map((item) => <article key={item.id} className="rounded-xl border border-[#E8DCCB] bg-white p-5">
        <div className="flex items-start justify-between gap-3"><div><h3 className="font-medium text-[#360810]">{item.customerName}</h3><time className="mt-1 block text-xs text-[#78655E]" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time></div><div className="flex" aria-label={`${item.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} className={index < item.rating ? 'fill-[#B38728] text-[#B38728]' : 'text-[#DCCBB8]'}/>)}</div></div>
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#68554E]">{item.review}</p>
        {!!item.photos?.length && <div className="mt-4 flex gap-2 overflow-x-auto">{item.photos.map((photo, index) => <img key={`${item.id}-${index}`} src={photo} alt={`Photo shared with review by ${item.customerName}, ${index + 1}`} loading="lazy" className="h-20 w-20 shrink-0 rounded-lg border border-[#E8DCCB] object-cover"/>)}</div>}
      </article>)}</div>}

    <AnimatePresence>
      {formOpen && <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && setFormOpen(false)}>
        <motion.div role="dialog" aria-modal="true" aria-labelledby="write-review-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#E8DCCB] bg-[#FAF8F5] p-5 shadow-2xl sm:p-7" initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}>
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[.2em] text-[#997A3D]">Your experience matters</p><h2 id="write-review-title" className="mt-1 font-serif text-2xl text-[#360810]">Write a review</h2></div><button type="button" aria-label="Close review form" onClick={() => setFormOpen(false)} className="rounded-full p-2 text-[#68554E] hover:bg-[#EFE7DE]"><X size={20}/></button></div>
          <form onSubmit={submitReview} className="mt-6 space-y-5">
            <label className="block text-sm font-medium text-[#360810]">Your name<input required maxLength={100} value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="mt-2 block w-full rounded-lg border border-[#DECDBB] bg-white p-3 outline-none focus:border-[#997A3D]" placeholder="Name shown with your review"/></label>
            <fieldset><legend className="text-sm font-medium text-[#360810]">Your rating</legend><div className="mt-2 flex gap-1">{Array.from({ length: 5 }, (_, index) => <button key={index} type="button" aria-label={`Rate ${index + 1} out of 5`} aria-pressed={rating === index + 1} onClick={() => setRating(index + 1)} className="rounded p-1 text-[#B38728]"><Star size={27} className={index < rating ? 'fill-current' : ''}/></button>)}</div></fieldset>
            <label className="block text-sm font-medium text-[#360810]">Review<textarea required minLength={5} maxLength={3000} rows={5} value={review} onChange={(event) => setReview(event.target.value)} className="mt-2 block w-full resize-y rounded-lg border border-[#DECDBB] bg-white p-3 outline-none focus:border-[#997A3D]" placeholder="What did you think about this piece?"/></label>
            <div><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[#360810]">Photos <span className="font-normal text-[#78655E]">(optional · up to 3)</span></p><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DECDBB] bg-white px-3 py-2 text-sm text-[#4A0E17] hover:bg-[#F6F0E8]"><ImagePlus size={16}/> Add photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={handlePhotos} disabled={photos.length >= 3}/></label></div>
              {!!photos.length && <div className="mt-3 flex gap-3">{photos.map((photo, index) => <div key={index} className="relative"><img src={photo} alt={`Review upload ${index + 1}`} className="h-20 w-20 rounded-lg object-cover"/><button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => setPhotos((items) => items.filter((_, i) => i !== index))} className="absolute -right-2 -top-2 rounded-full bg-[#4A0E17] p-1 text-white"><X size={12}/></button></div>)}</div>}
              {photoError && <p role="alert" className="mt-2 text-sm text-red-700">{photoError}</p>}
            </div>
            {submitError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{submitError}</p>}
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end"><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-[#DECDBB] px-5 py-3 text-sm text-[#4A0E17]">Cancel</button><button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A0E17] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">{submitting && <LoaderCircle size={16} className="animate-spin"/>}{submitting ? 'Submitting…' : 'Submit review'}</button></div>
          </form>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </section>;
}
