import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, Search, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import logoImg from '../assets/images/logo.png';
import { BridalProduct } from '../types/bridal';

interface NavbarProps {
  onOpenAtelier: () => void;
  onOpenTrousseau: () => void;
  onOpenMap: () => void;
  onOpenAdmin?: () => void;
  trousseauCount: number;
  activeSection: string;
  onNavigate: (id: string) => void;
  products?: BridalProduct[];
  onSelectProduct?: (p: BridalProduct) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const links = [['Home', '/'], ['Luxury', '/luxury'], ['Best Selling', '/best-selling'], ['Formals', '/formals'], ['New Arrivals', '/new-arrivals'], ['Sale', '/sale']];

export const Navbar: React.FC<NavbarProps> = ({ trousseauCount, products = [] }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const saleIsLive = products.some((product) => product.isDiscounted);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8DCCB] bg-[#FAF8F5]/95 backdrop-blur-md">
      <AnimatePresence>
        {saleIsLive && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 30, opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[#4A0E17] text-[#F8E6BD]">
          <div className="sale-marquee-viewport h-[30px] overflow-hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[.2em] sm:text-xs">
            <div className="sale-marquee-track h-full">
              {Array.from({ length: 6 }, (_, index) => <span key={index} aria-hidden={index > 0} className="sale-marquee-copy">✦ Sale is live at AHK Studio · Discover selected couture pieces at special prices · ✦</span>)}
            </div>
          </div>
        </motion.div>}
      </AnimatePresence>
      <div className="hidden border-b border-white/10 bg-[#180E12] px-4 py-1.5 text-[11px] text-stone-300 sm:block">
        <div className="mx-auto flex max-w-7xl justify-between"><span><b className="font-serif text-[#E5C378]">AHK Exclusive Boutique:</b> Shop # G-32, Dolmen Mall, Tariq Road, Karachi</span><a href="tel:+923222586576">+92 322 2586576</a></div>
      </div>
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-[76px] items-center justify-between gap-3">
          <Link to="/" aria-label="AHK Bridal Studio home" className="shrink-0"><img src={logoImg} alt="AHK Bridal Studio" className="h-10 w-auto max-w-[145px] object-contain sm:h-12 sm:max-w-[190px]" /></Link>
          <form className="hidden max-w-xs flex-1 items-center rounded-full border border-[#DECDBB] bg-white px-3 md:flex" onSubmit={(event) => { event.preventDefault(); navigate(`/search${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`); }}>
            <Search size={16} className="text-[#997A3D]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the collection" className="w-full bg-transparent px-2 py-2 text-xs outline-none" aria-label="Search collection" />
          </form>
          <div className="flex items-center gap-3">
            <Link to="/wishlist" aria-label="Wishlist" className="text-[#4A0E17] hover:text-[#997A3D]"><Heart size={20} /></Link>
            <Link to="/cart" aria-label="Shopping cart" className="relative text-[#4A0E17] hover:text-[#997A3D]"><ShoppingBag size={21} />{trousseauCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#7A0C1E] px-1 text-[9px] text-white">{trousseauCount}</span>}</Link>
          </div>
        </div>
        <nav aria-label="Main navigation" className="mobile-nav-slider flex min-h-11 items-center justify-start gap-5 overflow-x-auto border-t border-[#E8DCCB] px-3 text-[10px] font-medium uppercase tracking-[.04em] sm:justify-center sm:gap-8 sm:px-0 sm:text-xs sm:tracking-wider">
          {links.map(([label, path]) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `shrink-0 snap-start whitespace-nowrap py-3 transition-colors ${isActive ? 'text-[#7A0C1E]' : 'text-[#68554E] hover:text-[#7A0C1E]'}`}>{label}</NavLink>)}
        </nav>
        <form className="flex items-center border-t border-[#E8DCCB] py-2 md:hidden" onSubmit={(event) => { event.preventDefault(); navigate(`/search${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`); }}>
          <Search size={16} className="text-[#997A3D]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the collection" className="w-full bg-transparent px-2 text-sm outline-none" aria-label="Search collection" />
        </form>
      </div>
    </header>
  );
};
