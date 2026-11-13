import React, { useState, useEffect } from 'react';
import { Star, MessageSquareQuote, CheckCircle2, Heart, Sparkles, Send, User, MapPin, Calendar, Award } from 'lucide-react';
import { CustomerFeedback } from '../types/admin';
import { api } from '../services/api';

export const FeedbackAndTestimonialsSection: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [occasion, setOccasion] = useState('Royal Barat');
  const [ensembleName, setEnsembleName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load feedbacks on mount
  useEffect(() => {
    let isMounted = true;
    api.getFeedbacks()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setFeedbacks(data.filter((item) => item.status === 'Approved'));
        }
      })
      .catch((err) => {
        setLoadError((err as Error).message || 'Could not load testimonials.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !review.trim()) {
      setErrorMessage('Please enter your full name and review experience.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const newFeedback: Partial<CustomerFeedback> = {
      customerName: name.trim(),
      email: email.trim(),
      city: city.trim() || 'Karachi, Pakistan',
      occasion,
      ensembleName: ensembleName.trim(),
      rating,
      review: review.trim(),
    };

    try {
      const created = await api.submitFeedback(newFeedback);
      if (created.status === 'Approved') setFeedbacks((prev) => [created, ...prev]);
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setCity('');
      setEnsembleName('');
      setReview('');
      setRating(5);
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit your feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback-testimonials" className="py-16 lg:py-24 bg-[#FAF7F2] border-b border-[#E5D7C7] relative overflow-hidden">
      {/* Decorative background embellishment */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7A0C1E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#997A3D] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Royal Bride Testimonials</span>
            <span aria-hidden="true">·</span>
            <span>Client Praises</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#360810] font-normal tracking-tight">
            Treasured Words of Our Brides
          </h2>

          <p className="text-sm sm:text-base text-[#68554E] leading-relaxed">
            Every bridal creation carries our family promise of unmatched craftsmanship. Read heartfelt reviews from brides across Pakistan, the UK, the US, and UAE.
          </p>
        </div>

        {/* Testimonials Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/70 border border-[#E8DCCB] animate-pulse h-64" />
            ))
          ) : loadError ? (
            <div role="alert" className="col-span-full py-12 text-center text-rose-700 font-serif">
              Testimonials could not be loaded: {loadError}
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="col-span-full py-12 text-center text-stone-500 font-serif">
              No feedback entries yet. Be the first royal bride to share your experience below!
            </div>
          ) : (
            feedbacks.map((item) => (
              <div
                key={item.id}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5D7C7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#C5A059]/60"
              >
                <div className="space-y-4">
                  {/* Rating Stars & Occasion Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${
                            starIdx < item.rating
                              ? 'text-[#C5A059] fill-[#C5A059]'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-[#7A0C1E]/10 text-[#7A0C1E] text-[11px] font-mono uppercase tracking-wider font-semibold border border-[#7A0C1E]/20">
                      {item.occasion}
                    </span>
                  </div>

                  {/* Review Text */}
                  <div className="relative">
                    <MessageSquareQuote className="w-8 h-8 text-[#C5A059]/20 absolute -top-3 -left-2 pointer-events-none" />
                    <p className="text-xs sm:text-sm text-[#4A3B35] leading-relaxed italic relative z-10 pl-2">
                      &ldquo;{item.review}&rdquo;
                    </p>
                  </div>

                  {item.ensembleName && (
                    <div className="text-[11px] font-mono text-[#997A3D] font-medium flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{item.ensembleName}</span>
                    </div>
                  )}
                </div>

                {/* Bride Details & Verification */}
                <div className="pt-4 mt-4 border-t border-[#F0E6DA] flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#360810]">
                      {item.customerName}
                    </h4>
                    {item.city && (
                      <p className="text-[11px] text-[#8C766C] font-mono flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#C5A059]" />
                        <span>{item.city}</span>
                      </p>
                    )}
                  </div>

                  {item.isVerifiedBride && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Bride</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Feedback Submission Form Card */}
        <div className="max-w-3xl mx-auto rounded-3xl bg-white border border-[#DECDBB] shadow-xl overflow-hidden">
          <div className="p-6 sm:p-10 bg-gradient-to-r from-[#360810] to-[#540E1B] text-white space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#E5C378] font-mono">
              <Heart className="w-3.5 h-3.5 fill-[#E5C378]" />
              <span>Share Your Atelier Experience</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#FAF8F5]">
              Leave Your Feedback & Rating
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              Did you wear an AHK bridal creation for your Barat, Walima, Mehndi, or Nikah? Help future brides by sharing your fitting experience and reflections.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6 text-left">
            {submitSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you! Your feedback has been received and will appear after review.</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm">
                {errorMessage}
              </div>
            )}

            {/* Interactive Star Rating */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#78655E] tracking-wider mb-2">
                Overall Experience Rating *
              </label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const starValue = idx + 1;
                  const isFilled = (hoverRating || rating) >= starValue;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starValue)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${
                          isFilled
                            ? 'text-[#C5A059] fill-[#C5A059]'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 text-xs font-mono text-[#997A3D] font-bold">
                  {rating === 5 ? '5.0 - Royal Perfection' : `${rating}.0 Stars`}
                </span>
              </div>
            </div>

            {/* 2-Column Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#78655E] tracking-wider mb-1.5">
                  Bride&apos;s Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Ayesha Tariq"
                  className="w-full bg-[#FAF8F5] border border-[#DECDBB] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#360810] focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#78655E] tracking-wider mb-1.5">
                  Email or WhatsApp (Private)
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., ayesha@example.com"
                  className="w-full bg-[#FAF8F5] border border-[#DECDBB] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#360810] focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#78655E] tracking-wider mb-1.5">
                  City / Country
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Karachi, Lahore, London, Dallas"
                  className="w-full bg-[#FAF8F5] border border-[#DECDBB] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#360810] focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#78655E] tracking-wider mb-1.5">
                  Wedding Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DECDBB] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#360810] focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                >
                  <option value="Royal Barat">Royal Barat</option>
                  <option value="Royal Walima">Royal Walima</option>
                  <option value="Festive Mehndi">Festive Mehndi</option>
                  <option value="Serene Nikah">Serene Nikah</option>
                  <option value="Engagement & Shehnai">Engagement & Shehnai</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#78655E] tracking-wider mb-1.5">
                Ensemble / Suit Name (Optional)
              </label>
              <input
                type="text"
                value={ensembleName}
                onChange={(e) => setEnsembleName(e.target.value)}
                placeholder="e.g., The Shahbano Imperial Lehnga"
                className="w-full bg-[#FAF8F5] border border-[#DECDBB] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#360810] focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#78655E] tracking-wider mb-1.5">
                Your Review & Karigar Reflections *
              </label>
              <textarea
                required
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with the embroidery quality, fit, bespoke trials at Dolmen Mall Tariq Road, and compliments received on your wedding day..."
                className="w-full bg-[#FAF8F5] border border-[#DECDBB] rounded-xl p-4 text-xs sm:text-sm text-[#360810] focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#4A0E17] via-[#681421] to-[#7A0C1E] text-[#FAF8F5] text-xs uppercase tracking-wider font-bold shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#E5C378]" />
              <span>{isSubmitting ? 'Submitting Feedback...' : 'Submit Bridal Feedback'}</span>
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};
