import React from 'react';
import { Sparkles, ArrowRight, Compass, ShieldCheck, Clock, Award } from 'lucide-react';

interface HeroProps {
  onOpenAtelier: () => void;
  onExploreCollection: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAtelier, onExploreCollection }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F6F0E8] to-[#FAF8F5] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E8DCCB]">
      {/* Subtle Mughal Arch Watermark Geometry Background (subtle geometric decorative SVG) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
          <path d="M400,50 C400,200 650,200 650,450 C650,600 550,700 400,750 C250,700 150,600 150,450 C150,200 400,200 400,50 Z" fill="none" stroke="#4A0E17" strokeWidth="8" />
          <path d="M400,120 C400,240 580,240 580,450 C580,560 500,640 400,680 C300,640 220,560 220,450 C220,240 400,240 400,120 Z" fill="none" stroke="#4A0E17" strokeWidth="4" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Brand Story & Call to Action */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[#997A3D] font-medium">
                <span>ONE MAN'S DREAM </span>
                <span aria-hidden="true">·</span>
                <span>YEARS OF DEDICATION</span>
                <span aria-hidden="true">·</span>
                <span>A NAME BUILT TO LAST</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#360810] font-normal leading-[1.12] tracking-tight text-balance">
                FROM A DREAM TO A LEGACY
              </h1>

              <p className="text-base sm:text-lg text-[#614E46] leading-relaxed max-w-xl font-normal">
                  AHK Studio is the legacy of a man whose dedication, perseverance, and passion transformed a vision into reality. Built through years of hard work, the name stands for trust, quality, and timeless elegance—a legacy carried forward with pride.              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onOpenAtelier}
                className="group px-7 py-3.5 bg-[#4A0E17] hover:bg-[#601320] text-[#FAF8F5] text-sm uppercase tracking-wider font-semibold rounded-md transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
              >
                <Sparkles className="w-4 h-4 text-[#E5C378]" />
                <span>Explore Couture Gallery</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreCollection}
                className="px-6 py-3.5 border border-[#B38728] hover:border-[#4A0E17] text-[#4A0E17] hover:bg-[#FAF0E1]/80 text-sm uppercase tracking-wider font-medium rounded-md transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#C5A059]" />
                <span>Explore Grand Collection</span>
              </button>
            </div>

            {/* Micro quote snippet */}
            <div className="pt-4 border-t border-[#E8DCCB] text-xs text-[#78655E] italic">
              "A bride's jora is not just an outfit for a single day; it is the heirloom of love, memories, and royal heritage passed from generation to generation."
            </div>
          </div>

          {/* Right Column: Hero Bridal Image Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Decorative Frame Border */}
              <div className="absolute -inset-2.5 rounded-2xl border border-[#C5A059]/40 -rotate-1 pointer-events-none" />
              <div className="absolute -inset-1 rounded-2xl border border-[#C5A059]/20 rotate-1 pointer-events-none" />

              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-[#E8DDD1] aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/11]">
                <img
                  src="/src/assets/images/Unknown-6.png"
                  alt="Pakistani Bride in regal crimson zardozi bridal lehenga at royal palace"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-700"
                />

                {/* Scrim overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#20050A]/90 via-[#20050A]/20 to-transparent" />

                {/* Bottom caption overlay */}
                <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-1">
                  <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#E5C378] font-mono">
                    <span>·</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Proof & Heritage Trust Strip below split (adhering to Section 5.13 of skill) */}
        <div className="mt-14 pt-8 border-t border-[#E8DCCB] grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#4A0E17]">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-[#360810]">100%</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-[#735F57] font-medium">Bespoke Hand-Work</div>
            <p className="text-[11px] text-[#917E76] leading-tight">Hand-embroidered millimeter by millimeter on traditional kargahs.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#4A0E17]">
              <Award className="w-4 h-4 text-[#C5A059]" />
              <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-[#360810]">100%</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-[#735F57] font-medium">Pure Heritage Silks</div>
            <p className="text-[11px] text-[#917E76] leading-tight">Guaranteed 80+ GSM Katan raw silk, Mirzapur velvet, and Banarasi zari.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#4A0E17]">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-[#360810]">4th Gen</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-[#735F57] font-medium">Master Karigar Guilds</div>
            <p className="text-[11px] text-[#917E76] leading-tight">Preserving endangered Mughal zardozi, mukaish, and naqshi crafts.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#4A0E17]">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-[#360810]">Worldwide</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-[#735F57] font-medium">Insured White-Glove Care</div>
            <p className="text-[11px] text-[#917E76] leading-tight">Delivering to Pakistan, UK, USA, Canada, UAE, & Europe.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
