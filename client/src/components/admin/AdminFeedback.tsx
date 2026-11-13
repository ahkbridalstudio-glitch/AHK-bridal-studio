import React, { useState } from 'react';
import {
  Star,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  MessageSquareQuote,
  Award,
  Filter,
  Check
} from 'lucide-react';
import { CustomerFeedback } from '../../types/admin';

interface AdminFeedbackProps {
  feedbacks: CustomerFeedback[];
  onDeleteFeedback: (id: string) => Promise<void> | void;
}

export const AdminFeedback: React.FC<AdminFeedbackProps> = ({
  feedbacks,
  onDeleteFeedback,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [occasionFilter, setOccasionFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.city && item.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.ensembleName && item.ensembleName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesOccasion = occasionFilter === 'All' || item.occasion === occasionFilter;
    const matchesRating = ratingFilter === 'All' || item.rating === Number(ratingFilter);

    return matchesSearch && matchesOccasion && matchesRating;
  });

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await onDeleteFeedback(deletingId);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-[#C5A059] tracking-wider">
            AHK Studio Client Reflections
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Testimonials & Customer Feedback
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Review bridal client ratings, read Karigar reflections, and moderate or delete customer feedback.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-[#1A141D] border border-[#2F2430] text-xs font-mono text-[#E5C378] flex items-center gap-2">
          <Star className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
          <span>Total Reviews: {feedbacks.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#161217] border border-[#2C222A] flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feedback by bride name, city, review text..."
            className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        {/* Occasion Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 font-mono">Occasion:</span>
          <select
            value={occasionFilter}
            onChange={(e) => setOccasionFilter(e.target.value)}
            className="bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A059]"
          >
            <option value="All">All Occasions</option>
            <option value="Royal Barat">Royal Barat</option>
            <option value="Royal Walima">Royal Walima</option>
            <option value="Festive Mehndi">Festive Mehndi</option>
            <option value="Serene Nikah">Serene Nikah</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 font-mono">Rating:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A059]"
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Feedbacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-500 font-serif">
            No testimonials match your filters.
          </div>
        ) : (
          filteredFeedbacks.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#161217] border border-[#2C222A] hover:border-[#3E2D3B] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Stars & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, sIdx) => (
                      <Star
                        key={sIdx}
                        className={`w-3.5 h-3.5 ${
                          sIdx < item.rating
                            ? 'text-[#C5A059] fill-[#C5A059]'
                            : 'text-stone-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-mono text-[#E5C378] font-bold ml-1">
                      {item.rating}.0
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#7A0C1E]/30 text-[#E5C378] text-[10px] font-mono uppercase tracking-wider border border-[#7A0C1E]">
                      {item.occasion}
                    </span>

                    {/* Delete Feedback Button */}
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-white transition-colors cursor-pointer"
                      title="Delete feedback from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Review Message */}
                <p className="text-xs text-stone-300 leading-relaxed italic bg-[#1B151C] p-3 rounded-lg border border-[#2B212B]">
                  &ldquo;{item.review}&rdquo;
                </p>

                {item.ensembleName && (
                  <div className="text-[11px] font-mono text-[#C5A059] flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>Ensemble: {item.ensembleName}</span>
                  </div>
                )}
              </div>

              {/* Footer: Bride info & Date */}
              <div className="pt-3 border-t border-[#251D24] flex items-center justify-between text-[11px]">
                <div>
                  <span className="font-bold text-white font-serif">{item.customerName}</span>
                  {item.city && (
                    <span className="text-stone-400 ml-2 font-mono">({item.city})</span>
                  )}
                  {item.email && (
                    <div className="text-[10px] text-stone-500 font-mono mt-0.5">{item.email}</div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-stone-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1A141D] border border-[#3A2D37] rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif text-lg font-bold">Delete Testimonial?</h3>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to delete this customer feedback from the MongoDB database? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-[#2C222D] text-stone-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
