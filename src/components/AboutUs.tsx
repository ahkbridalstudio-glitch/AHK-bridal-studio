import React from 'react';
import { Sparkles, Award, Heart, ShieldCheck, Compass } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <section id="about" className="py-16 lg:py-24 bg-[#F5EFEB] border-b border-[#E0D2C3] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#997A3D] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>AHK Bridal Studio</span>
            <span aria-hidden="true">·</span>
            <span>Our Story & Legacy</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#360810] font-normal tracking-tight text-balance">
            *Where Tradition Meets Modern Bridal Elegance*          </h2>
          <p className="text-sm sm:text-base text-[#68554E] leading-relaxed">
            AHK Bridal Studio brings together the richness of Pakistani craftsmanship and the beauty of contemporary bridal fashion, creating timeless ensembles for the modern bride.
          </p>
        </div>

        {/* 2-Column Story Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-6 space-y-6 text-left">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#360810]">
              The Soul of the Pakistani Bride
            </h3>
            
            <p className="text-xs sm:text-sm text-[#5C4942] leading-relaxed">
              At AHK Bridal Studio, we reject mass factory production and cheap synthetic fibers. Every thread of dabka is hand-coiled, every mirror is locked in double silk stitches, and every border is shaped over traditional wooden <em>kargah</em> frames for our flagship boutique at Dolmen Mall Tariq Road, Karachi.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#D5C2AD]">
              <div>
                <div className="font-serif text-2xl font-bold text-[#4A0E17]">400+</div>
                <div className="text-xs text-[#78655E] uppercase tracking-wider font-medium mt-0.5">Years of Craft Lineage</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-bold text-[#4A0E17]">60+</div>
                <div className="text-xs text-[#78655E] uppercase tracking-wider font-medium mt-0.5">Master Karigars in Guild</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#C5A059]/40 shadow-xl aspect-[4/3] bg-[#E8DDD1]">
              <img
                src="/src/assets/images/craftsmanship_zardozi_macro_1792071423140.jpg"
                alt="Karigar hand stitching zardozi on wooden kargah frame"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-[10px] uppercase tracking-wider text-[#E5C378] font-mono">Master Artisan Kargah</div>
                <div className="font-serif text-base font-medium">Bespoke Hand Embroidery Atelier for AHK Studio Karachi</div>
              </div>
            </div>
          </div>
        </div>

       

      </div>
    </section>
  );
};
