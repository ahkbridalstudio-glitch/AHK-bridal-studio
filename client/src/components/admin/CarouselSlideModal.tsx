import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Check,
  Upload,
  Clock,
  Tag,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { CarouselSlide, AdminProduct } from '../../types/admin';

interface CarouselSlideModalProps {
  slide: CarouselSlide | null; // null for add new
  products: AdminProduct[];
  onClose: () => void;
  onSave: (slide: CarouselSlide) => void;
}

export const CarouselSlideModal: React.FC<CarouselSlideModalProps> = ({
  slide,
  products,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(slide);

  // Quick preset bridal photos from project assets
  const presetImages = [
    {
      label: 'Imperial Crimson Barat Lehnga',
      url: '/src/assets/images/hero_pakistani_bridal_lehenga_1792071419809.jpg',
    },
    {
      label: 'Emerald Velvet Shehnai Ensemble',
      url: '/src/assets/images/bridal_emerald_velvet_lehenga_1792253141443.jpg',
    },
    {
      label: 'Noor Mahal Walima Gown',
      url: '/src/assets/images/bridal_walima_gown_1792071422666.jpg',
    },
    {
      label: 'Jashn-e-Bahaar Mehndi Angrakha',
      url: '/src/assets/images/bridal_mehndi_angrakha_1792071423399.jpg',
    },
    {
      label: 'Meena Bazaar Ivory Peshwas',
      url: '/src/assets/images/bridal_nikah_ivory_1792071423461.jpg',
    },
    {
      label: 'Macro Zardozi Karigari',
      url: '/src/assets/images/craftsmanship_zardozi_macro_1792071423140.jpg',
    },
  ];

  // Form states
  const [title, setTitle] = useState(slide?.title || '');
  const [urduTitle, setUrduTitle] = useState(slide?.urduTitle || '');
  const [occasion, setOccasion] = useState(slide?.occasion || 'Royal Barat');
  const [fabric, setFabric] = useState(slide?.fabric || 'Pure Katan Raw Silk');
  const [colorway, setColorway] = useState(slide?.colorway || '');
  const [image, setImage] = useState(slide?.image || presetImages[0].url);
  const [pricePKR, setPricePKR] = useState<number>(slide?.pricePKR ?? 850000);
  const [priceUSD, setPriceUSD] = useState<number>(slide?.priceUSD ?? 3050);
  const [embroideryText, setEmbroideryText] = useState(
    slide?.embroidery ? slide.embroidery.join(', ') : 'Heavy Gold Zardozi, Hand Dabka, Naqshi'
  );
  const [description, setDescription] = useState(slide?.description || '');
  const [productId, setProductId] = useState(slide?.productId || '');
  const [order, setOrder] = useState<number>(slide?.order ?? 1);
  const [status, setStatus] = useState<'Active' | 'Draft'>(slide?.status || 'Active');

  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler converting local image to Base64 data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setValidationError('Image file must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result as string;
      setImage(base64);
      setValidationError('');
    };
    reader.readAsDataURL(file);
  };

  // Sync USD automatically when PKR changes if reasonable
  const handlePkrChange = (val: number) => {
    setPricePKR(val);
    if (val > 0) {
      setPriceUSD(Math.round(val / 278));
    }
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setValidationError('Please provide a slide title (e.g. The Shahbano Imperial Lehnga).');
      return;
    }
    if (!image.trim()) {
      setValidationError('Please upload or select an image for this carousel slide.');
      return;
    }

    const embroideryList = embroideryText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const updatedSlide: CarouselSlide = {
      id: slide?.id || `slide-${Date.now()}`,
      title: title.trim(),
      urduTitle: urduTitle.trim(),
      occasion: occasion.trim(),
      fabric: fabric.trim(),
      colorway: colorway.trim(),
      image: image.trim(),
      pricePKR: Number(pricePKR) || 0,
      priceUSD: Number(priceUSD) || 0,
      embroidery: embroideryList,
      description: description.trim(),
      productId: productId || undefined,
      order: Number(order) || 1,
      status,
      createdAt: slide?.createdAt || new Date().toISOString()
    };

    onSave(updatedSlide);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-[#181219] border border-[#3A2D37] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 text-stone-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#2C222A] bg-[#140E15] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#7A0C1E]/30 border border-[#7A0C1E]/50 text-[#C5A059]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                {isEditing ? 'Edit Carousel Product & Slide' : 'Add New Carousel Product Slide'}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Configure picture, royal occasion, pricing, and craftsmanship details shown on the storefront carousel.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#221B23] hover:bg-[#332734] text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Picture & Visual Media */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#C5A059] font-semibold">
              1. Carousel Picture & Photography
            </label>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Image Preview Box */}
              <div className="md:col-span-5 relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-black/60 border border-[#3A2D37] shadow-inner group">
                {image ? (
                  <img
                    src={image}
                    alt="Slide preview"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-500">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs">No picture chosen</span>
                  </div>
                )}
                {status === 'Draft' && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500/80 text-black text-[10px] font-bold uppercase">
                    Draft
                  </span>
                )}
              </div>

              {/* Upload & Image URL Input */}
              <div className="md:col-span-7 space-y-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Picture Image URL or Path</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://... or /src/assets/images/..."
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-[#2A202B] hover:bg-[#3D2E3F] text-white border border-[#443343] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Upload Picture from Computer</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1.5">Or choose a Studio Preset Asset:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {presetImages.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setImage(p.url)}
                        className={`relative rounded-lg overflow-hidden aspect-square border transition-all ${
                          image === p.url ? 'border-[#C5A059] ring-2 ring-[#C5A059]' : 'border-[#3A2D37] opacity-60 hover:opacity-100'
                        }`}
                        title={p.label}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Product Titles & Occasion */}
          <div className="space-y-3 pt-3 border-t border-[#2A202B]">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#C5A059] font-semibold">
              2. Title & Cultural Nomenclature
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-400 block mb-1">
                  Ensemble Title (English) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Shahbano Imperial Lehnga"
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1">
                  Urdu Calligraphy Name (Nastaliq)
                </label>
                <input
                  type="text"
                  value={urduTitle}
                  onChange={(e) => setUrduTitle(e.target.value)}
                  placeholder="شاہ بانو / گلِ داؤد"
                  dir="rtl"
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-[#E5C378] font-serif focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1">Royal Occasion / Event</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Royal Barat">Royal Barat</option>
                  <option value="Royal Shehnai & Barat">Royal Shehnai & Barat</option>
                  <option value="Royal Walima">Royal Walima</option>
                  <option value="Festive Mehndi & Mayun">Festive Mehndi & Mayun</option>
                  <option value="Serene Nikah">Serene Nikah</option>
                  <option value="Heritage Craftsmanship">Heritage Craftsmanship</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1">Fabric & Base Material</label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="Pure Katan Raw Silk & Velvet"
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1">Color Palette / Colorway</label>
                <input
                  type="text"
                  value={colorway}
                  onChange={(e) => setColorway(e.target.value)}
                  placeholder="Imperial Crimson & Antique Gold"
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              
            </div>
          </div>

          {/* Section 3: Pricing & Catalog Connection */}
          <div className="space-y-3 pt-3 border-t border-[#2A202B]">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#C5A059] font-semibold">
              3. Pricing & Catalog Link
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-stone-400 block mb-1">Price in PKR (Rs)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={pricePKR}
                  onChange={(e) => handlePkrChange(Number(e.target.value))}
                  placeholder="850000"
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-[#E5C378] font-mono font-bold focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1">Price in USD ($)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(Number(e.target.value))}
                  placeholder="3050"
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1">Link to Catalog Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="">None (Stand-alone Gallery)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Handwork & Description */}
          <div className="space-y-3 pt-3 border-t border-[#2A202B]">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#C5A059] font-semibold">
              4. Embroidery & Story Description
            </label>

            <div>
              <label className="text-xs text-stone-400 block mb-1">
                Embroidery Techniques (Comma-separated)
              </label>
              <input
                type="text"
                value={embroideryText}
                onChange={(e) => setEmbroideryText(e.target.value)}
                placeholder="Heavy Gold Zardozi, Dabka & Naqshi, Cut-Dana Beads, Scalloped Velvet Daman"
                className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Slide Editorial Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A regal heirloom Barat bridal masterpiece featuring a 16-kali skirt crusted in 3D hand-coiled dabka, antique tilla, and royal velvet border..."
                className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs text-stone-400 block mb-1">Display Sequence / Order</label>
                <input
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1">Visibility Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Draft')}
                  className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Active">Active (Visible on Storefront Carousel)</option>
                  <option value="Draft">Draft (Hidden from Storefront)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#2A202B] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-[#221B23] hover:bg-[#332734] text-stone-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#E5C378] hover:brightness-110 text-[#180E12] text-xs font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Carousel Slide Changes' : 'Publish Carousel Slide'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
