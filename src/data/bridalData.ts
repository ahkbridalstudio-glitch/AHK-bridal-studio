import { BridalProduct } from '../types/bridal';

// Real bridal products come from the MongoDB database
export const BRIDAL_COLLECTIONS: BridalProduct[] = [];

export interface CraftsmanshipTechnique {
  id: string;
  name: string;
  origin: string;
  metal: string;
  description: string;
  significance: string;
}

export const CRAFTSMANSHIP_TECHNIQUES: CraftsmanshipTechnique[] = [
  {
    id: 'zardozi',
    name: 'Shahi Zardozi & Dabka',
    origin: 'Mughal Imperial Workshops, Lahore & Delhi',
    metal: '24K Gold-Plated Metallic Wire & French Coil',
    description: 'Three-dimensional heavy metallic relief work where spring-like metallic wire (dabka) is cut into millimetric pieces, threaded like beads, and anchored onto rich velvet or pure silk bases to create sculptured floral vines and mehraabs.',
    significance: 'Traditional royal attire reserved for the Barat day, signifying supreme grandeur and familial heirloom status.'
  },
  {
    id: 'naqshi',
    name: 'Intricate Naqshi & Kora',
    origin: 'Old Lucknow & Kashmiri Ateliers',
    metal: 'Pure Silver & Antique Gilt',
    description: 'Crimp-patterned tubular threads twisted into lustrous leaf veins, petals, and delicate geometric jaals that catch candlelight with a shimmering metallic gleam.',
    significance: 'Provides textural depth and high reflection without excessive weight, giving the bride ethereal luminescence.'
  },
  {
    id: 'tilla',
    name: 'Heirloom Tilla & Marori',
    origin: 'Punjab & Kashmir Heritage Weaves',
    metal: 'Flattened Metallic Badla / Lappa',
    description: 'A single unbroken strand of pure metallic ribbon couched down with invisible silk stitches in mesmerizing concentric arabesque whorls and calligraphy border trims.',
    significance: 'Renowned for lasting over 70 years without tarnishing, making the ensemble pass gracefully across generations.'
  },
  {
    id: 'gota',
    name: 'Gota Kinari & Khulfi',
    origin: 'Rajasthan & Bahawalpur Riyasat',
    metal: 'Crushed Gold Foil Ribbon',
    description: 'Folded metallic ribbons shaped into samosa edgings, flower buds, and diamond chevrons sewn onto translucent silk organza and shimmering tissue fabrics.',
    significance: 'Vibrant, festive sparkle ideal for Mehndi, Mayun, and Sangeet celebrations that dances with every movement.'
  },
  {
    id: 'resham',
    name: 'Fine Resham Shading',
    origin: 'Multan & Persian Silk Route',
    metal: 'Untwisted Natural Silk Floss',
    description: 'Micro-needle silk embroidery blended across dozens of chromatic gradations, creating realistic shaded roses, nightingales, and miniature floral arabesques.',
    significance: 'Balances the heaviness of gold metalwork with soft romantic colors that flatter the bride’s natural radiance.'
  },
  {
    id: 'mukaish',
    name: 'Mukaish & Kaamdani',
    origin: 'Historic Walled Cities of Pakistan',
    metal: 'Flattened Silver Badla Dots',
    description: 'Minute metallic slivers pierced directly through delicate chiffon or tissue dupattas and flattened with fingernails into glistening starlight stars (chhatt).',
    significance: 'Creates the legendary starry-night veil effect when draped over the bride’s head during the Nikah ceremony.'
  }
];

export const PALETTE_PRESETS = [
  {
    name: 'Shahbano Imperial Barat',
    baseColor: '#7A0C1E',
    blouseColor: '#5C0816',
    dupattaColor: '#8C1226',
    metalTone: 'Antique Heirloom Gold'
  },
  {
    name: 'Noor Mahal Walima',
    baseColor: '#D8C7B5',
    blouseColor: '#C4B19D',
    dupattaColor: '#EBE3DA',
    metalTone: 'Champagne Zardozi'
  },
  {
    name: 'Jashn-e-Bahaar Mehndi',
    baseColor: '#0E4D34',
    blouseColor: '#B8860B',
    dupattaColor: '#D97706',
    metalTone: 'Antique Heirloom Gold'
  },
  {
    name: 'Meena Bazaar Nikah',
    baseColor: '#FAF8F5',
    blouseColor: '#F3EFEA',
    dupattaColor: '#F7F3EE',
    metalTone: 'Platinum Silver Tilla'
  }
];
