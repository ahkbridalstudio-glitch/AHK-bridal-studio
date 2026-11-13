import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ShopCategory } from '../../services/api';

const images = [
  '/src/assets/images/bridal_mehndi_angrakha_1792071423399.jpg',
  '/src/assets/images/bridal_nikah_ivory_1792071423461.jpg',
  '/src/assets/images/bridal_walima_gown_1792071422666.jpg',
  '/src/assets/images/bridal_mehndi_angrakha_1792071423399.jpg',
  '/src/assets/images/bridal_emerald_velvet_lehenga_1792253141443.jpg',
  '/src/assets/images/hero_pakistani_bridal_lehenga_1792071419809.jpg',
];
const defaults = ['kurta-set','pishwas','maxi','garara','lehenga','sharara'];
export function ShopByStyle() {
  const [categories,setCategories]=useState<ShopCategory[]>(defaults.map(slug=>({slug,name:slug==='kurta-set'?'Kurta Set':slug[0].toUpperCase()+slug.slice(1),description:''})));
  useEffect(()=>{api.getCategories().then(c=>{if(c.styles?.length)setCategories(c.styles)}).catch(()=>{});},[]);
  return <section className="border-y border-[#E8DCCB] bg-[#F6F0E8] py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="text-center text-[10px] uppercase tracking-[.3em] text-[#997A3D]">Explore silhouettes</p><h2 className="mt-2 text-center font-serif text-3xl text-[#360810] sm:text-4xl">Shop By Style</h2><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">{categories.map((category,index)=><Link key={category.slug} to={`/category/${category.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-[#E8DDD1] shadow-sm"><img src={images[index%images.length]} alt={category.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy"/><div className="absolute inset-0 bg-gradient-to-t from-[#20050A]/80 via-transparent to-transparent"/><h3 className="absolute inset-x-2 bottom-4 text-center font-serif text-lg text-white sm:text-xl">{category.name}</h3></Link>)}</div></div></section>;
}
