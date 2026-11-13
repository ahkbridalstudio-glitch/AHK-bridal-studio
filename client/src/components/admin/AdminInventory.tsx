import React, { useEffect, useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Search,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Edit2
} from 'lucide-react';
import { AdminProduct } from '../../types/admin';
import { api } from '../../services/api';

interface AdminInventoryProps {
  products: AdminProduct[];
  currency: 'PKR' | 'USD';
  onUpdateStock: (productId: string, stock: number) => void;
  onEditProduct: (product: AdminProduct) => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  products,
  currency,
  onUpdateStock,
  onEditProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [restockAmount, setRestockAmount] = useState<number>(3);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getCategories().then((categories) => {
      setCategoryNames(Object.fromEntries([...categories.collections, ...categories.styles].map((category) => [category.slug, category.name])));
    }).catch((error) => console.error('Could not load storefront category names:', error));
  }, []);

  const formatAmount = (pkr: number, usd: number) => {
    if (currency === 'USD') return `$${usd.toLocaleString()}`;
    return `PKR ${pkr.toLocaleString()}`;
  };

  const assignedCollections = (product: AdminProduct) => [
    ...(product.collections || []),
    ...(product.isDiscounted ? ['sale'] : []),
    ...(product.isBestSelling || product.totalSold > 0 ? ['best-selling'] : []),
    ...(product.isNewArrival ? ['new-arrivals'] : []),
  ].filter((slug, index, slugs) => slugs.indexOf(slug) === index);

  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockValuePKR = products.reduce((acc, p) => acc + p.stock * p.pricePKR, 0);
  const totalStockValueUSD = products.reduce((acc, p) => acc + p.stock * p.priceUSD, 0);
  const lowStockItems = products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0);
  const outOfStockItems = products.filter((p) => p.stock === 0);

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.fabric ? p.fabric.toLowerCase().includes(searchQuery.toLowerCase()) : false)
  );

  // Quick Restock All Low Stock Items by +3
  const handleRestockAllLow = () => {
    lowStockItems.forEach((p) => {
      onUpdateStock(p.id, p.stock + restockAmount);
    });
    outOfStockItems.forEach((p) => {
      onUpdateStock(p.id, p.stock + restockAmount);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Batch Restock Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-[#C5A059] tracking-wider">
            Dolmen Mall Tariq Road & Kargah Inventory
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Studio Stock & Restock Hub
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Monitor bridal ensemble availability, prevent stockouts, and manage artisan atelier restock.
          </p>
        </div>

        <button
          onClick={handleRestockAllLow}
          disabled={lowStockItems.length === 0 && outOfStockItems.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 disabled:opacity-40 text-white font-mono font-bold text-xs shadow-lg hover:brightness-110 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restock All Low-Stock (+{restockAmount} units)</span>
        </button>
      </div>

      {/* Inventory KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#161217] border border-[#2C222A]">
          <span className="text-[11px] font-mono uppercase text-stone-400">Total Units in Studio</span>
          <div className="text-2xl font-mono font-bold text-white mt-2">
            {totalStockUnits} <span className="text-sm font-sans font-normal text-stone-400">Suits</span>
          </div>
          <div className="text-xs text-stone-400 mt-1">Across catalog products</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161217] border border-[#2C222A]">
          <span className="text-[11px] font-mono uppercase text-stone-400">Inventory Valuation</span>
          <div className="text-2xl font-mono font-bold text-[#E5C378] mt-2">
            {formatAmount(totalStockValuePKR, totalStockValueUSD)}
          </div>
          <div className="text-xs text-stone-400 mt-1">At retail studio pricing</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161217] border border-amber-900/30">
          <span className="text-[11px] font-mono uppercase text-amber-300">Low Stock Watchlist</span>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-2">
            {lowStockItems.length} <span className="text-sm font-sans font-normal text-stone-400">Items</span>
          </div>
          <div className="text-xs text-amber-300/80 mt-1">Stock ≤ 2 pieces in boutique</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161217] border border-rose-900/30">
          <span className="text-[11px] font-mono uppercase text-rose-300">Out of Stock</span>
          <div className="text-2xl font-mono font-bold text-rose-400 mt-2">
            {outOfStockItems.length} <span className="text-sm font-sans font-normal text-stone-400">Items</span>
          </div>
          <div className="text-xs text-rose-300/80 mt-1">Requires immediate karigar queue</div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="rounded-2xl bg-[#161217] border border-[#2C222A] overflow-hidden shadow-xl">
        <div className="p-4 bg-[#1A141D] border-b border-[#2C222A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stock by title or SKU..."
              className="w-full bg-[#201822] border border-[#3A2D37] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <span>Fast Restock Increment:</span>
            <select
              value={restockAmount}
              onChange={(e) => setRestockAmount(Number(e.target.value))}
              className="bg-[#201822] border border-[#3A2D37] rounded-lg px-2 py-1 text-xs text-[#E5C378] focus:outline-none"
            >
              <option value={1}>+1 Unit</option>
              <option value={2}>+2 Units</option>
              <option value={3}>+3 Units</option>
              <option value={5}>+5 Units</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1C161F] text-[11px] font-mono uppercase text-stone-400 tracking-wider border-b border-[#2C222A]">
                <th className="py-3 px-4">SKU / Ensemble</th>
                <th className="py-3 px-4">Storefront Assignment</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Units in Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Inventory Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#201822] text-xs">
              {filteredProducts.map((prod) => {
                const isOut = prod.stock === 0;
                const isLow = prod.stock <= prod.lowStockThreshold && prod.stock > 0;

                return (
                  <tr key={prod.id} className="hover:bg-[#1E1720]/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-serif font-bold text-white">{prod.name}</div>
                      <div className="text-[10px] font-mono text-[#C5A059]">{prod.sku}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {assignedCollections(prod).map((slug) => <span key={slug} className="rounded border border-[#3A2D37] bg-[#201822] px-1.5 py-0.5 text-[9px] text-stone-300">{categoryNames[slug] || slug}</span>)}
                        {prod.styleCategory && <span className="rounded border border-[#C5A059]/30 bg-[#C5A059]/10 px-1.5 py-0.5 text-[9px] text-[#E5C378]">{categoryNames[prod.styleCategory] || prod.styleCategory}</span>}
                        {!assignedCollections(prod).length && !prod.styleCategory && <span className="text-[10px] text-stone-500">Unassigned</span>}
                      </div>
                      <div className="mt-1 text-[10px] text-stone-500">{prod.fabric}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-white whitespace-nowrap">
                      {formatAmount(prod.pricePKR, prod.priceUSD)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <button
                          onClick={() => onUpdateStock(prod.id, prod.stock - 1)}
                          disabled={prod.stock <= 0}
                          className="w-5 h-5 rounded bg-[#281F2A] hover:bg-[#7A0C1E] text-stone-200 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-white">{prod.stock}</span>
                        <button
                          onClick={() => onUpdateStock(prod.id, prod.stock + 1)}
                          className="w-5 h-5 rounded bg-[#281F2A] hover:bg-[#7A0C1E] text-stone-200 flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-400">
                      ≤ {prod.lowStockThreshold} pcs
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-stone-200 whitespace-nowrap">
                      {formatAmount(prod.stock * prod.pricePKR, prod.stock * prod.priceUSD)}
                    </td>

                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onUpdateStock(prod.id, prod.stock + restockAmount)}
                        className="px-3 py-1 rounded-lg bg-[#271E29] hover:bg-[#C5A059] text-stone-200 hover:text-[#180E12] font-mono text-xs transition-colors"
                      >
                        +{restockAmount} Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
