import React from 'react';
import { X, MapPin, Navigation, Clock, Phone, Car, ExternalLink, MessageCircle, Sparkles } from 'lucide-react';

interface StoreLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreLocationModal: React.FC<StoreLocationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Dolmen+Mall+Tariq+Road+Karachi";
  const mapsEmbedUrl = "https://www.google.com/maps?q=Dolmen+Mall+Tariq+Road+Karachi&output=embed";
  const whatsappLocationUrl = "https://wa.me/923222586576?text=Hello%20AHK%20Bridal%20Studio,%20please%20share%20your%20store%20live%20location%20at%20Dolmen%20Mall%20Tariq%20Road";

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#FAF8F5] rounded-2xl max-w-2xl w-full border border-[#D5C2AD] shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors shadow-md"
          aria-label="Close location modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#180E12] text-white border-b border-[#36272B] space-y-1 shrink-0 pr-12">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#E5C378]">
            <Sparkles className="w-3 h-3 text-[#E5C378]" />
            <span>Our Flagship Karachi Store</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#FAF8F5] leading-tight">
            AHK Bridal Studio · Dolmen Mall Tariq Road
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-300">
            Shop # G-32, Ground Floor · Pure katan silks, hand zardozi & bespoke bridal consultations.
          </p>
        </div>

        {/* Compact Interactive Map Embed */}
        <div className="relative h-36 sm:h-44 md:h-48 w-full bg-[#E5DBD0] border-b border-[#D5C2AD] shrink-0 overflow-hidden">
          <iframe
            title="AHK Bridal Studio - Dolmen Mall Tariq Road Location"
            src={mapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />

          {/* Map Overlay Badge */}
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-[#180E12]/90 backdrop-blur-md text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-[#C5A059]/40 text-xs flex items-center gap-1.5 sm:gap-2 shadow-lg pointer-events-none">
            <MapPin className="w-3.5 h-3.5 text-[#E5C378] shrink-0" />
            <div>
              <span className="font-semibold text-[#FAF8F5] text-[11px] sm:text-xs block">Dolmen Mall, Tariq Road</span>
              <span className="text-[9px] sm:text-[10px] text-stone-400 block font-mono">PECHS Block 2, Karachi</span>
            </div>
          </div>
        </div>

        {/* Location Details & Directions Grid (Scrollable if height exceeds screen) */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#5C4942]">
            
            {/* Address & Mall Floor */}
            <div className="space-y-2 p-3 sm:p-3.5 bg-white rounded-xl border border-[#E0D2C3]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A0E17] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Store Address & Floor</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-[#360810] text-sm">
                  Shop # G-32, Ground Floor, AHK Studio
                </p>
                <p className="text-[#68554E] font-medium text-xs">
                  Dolmen Mall, Tariq Road, Karachi, Pakistan
                </p>
                <p className="text-[10px] sm:text-[11px] text-[#997A3D] pt-0.5">
                  Exclusive physical studio in Karachi.
                </p>
              </div>
            </div>

            {/* Timings & Parking */}
            <div className="space-y-2 p-3 sm:p-3.5 bg-white rounded-xl border border-[#E0D2C3]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A0E17] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Opening Hours & Parking</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#78655E]">Mon – Thu:</span>
                  <span className="font-mono font-medium text-[#360810]">11:30 AM – 10:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78655E]">Friday:</span>
                  <span className="font-mono font-medium text-[#360810]">03:00 PM – 11:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78655E]">Sat & Sun:</span>
                  <span className="font-mono font-medium text-[#360810]">11:30 AM – 11:30 PM</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#997A3D] pt-0.5">
                  <Car className="w-3 h-3 shrink-0" />
                  <span>Basement parking & valet at Dolmen Mall.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons: Open Google Maps & WhatsApp Location */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-2.5 px-3.5 bg-[#4A0E17] hover:bg-[#681421] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <a
              href={whatsappLocationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-2.5 px-3.5 bg-[#0F5132] hover:bg-[#0c4128] text-white text-xs uppercase tracking-wider font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Get WhatsApp Live Location</span>
            </a>
          </div>

          <div className="text-center text-[10px] sm:text-[11px] text-[#78655E]">
            Direct contact: <a href="tel:+923222586576" className="font-mono font-bold text-[#4A0E17] hover:underline">+92 322 2586576</a> or WhatsApp <a href="https://wa.me/923222586576" target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-[#0F5132] hover:underline">+92 322 2586576</a>
          </div>
        </div>

      </div>
    </div>
  );
};

