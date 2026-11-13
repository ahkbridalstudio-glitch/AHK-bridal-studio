import React from 'react';
import { Sparkles, MapPin, Phone, Mail, Clock, MessageSquare, Navigation } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenContact: () => void;
  onOpenMap: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenContact, onOpenMap }) => {
  return (
    <footer className="bg-[#180E12] text-[#D8CFCA] border-t border-[#36272B] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 5-Column Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10 text-left">
          
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
              <span className="font-serif text-2xl font-semibold tracking-[0.2em] text-[#FAF8F5]">
                AHK BRIDAL STUDIO
              </span>
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#E5C378] font-medium">
                Haute Couture Bridal Maison
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Honoring centuries of Mughal hand embroidery, royal zardozi, hand-coiled dabka, and pure katan silks. Handcrafted by master karigars for the grand wedding day.
            </p>

            <div className="pt-2 text-xs text-[#E5C378] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flagship Store: Dolmen Mall, Tariq Road, Karachi</span>
            </div>
          </div>

          {/* Bridal Collections */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-white font-semibold">
              The Collections
            </div>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('luxury')} className="hover:text-white transition-colors">
                  Luxury Collection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('best-selling')} className="hover:text-white transition-colors">
                  Best Selling
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('formals')} className="hover:text-white transition-colors">
                  Formals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('new-arrivals')} className="hover:text-white transition-colors">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('atelier')} className="hover:text-white transition-colors text-[#E5C378]">
                  Custom Design Tool
                </button>
              </li>
            </ul>
          </div>

          {/* The Maison: About & Craft */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-white font-semibold">
              The Maison
            </div>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About AHK Bridal Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('collection')} className="hover:text-white transition-colors">
                  Bridal Ensembles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors text-[#E5C378]">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Store Locations & Contact */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-white font-semibold">
              Boutique Location
            </div>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                <div className="font-semibold text-[#E5C378] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>AHK Studio · Karachi</span>
                </div>
                <p className="text-[11px] text-stone-200">
                  Shop # G-32, Ground Floor, Dolmen Mall, Tariq Road, Karachi
                </p>
                <p className="text-[10px] text-[#C5A059]">
                  Exclusive boutique in Karachi (No branches in Lahore, London, or Dubai)
                </p>
                <div className="pt-1.5 text-[11px] font-mono text-stone-300 space-y-0.5 border-t border-white/10">
                  <div>
                    Tel: <a href="tel:+923222586576" className="text-[#E5C378] hover:underline font-bold">+92 322 2586576</a>
                  </div>
                  <div>
                    WhatsApp: <a href="https://wa.me/923222586576" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">+92 322 2586576</a>
                  </div>
                </div>
                <div className="pt-1">
                  <button
                    onClick={onOpenMap}
                    className="text-[11px] text-[#E5C378] hover:underline flex items-center gap-1 font-mono"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Open Store Map & Directions</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-stone-400 pt-1">
                Insured express delivery available to brides across Pakistan and internationally.
              </div>
              <div className="pt-2">
                <button
                  onClick={onOpenContact}
                  className="w-full py-1.5 px-3 rounded border border-[#E5C378] text-[#E5C378] hover:bg-[#E5C378]/20 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Contact Atelier</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Quiet Sub-Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 text-left">
          <div>
            © {new Date().getFullYear()} AHK BRIDAL STUDIO. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Dolmen Mall Tariq Road Flagship</span>
            <span>·</span>
            <span>Pure Fabric Guarantee</span>
            <span>·</span>
            <span>Worldwide Insured Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
