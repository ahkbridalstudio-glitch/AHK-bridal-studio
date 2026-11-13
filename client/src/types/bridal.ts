export type OccasionType = 'Barat' | 'Walima' | 'Mehndi' | 'Nikah' | 'All';
export type StyleCategorySlug = 'kurta-set' | 'pishwas' | 'maxi' | 'garara' | 'lehenga' | 'sharara';

export type SilhouetteType = 
  | 'Royal Barat Lehenga'
  | 'Royal Farshi Gharara'
  | 'Walima Gown & Maxi'
  | 'Nikah Peshwas & Frock'
  | 'Festive Mehndi Angrakha';

export type FabricType = 
  | 'Pure Katan Raw Silk'
  | 'Royal Mirzapur Velvet'
  | 'Banarasi Handloom Jamawar'
  | 'Shimmer French Tissue'
  | 'Pure Silk Organza';

export type MetalTone = 
  | 'Antique Heirloom Gold'
  | 'Champagne Zardozi'
  | 'Platinum Silver Tilla'
  | 'Rose Gold & Copper';

export type PatternMotif = 
  | 'Mughal Mehraab (Royal Arches)'
  | 'Shikargah (Paisley & Flora)'
  | 'Floral Arabesque Jaal'
  | 'Geometric Chevron (Lehriya)'
  | 'Starburst Mukaish Chhatt';

export type BorderStyle = 
  | 'Heavy 12-Inch Scalloped Zardozi'
  | 'Royal 8-Inch Velvet Trim'
  | 'Refined 5-Inch Delicate Tilla';

export type NecklineStyle = 
  | 'Mughal Sweetheart'
  | 'Royal Panelled Angrakha'
  | 'Imperial Mandarin Collar'
  | 'Regal Victoria Boat Neck';

export type SleeveStyle = 
  | 'Full Heavy Embellished Sleeve'
  | 'Three-Quarter Mukaish Spray'
  | 'Sheer Organza with Rich Cuff';

export type DupattaStyle = 
  | 'Heirloom Golden Kiran Lace'
  | 'Scalloped Royal Velvet Border'
  | 'Double Dupatta (Head Veil + Drape)'
  | 'All-Over Starburst Mukaish';

export type EmbroideryTechnique = 
  | 'Zardozi & Naqshi'
  | 'Hand Dabka & Kora'
  | 'Tilla & Marori'
  | 'Gotapatti & Mirrors'
  | 'Fine Resham Shading';

export interface CustomDesignState {
  silhouette: SilhouetteType;
  fabric: FabricType;
  baseColor: string;
  blouseColor: string;
  dupattaColor: string;
  metalTone: MetalTone;
  technique: EmbroideryTechnique;
  patternMotif: PatternMotif;
  borderStyle: BorderStyle;
  neckline: NecklineStyle;
  sleeve: SleeveStyle;
  dupatta: DupattaStyle;
  embroideryDensity: number; // 30 to 100
  lightingMode: 'daylight' | 'candlelit';
  measurements: {
    bust: string;
    waist: string;
    hips: string;
    lehengaLength: string;
    shoulder: string;
    sleeveLength: string;
    notes: string;
  };
}

export type BridalSize = 'S' | 'M' | 'L' | 'XL';

export interface SizeGuideRow {
  parameter: 'SHOULDER' | 'BUST' | 'WAIST' | 'HIP' | 'DAMAN' | 'ARM-HOLE';
  label: string;
  S: number;
  M: number;
  L: number;
  XL: number;
  description: string;
}

export const AHK_SIZE_GUIDE: SizeGuideRow[] = [
  { parameter: 'SHOULDER', label: 'Shoulder', S: 14, M: 15, L: 16, XL: 17, description: 'Seam to seam across back shoulder line' },
  { parameter: 'BUST', label: 'Bust', S: 18, M: 20, L: 22, XL: 24, description: 'Circumference across the fullest part of bust' },
  { parameter: 'WAIST', label: 'Waist', S: 16, M: 18, L: 19, XL: 20, description: 'Circumference at natural waistline indentation' },
  { parameter: 'HIP', label: 'Hip', S: 18, M: 20, L: 21, XL: 22, description: 'Circumference around the fullest part of hips' },
  { parameter: 'DAMAN', label: 'Daman', S: 20, M: 22, L: 23, XL: 24, description: 'Width / flare of bottom shirt or choli hem' },
  { parameter: 'ARM-HOLE', label: 'Arm-Hole', S: 7, M: 8, L: 9, XL: 9, description: 'Curved measurement around the armhole seam' },
];

export interface BridalProduct {
  id: string;
  slug?: string;
  collections?: string[];
  styleCategory?: StyleCategorySlug | string;
  isBestSelling?: boolean;
  isNewArrival?: boolean;
  name: string;
  urduName?: string;
  occasion: 'Barat' | 'Walima' | 'Mehndi' | 'Nikah';
  silhouette?: string; // Optional input
  pricePKR: number;
  priceUSD: number;
  image: string;
  secondaryImage?: string;
  images?: string[]; // Multiple pictures support
  fabric?: string; // Optional input
  embroidery?: string[];
  colorway?: string;
  description: string;
  craftDetails?: string;
  inclusions?: string[];
  deliveryWeeks?: number;
  defaultCustomState?: Partial<CustomDesignState>;

  // Discount options
  isDiscounted?: boolean;
  discountPercent?: number; // e.g. 15 for 15%
  discountDurationDays?: number;
  discountStartedAt?: string;
  discountEndsAt?: string;
  originalPricePKR?: number;
  originalPriceUSD?: number;
  discountPricePKR?: number;
  discountPriceUSD?: number;

  // Inventory / Stock Level
  stock?: number;
  lowStockThreshold?: number;
  sku?: string;

  // Size options according to AHK Bridal Studio Size Guide
  availableSizes?: BridalSize[];
  selectedSize?: BridalSize | 'Customize Size' | string;
  customMeasurements?: CustomSizeMeasurements;

  // Color options
  availableColors?: string[];
  selectedColor?: string;
}

export interface CustomSizeMeasurements {
  shoulder: string;
  bust: string;
  hips: string;
  daman: string;
  armhole: string;
}

export function isProductOutOfStock(product?: { stock?: number } | null): boolean {
  if (!product) return false;
  return typeof product.stock === 'number' && product.stock <= 0;
}

export function getProductColors(product: BridalProduct | null | undefined): string[] {
  if (!product) return [];
  if (Array.isArray(product.availableColors) && product.availableColors.length > 0) {
    const list = product.availableColors.map((c) => c.trim()).filter(Boolean);
    if (list.length > 0) return list;
  }
  if (product.colorway && product.colorway.trim()) {
    // If multiple colors are listed with commas, slashes, or semicolons
    if (product.colorway.includes(',') || product.colorway.includes('/') || product.colorway.includes(';')) {
      const parts = product.colorway.split(/[,/;]+/).map((c) => c.trim()).filter(Boolean);
      if (parts.length > 1) return parts;
    }
    // Single colorway representation
    return [product.colorway.trim()];
  }
  return [];
}

export interface TrousseauItem {
  id: string;
  productId?: string;
  title: string;
  type: 'catalog' | 'custom';
  occasion: string;
  fabric: string;
  image?: string;
  pricePKR: number;
  priceUSD: number;
  originalPricePKR?: number;
  originalPriceUSD?: number;
  discountPercent?: number;
  size?: BridalSize | 'Customize Size' | string;
  color?: string;
  quantity: number;
  customDetails?: Partial<CustomDesignState>;
  customMeasurements?: CustomSizeMeasurements;
}
