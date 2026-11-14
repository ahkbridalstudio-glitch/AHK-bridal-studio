import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Minus, Plus, ArrowLeft } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { api, ShopCategory } from './services/api';
import { AdminProduct, AdminOrder } from './types/admin';
import { TrousseauItem } from './types/bridal';
import { getProductSlug } from './utils/productSlug';
import { calculateCodFee } from './utils/codPricing';
import { ApiLoadingBar } from './components/ApiLoadingBar';
import { AnimatePresence, motion } from 'motion/react';

const Hero = lazy(() => import('./components/Hero').then((module) => ({ default: module.Hero })));
const BridalPictureCarousel = lazy(() => import('./components/BridalPictureCarousel').then((module) => ({ default: module.BridalPictureCarousel })));
const AboutUs = lazy(() => import('./components/AboutUs').then((module) => ({ default: module.AboutUs })));
const ContactUs = lazy(() => import('./components/ContactUs').then((module) => ({ default: module.ContactUs })));
const StoreLocationModal = lazy(() => import('./components/StoreLocationModal').then((module) => ({ default: module.StoreLocationModal })));
const ProductGrid = lazy(() => import('./components/shop/ProductGrid').then((module) => ({ default: module.ProductGrid })));
const ProductReviews = lazy(() => import('./components/shop/ProductReviews').then((module) => ({ default: module.ProductReviews })));
const ShopByStyle = lazy(() => import('./components/shop/ShopByStyle').then((module) => ({ default: module.ShopByStyle })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin').then((module) => ({ default: module.AdminLogin })));

const collections = [
  { slug: 'luxury', title: 'Luxury Collection', description: 'Hand finished couture pieces from the AHK atelier.' },
  { slug: 'best-selling', title: 'Best Selling', description: 'The most-loved pieces chosen by our clients.' },
  { slug: 'formals', title: 'Formals', description: 'Refined formalwear for celebrations and special evenings.' },
  { slug: 'new-arrivals', title: 'New Arrivals', description: 'The latest additions from the atelier.' },
  { slug: 'sale', title: 'Sale', description: 'Selected pieces currently available at a special price.' },
];
const styleFallbacks = [
  '/src/assets/images/bridal_mehndi_angrakha_1792071423399.jpg', '/src/assets/images/bridal_nikah_ivory_1792071423461.jpg',
  '/src/assets/images/bridal_walima_gown_1792071422666.jpg', '/src/assets/images/bridal_mehndi_angrakha_1792071423399.jpg',
  '/src/assets/images/bridal_emerald_velvet_lehenga_1792253141443.jpg', '/src/assets/images/hero_pakistani_bridal_lehenga_1792071419809.jpg',
];
const pageClass = 'mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8';
const titleClass = 'font-serif text-3xl text-[#360810] sm:text-4xl';
const money = (n: number) => `PKR ${Number(n || 0).toLocaleString()}`;

function PageHead({ title, description }: { title: string; description: string }) {
  useEffect(() => { document.title = `${title} | AHK Bridal Studio`; const meta = document.querySelector('meta[name="description"]') || document.createElement('meta'); meta.setAttribute('name', 'description'); meta.setAttribute('content', description); document.head.appendChild(meta); }, [title, description]);
  return <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="mb-8 border-b border-[#E8DCCB] pb-6"><p className="mb-2 text-xs uppercase tracking-[.25em] text-[#997A3D]">AHK Bridal Studio</p><h1 className={titleClass}>{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#78655E]">{description}</p></motion.header>;
}

function CollectionPage({ slug, style = false }: { slug: string; style?: boolean }) {
  const [products, setProducts] = useState<AdminProduct[]>([]); const [categories, setCategories] = useState<{collections: ShopCategory[]; styles: ShopCategory[]}>({ collections: [], styles: [] }); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const metadata = collections.find((c) => c.slug === slug);
  useEffect(() => { let active = true; setLoading(true); setError(''); Promise.all([api.getCategories(), api.getProducts(style ? { styleCategory: slug } : { collection: slug })]).then(([cats, result]) => { if (active) { setCategories(cats); setProducts(result); } }).catch((e) => active && setError(e.message)).finally(() => active && setLoading(false)); return () => { active = false; }; }, [slug, style]);
  const category = (style ? categories.styles : categories.collections).find((c) => c.slug === slug);
  const title = style ? category?.name || slug.replaceAll('-', ' ') : metadata?.title || slug;
  const description = category?.description || metadata?.description || 'Discover the AHK Bridal Studio collection.';
  const index = ['kurta-set','pishwas','maxi','garara','lehenga','sharara'].indexOf(slug);
  return <main className={pageClass}><PageHead title={title} description={description}/>{style && <div className="mb-8 h-48 overflow-hidden rounded-xl sm:h-72"><img className="h-full w-full object-cover object-center" src={styleFallbacks[index] || styleFallbacks[0]} alt={title}/></div>}{loading ? <ApiLoadingBar className="min-h-52"/> : error ? <p role="alert" className="rounded-xl bg-red-50 p-6 text-red-800">Could not load this collection: {error}</p> : <ProductGrid products={products} emptyTitle="No pieces in this collection yet" emptyDescription="New pieces will appear here once they are assigned to this collection."/>}</main>;
}

function SearchPage() {
  const [params] = useSearchParams(); const initial = params.get('q') || ''; const [products, setProducts] = useState<AdminProduct[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => { let active=true; setError(''); if (!initial.trim()) { setProducts([]); return; } setLoading(true); api.getProducts({search: initial}).then((p)=>active&&setProducts(p)).catch(e=>active&&setError(e.message)).finally(()=>active&&setLoading(false)); return ()=>{active=false;}; }, [initial]);
  return <main className={pageClass}><PageHead title="Search" description="Search the AHK couture collection."/>{loading?<ApiLoadingBar className="min-h-72"/>:error?<p role="alert">{error}</p>:initial?<ProductGrid products={products}/>:<p className="text-[#78655E]">Use the search field above to find pieces, fabrics, and styles.</p>}</main>;
}

function ProductPage({ add, wishlistIds, toggleWishlist, products }: { add: (p: AdminProduct, size: string, color: string, quantity: number) => void; wishlistIds: string[]; toggleWishlist:(id:string)=>void; products:AdminProduct[] }) {
  const { slug = '' } = useParams(); const navigate=useNavigate(); const [product,setProduct]=useState<AdminProduct|null>(null); const [related,setRelated]=useState<AdminProduct[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [size,setSize]=useState(''); const [color,setColor]=useState(''); const [quantity,setQuantity]=useState(1); const [image,setImage]=useState('');
  useEffect(()=>{let active=true;setLoading(true);setError('');api.getProductBySlug(slug).then(p=>{if(!active)return;setProduct(p);setImage(p.image);document.title=`${p.name} | AHK Bridal Studio`;setLoading(false);api.getProducts(p.styleCategory?{styleCategory:p.styleCategory}:{}).then(list=>{if(active)setRelated(list.filter(x=>x.id!==p.id).slice(0,4));}).catch(()=>{});}).catch(e=>{if(active){setError(e.message);setLoading(false);}});return()=>{active=false;};},[slug]);
  useEffect(()=>{const match=products.find(p=>getProductSlug(p)===slug||p.id===slug);if(match){setProduct(current=>current||match);setImage(current=>current||match.image);setLoading(false);document.title=`${match.name} | AHK Bridal Studio`;setRelated(products.filter(p=>p.id!==match.id&&(p.styleCategory===match.styleCategory||!match.styleCategory)).slice(0,4));}},[products,slug]);
  if(loading)return <main className={pageClass}><ApiLoadingBar className="min-h-[45vh]"/></main>; if(error||!product)return <main className={pageClass}><p role="alert">{error||'Product not found.'}</p><Link to="/luxury" className="mt-4 inline-block text-[#7A0C1E]">Browse collections</Link></main>;
  const images=[...new Set([product.image,...(product.images||[]),product.secondaryImage].filter(Boolean))] as string[]; const colors=[...new Set([...(product.availableColors||[]),...(product.colorway||'').split(/[,/;]+/).map(c=>c.trim()).filter(Boolean)])]; const discounted=Boolean(product.isDiscounted||product.discountPercent); const price=discounted?(product.discountPricePKR||product.pricePKR):product.pricePKR;
  const addSelected = () => add(product, size, color, quantity);
  return <main className={pageClass}><Link to="/luxury" className="mb-6 inline-flex items-center gap-2 text-sm text-[#78655E]"><ArrowLeft size={16}/> Back to collections</Link><div className="grid gap-8 lg:grid-cols-2"><section><div className="aspect-[4/5] overflow-hidden rounded-xl bg-[#EFE7DE]"><img src={image} alt={product.name} className="h-full w-full object-cover"/></div><div className="mt-3 flex gap-3 overflow-x-auto">{images.map(src=><button key={src} onClick={()=>setImage(src)} className="h-20 w-16 shrink-0 overflow-hidden rounded border border-[#E8DCCB]"><img src={src} className="h-full w-full object-cover"/></button>)}</div></section><section className="py-3"><p className="text-xs uppercase tracking-[.2em] text-[#997A3D]">{product.silhouette||product.styleCategory||'Couture'}</p><div className="mt-3 flex items-start justify-between gap-4"><h1 className="font-serif text-3xl text-[#360810] sm:text-4xl">{product.name}</h1><button aria-label={wishlistIds.includes(product.id)?'Remove from wishlist':'Add to wishlist'} onClick={()=>toggleWishlist(product.id)} className="rounded-full border border-[#E8DCCB] p-3 text-[#7A0C1E]"><Heart className={wishlistIds.includes(product.id)?'fill-current':''}/></button></div><div className="mt-5 flex gap-3 font-mono"><b className="text-[#4A0E17]">{money(price)}</b>{discounted&&<del className="text-stone-400">{money(product.originalPricePKR||product.pricePKR)}</del>}</div><p className="mt-6 whitespace-pre-line text-sm leading-7 text-[#68554E]">{product.description}</p>{product.fabric&&<p className="mt-4 text-sm"><b>Fabric:</b> {product.fabric}</p>}<label className="mt-7 block text-sm font-medium">Size<select className="mt-2 block w-full rounded border border-[#E8DCCB] bg-white p-3" value={size} onChange={e=>setSize(e.target.value)}><option value="">Select size</option>{(product.availableSizes?.length?product.availableSizes:['S','M','L','XL']).map(s=><option key={s}>{s}</option>)}</select></label>{colors.length>0&&<label className="mt-4 block text-sm font-medium">Color<select className="mt-2 block w-full rounded border border-[#E8DCCB] bg-white p-3" value={color} onChange={e=>setColor(e.target.value)}><option value="">Select color</option>{colors.map(c=><option key={c}>{c}</option>)}</select></label>}<label className="mt-4 block text-sm font-medium">Quantity<input className="mt-2 block w-24 rounded border border-[#E8DCCB] p-3" type="number" min="1" max={product.stock||99} value={quantity} onChange={e=>setQuantity(Math.max(1,Number(e.target.value)))}/></label><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button disabled={!size||!product.stock} onClick={addSelected} className="rounded bg-[#4A0E17] px-6 py-3 text-white disabled:opacity-40">Add to Cart</button><button disabled={!size||!product.stock} onClick={()=>{addSelected();navigate('/checkout');}} className="rounded border border-[#4A0E17] px-6 py-3 text-[#4A0E17] disabled:opacity-40">Buy Now</button></div>{product.stock===0&&<p className="mt-3 text-sm text-red-700">Currently out of stock</p>}</section></div><ProductReviews key={product.id} productId={product.id}/>{related.length>0&&<section className="mt-16"><h2 className={`${titleClass} mb-6`}>Related pieces</h2><ProductGrid products={related}/></section>}</main>;
}

function CartPage({items,setItems}:{items:TrousseauItem[];setItems:React.Dispatch<React.SetStateAction<TrousseauItem[]>>}) {
  const subtotal=items.reduce((n,i)=>n+i.pricePKR*i.quantity,0); const shipping=items.length?calculateCodFee('Karachi'):0;
  return <main className={pageClass}><PageHead title="Your Cart" description="Review your selected pieces before checkout."/>{!items.length?<div className="py-12 text-center"><ShoppingBag className="mx-auto mb-4"/><p>Your cart is empty.</p><Link className="mt-5 inline-block rounded bg-[#4A0E17] px-5 py-3 text-white" to="/luxury">Continue shopping</Link></div>:<div className="grid gap-8 lg:grid-cols-[1fr_340px]"><div className="space-y-4">{items.map(item=><article key={item.id} className="flex gap-4 rounded-xl border border-[#E8DCCB] bg-white p-3 sm:p-5"><Link to={item.productId?`/product/${item.productId}`:'/luxury'} className="h-28 w-24 shrink-0 overflow-hidden rounded bg-[#EFE7DE]">{item.image&&<img className="h-full w-full object-cover" src={item.image}/>}</Link><div className="min-w-0 flex-1"><h2 className="font-serif text-lg text-[#360810]">{item.title}</h2><p className="text-xs text-[#78655E]">{item.size&&`Size ${item.size}`} {item.color&&` · ${item.color}`}</p><p className="mt-2 font-mono text-sm">{money(item.pricePKR)}</p><div className="mt-3 flex items-center gap-3"><button aria-label="Decrease quantity" onClick={()=>setItems(xs=>xs.map(x=>x.id===item.id?{...x,quantity:Math.max(1,x.quantity-1)}:x))}><Minus size={16}/></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={()=>setItems(xs=>xs.map(x=>x.id===item.id?{...x,quantity:x.quantity+1}:x))}><Plus size={16}/></button><button className="ml-auto text-red-700" aria-label="Remove item" onClick={()=>setItems(xs=>xs.filter(x=>x.id!==item.id))}><Trash2 size={17}/></button></div></div></article>)}</div><aside className="h-fit rounded-xl border border-[#E8DCCB] bg-white p-5"><h2 className="font-serif text-xl">Order summary</h2><p className="mt-4 flex justify-between text-sm"><span>Subtotal</span><b>{money(subtotal)}</b></p><p className="mt-3 flex justify-between text-sm"><span>Shipping (Karachi COD)</span><b>{shipping?money(shipping):'Free'}</b></p><p className="mt-4 flex justify-between border-t border-[#E8DCCB] pt-4"><b>Total</b><b>{money(subtotal+shipping)}</b></p><Link to="/checkout" className="mt-5 block rounded bg-[#4A0E17] p-3 text-center text-white">Proceed to Checkout</Link><Link to="/luxury" className="mt-3 block text-center text-sm text-[#78655E]">Continue shopping</Link></aside></div>}</main>;
}

function CheckoutPage({items,clear}:{items:TrousseauItem[];clear:()=>void}) {
  const navigate=useNavigate();
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [phone,setPhone]=useState('');
  const [street,setStreet]=useState('');
  const [city,setCity]=useState('Karachi');
  const [postal,setPostal]=useState('');
  const [error,setError]=useState('');
  const [coupon,setCoupon]=useState('');
  const [couponError,setCouponError]=useState('');
  const [couponBusy,setCouponBusy]=useState(false);
  const [appliedCoupon,setAppliedCoupon]=useState<{code:string;discountType?:'percentage'|'fixed'|'free_cod';discountAmountPKR?:number;discountAmountUSD?:number;freeCOD?:boolean;message:string}|null>(null);
  const [busy,setBusy]=useState(false);
  const [orderNo,setOrderNo]=useState('');
  const subtotal=items.reduce((n,i)=>n+i.pricePKR*i.quantity,0);
  const shipping=items.length?(appliedCoupon?.freeCOD?0:calculateCodFee(city)):0;
  const discountAmount=appliedCoupon?.discountAmountPKR||0;
  const total=Math.max(0,subtotal-discountAmount)+shipping;

  async function applyCoupon() {
    setCouponBusy(true);setCouponError('');
    try {
      const result=await api.validateDiscount(coupon,subtotal);
      if(!result.valid) throw new Error(result.message);
      setAppliedCoupon({code:result.code||coupon.trim().toUpperCase(),discountType:result.discountType,discountAmountPKR:result.discountAmountPKR,discountAmountUSD:result.discountAmountUSD,freeCOD:result.freeCOD,message:result.message});
      setCouponError('');
    } catch (err) { setAppliedCoupon(null); setCouponError((err as Error).message); }
    finally { setCouponBusy(false); }
  }

  async function placeOrder(e:React.FormEvent) {
    e.preventDefault();setBusy(true);setError('');
    const now=new Date().toISOString();
    const order:AdminOrder={id:`ord-${Date.now()}`,orderNumber:`AHK-COD-${Date.now().toString().slice(-6)}`,createdAt:now,updatedAt:now,customerName:name.trim(),customerEmail:email.trim(),customerPhone:phone.trim(),customerWhatsApp:phone.trim(),shippingAddress:{street:street.trim(),city:city.trim(),provinceState:city.toLowerCase().includes('karachi')?'Sindh':'Pakistan',country:'Pakistan',postalCode:postal.trim()},items:items.map(i=>({id:i.id,productId:i.productId,title:i.title,sku:'AHK-BRD',occasion:i.occasion,fabric:i.fabric,image:i.image,pricePKR:i.pricePKR,priceUSD:i.priceUSD,size:i.size,color:i.color,quantity:i.quantity})),subtotalPKR:subtotal,taxPKR:0,shippingFeePKR:shipping,discountCode:appliedCoupon?.code||'',discountAmountPKR:discountAmount,discountAmountUSD:appliedCoupon?.discountAmountUSD||0,freeCODApplied:Boolean(appliedCoupon?.freeCOD),totalPKR:total,totalUSD:Math.round(total/278),status:'Pending',paymentStatus:'Cash on Delivery (Pending)',paymentMethod:'Cash on Delivery (COD)',deliveryTracking:{courier:'TCS Express',trackingNumber:'',trackingUrl:'https://www.tcsexpress.com/tracking',estimatedDelivery:'3 to 5 business days',currentMilestoneIndex:0,milestones:[]},notes:'Cash on Delivery order',channel:'Online Storefront'};
    try { const created=await api.createOrder(order);setOrderNo(created.orderNumber);clear(); }
    catch(err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }

  if(orderNo)return <main className={`${pageClass} text-center`}><PageHead title="Order received" description="Your Cash on Delivery order has been sent to the atelier."/><p className="text-[#78655E]">Order number: <b>{orderNo}</b></p><Link to="/" className="mt-6 inline-block rounded bg-[#4A0E17] px-6 py-3 text-white">Return home</Link></main>;
  if(!items.length)return <main className={pageClass}><PageHead title="Checkout" description="Complete your order."/><p>Your cart is empty. <Link className="text-[#7A0C1E]" to="/luxury">Browse collections</Link></p></main>;

  return <main className={pageClass}>
    <PageHead title="Checkout" description="Securely submit your order to the AHK atelier."/>
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={placeOrder} className="space-y-4 rounded-xl border border-[#E8DCCB] bg-white p-5 sm:p-7">
        <h2 className="font-serif text-2xl">Delivery details</h2>
        {[['Full name',name,setName,'text'],['Email address',email,setEmail,'email'],['Phone number',phone,setPhone,'tel'],['Street address',street,setStreet,'text'],['City',city,setCity,'text'],['Postal code',postal,setPostal,'text']].map(([label,value,setter,type]:any)=><label key={label} className="block text-sm">{label}<input required={label!=='Postal code'} type={type} value={value} onChange={e=>setter(e.target.value)} className="mt-1 block w-full rounded border border-[#E8DCCB] p-3"/></label>)}
        <label className="block text-sm">Payment method<input readOnly value="Cash on Delivery (COD)" className="mt-1 block w-full rounded border border-[#E8DCCB] bg-stone-50 p-3"/></label>
        {error&&<p role="alert" className="text-sm text-red-700">Order failed: {error}</p>}
        <button disabled={busy} className="w-full rounded bg-[#4A0E17] p-3 text-white disabled:opacity-50">{busy?'Submitting order…':'Place COD order'}</button>
      </form>
      <aside className="h-fit rounded-xl border border-[#E8DCCB] bg-white p-5">
        <h2 className="font-serif text-xl">Order summary</h2>
        {items.map(i=><p key={i.id} className="mt-3 flex justify-between gap-3 text-sm"><span>{i.title} × {i.quantity}</span><b>{money(i.pricePKR*i.quantity)}</b></p>)}
        <div className="mt-5 border-t border-[#E8DCCB] pt-4">
          <label htmlFor="checkout-coupon" className="text-sm font-medium">Coupon code</label>
          <div className="mt-2 flex gap-2"><input id="checkout-coupon" value={coupon} onChange={e=>{setCoupon(e.target.value.toUpperCase());if(appliedCoupon)setAppliedCoupon(null);}} placeholder="Enter code" className="min-w-0 flex-1 rounded border border-[#E8DCCB] px-3 py-2 text-sm"/><button type="button" onClick={applyCoupon} disabled={couponBusy||!coupon.trim()} className="rounded bg-[#4A0E17] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{couponBusy?'Checking…':'Apply'}</button></div>
          {appliedCoupon&&<div className="mt-2 flex items-center justify-between gap-2 text-xs text-emerald-700"><span>{appliedCoupon.message}</span><button type="button" onClick={()=>{setAppliedCoupon(null);setCoupon('');}} className="underline">Remove</button></div>}
          {couponError&&<p role="alert" className="mt-2 text-xs text-red-700">{couponError}</p>}
        </div>
        {discountAmount>0&&<p className="mt-4 flex justify-between text-sm text-emerald-700"><span>Coupon savings</span><b>−{money(discountAmount)}</b></p>}
        {appliedCoupon?.freeCOD&&<p className="mt-3 flex justify-between text-sm text-emerald-700"><span>Free COD coupon</span><b>Applied</b></p>}
        <p className="mt-4 flex justify-between border-t border-[#E8DCCB] pt-4 text-sm"><span>Shipping / COD</span><b>{shipping?money(shipping):'Free'}</b></p>
        <p className="mt-3 flex justify-between"><b>Total</b><b>{money(total)}</b></p>
      </aside>
    </div>
  </main>;
}

function WishlistPage({ids,toggle}:{ids:string[];toggle:(id:string)=>void}) {const [products,setProducts]=useState<AdminProduct[]>([]);const [error,setError]=useState('');useEffect(()=>{api.getProducts().then(setProducts).catch(e=>setError(e.message));},[]);const saved=products.filter(p=>ids.includes(p.id));return <main className={pageClass}><PageHead title="Wishlist" description="Your saved couture pieces."/>{error?<p role="alert">{error}</p>:!saved.length?<p>Your wishlist is empty. Save pieces as you browse.</p>:<><div className="mb-4 flex justify-end"><button onClick={()=>saved.forEach(p=>toggle(p.id))} className="flex items-center gap-2 text-sm text-[#7A0C1E]"><Heart size={16}/> Clear wishlist</button></div><ProductGrid products={saved} wishlistIds={ids} onToggleWishlist={toggle}/></>}</main>}

function Home({products,setLocation}:{products:AdminProduct[];setLocation:()=>void}) {const navigate=useNavigate();return <><Hero onOpenAtelier={()=>navigate('/luxury')} onExploreCollection={()=>navigate('/luxury')}/><ShopByStyle/><main><section className="py-8"><BridalPictureCarousel products={products} onSelectProduct={p=>navigate(`/product/${getProductSlug(p)}`)} onAddToCart={p=>navigate(`/product/${getProductSlug(p)}`)} onExploreCollection={()=>navigate('/luxury')}/></section><section className={pageClass}><PageHead title="New from the atelier" description="Discover current pieces from our live collection."/><ProductGrid products={products.filter(p=>p.isNewArrival).slice(0,8)}/></section><AboutUs/><ContactUs onOpenMap={setLocation}/></main></>}

function RoutedApp() {
 const navigate=useNavigate();const route=useLocation();const [products,setProducts]=useState<AdminProduct[]>([]);const [items,setItems]=useState<TrousseauItem[]>(()=>{try{return JSON.parse(localStorage.getItem('ahk_bridal_trousseau')||'[]')}catch{return []}});const [wishlist,setWishlist]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('ahk_bridal_wishlist')||'[]')}catch{return []}});const [mapOpen,setMapOpen]=useState(false);const [admin,setAdmin]=useState(location.pathname.startsWith('/admin'));const [authed,setAuthed]=useState(()=>sessionStorage.getItem('ahk_admin_auth')==='true');
 const [initialContentLoading,setInitialContentLoading]=useState(true);const initialContentLoaded=useRef(false);
 useEffect(()=>{const timer=window.setTimeout(()=>{const target=route.hash?document.getElementById(route.hash.slice(1)):null;if(target)target.scrollIntoView({block:'start',behavior:'auto'});else window.scrollTo({top:0,left:0,behavior:'auto'});},0);return()=>window.clearTimeout(timer);},[route.pathname,route.hash]);
 useEffect(()=>{if(route.pathname.startsWith('/admin')){if(!initialContentLoaded.current){initialContentLoaded.current=true;setInitialContentLoading(false);}return;}let active=true;api.getProducts().then(p=>{if(active)setProducts(p);}).catch(e=>console.error('[API] products',e)).finally(()=>{if(!initialContentLoaded.current){initialContentLoaded.current=true;setInitialContentLoading(false);}});return()=>{active=false;};},[route.pathname]);useEffect(()=>{localStorage.setItem('ahk_bridal_trousseau',JSON.stringify(items));},[items]);useEffect(()=>{localStorage.setItem('ahk_bridal_wishlist',JSON.stringify(wishlist));},[wishlist]);
 const add=(p:AdminProduct,size:string,color:string,quantity=1)=>{const price=p.isDiscounted?(p.discountPricePKR||p.pricePKR):p.pricePKR;const id=`${p.id}-${size}-${color||'default'}`;setItems(xs=>{const found=xs.find(x=>x.id===id);return found?xs.map(x=>x.id===id?{...x,quantity:x.quantity+quantity}:x):[{id,productId:p.id,title:p.name,type:'catalog',occasion:p.occasion,fabric:p.fabric||'',image:p.image,pricePKR:price,priceUSD:p.discountPriceUSD||p.priceUSD,size,color:color||undefined,quantity},...xs]});};
 if(location.pathname.startsWith('/admin'))return <Suspense fallback={<main className={pageClass}>Loading admin panel…</main>}>{!authed?<AdminLogin onLoginSuccess={()=>{sessionStorage.setItem('ahk_admin_auth','true');setAuthed(true)}} onBackToStore={()=>navigate('/')}/>:<AdminDashboard onBackToStore={()=>navigate('/')} onLogout={()=>{sessionStorage.removeItem('ahk_admin_auth');setAuthed(false);navigate('/')}}/>}</Suspense>;
 return <div className="min-h-screen flex flex-col bg-[#FAF8F5] font-sans text-[#1E191B]"><Navbar onOpenAtelier={()=>navigate('/luxury')} onOpenTrousseau={()=>navigate('/cart')} onOpenMap={()=>setMapOpen(true)} trousseauCount={items.reduce((n,i)=>n+i.quantity,0)} activeSection="" onNavigate={section=>navigate(section==='hero'?'/':`/#${section}`)} products={products} onSelectProduct={p=>navigate(`/product/${getProductSlug(p)}`)} searchQuery="" onSearchChange={()=>{}}/><div className="min-h-[60vh] flex-1">{initialContentLoading?<ApiLoadingBar className="min-h-[60vh]"/>:<Suspense fallback={<ApiLoadingBar className="min-h-[60vh]"/>}><AnimatePresence mode="wait" initial={false}><motion.div key={route.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.22, ease: "easeOut" }}><Routes location={route}><Route path="/" element={<Home products={products} setLocation={()=>setMapOpen(true)}/>}/>{collections.map(c=><Route key={c.slug} path={`/${c.slug}`} element={<CollectionPage slug={c.slug}/>}/>)}<Route path="/category/:slug" element={<StyleRoute/>}/><Route path="/product/:slug" element={<ProductPage add={add} products={products} wishlistIds={wishlist} toggleWishlist={id=>setWishlist(xs=>xs.includes(id)?xs.filter(x=>x!==id):[...xs,id])}/>}/><Route path="/cart" element={<CartPage items={items} setItems={setItems}/>}/><Route path="/checkout" element={<CheckoutPage items={items} clear={()=>setItems([])}/>}/><Route path="/search" element={<SearchPage/>}/><Route path="/wishlist" element={<WishlistPage ids={wishlist} toggle={id=>setWishlist(xs=>xs.includes(id)?xs.filter(x=>x!==id):[...xs,id])}/>}/><Route path="*" element={<main className={pageClass}><PageHead title="Page not found" description="The page you requested could not be found."/><Link to="/">Return home</Link></main>}/></Routes></motion.div></AnimatePresence></Suspense>}</div><Footer onNavigate={section=>navigate(['luxury','best-selling','formals','new-arrivals','sale'].includes(section)?`/${section}`:section==='hero'?'/':`/#${section}`)} onOpenContact={()=>navigate('/#contact')} onOpenMap={()=>setMapOpen(true)}/>{mapOpen&&<Suspense fallback={null}><StoreLocationModal isOpen onClose={()=>setMapOpen(false)}/></Suspense>}</div>;
}
function StyleRoute(){const {slug=''}=useParams();return <CollectionPage slug={slug} style/>}
export default function App(){return <BrowserRouter><RoutedApp/></BrowserRouter>}
