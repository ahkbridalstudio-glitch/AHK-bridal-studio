import React from 'react';
import {
  Building2,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

interface AdminSettingsProps {
  currency: 'PKR' | 'USD';
  onCurrencyToggle: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  currency,
  onCurrencyToggle,
}) => {
  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300 text-left">
      <div>
        <div className="text-xs font-mono uppercase text-[#C5A059] tracking-wider">
          Configuration & Boutique Registry
        </div>
        <h2 className="text-2xl font-serif font-bold text-white mt-1">
          Dolmen Mall Tariq Road Flagship Settings
        </h2>
        <p className="text-xs text-stone-400 mt-1">
          Official boutique physical address, telephone lines, and courier dispatch setup.
        </p>
      </div>

      {/* Flagship Storefront Details Card */}
      <div className="p-6 rounded-2xl bg-[#161217] border border-[#2C222A] space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#C5A059] font-bold">
          <Building2 className="w-4 h-4" /> Physical Flagship Boutique
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-400 font-mono mb-1">Official Boutique Name</label>
            <div className="p-2.5 rounded-lg bg-[#201822] text-white font-medium border border-[#3A2D37]">
              AHK BRIDAL STUDIO
            </div>
          </div>

          <div>
            <label className="block text-stone-400 font-mono mb-1">Shop Number & Location</label>
            <div className="p-2.5 rounded-lg bg-[#201822] text-white font-medium border border-[#3A2D37]">
              Shop # G-32, Ground Floor, Dolmen Mall, Tariq Road
            </div>
          </div>

          <div>
            <label className="block text-stone-400 font-mono mb-1">City & Territory</label>
            <div className="p-2.5 rounded-lg bg-[#201822] text-white font-medium border border-[#3A2D37]">
              Karachi, Pakistan (Exclusive Boutique — No Lahore/Dubai/London Branches)
            </div>
          </div>

          <div>
            <label className="block text-stone-400 font-mono mb-1">Opening Hours</label>
            <div className="p-2.5 rounded-lg bg-[#201822] text-white font-medium border border-[#3A2D37]">
              Mon – Sun: 11:00 AM – 10:00 PM (PKT)
            </div>
          </div>
        </div>
      </div>

      {/* Official Contacts Card */}
      <div className="p-6 rounded-2xl bg-[#161217] border border-[#2C222A] space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#C5A059] font-bold">
          <Phone className="w-4 h-4" /> Official Studio Communication Lines
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-400 font-mono mb-1">Official Telephone</label>
            <div className="p-2.5 rounded-lg bg-[#201822] text-white font-mono font-bold border border-[#3A2D37] flex items-center justify-between">
              <span>+92 322 2586576</span>
              <span className="text-[10px] text-emerald-400">Direct Voice Line</span>
            </div>
          </div>

          <div>
            <label className="block text-stone-400 font-mono mb-1">Official WhatsApp Desk</label>
            <div className="p-2.5 rounded-lg bg-[#201822] text-[#25D366] font-mono font-bold border border-[#3A2D37] flex items-center justify-between">
              <span>+92 322 2586576</span>
              <span className="text-[10px] text-[#25D366]">Live Chat & Video Swatches</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courier Integrations */}
      <div className="p-6 rounded-2xl bg-[#161217] border border-[#2C222A] space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#C5A059] font-bold">
          <Truck className="w-4 h-4" /> Integrated Courier Partners
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#201822] border border-[#342735] flex items-center justify-between">
            <div>
              <div className="font-bold text-white">AHK Concierge Van</div>
              <div className="text-[11px] text-stone-400">Karachi VIP Same-Day Direct Fitting</div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Active</span>
          </div>

          <div className="p-3 rounded-xl bg-[#201822] border border-[#342735] flex items-center justify-between">
            <div>
              <div className="font-bold text-white">TCS Express</div>
              <div className="text-[11px] text-stone-400">Nationwide Pakistan Courier Service</div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Connected</span>
          </div>

          <div className="p-3 rounded-xl bg-[#201822] border border-[#342735] flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Leopards Courier</div>
              <div className="text-[11px] text-stone-400">Punjab & KPK Bridal Express Logistics</div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Connected</span>
          </div>

          <div className="p-3 rounded-xl bg-[#201822] border border-[#342735] flex items-center justify-between">
            <div>
              <div className="font-bold text-white">DHL Express Global</div>
              <div className="text-[11px] text-stone-400">International Air Freight (UAE, UK, USA)</div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Connected</span>
          </div>
        </div>
      </div>

    </div>
  );
};
