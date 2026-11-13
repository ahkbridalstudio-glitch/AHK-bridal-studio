import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Boxes,
  Sparkles,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { AdminProduct } from '../../types/admin';
import { api, ShopCategory } from '../../services/api';

interface AdminProductsProps {
  products: AdminProduct[];
  currency: 'PKR' | 'USD';
  onAddNewProduct: () => void;
  onEditProduct: (product: AdminProduct) => void;
  onViewProduct: (product: AdminProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateStock: (productId: string, stock: number) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  currency,
  onAddNewProduct,
  onEditProduct,
  onViewProduct,
  onDeleteProduct,
  onUpdateStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<string>('All');
  const [styleFilter, setStyleFilter] = useState<string>('All');
  const [collections, setCollections] = useState<ShopCategory[]>([]);
  const [styles, setStyles] = useState<ShopCategory[]>([]);
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'OutOfStock' | 'InStock'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  useEffect(() => {
    api.getCategories().then((categories) => {
      setCollections(categories.collections || []);
      setStyles(categories.styles || []);
    }).catch((error) => console.error('Could not load storefront categories:', error));
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

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.urduName && prod.urduName.includes(searchQuery)) ||
      prod.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.fabric ? prod.fabric.toLowerCase().includes(searchQuery.toLowerCase()) : false);

    const matchesCollection = collectionFilter === 'All' || (collectionFilter === 'sale'
      ? Boolean(prod.isDiscounted)
      : collectionFilter === 'best-selling'
      ? Boolean(prod.isBestSelling || prod.totalSold > 0)
      : collectionFilter === 'new-arrivals'
      ? Boolean(prod.isNewArrival)
      : Boolean(prod.collections?.includes(collectionFilter)));
    const matchesStyle = styleFilter === 'All' || prod.styleCategory === styleFilter;

    let matchesStock = true;
    if (stockFilter === 'Low') {
      matchesStock = prod.stock > 0 && prod.stock <= prod.lowStockThreshold;
    } else if (stockFilter === 'OutOfStock') {
      matchesStock = prod.stock === 0;
    } else if (stockFilter === 'InStock') {
      matchesStock = prod.stock > prod.lowStockThreshold;
    }

    return matchesSearch && matchesCollection && matchesStyle && matchesStock;
  });

  const confirmDelete = (id: string) => {
    onDeleteProduct(id);
    setDeletingProductId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-[#C5A059] tracking-wider">
            AHK Studio Catalog & Inventory
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Bridal Suit Management
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Create, edit, manage stock, and monitor pricing for royal Pakistani bridal ensembles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#1A141C] border border-[#2F2430] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-[#7A0C1E] text-white' : 'text-stone-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#7A0C1E] text-white' : 'text-stone-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onAddNewProduct}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E5C378] text-[#180E12] font-semibold text-xs shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Ensemble</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#161217] border border-[#2C222A] space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ensemble Name, Urdu title, SKU, or Fabric..."
              className="w-full bg-[#1F1721] border border-[#3A2D37] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-mono whitespace-nowrap">Stock Level:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="bg-[#1F1721] border border-[#3A2D37] rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="All">All Stock Levels</option>
              <option value="Low">Low Stock Alert (≤ 2)</option>
              <option value="InStock">Healthy Stock (&gt; 2)</option>
              <option value="OutOfStock">Out of Stock (0)</option>
            </select>
          </div>
        </div>

          {/* Storefront collection filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-stone-500 mr-1 text-[11px] uppercase">Collection:</span>
          {['All', ...collections.map((cat) => cat.slug)].map((cat) => {
            const count =
              cat === 'All' ? products.length : products.filter((p) => cat === 'sale'
                ? Boolean(p.isDiscounted)
                : cat === 'best-selling'
                ? Boolean(p.isBestSelling || p.totalSold > 0)
                : cat === 'new-arrivals'
                ? Boolean(p.isNewArrival)
                : p.collections?.includes(cat)).length;
            const isSelected = collectionFilter === cat;
            const label = cat === 'All' ? 'All' : collections.find((category) => category.slug === cat)?.name || cat;

            return (
              <button
                key={cat}
                onClick={() => setCollectionFilter(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#7A0C1E] text-white font-bold shadow-sm'
                    : 'bg-[#1F1721] text-stone-300 hover:bg-[#2A1F2D]'
                }`}
              >
                {label} <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-3 text-xs font-mono text-stone-400">
          <span className="text-[11px] uppercase">Shop By Style:</span>
          <select value={styleFilter} onChange={(event) => setStyleFilter(event.target.value)} className="rounded-lg border border-[#3A2D37] bg-[#1F1721] px-3 py-2 text-stone-200">
            <option value="All">All styles</option>
            {styles.map((style) => <option key={style.slug} value={style.slug}>{style.name}</option>)}
          </select>
        </label>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-[#161217] border border-[#2C222A] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1A141C] border-b border-[#2C222A] text-[11px] font-mono uppercase text-stone-400 tracking-wider">
                  <th className="py-3.5 px-4">Ensemble / Image</th>
                  <th className="py-3.5 px-4">SKU & Urdu Title</th>
                  <th className="py-3.5 px-4">Storefront Assignment</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Turnaround</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201822] text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-500 font-mono text-xs">
                      No products match your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const isLow = prod.stock <= prod.lowStockThreshold && prod.stock > 0;
                    const isOut = prod.stock === 0;

                    return (
                      <tr
                        key={prod.id}
                        className="hover:bg-[#1E1720]/80 transition-colors group cursor-pointer"
                        onClick={() => onViewProduct(prod)}
                      >
                        {/* Ensemble & Image */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-12 h-14 rounded-lg object-cover border border-[#3A2D37] shrink-0"
                            />
                            <div>
                              <div className="font-serif font-bold text-white group-hover:text-[#E5C378] transition-colors">
                                {prod.name}
                              </div>
                              <div className="text-[10px] text-stone-400 line-clamp-1 max-w-xs mt-0.5">
                                {prod.silhouette}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SKU & Urdu Name */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-[#C5A059] font-bold text-xs">{prod.sku}</div>
                          {prod.urduName && (
                            <div className="font-serif text-stone-300 text-xs mt-0.5">
                              {prod.urduName}
                            </div>
                          )}
                        </td>

                        {/* Storefront Assignment */}
                        <td className="py-3.5 px-4">
                          <div className="flex max-w-[220px] flex-wrap gap-1">
                            {assignedCollections(prod).map((slug) => <span key={slug} className="rounded border border-[#332436] bg-[#221824] px-1.5 py-0.5 text-[9px] font-mono text-stone-300">{collections.find((c) => c.slug === slug)?.name || slug}</span>)}
                            {prod.styleCategory && <span className="rounded border border-[#C5A059]/30 bg-[#C5A059]/10 px-1.5 py-0.5 text-[9px] font-mono text-[#E5C378]">{styles.find((c) => c.slug === prod.styleCategory)?.name || prod.styleCategory}</span>}
                            {!assignedCollections(prod).length && !prod.styleCategory && <span className="text-[10px] text-stone-500">Unassigned</span>}
                          </div>
                          <div className="mt-1 truncate text-[10px] text-stone-400">{prod.fabric}</div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                          {prod.isDiscounted && prod.discountPercent && prod.discountPercent > 0 ? (
                            <div>
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className="text-[#E5C378]">{formatAmount(prod.pricePKR, prod.priceUSD)}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#991B1B] text-white font-bold">
                                  -{prod.discountPercent}%
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-500 line-through">
                                {formatAmount(prod.originalPricePKR || prod.pricePKR, prod.originalPriceUSD || prod.priceUSD)}
                              </div>
                            </div>
                          ) : (
                            <span className="font-bold text-white">{formatAmount(prod.pricePKR, prod.priceUSD)}</span>
                          )}
                        </td>

                        {/* Stock with Inline +/- Adjuster */}
                        <td
                          className="py-3.5 px-4"
                          onClick={(e) => e.stopPropagation()} // don't open modal
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onUpdateStock(prod.id, prod.stock - 1)}
                              disabled={prod.stock <= 0}
                              className="w-6 h-6 rounded bg-[#251C27] hover:bg-[#7A0C1E] text-stone-300 hover:text-white disabled:opacity-30 flex items-center justify-center font-mono font-bold text-xs transition-colors"
                            >
                              -
                            </button>

                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded text-xs min-w-[32px] text-center ${
                                isOut
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : isLow
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-[#251C27] text-white'
                              }`}
                            >
                              {prod.stock}
                            </span>

                            <button
                              onClick={() => onUpdateStock(prod.id, prod.stock + 1)}
                              className="w-6 h-6 rounded bg-[#251C27] hover:bg-[#7A0C1E] text-stone-300 hover:text-white flex items-center justify-center font-mono font-bold text-xs transition-colors"
                            >
                              +
                            </button>
                          </div>
                          {isLow && (
                            <div className="text-[9px] font-mono text-amber-400 mt-1">
                              Low Stock Alert
                            </div>
                          )}
                          {isOut && (
                            <div className="text-[9px] font-mono text-rose-400 mt-1">
                              Out of Stock
                            </div>
                          )}
                        </td>

                        {/* Delivery Turnaround */}
                        <td className="py-3.5 px-4 font-mono text-stone-300">
                          {prod.deliveryWeeks || 8} weeks
                          <div className="text-[10px] text-stone-500">
                            Bespoke Couture
                          </div>
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onViewProduct(prod)}
                              className="p-1.5 rounded-lg bg-[#251C27] hover:bg-[#39293C] text-stone-300 hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-[#251C27] hover:bg-[#C5A059] text-stone-300 hover:text-[#180E12] transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingProductId(prod.id)}
                              className="p-1.5 rounded-lg bg-[#251C27] hover:bg-rose-900 text-stone-300 hover:text-rose-200 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const isLow = prod.stock <= prod.lowStockThreshold && prod.stock > 0;
            const isOut = prod.stock === 0;

            return (
              <div
                key={prod.id}
                className="rounded-2xl bg-[#161217] border border-[#2C222A] overflow-hidden group hover:border-[#C5A059]/40 transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#241B26]">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#180E12]/90 backdrop-blur-md text-[#E5C378] border border-[#C5A059]/30">
                        {[...assignedCollections(prod).map((slug) => collections.find((c) => c.slug === slug)?.name || slug), ...(prod.styleCategory ? [styles.find((c) => c.slug === prod.styleCategory)?.name || prod.styleCategory] : [])].join(' · ') || 'Unassigned'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-black/80 text-stone-300">
                        {prod.sku}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold backdrop-blur-md ${
                          isOut
                            ? 'bg-rose-900/90 text-rose-200 border border-rose-500/40'
                            : isLow
                            ? 'bg-amber-900/90 text-amber-200 border border-amber-500/40'
                            : 'bg-emerald-900/90 text-emerald-200 border border-emerald-500/40'
                        }`}
                      >
                        {prod.stock} in Studio
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-serif font-bold text-white text-base">{prod.name}</h4>
                        {prod.urduName && (
                          <div className="text-xs font-serif text-[#C5A059] mt-0.5">
                            {prod.urduName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-stone-400 mt-2 line-clamp-2">
                      {prod.description}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#251C27] flex items-center justify-between">
                      <div className="font-mono">
                        <span className="text-[10px] text-stone-500 block uppercase">
                          {prod.isDiscounted ? 'Sale Price' : 'Base Price'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-sm ${prod.isDiscounted ? 'text-[#E5C378]' : 'text-white'}`}>
                            {formatAmount(prod.pricePKR, prod.priceUSD)}
                          </span>
                          {prod.isDiscounted && prod.discountPercent && prod.discountPercent > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#991B1B] text-white font-bold">
                              -{prod.discountPercent}%
                            </span>
                          )}
                        </div>
                        {prod.isDiscounted && (
                          <div className="text-[10px] text-stone-500 line-through">
                            {formatAmount(prod.originalPricePKR || prod.pricePKR, prod.originalPriceUSD || prod.priceUSD)}
                          </div>
                        )}
                      </div>
                      <div className="text-right font-mono text-[11px] text-stone-400">
                        <div className="text-[#C5A059] font-bold">
                          {(prod.availableSizes && prod.availableSizes.length > 0 ? prod.availableSizes : ['S', 'M', 'L', 'XL']).join(' · ')}
                        </div>
                        <span className="text-[10px] text-stone-500 block">{prod.deliveryWeeks || 8} Wks Handcrafted</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-[#1A141D] border-t border-[#261E28] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateStock(prod.id, prod.stock - 1)}
                      disabled={prod.stock <= 0}
                      className="w-7 h-7 rounded bg-[#281F2A] hover:bg-[#7A0C1E] text-stone-200 disabled:opacity-30 flex items-center justify-center font-mono text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs text-white px-2 font-bold">
                      {prod.stock}
                    </span>
                    <button
                      onClick={() => onUpdateStock(prod.id, prod.stock + 1)}
                      className="w-7 h-7 rounded bg-[#281F2A] hover:bg-[#7A0C1E] text-stone-200 flex items-center justify-center font-mono text-xs"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewProduct(prod)}
                      className="p-1.5 rounded-lg bg-[#251C27] hover:bg-[#382B3B] text-stone-300 hover:text-white"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditProduct(prod)}
                      className="p-1.5 rounded-lg bg-[#251C27] hover:bg-[#C5A059] text-stone-300 hover:text-[#180E12]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProductId(prod.id)}
                      className="p-1.5 rounded-lg bg-[#251C27] hover:bg-rose-900 text-stone-300 hover:text-rose-200"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#18131A] border border-[#3A2D37] rounded-2xl w-full max-w-md p-6 shadow-2xl text-left">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Delete Bridal Ensemble?</h3>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              Are you sure you want to remove this ensemble from the catalog? This will remove it from both the Storefront and the Studio inventory.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 rounded-xl bg-[#241A23] text-stone-300 text-xs font-mono hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deletingProductId)}
                className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-mono font-bold transition-colors shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
