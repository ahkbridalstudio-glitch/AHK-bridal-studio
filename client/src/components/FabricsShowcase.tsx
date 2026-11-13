import React from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

interface FabricsShowcaseProps {
  onOpenAtelierWithFabric: (fabric: string) => void;
}

export const FabricsShowcase: React.FC<FabricsShowcaseProps> = ({ onOpenAtelierWithFabric }) => {
  const fabrics = [
    {
      name: 'Pure Katan Raw Silk',
      urdu: 'کاتان ریشم',
      weight: '85 - 100 GSM',
      finish: 'Subtle Lustrous Crisp Drape',
      bestFor: 'Barat Lehengas & Fitted Cholis',
      colorway: '#7A0C1E',
      description: 'Hand-reeled mulberry silk filament threads woven densely on heritage powerlooms. Unyielding structural strength required to bear heavy 3D bullion gold dabka without sagging or distorting.',
      features: ['100% Guaranteed Mulberry Silk', 'Does not bleed or wrinkle', 'Subtle natural slub texture']
    },
    {
      name: 'Royal Mirzapur Velvet',
      urdu: 'مخملِ خاص',
      weight: 'Plush Dense Micro-Pile',
      finish: 'Deep Light-Absorbing Sheen',
      bestFor: 'Farshi Ghararas & Scalloped Borders',
      colorway: '#4A0E17',
      description: 'An ancient staple of winter Mughal courts. Woven with pure silk backing and fine micro-sheared pile that imparts an intense, intoxicating depth to dark rubies, royal plums, and midnight teals.',
      features: ['Ultra-dense silk pile', 'Luxurious thermal drape', 'Provides high-contrast backdrop for gold wire']
    },
    {
      name: 'Banarasi Handloom Jamawar',
      urdu: 'بنارسی جامہ وار',
      weight: 'Zari Brocade Handloom',
      finish: 'Embedded Metallic Relief',
      bestFor: 'Nikah Peshwas & Bridal Dupattas',
      colorway: '#FAF6EE',
      description: 'Handwoven across weeks on historic wooden jacquard looms. Metallic gold tilla threads are introduced into the silk warp to formulate unbroken floral scrolls, paisley kalkas, and royal hunting scenes.',
      features: ['True handloom selvedge edge', 'Double-sided reversible finish', 'Generational antique patina']
    },
    {
      name: 'Shimmer French Tissue',
      urdu: 'فرانسیسی ٹشو',
      weight: 'Metallic-Silk Composite',
      finish: 'Luminescent Evening Glow',
      bestFor: 'Walima Gowns & Trailing Capes',
      colorway: '#D8CFCA',
      description: 'Spun with fine metallic lurex weft and pure silk warp. Catches crystal chandeliers and candlelight with liquid mercury brilliance, making it the supreme choice for grand Walima receptions.',
      features: ['Liquid metallic drape', 'Featherlight evening movement', 'Glints under photography flashes']
    }
  ];

  return (
    <section id="fabrics" className="py-16 lg:py-24 bg-[#F5EFEB] border-b border-[#E0D2C3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#997A3D] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Fabric Provenance & Purity</span>
            <span aria-hidden="true">·</span>
            <span>The Foundation of Royalty</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#360810] font-normal tracking-tight text-balance">
            Luxurious Pure Silks, Velvets & Zari Jamawar
          </h2>
          <p className="text-sm sm:text-base text-[#68554E] leading-relaxed">
            The foundation of couture is the purity of the cloth. We source exclusively pure natural fibers—never synthetic polyesters—ensuring natural drape, breathability, and generational longevity.
          </p>
        </div>

        {/* 4 Fabric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fabrics.map((fabric) => (
            <div
              key={fabric.name}
              className="bg-[#FAF8F5] rounded-xl border border-[#D5C2AD] p-6 hover:border-[#C5A059] transition-all hover:shadow-lg flex flex-col justify-between space-y-6 text-left"
            >
              <div className="space-y-4">
                {/* Visual Swatch Pill & Urdu Stamp */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full border border-black/10 shadow-inner flex items-center justify-center"
                       style={{ backgroundColor: fabric.colorway }}>
                    <div className="w-4 h-4 rounded-full border border-white/40" />
                  </div>
                  <span className="font-serif text-base font-bold text-[#997A3D]">
                    {fabric.urdu}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-semibold text-[#360810]">
                    {fabric.name}
                  </h3>
                  <div className="text-[11px] font-mono text-[#997A3D] uppercase tracking-wider">
                    {fabric.weight}
                  </div>
                </div>

                <p className="text-xs text-[#68554E] leading-relaxed">
                  {fabric.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-[#E8DCCB]">
                  <div className="text-[10px] uppercase tracking-wider text-[#917E76] font-semibold">
                    Signature Properties
                  </div>
                  <ul className="space-y-1 text-xs text-[#5C4942]">
                    {fabric.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onOpenAtelierWithFabric(fabric.name)}
                className="w-full py-2.5 px-3 bg-[#FAF0E1] hover:bg-[#4A0E17] text-[#4A0E17] hover:text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explore {fabric.name.split(' ')[0]} in Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
