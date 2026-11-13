import React, { useState, useId } from 'react';
import { 
  Sparkles, 
  Sliders, 
  Layers, 
  Palette, 
  Ruler, 
  Sun, 
  Moon, 
  ShoppingBag, 
  Calendar, 
  Download, 
  RotateCcw,
  Check, 
  Maximize2, 
  ZoomIn, 
  Clock, 
  Users, 
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  CustomDesignState, 
  SilhouetteType, 
  FabricType, 
  MetalTone, 
  PatternMotif, 
  BorderStyle, 
  NecklineStyle, 
  SleeveStyle, 
  DupattaStyle, 
  EmbroideryTechnique 
} from '../types/bridal';
import { PALETTE_PRESETS } from '../data/bridalData';

interface CustomAtelierProps {
  initialState?: Partial<CustomDesignState>;
  onAddToTrousseau: (state: CustomDesignState, pricePKR: number, priceUSD: number) => void;
  onOrderNow: (state: CustomDesignState, pricePKR: number, priceUSD: number) => void;
  onContactUs: () => void;
}

const DEFAULT_STATE: CustomDesignState = {
  silhouette: 'Royal Barat Lehenga',
  fabric: 'Pure Katan Raw Silk',
  baseColor: '#7A0C1E', // Sultanat Crimson
  blouseColor: '#650817',
  dupattaColor: '#8C1226',
  metalTone: 'Antique Heirloom Gold',
  technique: 'Zardozi & Naqshi',
  patternMotif: 'Mughal Mehraab (Royal Arches)',
  borderStyle: 'Heavy 12-Inch Scalloped Zardozi',
  neckline: 'Mughal Sweetheart',
  sleeve: 'Full Heavy Embellished Sleeve',
  dupatta: 'Heirloom Golden Kiran Lace',
  embroideryDensity: 85,
  lightingMode: 'candlelit',
  measurements: {
    bust: '36',
    waist: '28',
    hips: '39',
    lehengaLength: '43',
    shoulder: '14.5',
    sleeveLength: '22',
    notes: 'Require extra 2 inches margin inside the choli side seams for bridal adjustments.'
  }
};

type AtelierTab = 'silhouette' | 'fabric' | 'palette' | 'patterns' | 'craft' | 'measurements';

export const CustomAtelier: React.FC<CustomAtelierProps> = ({
  initialState,
  onAddToTrousseau,
  onOrderNow,
  onContactUs,
}) => {
  const [design, setDesign] = useState<CustomDesignState>({
    ...DEFAULT_STATE,
    ...initialState
  });

  const [activeTab, setActiveTab] = useState<AtelierTab>('silhouette');
  const [viewMode, setViewMode] = useState<'full' | 'daman' | 'swatch'>('full');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(0);

  // Generate unique IDs for SVG gradients to prevent ID collisions
  const goldGradId = useId();
  const silverGradId = useId();
  const copperGradId = useId();
  const champagneGradId = useId();
  const velvetTextureId = useId();

  const calculatePrice = () => {
    let basePKR = 550000;
    if (design.silhouette === 'Royal Farshi Gharara') basePKR += 260000;
    else if (design.silhouette === 'Royal Barat Lehenga') basePKR += 220000;
    else if (design.silhouette === 'Walima Gown & Maxi') basePKR += 150000;
    else if (design.silhouette === 'Nikah Peshwas & Frock') basePKR += 80000;

    if (design.fabric === 'Royal Mirzapur Velvet') basePKR += 90000;
    if (design.fabric === 'Banarasi Handloom Jamawar') basePKR += 70000;

    if (design.borderStyle === 'Heavy 12-Inch Scalloped Zardozi') basePKR += 75000;

    const densityAddon = Math.round((design.embroideryDensity - 50) * 1500);
    const finalPKR = Math.max(480000, basePKR + densityAddon);
    const finalUSD = Math.round(finalPKR / 280);

    return { finalPKR, finalUSD };
  };

  const { finalPKR, finalUSD } = calculatePrice();
  const karigarCount = Math.min(12, Math.max(6, Math.round(design.embroideryDensity / 12)));

  // Preset palette applicator
  const applyPreset = (preset: typeof PALETTE_PRESETS[0], idx: number) => {
    setActivePresetIndex(idx);
    setDesign(prev => ({
      ...prev,
      baseColor: preset.baseColor,
      blouseColor: preset.blouseColor,
      dupattaColor: preset.dupattaColor,
      metalTone: preset.metalTone as any
    }));
  };

  const handleSaveToTrousseau = () => {
    onAddToTrousseau(design, finalPKR, finalUSD);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDownloadSpec = () => {
    const specText = `
=========================================
AHK BRIDAL STUDIO
OFFICIAL HEIRLOOM SPECIFICATION SHEET
=========================================
Date: ${new Date().toLocaleDateString('en-GB')}
Ensemble Silhouette: ${design.silhouette}
Fabric Base: ${design.fabric}
Embroidery Technique: ${design.technique}
Metal Tone: ${design.metalTone}
Pattern Motif: ${design.patternMotif}
Border Style: ${design.borderStyle}
Neckline: ${design.neckline}
Sleeve Embellishment: ${design.sleeve}
Dupatta Trim: ${design.dupatta}
Embroidery Density: ${design.embroideryDensity}%

COLOR HARMONY:
- Skirt Base: ${design.baseColor}
- Blouse/Choli: ${design.blouseColor}
- Dupatta Veil: ${design.dupattaColor}

BESPOKE MEASUREMENTS:
- Bust: ${design.measurements.bust}"
- Waist: ${design.measurements.waist}"
- Hips: ${design.measurements.hips}"
- Lehenga Length: ${design.measurements.lehengaLength}"
- Shoulder: ${design.measurements.shoulder}"
- Sleeve Length: ${design.measurements.sleeveLength}"
- Fitting Notes: ${design.measurements.notes}

CRAFTSMANSHIP METRICS:
- Master Karigars Assigned: ${karigarCount} Dedicated Karigars
- Construction Timeline: 10 - 14 Weeks
- Estimated Price: PKR ${finalPKR.toLocaleString()} (approx. $${finalUSD.toLocaleString()} USD)
=========================================
Boutique Address: Shop # G-32, Ground Floor, AHK Studio, Dolmen Mall, Tariq Road, Karachi, Pakistan
Inquiries & WhatsApp: +92 300 8456789 | Email: karachi@ahkbridal.com
`;

    const blob = new Blob([specText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AHK-Bridal-Studio-Spec-${design.silhouette.replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper for metal stroke colors in SVG
  const getMetalColor = () => {
    switch (design.metalTone) {
      case 'Antique Heirloom Gold':
        return `url(#${goldGradId})`;
      case 'Champagne Zardozi':
        return `url(#${champagneGradId})`;
      case 'Platinum Silver Tilla':
        return `url(#${silverGradId})`;
      case 'Rose Gold & Copper':
        return `url(#${copperGradId})`;
      default:
        return `url(#${goldGradId})`;
    }
  };

  const getMetalSolid = () => {
    switch (design.metalTone) {
      case 'Antique Heirloom Gold':
        return '#D4AF37';
      case 'Champagne Zardozi':
        return '#E5D3A3';
      case 'Platinum Silver Tilla':
        return '#E0E0E0';
      case 'Rose Gold & Copper':
        return '#D99B82';
      default:
        return '#D4AF37';
    }
  };

  return (
    <section id="atelier" className="py-12 lg:py-20 bg-[#F5EFEB] border-b border-[#E0D2C3] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#997A3D] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Interactive Bespoke Atelier</span>
            <span aria-hidden="true">·</span>
            <span>Kargah Studio</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#360810] font-normal tracking-tight text-balance">
            Personalize Your Pakistani Bridal Ensemble
          </h2>
          <p className="text-sm sm:text-base text-[#68554E] leading-relaxed">
            Every bride possesses an individual vision of royal grace. Sculpt your silhouette, select authentic Mughal patterns, customize royal color schemes, and visualize handcrafted gold zardozi in real-time.
          </p>
        </div>

        {/* Main 2-Column Customizer Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Live Visual SVG Canvas & Preview Mode (5 cols) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className={`relative rounded-2xl overflow-hidden border border-[#D5C2AD] shadow-xl transition-all duration-500 ${
              design.lightingMode === 'candlelit' 
                ? 'bg-[#180E12] text-[#FAF8F5]' 
                : 'bg-[#FAF8F5] text-[#2D2427]'
            }`}>
              
              {/* Studio Canvas Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#D5C2AD]/40 text-xs">
                {/* Lighting Toggle */}
                <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded-md">
                  <button
                    onClick={() => setDesign(p => ({ ...p, lightingMode: 'daylight' }))}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                      design.lightingMode === 'daylight' 
                        ? 'bg-[#FAF8F5] text-[#4A0E17] shadow-sm' 
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>Courtyard Day</span>
                  </button>
                  <button
                    onClick={() => setDesign(p => ({ ...p, lightingMode: 'candlelit' }))}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                      design.lightingMode === 'candlelit' 
                        ? 'bg-[#4A0E17] text-[#FAF8F5] shadow-sm' 
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Moon className="w-3 h-3 text-[#E5C378]" />
                    <span>Candlelit Hall</span>
                  </button>
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <button
                    onClick={() => setViewMode('full')}
                    className={`px-2 py-1 rounded transition-colors ${
                      viewMode === 'full' 
                        ? 'bg-[#C5A059]/20 text-[#C5A059] font-bold' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    Ensemble
                  </button>
                  <span>/</span>
                  <button
                    onClick={() => setViewMode('daman')}
                    className={`px-2 py-1 rounded transition-colors ${
                      viewMode === 'daman' 
                        ? 'bg-[#C5A059]/20 text-[#C5A059] font-bold' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    Daman Hem
                  </button>
                  <span>/</span>
                  <button
                    onClick={() => setViewMode('swatch')}
                    className={`px-2 py-1 rounded transition-colors ${
                      viewMode === 'swatch' 
                        ? 'bg-[#C5A059]/20 text-[#C5A059] font-bold' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    Fabric
                  </button>
                </div>
              </div>

              {/* The Visual SVG Canvas */}
              <div className="relative aspect-[3/4] p-4 flex items-center justify-center overflow-hidden">
                {/* Candlelit Ambient Chandelier Glow Effect */}
                {design.lightingMode === 'candlelit' && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
                    style={{
                      background: 'radial-gradient(circle at 50% 25%, rgba(229,195,120,0.45) 0%, rgba(212,175,55,0.15) 45%, transparent 75%)'
                    }}
                  />
                )}

                {/* VIEW MODE 1: FULL BRIDAL SILHOUETTE SVG */}
                {viewMode === 'full' && (
                  <svg 
                    viewBox="0 0 500 700" 
                    className="w-full h-full max-h-[580px] drop-shadow-2xl transition-all duration-300"
                    style={{ transform: 'scale(1.02)' }}
                  >
                    <defs>
                      {/* Metallic Shimmer Gradients */}
                      <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C5A059" />
                        <stop offset="25%" stopColor="#FFF2A7" />
                        <stop offset="50%" stopColor="#AA771C" />
                        <stop offset="75%" stopColor="#F9E8A2" />
                        <stop offset="100%" stopColor="#8C6211" />
                      </linearGradient>

                      <linearGradient id={silverGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D5D9E0" />
                        <stop offset="35%" stopColor="#FFFFFF" />
                        <stop offset="65%" stopColor="#98A2B3" />
                        <stop offset="100%" stopColor="#ECEFF3" />
                      </linearGradient>

                      <linearGradient id={champagneGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E2CFA7" />
                        <stop offset="40%" stopColor="#FCF8ED" />
                        <stop offset="75%" stopColor="#C2A877" />
                        <stop offset="100%" stopColor="#F5E8D0" />
                      </linearGradient>

                      <linearGradient id={copperGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#CB7D65" />
                        <stop offset="30%" stopColor="#F7DDD4" />
                        <stop offset="70%" stopColor="#A8523A" />
                        <stop offset="100%" stopColor="#E09C86" />
                      </linearGradient>

                      {/* Fabric Texture Pattern */}
                      <pattern id={velvetTextureId} width="20" height="20" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="20" y2="20" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                        <line x1="20" y1="0" x2="0" y2="20" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
                      </pattern>

                      {/* Kiran Lace Filter for fringe gleam */}
                      <filter id="kiranGlow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#C5A059" floodOpacity="0.6" />
                      </filter>
                    </defs>

                    {/* DUPATTA BACK VEIL (Flowing behind shoulders) */}
                    <path
                      d="M 180,80 Q 140,250 110,620 Q 250,650 390,620 Q 360,250 320,80 Z"
                      fill={design.dupattaColor}
                      fillOpacity={design.fabric === 'Pure Silk Organza' ? '0.45' : '0.65'}
                    />

                    {/* STARBURST MUKAISH SPRAY ON VEIL */}
                    {(design.patternMotif === 'Starburst Mukaish Chhatt' || design.dupatta === 'All-Over Starburst Mukaish') && (
                      <g fill={getMetalSolid()} opacity="0.85">
                        {[
                          [140, 200], [170, 160], [130, 290], [160, 360], [130, 450], [150, 520],
                          [360, 200], [330, 160], [370, 290], [340, 360], [370, 450], [350, 520],
                          [200, 140], [300, 140], [250, 170]
                        ].map(([cx, cy], i) => (
                          <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? "2" : "1.5"} />
                        ))}
                      </g>
                    )}

                    {/* BASE SKIRT / LEHENGA / GHARARA / GOWN */}
                    {design.silhouette === 'Royal Farshi Gharara' ? (
                      // Farshi Gharara with knee gathers and trailing flare
                      <g>
                        {/* Upper Kurti Thighs */}
                        <path d="M 210,230 L 290,230 L 305,370 L 195,370 Z" fill={design.baseColor} />
                        {/* Knee Gote Band (Rich Zari joint) */}
                        <rect x="185" y="370" width="130" height="18" rx="2" fill={getMetalColor()} />
                        {/* Left Gharara Leg Flare with trailing waves */}
                        <path
                          d="M 195,388 Q 140,480 60,650 Q 160,665 240,650 Q 225,510 240,388 Z"
                          fill={design.baseColor}
                        />
                        {/* Right Gharara Leg Flare with trailing waves */}
                        <path
                          d="M 260,388 Q 275,510 260,650 Q 340,665 440,650 Q 360,480 305,388 Z"
                          fill={design.baseColor}
                        />
                        {/* Gharara Daman Border */}
                        <path
                          d="M 60,650 Q 160,665 240,650 L 236,630 Q 160,645 70,630 Z"
                          fill={getMetalColor()}
                        />
                        <path
                          d="M 260,650 Q 340,665 440,650 L 430,630 Q 340,645 264,630 Z"
                          fill={getMetalColor()}
                        />
                      </g>
                    ) : design.silhouette === 'Nikah Peshwas & Frock' ? (
                      // Flowing 24-Kali Peshwas Frock
                      <g>
                        <path
                          d="M 215,220 Q 200,380 90,650 Q 250,675 410,650 Q 300,380 285,220 Z"
                          fill={design.baseColor}
                        />
                        {/* Vertical Kalis Lines */}
                        <g stroke={getMetalSolid()} strokeWidth="0.8" opacity="0.6">
                          <path d="M 220,225 Q 210,400 130,650" />
                          <path d="M 235,225 Q 230,400 190,655" />
                          <path d="M 250,225 Q 250,400 250,660" />
                          <path d="M 265,225 Q 270,400 310,655" />
                          <path d="M 280,225 Q 290,400 370,650" />
                        </g>
                      </g>
                    ) : design.silhouette === 'Walima Gown & Maxi' ? (
                      // Elegant Floor-length Maxi Gown with sweeping train
                      <g>
                        <path
                          d="M 215,215 Q 185,390 80,660 Q 250,685 420,660 Q 315,390 285,215 Z"
                          fill={design.baseColor}
                        />
                        {/* Flowing overlay train shadows */}
                        <path
                          d="M 80,660 Q 30,675 50,685 Q 250,710 450,685 Q 470,675 420,660 Z"
                          fill={design.baseColor}
                          opacity="0.8"
                        />
                      </g>
                    ) : (
                      // Royal Barat Lehenga (Voluminous 16-kali skirt)
                      <g>
                        <path
                          d="M 210,230 Q 180,410 70,645 Q 250,675 430,645 Q 320,410 290,230 Z"
                          fill={design.baseColor}
                        />
                        {/* Skirt pleats and shadow folds */}
                        <g stroke="rgba(0,0,0,0.2)" strokeWidth="1.2">
                          <path d="M 220,235 Q 195,420 120,645" />
                          <path d="M 235,235 Q 225,430 180,655" />
                          <path d="M 250,235 Q 250,440 250,660" />
                          <path d="M 265,235 Q 275,430 320,655" />
                          <path d="M 280,235 Q 305,420 380,645" />
                        </g>
                      </g>
                    )}

                    {/* EMBROIDERY MOTIFS ON SKIRT */}
                    <g opacity={Math.min(1, design.embroideryDensity / 85)}>
                      {design.patternMotif === 'Mughal Mehraab (Royal Arches)' && (
                        // Repeated Mughal Arches with floral center
                        <g stroke={getMetalColor()} fill="none" strokeWidth="2">
                          {[110, 160, 215, 270, 325, 380].map((x, i) => (
                            <g key={i}>
                              <path d={`M ${x-18},610 Q ${x},550 ${x+18},610`} />
                              <circle cx={x} cy={575} r="4" fill={getMetalSolid()} />
                              <path d={`M ${x},575 L ${x},595`} strokeWidth="1.5" />
                              <path d={`M ${x-6},590 Q ${x},580 ${x+6},590`} />
                            </g>
                          ))}
                        </g>
                      )}

                      {design.patternMotif === 'Shikargah (Paisley & Flora)' && (
                        // Flowing Paisley medallions (Kalka)
                        <g fill={getMetalColor()} stroke={getMetalSolid()} strokeWidth="0.8">
                          {[
                            [130, 560, 0.7], [180, 520, 0.8], [240, 550, 0.85],
                            [300, 520, 0.8], [350, 560, 0.7], [200, 440, 0.6], [280, 440, 0.6]
                          ].map(([x, y, scale], i) => (
                            <g key={i} transform={`translate(${x}, ${y}) scale(${scale})`}>
                              <path d="M 0,25 C -15,10 -15,-15 0,-25 C 10,-30 20,-15 15,0 C 12,12 8,22 0,25 Z" />
                              <circle cx="2" cy="0" r="3" fill="#FAF8F5" opacity="0.6" />
                            </g>
                          ))}
                        </g>
                      )}

                      {design.patternMotif === 'Floral Arabesque Jaal' && (
                        // Diamond lattice mesh across skirt
                        <g stroke={getMetalSolid()} strokeWidth="1" strokeDasharray="3 3" opacity="0.75">
                          {[
                            "M 100,600 L 250,450 L 400,600",
                            "M 130,630 L 250,510 L 370,630",
                            "M 160,650 L 250,560 L 340,650",
                            "M 120,490 L 250,620 L 380,490"
                          ].map((d, i) => (
                            <path key={i} d={d} />
                          ))}
                          {/* Diamond intersection florets */}
                          {[
                            [250, 450], [250, 510], [250, 560], [200, 500], [300, 500], [175, 555], [325, 555]
                          ].map(([cx, cy], i) => (
                            <circle key={i} cx={cx} cy={cy} r="3" fill={getMetalSolid()} />
                          ))}
                        </g>
                      )}

                      {design.patternMotif === 'Geometric Chevron (Lehriya)' && (
                        // Rhythmic zig-zag waves
                        <g stroke={getMetalSolid()} strokeWidth="1.6" fill="none" opacity="0.8">
                          {[470, 505, 540, 575].map((y, i) => (
                            <path
                              key={i}
                              d={`M 110,${y+15} L 160,${y} L 210,${y+15} L 250,${y} L 290,${y+15} L 340,${y} L 390,${y+15}`}
                            />
                          ))}
                        </g>
                      )}
                    </g>

                    {/* DAMAN BOTTOM BORDER (Customized Depth) */}
                    {design.borderStyle === 'Heavy 12-Inch Scalloped Zardozi' ? (
                      <g>
                        {/* 12-Inch Deep Scalloped Zardozi Hem */}
                        <path
                          d="M 70,645 Q 250,675 430,645 L 425,605 Q 250,635 75,605 Z"
                          fill={getMetalColor()}
                        />
                        {/* Scallops along the lower hem */}
                        <path
                          d="M 70,645 Q 100,655 130,648 Q 160,660 190,652 Q 220,665 250,660 Q 280,665 310,652 Q 340,660 370,648 Q 400,655 430,645"
                          stroke={getMetalSolid()}
                          strokeWidth="3"
                          fill="none"
                        />
                      </g>
                    ) : design.borderStyle === 'Royal 8-Inch Velvet Trim' ? (
                      <g>
                        <path
                          d="M 72,645 Q 250,675 428,645 L 424,620 Q 250,650 76,620 Z"
                          fill="#3A0810"
                        />
                        <path
                          d="M 72,645 Q 250,675 428,645"
                          stroke={getMetalColor()}
                          strokeWidth="4"
                          fill="none"
                        />
                      </g>
                    ) : (
                      // 5-Inch Delicate Tilla Trim
                      <path
                        d="M 73,645 Q 250,675 427,645"
                        stroke={getMetalColor()}
                        strokeWidth="3.5"
                        fill="none"
                      />
                    )}

                    {/* KIRAN LACE FRINGE ALONG LEHENGA HEM */}
                    {design.dupatta === 'Heirloom Golden Kiran Lace' && (
                      <g stroke={getMetalSolid()} strokeWidth="1" opacity="0.9" filter="url(#kiranGlow)">
                        {Array.from({ length: 42 }).map((_, i) => {
                          const x = 75 + i * 8.4;
                          const y = 645 + Math.sin((i / 42) * Math.PI) * 20;
                          return (
                            <line key={i} x1={x} y1={y} x2={x + 1} y2={y + 8} />
                          );
                        })}
                      </g>
                    )}

                    {/* CHOLI / BLOUSE / KURTI */}
                    <g>
                      {/* Blouse Body */}
                      <path
                        d="M 205,130 L 295,130 L 290,225 L 210,225 Z"
                        fill={design.blouseColor}
                      />

                      {/* Neckline Cutouts & Trim */}
                      {design.neckline === 'Mughal Sweetheart' ? (
                        <g>
                          <path
                            d="M 225,130 Q 235,160 250,172 Q 265,160 275,130"
                            stroke={getMetalColor()}
                            strokeWidth="3"
                            fill="none"
                          />
                          <path
                            d="M 225,130 Q 235,160 250,172 Q 265,160 275,130 Z"
                            fill="#F2DFC9" // skin tone
                          />
                        </g>
                      ) : design.neckline === 'Royal Panelled Angrakha' ? (
                        <g>
                          <path
                            d="M 225,130 L 285,185 L 290,225"
                            stroke={getMetalColor()}
                            strokeWidth="3"
                            fill="none"
                          />
                          {/* Festive Silk Tassels (Latkan) */}
                          <circle cx="282" cy="188" r="4" fill="#C5A059" />
                          <line x1="282" y1="188" x2="280" y2="210" stroke="#C5A059" strokeWidth="1.5" />
                        </g>
                      ) : design.neckline === 'Imperial Mandarin Collar' ? (
                        <g>
                          <path d="M 230,126 L 270,126 L 268,140 L 232,140 Z" fill={getMetalColor()} />
                          <path d="M 250,140 L 250,180" stroke={getMetalColor()} strokeWidth="2" />
                        </g>
                      ) : (
                        // Regal Victoria Boat Neck
                        <g>
                          <path
                            d="M 215,130 Q 250,145 285,130"
                            stroke={getMetalColor()}
                            strokeWidth="3.5"
                            fill="none"
                          />
                          <path d="M 215,130 Q 250,145 285,130 Z" fill="#F2DFC9" />
                        </g>
                      )}

                      {/* SLEEVES */}
                      {design.sleeve === 'Full Heavy Embellished Sleeve' ? (
                        <g>
                          {/* Left Arm Full */}
                          <path d="M 205,130 L 165,240 L 175,244 L 210,150 Z" fill={design.blouseColor} />
                          {/* Right Arm Full */}
                          <path d="M 295,130 L 335,240 L 325,244 L 290,150 Z" fill={design.blouseColor} />
                          {/* Embellished Cuffs */}
                          <rect x="162" y="235" width="15" height="10" fill={getMetalColor()} transform="rotate(-20 162 235)" />
                          <rect x="323" y="235" width="15" height="10" fill={getMetalColor()} transform="rotate(20 323 235)" />
                        </g>
                      ) : design.sleeve === 'Three-Quarter Mukaish Spray' ? (
                        <g>
                          <path d="M 205,130 L 175,205 L 186,210 L 210,150 Z" fill={design.blouseColor} />
                          <path d="M 295,130 L 325,205 L 314,210 L 290,150 Z" fill={design.blouseColor} />
                          {/* Mukaish dots */}
                          <circle cx="190" cy="170" r="1.5" fill={getMetalSolid()} />
                          <circle cx="182" cy="190" r="1.5" fill={getMetalSolid()} />
                          <circle cx="310" cy="170" r="1.5" fill={getMetalSolid()} />
                          <circle cx="318" cy="190" r="1.5" fill={getMetalSolid()} />
                        </g>
                      ) : (
                        // Sheer Organza with Rich Cuff
                        <g>
                          <path d="M 205,130 L 165,240 L 175,244 L 210,150 Z" fill={design.blouseColor} opacity="0.5" />
                          <path d="M 295,130 L 335,240 L 325,244 L 290,150 Z" fill={design.blouseColor} opacity="0.5" />
                          <rect x="160" y="235" width="18" height="12" fill={getMetalColor()} transform="rotate(-20 160 235)" />
                          <rect x="322" y="235" width="18" height="12" fill={getMetalColor()} transform="rotate(20 322 235)" />
                        </g>
                      )}

                      {/* Choli Waist Border */}
                      <rect x="210" y="218" width="80" height="7" fill={getMetalColor()} />
                    </g>

                    {/* DUPATTA FRONT DRAPE & MATHA PATTI / VEIL */}
                    <g>
                      {/* Draped Pallu across torso */}
                      <path
                        d="M 200,130 Q 230,190 280,260 Q 320,330 360,420 Q 340,430 310,340 Q 260,250 190,140 Z"
                        fill={design.dupattaColor}
                        fillOpacity={design.fabric === 'Pure Silk Organza' ? '0.6' : '0.8'}
                      />
                      {/* Scalloped Gold Pallu Border */}
                      <path
                        d="M 200,130 Q 230,190 280,260 Q 320,330 360,420"
                        stroke={getMetalColor()}
                        strokeWidth="3.5"
                        fill="none"
                      />

                      {/* Dupatta Kiran Fringe along the drape */}
                      {design.dupatta === 'Heirloom Golden Kiran Lace' && (
                        <g stroke={getMetalSolid()} strokeWidth="0.8" opacity="0.85">
                          {Array.from({ length: 24 }).map((_, i) => {
                            const t = i / 24;
                            const x = 200 + t * 160;
                            const y = 130 + t * 290;
                            return (
                              <line key={i} x1={x} y1={y} x2={x - 4} y2={y + 5} />
                            );
                          })}
                        </g>
                      )}

                      {/* Head Veil Contour & Matha Patti Jewelry */}
                      <path
                        d="M 220,70 Q 250,55 280,70 Q 275,100 250,110 Q 225,100 220,70 Z"
                        fill="#F2DFC9" // Bride face contour
                      />
                      {/* Hair Bun */}
                      <path d="M 230,62 Q 250,52 270,62 Z" fill="#1C1417" />
                      {/* Matha Patti Head Jewelry */}
                      <path
                        d="M 222,70 Q 250,62 278,70"
                        stroke={getMetalColor()}
                        strokeWidth="2.5"
                        fill="none"
                      />
                      {/* Tikka Pendant */}
                      <circle cx="250" cy="74" r="3" fill={getMetalSolid()} />
                      <line x1="250" y1="62" x2="250" y2="72" stroke={getMetalSolid()} strokeWidth="1" />
                      
                      {/* Nose Ring (Nath) */}
                      <circle cx="244" cy="94" r="3.5" stroke={getMetalSolid()} strokeWidth="0.8" fill="none" />
                      <path d="M 244,92 Q 235,84 225,80" stroke={getMetalSolid()} strokeWidth="0.6" fill="none" />
                      
                      {/* Polki Guluband Choker Necklace */}
                      <path
                        d="M 235,122 Q 250,132 265,122"
                        stroke={getMetalColor()}
                        strokeWidth="3.5"
                        fill="none"
                      />
                    </g>
                  </svg>
                )}

                {/* VIEW MODE 2: DAMAN BORDER MACRO CLOSEUP */}
                {viewMode === 'daman' && (
                  <div className="w-full h-full flex flex-col justify-center items-center p-6 space-y-4">
                    <div className="w-full max-w-sm rounded-xl p-6 border border-[#C5A059]/40 shadow-inner relative overflow-hidden"
                         style={{ backgroundColor: design.baseColor }}>
                      <div className="text-[10px] uppercase tracking-widest text-[#FAF8F5]/80 mb-2 font-mono">
                        Macro Kargah View · {design.fabric}
                      </div>

                      {/* Handcraft Zardozi Simulation */}
                      <div className="space-y-4">
                        <div className="h-6 w-full rounded flex items-center justify-around border-t-2 border-b-2"
                             style={{ borderColor: getMetalSolid() }}>
                          {Array.from({ length: 8 }).map((_, i) => (
                            <span key={i} className="text-xs" style={{ color: getMetalSolid() }}>✦</span>
                          ))}
                        </div>

                        {/* Motif preview */}
                        <div className="py-6 flex justify-center items-center">
                          <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md">
                            {design.patternMotif === 'Mughal Mehraab (Royal Arches)' ? (
                              <path d="M 20,80 Q 20,40 50,20 Q 80,40 80,80 Z M 50,45 A 5 5 0 1 0 50 55 A 5 5 0 1 0 50 45"
                                    fill="none" stroke={getMetalSolid()} strokeWidth="3" />
                            ) : design.patternMotif === 'Shikargah (Paisley & Flora)' ? (
                              <path d="M 50,15 C 30,30 30,60 50,85 C 65,70 70,50 65,35 C 60,20 55,10 50,15 Z"
                                    fill={getMetalSolid()} />
                            ) : (
                              <g stroke={getMetalSolid()} strokeWidth="2" fill="none">
                                <circle cx="50" cy="50" r="25" />
                                <path d="M 25,50 L 75,50 M 50,25 L 50,75" />
                              </g>
                            )}
                          </svg>
                        </div>

                        {/* Fringe */}
                        <div className="flex justify-between border-t border-[#C5A059] pt-2">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="w-0.5 h-6 rounded-full" style={{ backgroundColor: getMetalSolid() }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-stone-400">
                      Simulated 12-strand hand-coiled dabka & bullion metal wire
                    </div>
                  </div>
                )}

                {/* VIEW MODE 3: FABRIC SWATCH MACRO */}
                {viewMode === 'swatch' && (
                  <div className="w-full h-full flex flex-col justify-center items-center p-6 space-y-4">
                    <div className="w-64 h-64 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
                         style={{ backgroundColor: design.baseColor }}>
                      <div className="flex justify-between items-start text-white">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider font-mono opacity-80">Heritage Swatch</div>
                          <div className="font-serif text-lg font-bold">{design.fabric}</div>
                        </div>
                        <div className="w-6 h-6 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: getMetalSolid() }} />
                      </div>

                      <div className="space-y-2 text-white/90 text-xs">
                        <div className="flex justify-between">
                          <span className="opacity-70">Weave Grade:</span>
                          <span className="font-mono font-medium">85 GSM Pure Katan</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Thread Count:</span>
                          <span className="font-mono font-medium">100% Mulberry Silk</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Embellishment:</span>
                          <span className="font-medium">{design.technique}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-stone-400">
                      Hand-dyed in authentic heritage earthen vats
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Live Calculations Bar */}
              <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-[#D5C2AD]/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#C5A059]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Atelier Lead Time:</span>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-sm">
                    10 - 14 Weeks
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#C5A059]">
                    <Users className="w-3.5 h-3.5" />
                    <span>Master Karigars Assigned:</span>
                  </div>
                  <span className="font-mono tabular-nums font-semibold">
                    {karigarCount} Dedicated Karigars
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">Bespoke Estimate</div>
                    <div className="font-serif text-xl sm:text-2xl font-bold text-[#E5C378]">
                      PKR {finalPKR.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">International USD</div>
                    <div className="font-mono text-base font-semibold text-stone-200">
                      ${finalUSD.toLocaleString()} USD
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Below Canvas */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSaveToTrousseau}
                  className="py-3 px-3 bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#E5C378]" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onOrderNow(design, finalPKR, finalUSD)}
                  className="py-3 px-3 bg-[#C5A059] hover:bg-[#B38728] text-[#1C1417] text-xs uppercase tracking-wider font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#1C1417]" />
                  <span>Order Now</span>
                </button>
              </div>

              <button
                onClick={handleDownloadSpec}
                className="w-full py-2.5 px-4 bg-[#FAF8F5] hover:bg-[#FAF0E1] text-[#4A0E17] border border-[#C5A059] text-xs uppercase tracking-wider font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Export Official Spec Sheet</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls & Tabs (7 cols) */}
          <div className="lg:col-span-7 bg-[#FAF8F5] rounded-2xl border border-[#D5C2AD] p-6 sm:p-8 shadow-sm space-y-8">
            
            {/* Tab Navigation Header (Clean segmented buttons, no candy pills) */}
            <div className="flex items-center gap-1.5 p-1.5 bg-[#EFE7DE] rounded-xl overflow-x-auto no-scrollbar">
              {[
                { id: 'silhouette', label: '1. Silhouette', icon: Layers },
                { id: 'fabric', label: '2. Fabric', icon: Sparkles },
                { id: 'palette', label: '3. Colors & Zari', icon: Palette },
                { id: 'patterns', label: '4. Motifs & Cuts', icon: Sliders },
                { id: 'craft', label: '5. Zardozi Density', icon: Sparkles },
                { id: 'measurements', label: '6. Sizing', icon: Ruler },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium uppercase tracking-wider rounded-lg transition-all whitespace-nowrap shrink-0 ${
                      isActive 
                        ? 'bg-[#4A0E17] text-[#FAF8F5] shadow-sm' 
                        : 'text-[#68554E] hover:text-[#4A0E17] hover:bg-[#E5DBD0]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E5C378]' : 'text-[#997A3D]'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: SILHOUETTES */}
            {activeTab === 'silhouette' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-[#360810]">Select Royal Bridal Silhouette</h3>
                  <p className="text-xs text-[#78655E] mt-1">
                    Choose the traditional architectural form for your wedding occasion.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'Royal Barat Lehenga',
                      urdu: 'شاہی لہنگا',
                      occasion: 'Barat Ceremony',
                      desc: 'A grand 16-kali flared skirt with heavy velvet daman border, fitted choli, and signature draped head veil.'
                    },
                    {
                      id: 'Royal Farshi Gharara',
                      urdu: 'فرشی غرارہ',
                      occasion: 'Barat / Shehnai Tradition',
                      desc: 'Awadhi & Lahori royal heritage silhouette with flared knee-gathers and a majestic sweeping court trail.'
                    },
                    {
                      id: 'Walima Gown & Maxi',
                      urdu: 'ولیمہ گاؤن',
                      occasion: 'Walima Reception',
                      desc: 'Contemporary floor-length trailing gown embellished with crystalline cut-dana and sheer cape dupatta.'
                    },
                    {
                      id: 'Nikah Peshwas & Frock',
                      urdu: 'پیشواز و فراک',
                      occasion: 'Nikah / Serene Purity',
                      desc: 'Timeless 24-kali cascading Peshwas frock with Banarasi brocade churidar and mukaish veil.'
                    },
                    {
                      id: 'Festive Mehndi Angrakha',
                      urdu: 'مہندی انگورکھا',
                      occasion: 'Mehndi & Mayun',
                      desc: 'Asymmetric overlapping placket with handcrafted latkans, gotapatti borders, and vibrant colors.'
                    }
                  ].map(item => {
                    const isSelected = design.silhouette === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setDesign(p => ({ ...p, silhouette: item.id as SilhouetteType }))}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#4A0E17] bg-[#FAF0E1] ring-1 ring-[#4A0E17]'
                            : 'border-[#E0D2C3] bg-white hover:border-[#C5A059]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-serif text-base font-semibold text-[#360810]">{item.id}</span>
                          <span className="font-serif text-sm text-[#997A3D]">{item.urdu}</span>
                        </div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-[#997A3D] mb-2">{item.occasion}</div>
                        <p className="text-xs text-[#68554E] leading-relaxed">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: FABRICS */}
            {activeTab === 'fabric' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-[#360810]">Choose Luxurious Heirloom Fabric</h3>
                  <p className="text-xs text-[#78655E] mt-1">
                    Every fabric is guaranteed 100% pure silk or velvet, hand-spun and weighted for royal bridal movement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'Pure Katan Raw Silk',
                      weight: '85-100 GSM Heavy Drape',
                      origin: 'Lahore Silk Guilds',
                      desc: 'The traditional foundation of Pakistani Barat ensembles. Provides crisp structure, rich luster, and supports heavy 3D dabka wire.'
                    },
                    {
                      id: 'Royal Mirzapur Velvet',
                      weight: 'Deep Micro-Pile Silk Velvet',
                      origin: 'Historic Mirzapur Artisans',
                      desc: 'Plush, opulent, light-absorbing winter velvet that gives deep rubies and plum tones their regal depth.'
                    },
                    {
                      id: 'Banarasi Handloom Jamawar',
                      weight: 'Pure Zari Woven Silk',
                      origin: 'Heritage Weaving Looms',
                      desc: 'Intricate brocade handwoven with fine antique gold tilla motifs embedded directly in the silk warp.'
                    },
                    {
                      id: 'Shimmer French Tissue',
                      weight: 'Luminescent Metallic Weft',
                      origin: 'Lyons & Lahore Collaboration',
                      desc: 'Ethereal, sparkling texture that shimmers with soft silvery champagne tones under evening chandeliers.'
                    },
                    {
                      id: 'Pure Silk Organza',
                      weight: 'Featherlight Sheer Weave',
                      origin: 'Pure Mulberry Silk',
                      desc: 'Crisp, translucent, and graceful for multi-tiered flared skirts and delicate mukaish-sprinkled bridal dupattas.'
                    }
                  ].map(fab => {
                    const isSelected = design.fabric === fab.id;
                    return (
                      <div
                        key={fab.id}
                        onClick={() => setDesign(p => ({ ...p, fabric: fab.id as FabricType }))}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#4A0E17] bg-[#FAF0E1] ring-1 ring-[#4A0E17]'
                            : 'border-[#E0D2C3] bg-white hover:border-[#C5A059]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif text-base font-semibold text-[#360810]">{fab.id}</span>
                          <span className="text-[10px] font-mono text-[#997A3D]">{fab.weight}</span>
                        </div>
                        <div className="text-[11px] text-[#997A3D] uppercase tracking-wider mb-2">{fab.origin}</div>
                        <p className="text-xs text-[#68554E] leading-relaxed">{fab.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: COLORS & PALETTE */}
            {activeTab === 'palette' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-2xl text-[#360810]">Color Schemes & Metal Zari Tones</h3>
                  <p className="text-xs text-[#78655E] mt-1">
                    Select a curated royal bridal preset or personalize each individual garment hue.
                  </p>
                </div>

                {/* Preset Palettes */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-[#78655E] font-medium">
                    Curated Imperial Wedding Palettes
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PALETTE_PRESETS.map((preset, idx) => {
                      const isSelected = activePresetIndex === idx;
                      return (
                        <button
                          key={preset.name}
                          onClick={() => applyPreset(preset, idx)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected 
                              ? 'border-[#4A0E17] bg-[#FAF0E1] ring-1 ring-[#4A0E17]' 
                              : 'border-[#E0D2C3] bg-white hover:border-[#C5A059]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.baseColor }} />
                            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.blouseColor }} />
                            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.dupattaColor }} />
                          </div>
                          <div className="font-serif text-xs font-semibold text-[#360810] leading-snug">{preset.name}</div>
                          <div className="text-[10px] text-[#997A3D] mt-0.5">{preset.metalTone}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Hex Color Pickers */}
                <div className="pt-6 border-t border-[#E8DCCB] space-y-4">
                  <div className="text-xs uppercase tracking-wider text-[#78655E] font-medium">
                    Custom Hue Precision
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Skirt Base */}
                    <div className="p-3 bg-white rounded-xl border border-[#E0D2C3] space-y-2">
                      <div className="text-xs font-medium text-[#4A0E17]">Skirt / Lehnga Base</div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={design.baseColor}
                          onChange={(e) => {
                            setActivePresetIndex(null);
                            setDesign(p => ({ ...p, baseColor: e.target.value }));
                          }}
                          className="w-10 h-10 rounded cursor-pointer border border-[#C5A059] p-0.5"
                        />
                        <span className="font-mono text-xs uppercase text-[#68554E]">{design.baseColor}</span>
                      </div>
                    </div>

                    {/* Blouse Color */}
                    <div className="p-3 bg-white rounded-xl border border-[#E0D2C3] space-y-2">
                      <div className="text-xs font-medium text-[#4A0E17]">Blouse / Choli</div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={design.blouseColor}
                          onChange={(e) => {
                            setActivePresetIndex(null);
                            setDesign(p => ({ ...p, blouseColor: e.target.value }));
                          }}
                          className="w-10 h-10 rounded cursor-pointer border border-[#C5A059] p-0.5"
                        />
                        <span className="font-mono text-xs uppercase text-[#68554E]">{design.blouseColor}</span>
                      </div>
                    </div>

                    {/* Dupatta Color */}
                    <div className="p-3 bg-white rounded-xl border border-[#E0D2C3] space-y-2">
                      <div className="text-xs font-medium text-[#4A0E17]">Dupatta Veil</div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={design.dupattaColor}
                          onChange={(e) => {
                            setActivePresetIndex(null);
                            setDesign(p => ({ ...p, dupattaColor: e.target.value }));
                          }}
                          className="w-10 h-10 rounded cursor-pointer border border-[#C5A059] p-0.5"
                        />
                        <span className="font-mono text-xs uppercase text-[#68554E]">{design.dupattaColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metal & Zari Tone Selection */}
                <div className="pt-6 border-t border-[#E8DCCB] space-y-3">
                  <div className="text-xs uppercase tracking-wider text-[#78655E] font-medium">
                    Embroidery Wire & Zari Metal Finish
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'Antique Heirloom Gold', color: '#D4AF37', desc: 'Warm 24K burnished tone' },
                      { id: 'Champagne Zardozi', color: '#E5D3A3', desc: 'Soft luminous cream gold' },
                      { id: 'Platinum Silver Tilla', color: '#D0D5DD', desc: 'Sterling crisp silver' },
                      { id: 'Rose Gold & Copper', color: '#D99B82', desc: 'Romantic blushing metallic' },
                    ].map(metal => {
                      const isSelected = design.metalTone === metal.id;
                      return (
                        <div
                          key={metal.id}
                          onClick={() => setDesign(p => ({ ...p, metalTone: metal.id as MetalTone }))}
                          className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                            isSelected
                              ? 'border-[#4A0E17] bg-[#FAF0E1] ring-1 ring-[#4A0E17]'
                              : 'border-[#E0D2C3] bg-white hover:border-[#C5A059]'
                          }`}
                        >
                          <div className="w-5 h-5 mx-auto rounded-full border border-black/10 shadow-sm mb-2" style={{ backgroundColor: metal.color }} />
                          <div className="text-xs font-medium text-[#360810] leading-tight">{metal.id}</div>
                          <div className="text-[10px] text-[#997A3D] mt-1">{metal.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MOTIFS & CUTS */}
            {activeTab === 'patterns' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-2xl text-[#360810]">Patterns, Motifs & Neckline Cuts</h3>
                  <p className="text-xs text-[#78655E] mt-1">
                    Personalize the Mughal motifs stitched across your lehenga skirt, borders, and necklines.
                  </p>
                </div>

                {/* Pattern Motif */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-[#78655E] font-medium">
                    Skirt Jaal & Embroidery Motif
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'Mughal Mehraab (Royal Arches)', desc: 'Architectural arches reminiscent of Lahore Fort, framing floral urns.' },
                      { id: 'Shikargah (Paisley & Flora)', desc: 'Classic Kashmiri paisley (kalka/buta) medallions with intricate foliage.' },
                      { id: 'Floral Arabesque Jaal', desc: 'Diamond-mesh interlaced vines with miniature rosettes at each apex.' },
                      { id: 'Geometric Chevron (Lehriya)', desc: 'Rhythmic zig-zag waves creating continuous motion when walking.' },
                      { id: 'Starburst Mukaish Chhatt', desc: 'Translucent galaxy of hand-hammered pure silver and gold specks.' },
                    ].map(motif => {
                      const isSelected = design.patternMotif === motif.id;
                      return (
                        <div
                          key={motif.id}
                          onClick={() => setDesign(p => ({ ...p, patternMotif: motif.id as PatternMotif }))}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#4A0E17] bg-[#FAF0E1] ring-1 ring-[#4A0E17]'
                              : 'border-[#E0D2C3] bg-white hover:border-[#C5A059]'
                          }`}
                        >
                          <div className="text-xs font-semibold text-[#360810] mb-1">{motif.id}</div>
                          <p className="text-[11px] text-[#68554E] leading-relaxed">{motif.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daman Border Style */}
                <div className="pt-6 border-t border-[#E8DCCB] space-y-3">
                  <div className="text-xs uppercase tracking-wider text-[#78655E] font-medium">
                    Daman Hem Border Depth
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'Heavy 12-Inch Scalloped Zardozi', desc: 'Opulent scalloped imperial border with maximum presence.' },
                      { id: 'Royal 8-Inch Velvet Trim', desc: 'Plush contrasting velvet band encrusted with dabka floral crests.' },
                      { id: 'Refined 5-Inch Delicate Tilla', desc: 'Sleek, lightweight contemporary hemline with clean edges.' },
                    ].map(border => {
                      const isSelected = design.borderStyle === border.id;
                      return (
                        <div
                          key={border.id}
                          onClick={() => setDesign(p => ({ ...p, borderStyle: border.id as BorderStyle }))}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#4A0E17] bg-[#FAF0E1] ring-1 ring-[#4A0E17]'
                              : 'border-[#E0D2C3] bg-white hover:border-[#C5A059]'
                          }`}
                        >
                          <div className="text-xs font-semibold text-[#360810] mb-1">{border.id}</div>
                          <p className="text-[11px] text-[#68554E] leading-snug">{border.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Necklines & Dupatta Finishes */}
                <div className="pt-6 border-t border-[#E8DCCB] grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Neckline */}
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-wider text-[#78655E] font-medium">
                      Choli Neckline Cut
                    </div>
                    <div className="space-y-2">
                      {[
                        'Mughal Sweetheart',
                        'Royal Panelled Angrakha',
                        'Imperial Mandarin Collar',
                        'Regal Victoria Boat Neck'
                      ].map(neck => (
                        <button
                          key={neck}
                          onClick={() => setDesign(p => ({ ...p, neckline: neck as NecklineStyle }))}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                            design.neckline === neck
                              ? 'border-[#4A0E17] bg-[#FAF0E1] font-semibold text-[#4A0E17]'
                              : 'border-[#E0D2C3] bg-white text-[#68554E] hover:border-[#C5A059]'
                          }`}
                        >
                          {neck}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dupatta Border */}
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-wider text-[#78655E] font-medium">
                      Dupatta Border & Kiran Finish
                    </div>
                    <div className="space-y-2">
                      {[
                        'Heirloom Golden Kiran Lace',
                        'Scalloped Royal Velvet Border',
                        'Double Dupatta (Head Veil + Drape)',
                        'All-Over Starburst Mukaish'
                      ].map(dup => (
                        <button
                          key={dup}
                          onClick={() => setDesign(p => ({ ...p, dupatta: dup as DupattaStyle }))}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                            design.dupatta === dup
                              ? 'border-[#4A0E17] bg-[#FAF0E1] font-semibold text-[#4A0E17]'
                              : 'border-[#E0D2C3] bg-white text-[#68554E] hover:border-[#C5A059]'
                          }`}
                        >
                          {dup}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ZARDOZI DENSITY & CRAFTSMANSHIP */}
            {activeTab === 'craft' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-2xl text-[#360810]">Embroidery Technique & Density</h3>
                  <p className="text-xs text-[#78655E] mt-1">
                    Control the coverage and intensity of the hand-needlework applied to your bridal suit.
                  </p>
                </div>

                {/* Primary Technique */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-[#78655E] font-medium">
                    Primary Karigari Technique
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'Zardozi & Naqshi', desc: 'Heavy 3D relief gold embroidery with cut-dana beads and thick bullion wire.' },
                      { id: 'Hand Dabka & Kora', desc: 'Delicate coiled spring wire sliced and stitched for fine shaded metallic textures.' },
                      { id: 'Tilla & Marori', desc: 'Twisted metallic zari cord pinned in continuous spiraling Mughal calligraphic vines.' },
                      { id: 'Gotapatti & Mirrors', desc: 'Beaten gold leaf ribbons with framed convex mirrors for festive shimmer.' },
                      { id: 'Fine Resham Shading', desc: 'Pure untwisted mulberry silk floss providing rich botanical floral shading.' }
                    ].map(tech => {
                      const isSelected = design.technique === tech.id;
                      return (
                        <div
                          key={tech.id}
                          onClick={() => setDesign(p => ({ ...p, technique: tech.id as EmbroideryTechnique }))}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#4A0E17] bg-[#FAF0E1] ring-1 ring-[#4A0E17]'
                              : 'border-[#E0D2C3] bg-white hover:border-[#C5A059]'
                          }`}
                        >
                          <div className="text-xs font-semibold text-[#360810] mb-1">{tech.id}</div>
                          <p className="text-[11px] text-[#68554E] leading-relaxed">{tech.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Density Slider */}
                <div className="pt-6 border-t border-[#E8DCCB] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#78655E] font-medium">
                        Embroidery Surface Density
                      </div>
                      <p className="text-[11px] text-[#917E76]">
                        {design.embroideryDensity <= 50 ? 'Refined Delicate (Lightweight)' : design.embroideryDensity <= 80 ? 'Regal Grandeur (Balanced Full Coverage)' : 'Imperial Heirloom (Full Surface Encrusted)'}
                      </p>
                    </div>
                    <div className="font-mono text-base font-bold tabular-nums text-[#4A0E17]">
                      {design.embroideryDensity}% Coverage
                    </div>
                  </div>

                  <input
                    type="range"
                    min="35"
                    max="100"
                    step="5"
                    value={design.embroideryDensity}
                    onChange={(e) => setDesign(p => ({ ...p, embroideryDensity: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-[#E0D2C3] rounded-lg appearance-none cursor-pointer accent-[#4A0E17]"
                  />

                  <div className="flex justify-between text-[10px] font-mono uppercase text-[#997A3D]">
                    <span>35% Subtle Chhatt</span>
                    <span>70% Grand Barat Standard</span>
                    <span>100% Solid Imperial Heirloom</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: BESPOKE MEASUREMENTS */}
            {activeTab === 'measurements' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-[#360810]">Bespoke Sizing & Bridal Consultation</h3>
                  <p className="text-xs text-[#78655E] mt-1">
                    Provide preliminary bridal measurements in inches. Our senior master cutter verifies all proportions during your private consultation.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      Bust (Inches)
                    </label>
                    <input
                      type="text"
                      value={design.measurements.bust}
                      onChange={(e) => setDesign(p => ({ ...p, measurements: { ...p.measurements, bust: e.target.value } }))}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-[#E0D2C3] text-sm font-mono text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                      placeholder="e.g. 36"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      Waist (Inches)
                    </label>
                    <input
                      type="text"
                      value={design.measurements.waist}
                      onChange={(e) => setDesign(p => ({ ...p, measurements: { ...p.measurements, waist: e.target.value } }))}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-[#E0D2C3] text-sm font-mono text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                      placeholder="e.g. 28"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      Hips (Inches)
                    </label>
                    <input
                      type="text"
                      value={design.measurements.hips}
                      onChange={(e) => setDesign(p => ({ ...p, measurements: { ...p.measurements, hips: e.target.value } }))}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-[#E0D2C3] text-sm font-mono text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                      placeholder="e.g. 39"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      Lehenga Length
                    </label>
                    <input
                      type="text"
                      value={design.measurements.lehengaLength}
                      onChange={(e) => setDesign(p => ({ ...p, measurements: { ...p.measurements, lehengaLength: e.target.value } }))}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-[#E0D2C3] text-sm font-mono text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                      placeholder="e.g. 43"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      Shoulder Across
                    </label>
                    <input
                      type="text"
                      value={design.measurements.shoulder}
                      onChange={(e) => setDesign(p => ({ ...p, measurements: { ...p.measurements, shoulder: e.target.value } }))}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-[#E0D2C3] text-sm font-mono text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                      placeholder="e.g. 14.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                      Sleeve Length
                    </label>
                    <input
                      type="text"
                      value={design.measurements.sleeveLength}
                      onChange={(e) => setDesign(p => ({ ...p, measurements: { ...p.measurements, sleeveLength: e.target.value } }))}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-[#E0D2C3] text-sm font-mono text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none"
                      placeholder="e.g. 22"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#78655E] font-medium mb-1">
                    Special Tailoring or Bridal Notes
                  </label>
                  <textarea
                    rows={3}
                    value={design.measurements.notes}
                    onChange={(e) => setDesign(p => ({ ...p, measurements: { ...p.measurements, notes: e.target.value } }))}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-[#E0D2C3] text-xs text-[#360810] focus:ring-1 focus:ring-[#4A0E17] outline-none leading-relaxed"
                    placeholder="Enter wedding date, heel height, or specific jewelry styling notes..."
                  />
                </div>

                <div className="pt-4 border-t border-[#E8DCCB] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#78655E]">
                    <Info className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span>Includes complimentary fitting adjustments & worldwide insured shipping.</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onContactUs}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#FAF0E1] text-[#4A0E17] border border-[#C5A059] text-xs uppercase tracking-wider font-semibold rounded-lg transition-all whitespace-nowrap"
                    >
                      Contact Stylist
                    </button>
                    <button
                      type="button"
                      onClick={() => onOrderNow(design, finalPKR, finalUSD)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#E5C378]" />
                      <span>Order Bespoke Suit</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Stepper Buttons */}
            <div className="pt-6 border-t border-[#E8DCCB] flex items-center justify-between">
              <button
                onClick={() => setDesign(DEFAULT_STATE)}
                className="text-xs text-[#78655E] hover:text-[#4A0E17] flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Heritage Default</span>
              </button>

              <div className="flex items-center gap-3">
                {activeTab !== 'measurements' ? (
                  <button
                    onClick={() => {
                      const tabs: AtelierTab[] = ['silhouette', 'fabric', 'palette', 'patterns', 'craft', 'measurements'];
                      const nextIdx = tabs.indexOf(activeTab) + 1;
                      if (nextIdx < tabs.length) setActiveTab(tabs[nextIdx]);
                    }}
                    className="px-4 py-2 bg-[#FAF0E1] text-[#4A0E17] hover:bg-[#EBDDC8] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Next Section</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSaveToTrousseau}
                    className="px-6 py-2.5 bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#E5C378]" />
                    <span>Save Ensemble</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
