import React, { useState } from 'react';
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  Calendar,
  Sparkles,
  MapPin,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { CustomerProfile, AdminOrder } from '../../types/admin';

interface AdminCustomersProps {
  customers: CustomerProfile[];
  orders: AdminOrder[];
  currency: 'PKR' | 'USD';
  onSelectOrder: (order: AdminOrder) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({
  customers,
  orders,
  currency,
  onSelectOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const formatAmount = (pkr: number) => {
    if (currency === 'USD') return `$${Math.round(pkr / 279).toLocaleString()}`;
    return `PKR ${pkr.toLocaleString()}`;
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="text-xs font-mono uppercase text-[#C5A059] tracking-wider">
          Bridal Registry & Client Dossier
        </div>
        <h2 className="text-2xl font-serif font-bold text-white mt-1">Brides & VIP Clients</h2>
        <p className="text-xs text-stone-400 mt-1">
          Maintain bespoke styling relationships, wedding dates, and contact history.
        </p>
      </div>

      {/* Search */}
      <div className="w-full sm:w-80 relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search bride by name, city, or phone..."
          className="w-full bg-[#1A141D] border border-[#3A2D37] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
        />
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((c) => {
          const clientOrders = orders.filter((o) =>
            o.customerName.toLowerCase().includes(c.name.toLowerCase())
          );

          const digits = c.phone.replace(/[^0-9]/g, '');
          const cleanPhone = digits.startsWith('0') && digits.length >= 10 ? `92${digits.slice(1)}` : (digits.startsWith('3') && digits.length === 10 ? `92${digits}` : digits);
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Salam ${c.name}, greetings from AHK Bridal Studio (Dolmen Mall Tariq Road). We are following up regarding your bridal preparations.`
          )}`;

          return (
            <div
              key={c.id}
              className="p-6 rounded-2xl bg-[#161217] border border-[#2C222A] hover:border-[#C5A059]/40 transition-all shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">{c.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#C5A059]" />
                      <span>
                        {c.city}, {c.country}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                      c.status === 'VIP Bride'
                        ? 'bg-[#7A0C1E]/30 text-[#E5C378] border border-[#C5A059]/40'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#251C27] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Total Spend:</span>
                    <span className="font-mono font-bold text-white">
                      {formatAmount(c.totalSpendPKR)}
                    </span>
                  </div>
                  {c.weddingDate && (
                    <div className="flex justify-between">
                      <span className="text-stone-400">Wedding Date:</span>
                      <span className="font-mono text-[#E5C378]">{c.weddingDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-400">Total Commissions:</span>
                    <span className="font-mono text-stone-200">{c.totalOrders} Suits</span>
                  </div>
                </div>

                {c.notes && (
                  <p className="mt-3 p-2.5 rounded-lg bg-[#201822] text-[11px] text-stone-300 italic border border-[#2D212F]">
                    &ldquo;{c.notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#251C27] flex items-center justify-between gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-xs font-mono font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                {clientOrders.length > 0 && (
                  <button
                    onClick={() => onSelectOrder(clientOrders[0])}
                    className="flex items-center gap-1 text-xs font-mono text-[#E5C378] hover:underline"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>View Order</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
