import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  Upload,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Star,
  Percent,
  Tag,
  Ruler
} from 'lucide-react';
import { AdminProduct } from '../../types/admin';
import { OccasionType, BridalSize, AHK_SIZE_GUIDE } from '../../types/bridal';
import { SizeGuideModal } from '../SizeGuideModal';
import { api, ShopCategories } from '../../services/api';
import { toProductSlug } from '../../utils/productSlug';

interface ProductFormModalProps {
  product: AdminProduct | null; // null for create new
  onClose: () => void;
  onSave: (product: AdminProduct) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(product);

  // Preset Pakistani bridal images available in assets
  const presetImages = [
    {
      label: 'Imperial Barat Crimson Lehnga',
      url: '/src/assets/images/hero_pakistani_bridal_lehenga_1792071419809.jpg',
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
      label: 'Meena Bazaar Ivory Nikah Peshwas',
      url: '/src/assets/images/bridal_nikah_ivory_1792071423461.jpg',
    },
    {
      label: 'Macro Zardozi Craftsmanship',
      url: '/src/assets/images/craftsmanship_zardozi_macro_1792071423140.jpg',
    },
  ];

  // Form states
  const [name, setName] = useState(product?.name || '');
  const [urduName, setUrduName] = useState(product?.urduName || '');
  const [sku, setSku] = useState(product?.sku || `AHK-BRD-${Math.floor(10 + Math.random() * 90)}`);
  const [occasion, setOccasion] = useState<OccasionType>(product?.occasion || 'Barat');
  const [shopCategories, setShopCategories] = useState<ShopCategories>({ collections: [], styles: [] });
  const [collections, setCollections] = useState<string[]>(product?.collections || []);
  const [styleCategory, setStyleCategory] = useState(product?.styleCategory || '');
  const [isBestSelling, setIsBestSelling] = useState(Boolean(product?.isBestSelling));
  const [isNewArrival, setIsNewArrival] = useState(Boolean(product?.isNewArrival));
  
  // Silhouette Cut: Input field and optional
  const [silhouette, setSilhouette] = useState(product?.silhouette || '');
  
  // Pure Base Fabric: Input field and optional
  const [fabric, setFabric] = useState(product?.fabric || '');

  // Base pricing
  const defaultBasePkr = product?.originalPricePKR || product?.pricePKR || 750000;
  const [basePricePKR, setBasePricePKR] = useState(defaultBasePkr);
  const [basePriceUSD, setBasePriceUSD] = useState(product?.originalPriceUSD || product?.priceUSD || 2690);

  // Discount feature
  const [isDiscounted, setIsDiscounted] = useState<boolean>(
    Boolean(product?.isDiscounted || (product?.discountPercent && product.discountPercent > 0))
  );
  const [discountPercent, setDiscountPercent] = useState<number>(
    product?.discountPercent && product.discountPercent > 0 ? product.discountPercent : 15
  );
  const [discountDurationDays, setDiscountDurationDays] = useState<number>(product?.discountDurationDays || 7);

  // Size options (according to AHK Bridal Studio Size Guide: S, M, L, XL)
  const [availableSizes, setAvailableSizes] = useState<BridalSize[]>(
    product?.availableSizes && product.availableSizes.length > 0
      ? product.availableSizes
      : ['S', 'M', 'L', 'XL']
  );
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);

  const [stock, setStock] = useState(product?.stock ?? 4);
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold ?? 2);
  const [deliveryWeeks, setDeliveryWeeks] = useState(product?.deliveryWeeks || 10);
  const [colorway, setColorway] = useState(product?.colorway || '');
  const [availableColors, setAvailableColors] = useState<string[]>(() => {
    if (Array.isArray(product?.availableColors) && product.availableColors.length > 0) {
      return product.availableColors.map((c) => c.trim()).filter(Boolean);
    }
    if (product?.colorway && (product.colorway.includes(',') || product.colorway.includes('/') || product.colorway.includes(';'))) {
      return product.colorway.split(/[,/;]+/).map((c) => c.trim()).filter(Boolean);
    }
    return product?.colorway ? [product.colorway.trim()] : [];
  });
  const [newColorInput, setNewColorInput] = useState('');

  // Multiple Pictures Support
  const initialPictures: string[] = (
    Array.isArray(product?.images) && product!.images.length > 0
      ? product!.images
      : [product?.image, product?.secondaryImage].filter(Boolean) as string[]
  );

  const [images, setImages] = useState<string[]>(
    initialPictures.length > 0 ? initialPictures : [presetImages[0].url]
  );
  const [imageSourceTab, setImageSourceTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // File input reference supporting multiple pictures
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getCategories().then(setShopCategories).catch((error) => {
      console.error('Could not load product categories:', error);
    });
  }, []);

  const [description, setDescription] = useState(product?.description || '');
  const [craftDetails, setCraftDetails] = useState(product?.craftDetails || '');
  const [inclusionsText, setInclusionsText] = useState(product?.inclusions?.join('\n') || '');

  // Sync USD price automatically when PKR changes if user hasn't set custom
  const handleBasePkrChange = (val: number) => {
    setBasePricePKR(val);
    setBasePriceUSD(Math.round(val / 279));
  };

  // Calculated discounted prices
  const computedDiscountedPKR = isDiscounted
    ? Math.round(basePricePKR * (1 - discountPercent / 100))
    : basePricePKR;

  const computedDiscountedUSD = isDiscounted
    ? Math.round(basePriceUSD * (1 - discountPercent / 100))
    : basePriceUSD;

  const savingsPKR = isDiscounted ? basePricePKR - computedDiscountedPKR : 0;
  const savingsUSD = isDiscounted ? basePriceUSD - computedDiscountedUSD : 0;

  // Toggle size inclusion
  const toggleSize = (size: BridalSize) => {
    setAvailableSizes((prev) => {
      if (prev.includes(size)) {
        if (prev.length === 1) return prev; // Keep at least one size
        return prev.filter((s) => s !== size);
      }
      return [...prev, size];
    });
  };

  const selectAllSizes = () => {
    setAvailableSizes(['S', 'M', 'L', 'XL']);
  };

  // Helper to read and optimize images from folder / local disk
  const processImageFile = (file: File): Promise<{ dataUrl: string; name: string; sizeKb: number }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file (JPG, PNG, WEBP, etc.)'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read the selected file'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Selected file could not be parsed as an image'));
        img.onload = () => {
          const maxDimension = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ dataUrl: e.target?.result as string, name: file.name, sizeKb: Math.round(file.size / 1024) });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
          resolve({ dataUrl, name: file.name, sizeKb });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle selecting multiple pictures from disk
  const handleMultiFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImage(true);
    setImageError(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await processImageFile(files[i]);
        newUrls.push(res.dataUrl);
      }

      setImages((prev) => {
        if (prev.length === 1 && prev[0] === presetImages[0].url) {
          return newUrls;
        }
        return [...prev, ...newUrls];
      });
    } catch (err: any) {
      setImageError(err.message || 'Error processing selected pictures');
    } finally {
      setIsProcessingImage(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  // Handle drop of multiple files
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setIsProcessingImage(true);
    setImageError(null);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          const res = await processImageFile(files[i]);
          newUrls.push(res.dataUrl);
        }
      }
      if (newUrls.length > 0) {
        setImages((prev) => {
          if (prev.length === 1 && prev[0] === presetImages[0].url) {
            return newUrls;
          }
          return [...prev, ...newUrls];
        });
      }
    } catch (err: any) {
      setImageError(err.message || 'Error processing dropped images');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Remove a picture
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      return updated.length > 0 ? updated : [presetImages[0].url];
    });
  };

  // Set picture as primary (moves it to index 0)
  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, idx) => idx !== index);
      return [selected, ...rest];
    });
  };

  // Add custom URL image
  const handleAddCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => {
      if (prev.length === 1 && prev[0] === presetImages[0].url) {
        return [customImageUrl.trim()];
      }
      return [...prev, customImageUrl.trim()];
    });
    setCustomImageUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const inclusions = inclusionsText
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);

    const primaryImage = images[0] || presetImages[0].url;
    const secondaryImage = images[1] || '';

    // Active selling prices
    const activePricePKR = isDiscounted ? computedDiscountedPKR : basePricePKR;
    const activePriceUSD = isDiscounted ? computedDiscountedUSD : basePriceUSD;

    const updatedProduct: AdminProduct = {
      id: product?.id || `ensemble-${Date.now()}`,
      name: name.trim(),
      slug: product?.slug || toProductSlug(name) || product?.id,
      collections,
      styleCategory,
      isBestSelling,
      isNewArrival,
      urduName: urduName.trim(),
      sku: sku.trim(),
      occasion: occasion as any,
      category: occasion,
      silhouette: silhouette.trim(), // Optional input
      fabric: fabric.trim(), // Optional input
      pricePKR: Number(activePricePKR),
      priceUSD: Number(activePriceUSD),
      // Discount fields
      isDiscounted,
      discountDurationDays: isDiscounted ? discountDurationDays : 0,
      discountPercent: isDiscounted ? Number(discountPercent) : 0,
      originalPricePKR: Number(basePricePKR),
      originalPriceUSD: Number(basePriceUSD),
      discountPricePKR: isDiscounted ? Number(computedDiscountedPKR) : 0,
      discountPriceUSD: isDiscounted ? Number(computedDiscountedUSD) : 0,
      // Size options
      availableSizes: availableSizes.length > 0 ? availableSizes : ['S', 'M', 'L', 'XL'],
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      image: primaryImage,
      secondaryImage,
      images, // Multiple pictures array saved!
      embroidery: product?.embroidery || ['Heavy Gold Zardozi', 'Dabka & Naqshi', 'Cut-Dana Beads'],
      colorway: colorway.trim(),
      availableColors: availableColors.length > 0
        ? availableColors
        : (colorway.includes(',') || colorway.includes('/') || colorway.includes(';'))
        ? colorway.split(/[,/;]+/).map((c) => c.trim()).filter(Boolean)
        : (colorway.trim() ? [colorway.trim()] : []),
      description: description.trim(),
      craftDetails: craftDetails.trim(),
      inclusions,
      deliveryWeeks: Number(deliveryWeeks),
      status: 'Active',
      createdAt: product?.createdAt || new Date().toISOString(),
      totalSold: product?.totalSold ?? 0,
      rating: product?.rating ?? 5.0,
      reviewCount: product?.reviewCount ?? 1,
      defaultCustomState: product?.defaultCustomState,
    };

    onSave(updatedProduct);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
        <div className="bg-[#141015] border border-[#3A2D37] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-left text-white">
          {/* Modal Header */}
          <div className="p-5 sm:p-6 bg-[#1A141D] border-b border-[#2C222A] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#C5A059] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#E5C378]" />
                <span>Atelier Master Product Catalog</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                {isEditing ? `Edit: ${product?.name}` : 'Add New Bridal Suit'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* Section 1: Basic Identifiers */}
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase text-[#C5A059] font-bold">
                1. Title & Classification
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Ensemble Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. The Shahbano Imperial Lehnga"
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Urdu Calligraphy Title
                  </label>
                  <input
                    type="text"
                    value={urduName}
                    onChange={(e) => setUrduName(e.target.value)}
                    placeholder="e.g. شاہ بانو"
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-right font-serif text-[#E5C378] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    SKU / Atelier Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs font-mono text-[#E5C378] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Occasion Ceremony *
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value as OccasionType)}
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Barat">Barat Ceremony</option>
                    <option value="Walima">Walima Reception</option>
                    <option value="Mehndi">Mehndi / Mayun</option>
                    <option value="Nikah">Nikah Ceremony</option>
                  </select>
                </div>

                {/* Silhouette Cut is an input field and optional */}
                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Silhouette Cut <span className="text-stone-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={silhouette}
                    onChange={(e) => setSilhouette(e.target.value)}
                    placeholder="e.g. Royal Barat Lehenga, Farshi Gharara"
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-[#3A2D37] bg-[#1A141D] p-3 space-y-2">
                  <label className="block text-xs font-mono uppercase text-[#E5C378]">Storefront collections</label>
                  <div className="grid grid-cols-2 gap-2">
                    {shopCategories.collections.map((category) => {
                      const checked = category.slug === 'sale'
                        ? isDiscounted
                        : category.slug === 'best-selling'
                        ? isBestSelling
                        : category.slug === 'new-arrivals'
                        ? isNewArrival
                        : collections.includes(category.slug);
                      return (
                        <label key={category.slug} className="flex items-center gap-2 text-xs text-stone-200">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              const enabled = event.target.checked;
                              if (category.slug === 'sale') setIsDiscounted(enabled);
                              else if (category.slug === 'best-selling') setIsBestSelling(enabled);
                              else if (category.slug === 'new-arrivals') setIsNewArrival(enabled);
                              setCollections((current) => enabled
                                ? [...new Set([...current, category.slug])]
                                : current.filter((value) => value !== category.slug));
                            }}
                            className="accent-[#C5A059]"
                          />
                          {category.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">Shop By Style category</label>
                  <select
                    value={styleCategory}
                    onChange={(event) => setStyleCategory(event.target.value)}
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="">Unassigned</option>
                    {shopCategories.styles.map((category) => (
                      <option key={category.slug} value={category.slug}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Fabric & Colorway */}
            <div className="space-y-4 pt-4 border-t border-[#261F28]">
              <div className="text-xs font-mono uppercase text-[#C5A059] font-bold">
                2. Materiality & Craft Specs
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pure Base Fabric is an input field and optional */}
                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Pure Base Fabric <span className="text-stone-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. Pure Katan Raw Silk, Royal Mirzapur Velvet"
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Couture Colorway / Palette Description <span className="text-stone-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={colorway}
                    onChange={(e) => setColorway(e.target.value)}
                    placeholder="e.g. Imperial Crimson & Antique Gold"
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Available Colors Manager (Single vs Multiple Colors) */}
              <div className="p-3.5 bg-[#1F1721] rounded-xl border border-[#3A2D37] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="block text-xs font-mono text-[#E5C378] font-bold">
                      Available Outfit Colors (Single or Multiple Shades)
                    </label>
                    <p className="text-[11px] text-stone-400">
                      If 2 or more colors are added here, customers will be prompted to select their color when adding to cart. If only 1 color is added, customers will not be asked about color.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D212F] text-stone-300 border border-[#443048] whitespace-nowrap">
                    {availableColors.length} {availableColors.length === 1 ? 'color option' : 'color options'}
                  </span>
                </div>

                {/* Color Tags */}
                {availableColors.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableColors.map((col, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2A1D2B] border border-[#523A56] text-xs font-mono text-stone-200 shadow-xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                        <span>{col}</span>
                        <button
                          type="button"
                          onClick={() => setAvailableColors((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                          title={`Remove ${col}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add new color input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newColorInput.trim()) {
                          const parts = newColorInput.split(/[,/]+/).map((c) => c.trim()).filter(Boolean);
                          setAvailableColors((prev) => Array.from(new Set([...prev, ...parts])));
                          setNewColorInput('');
                        }
                      }
                    }}
                    placeholder="Type color (e.g. Ruby Red, Emerald Green, Antique Gold) and click Add or press Enter..."
                    className="flex-1 bg-[#160E18] border border-[#3A2D37] rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newColorInput.trim()) {
                        const parts = newColorInput.split(/[,/]+/).map((c) => c.trim()).filter(Boolean);
                        setAvailableColors((prev) => Array.from(new Set([...prev, ...parts])));
                        setNewColorInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs font-mono font-bold rounded-lg border border-[#7A0C1E] transition-colors cursor-pointer shrink-0"
                  >
                    + Add Color
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Studio Stock */}
            <div className="space-y-4 pt-4 border-t border-[#261F28]">
              <div className="text-xs font-mono uppercase text-[#C5A059] font-bold">
                3. Pricing & Studio Stock
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Regular Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={basePricePKR}
                    onChange={(e) => handleBasePkrChange(Number(e.target.value))}
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">Regular (USD)</label>
                  <input
                    type="number"
                    required
                    value={basePriceUSD}
                    onChange={(e) => setBasePriceUSD(Number(e.target.value))}
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Studio Stock Units
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Delivery Lead Time (Weeks)
                  </label>
                  <input
                    type="number"
                    value={deliveryWeeks}
                    onChange={(e) => setDeliveryWeeks(Number(e.target.value))}
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Product Discount Option */}
            <div className="space-y-4 pt-4 border-t border-[#261F28] bg-[#1A121A]/50 p-4 rounded-2xl border border-[#382637]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#7A0C1E]/30 text-[#E5C378] flex items-center justify-center border border-[#7A0C1E]/50">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-[#E5C378] font-bold">
                      Special Product Discount
                    </div>
                    <div className="text-[11px] text-stone-400">
                      When enabled, the discount will be clearly shown on the website product card, detail view, and cart.
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDiscounted}
                    onChange={(e) => setIsDiscounted(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2C212E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#991B1B]"></div>
                  <span className="ml-2 text-xs font-mono font-bold text-white">
                    {isDiscounted ? 'Discount ON' : 'Discount OFF'}
                  </span>
                </label>
              </div>

              {isDiscounted && (
                <div className="space-y-4 pt-3 border-t border-[#2E202F] animate-in fade-in duration-200">
                  <label className="block max-w-sm text-xs font-mono text-stone-300">
                    Sale duration (days)
                    <input type="number" min={1} max={365} required value={discountDurationDays} onChange={(event) => setDiscountDurationDays(Math.max(1, Math.min(365, Number(event.target.value))))} className="mt-1 block w-full rounded-lg border border-[#3F2D42] bg-[#251B27] px-3 py-2 text-sm text-white focus:border-[#E5C378] focus:outline-none" />
                    <span className="mt-1 block text-[10px] text-stone-500">The sale ends automatically after this many days.</span>
                  </label>
                  {/* Quick percentage buttons */}
                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1.5">
                      Select Discount Percentage:
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountPercent(pct)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            discountPercent === pct
                              ? 'bg-[#991B1B] text-white shadow-md ring-2 ring-[#E5C378]'
                              : 'bg-[#251B27] text-stone-300 hover:bg-[#342437] border border-[#3F2D42]'
                          }`}
                        >
                          {pct}% OFF
                        </button>
                      ))}
                      <div className="flex items-center gap-1.5 ml-2">
                        <span className="text-xs text-stone-400">Custom:</span>
                        <input
                          type="number"
                          min={1}
                          max={95}
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Math.max(1, Math.min(95, Number(e.target.value))))}
                          className="w-16 bg-[#251B27] border border-[#3F2D42] rounded-lg px-2 py-1 text-xs font-mono text-center text-white focus:outline-none focus:border-[#E5C378]"
                        />
                        <span className="text-xs font-mono text-[#E5C378] font-bold">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Comparison Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#201522] rounded-xl border border-[#402B42]">
                    <div className="text-left">
                      <div className="text-[10px] font-mono uppercase text-stone-400">Original Price</div>
                      <div className="text-sm font-mono text-stone-400 line-through">
                        PKR {basePricePKR.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">${basePriceUSD.toLocaleString()} USD</div>
                    </div>

                    <div className="text-left">
                      <div className="text-[10px] font-mono uppercase text-rose-300">Customer Saves</div>
                      <div className="text-sm font-mono font-bold text-rose-400">
                        -PKR {savingsPKR.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-rose-300/80 font-mono">-${savingsUSD.toLocaleString()} USD ({discountPercent}% OFF)</div>
                    </div>

                    <div className="text-left">
                      <div className="text-[10px] font-mono uppercase text-[#E5C378] font-bold">New Sale Price</div>
                      <div className="text-base font-mono font-bold text-[#E5C378]">
                        PKR {computedDiscountedPKR.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#E5C378]/80 font-mono">${computedDiscountedUSD.toLocaleString()} USD</div>
                    </div>
                  </div>

                  {/* Storefront Badge Preview */}
                  <div className="flex items-center gap-3 p-2.5 bg-[#2A1820] rounded-lg border border-[#58212D] text-xs">
                    <Tag className="w-4 h-4 text-[#E5C378] shrink-0" />
                    <div>
                      <span className="text-stone-300">Storefront Badge Preview: </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#991B1B] text-white shadow-xs ml-1">
                        -{discountPercent}% OFF
                      </span>
                      <span className="text-stone-400 ml-2 text-[11px]">
                        Website will display the original price crossed out and highlight PKR {computedDiscountedPKR.toLocaleString()}.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Size Options (According to AHK Bridal Studio Size Guide) */}
            <div className="space-y-4 pt-4 border-t border-[#261F28] bg-[#161219]/40 p-4 rounded-2xl border border-[#342838]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-xs font-mono uppercase text-[#C5A059] font-bold">
                      5. Available Bridal Sizes (AHK Studio Standard)
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Select sizes available for this ensemble based on the AHK Bridal Studio Size Guide (in inches).
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllSizes}
                    className="px-2.5 py-1 bg-[#261D29] hover:bg-[#382B3C] text-stone-300 rounded text-[11px] font-mono transition-colors cursor-pointer border border-[#3B2C3F]"
                  >
                    All Sizes (S-XL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuideModal(true)}
                    className="px-2.5 py-1 bg-[#4A0E17] hover:bg-[#681421] text-[#E5C378] rounded text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 border border-[#7A0C1E]"
                  >
                    <span>View Size Guide (Inch)</span>
                  </button>
                </div>
              </div>

              {/* Size Buttons Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['S', 'M', 'L', 'XL'] as BridalSize[]).map((sizeKey) => {
                  const isSelected = availableSizes.includes(sizeKey);
                  return (
                    <button
                      key={sizeKey}
                      type="button"
                      onClick={() => toggleSize(sizeKey)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#311A2E] border-[#C5A059] shadow-md ring-1 ring-[#C5A059]/40'
                          : 'bg-[#1C1620] border-[#2E2430] opacity-50 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold text-white">Size {sizeKey}</span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#C5A059] text-[#141015] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-stone-600" />
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono mt-1 space-y-0.5">
                        {sizeKey === 'S' && <div>Sh: 14&quot; · Bust: 18&quot; · W: 16&quot;</div>}
                        {sizeKey === 'M' && <div>Sh: 15&quot; · Bust: 20&quot; · W: 18&quot;</div>}
                        {sizeKey === 'L' && <div>Sh: 16&quot; · Bust: 22&quot; · W: 19&quot;</div>}
                        {sizeKey === 'XL' && <div>Sh: 17&quot; · Bust: 24&quot; · W: 20&quot;</div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Inline Size Guide Reference Table */}
              <div className="p-3 bg-[#110D13] rounded-xl border border-[#271E29] overflow-x-auto">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#C5A059] font-bold mb-1.5 flex items-center justify-between">
                  <span>SIZE GUIDE · AHK BRIDAL STUDIO (INCH)</span>
                  <span className="text-stone-500 font-normal">Shoulder, Bust, Waist, Hip, Daman, Arm-Hole</span>
                </div>
                <table className="w-full text-center border-collapse text-[11px] font-mono">
                  <thead>
                    <tr className="border-b border-[#2B1F2D] text-stone-400">
                      <th className="py-1 px-2 text-left font-normal">PARAM (INCH)</th>
                      <th className="py-1 px-2 font-bold text-[#E5C378]">S</th>
                      <th className="py-1 px-2 font-bold text-[#E5C378]">M</th>
                      <th className="py-1 px-2 font-bold text-[#E5C378]">L</th>
                      <th className="py-1 px-2 font-bold text-[#E5C378]">XL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D1620] text-stone-300">
                    {AHK_SIZE_GUIDE.map((row) => (
                      <tr key={row.parameter}>
                        <td className="py-1 px-2 text-left text-stone-400 font-bold">{row.parameter}</td>
                        <td className="py-1 px-2">{row.S}&quot;</td>
                        <td className="py-1 px-2">{row.M}&quot;</td>
                        <td className="py-1 px-2">{row.L}&quot;</td>
                        <td className="py-1 px-2">{row.XL}&quot;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 6: Imagery & Multiple Pictures Support */}
            <div className="space-y-4 pt-4 border-t border-[#261F28]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase text-[#C5A059] font-bold">
                    6. Bridal Ensemble Pictures ({images.length} added)
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Add multiple pictures of the outfit (full view, macro embroidery, back view, dupatta drape).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => multiFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[#7A0C1E] hover:bg-[#921025] text-white rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5 text-[#E5C378]" />
                  <span>Add Pictures</span>
                </button>
              </div>

              {/* Hidden Multi-file input */}
              <input
                ref={multiFileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultiFilesChange}
                className="hidden"
              />

              {/* Image Source Selection Tabs */}
              <div className="flex items-center gap-2 border-b border-[#2C222A] pb-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setImageSourceTab('upload')}
                  className={`pb-1 px-2 transition-colors cursor-pointer ${
                    imageSourceTab === 'upload'
                      ? 'border-b-2 border-[#C5A059] text-[#E5C378] font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Upload Multiple Files
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceTab('preset')}
                  className={`pb-1 px-2 transition-colors cursor-pointer ${
                    imageSourceTab === 'preset'
                      ? 'border-b-2 border-[#C5A059] text-[#E5C378] font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Pakistani Atelier Presets
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceTab('url')}
                  className={`pb-1 px-2 transition-colors cursor-pointer ${
                    imageSourceTab === 'url'
                      ? 'border-b-2 border-[#C5A059] text-[#E5C378] font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Paste Image URL
                </button>
              </div>

              {/* Tab 1: Upload from Disk / Drag & Drop */}
              {imageSourceTab === 'upload' && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => multiFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#C5A059] bg-[#C5A059]/10'
                      : 'border-[#3A2D37] hover:border-[#C5A059]/60 bg-[#1A141D]'
                  }`}
                >
                  {isProcessingImage ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-2">
                      <RefreshCw className="w-8 h-8 text-[#E5C378] animate-spin" />
                      <span className="text-xs font-mono text-stone-300">
                        Optimizing & uploading pictures...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#271E29] flex items-center justify-center text-[#E5C378]">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-mono font-bold text-white">
                        Click to select multiple pictures or drag & drop here
                      </div>
                      <p className="text-[11px] text-stone-400 max-w-sm">
                        Select multiple photos simultaneously (JPG, PNG, WEBP). They will be automatically compressed and added to this product's gallery.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Preset Pakistani Bridal Photos */}
              {imageSourceTab === 'preset' && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {presetImages.map((preset, idx) => {
                    const isAlreadyAdded = images.includes(preset.url);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!isAlreadyAdded) {
                            setImages((prev) => [...prev, preset.url]);
                          }
                        }}
                        className={`group relative aspect-[3/4] rounded-xl overflow-hidden border cursor-pointer transition-all ${
                          isAlreadyAdded
                            ? 'border-[#C5A059] ring-2 ring-[#C5A059]/50 opacity-90'
                            : 'border-[#3A2D37] hover:border-[#C5A059]'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                          <span className="text-[10px] text-white line-clamp-1 font-mono">
                            {preset.label}
                          </span>
                          {isAlreadyAdded ? (
                            <span className="text-[9px] text-[#E5C378] font-bold">Added</span>
                          ) : (
                            <span className="text-[9px] text-stone-300 group-hover:text-[#E5C378]">
                              + Add
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 3: Custom URL */}
              {imageSourceTab === 'url' && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://example.com/bridal-dress-image.jpg"
                    className="flex-1 bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    disabled={!customImageUrl.trim()}
                    className="px-4 py-2 bg-[#C5A059] hover:bg-[#b58f4a] disabled:opacity-40 text-[#180E12] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Add Image
                  </button>
                </div>
              )}

              {imageError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              {/* Gallery List of Added Pictures */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-mono text-stone-400">
                  Current Pictures ({images.length}) · The first picture marked with <Star className="w-3 h-3 inline text-[#E5C378] fill-[#E5C378]" /> is the primary storefront cover photo.
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {images.map((imgUrl, index) => {
                    const isPrimary = index === 0;
                    return (
                      <div
                        key={index}
                        className={`relative group aspect-[3/4] rounded-xl overflow-hidden border-2 bg-[#1A141D] ${
                          isPrimary
                            ? 'border-[#C5A059] shadow-lg ring-2 ring-[#C5A059]/40'
                            : 'border-[#3A2D37]'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Uploaded preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Primary Badge */}
                        {isPrimary && (
                          <div className="absolute top-1 left-1 bg-[#C5A059] text-[#141015] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow">
                            <Star className="w-2.5 h-2.5 fill-[#141015]" />
                            <span>Cover</span>
                          </div>
                        )}

                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(index)}
                              className="w-full py-1 px-1.5 rounded bg-[#C5A059] hover:bg-[#b58f4a] text-[#141015] font-mono text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                              title="Set as Cover Photo"
                            >
                              <Star className="w-3 h-3" />
                              <span>Make Cover</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="w-full py-1 px-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-mono text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            title="Remove picture"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 7: Description & Craftsman Notes */}
            <div className="space-y-4 pt-4 border-t border-[#261F28]">
              <div className="text-xs font-mono uppercase text-[#C5A059] font-bold">
                7. Description & Atelier Inclusions
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Couture Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. An exquisite heirloom bridal creation featuring bespoke silhouette and handcrafted motifs..."
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059] placeholder-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Hand-embroidery & Craftsmanship Details <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={craftDetails}
                    onChange={(e) => setCraftDetails(e.target.value)}
                    placeholder="e.g. Masterfully hand-worked in our Karachi atelier with 3D antique zardozi, dabka, and tilla flourishes..."
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059] placeholder-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-300 mb-1">
                    Ensemble Inclusions <span className="text-stone-400 font-normal">(Optional - One item per line)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={inclusionsText}
                    onChange={(e) => setInclusionsText(e.target.value)}
                    placeholder="16-Kali Embellished Skirt&#10;Hand-worked Blouse / Choli&#10;Heirloom Organza Dupatta with Kiran Lace"
                    className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] placeholder-stone-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-6 border-t border-[#2C222A] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#3A2D37] hover:bg-white/5 text-stone-300 text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b58f4a] text-[#180E12] font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isEditing ? 'Save Ensemble Changes' : 'Publish to Catalog'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Size Guide Reference Modal */}
      <SizeGuideModal
        isOpen={showSizeGuideModal}
        onClose={() => setShowSizeGuideModal(false)}
      />
    </>
  );
};
