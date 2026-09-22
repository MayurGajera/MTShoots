export interface PhotographyCategory {
  id: string;
  name: string;
  shortName: string;
  description: string;
  image: string;
  popularCount: string;
}

export const PHOTOGRAPHY_CATEGORIES: PhotographyCategory[] = [
  {
    id: 'all',
    name: 'All Categories',
    shortName: 'All Shoots',
    description: 'Browse all verified photographers across all genres and styles',
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80',
    popularCount: 'All Genres'
  },
  {
    id: 'wedding',
    name: 'Wedding & Pre-Wedding',
    shortName: 'Wedding',
    description: 'Grand royal Indian weddings, candid pre-wedding, and sangeet celebrations',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
    popularCount: '120+ Shoots'
  },
  {
    id: 'fashion',
    name: 'Fashion & Editorial',
    shortName: 'Fashion',
    description: 'Haute couture, magazine covers, designer lookbooks, and runway style',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
    popularCount: '250+ Shoots'
  },
  {
    id: 'portrait',
    name: 'Portraits & Headshots',
    shortName: 'Portraits',
    description: 'Executive LinkedIn headshots, celebrity portraits, and artistic character studies',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    popularCount: '180+ Shoots'
  },
  {
    id: 'commercial',
    name: 'Commercial & Advertising',
    shortName: 'Commercial',
    description: 'High-impact billboard campaigns, brand storytelling, and corporate advertising',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    popularCount: '140+ Shoots'
  },
  {
    id: 'architecture',
    name: 'Architecture & Real Estate',
    shortName: 'Architecture',
    description: 'Heritage monuments, luxury interior design, villas, and modern brutalist facades',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    popularCount: '95+ Shoots'
  },
  {
    id: 'product',
    name: 'Product & E-Commerce',
    shortName: 'Product',
    description: 'Clean Amazon/Shopify catalog packshots, cosmetics, and fine jewelry macros',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    popularCount: '310+ Shoots'
  },
  {
    id: 'food',
    name: 'Food & Culinary',
    shortName: 'Food',
    description: 'Gourmet restaurant menus, cloud kitchens, culinary books, and artisan cocktails',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    popularCount: '85+ Shoots'
  },
  {
    id: 'events',
    name: 'Events & Concerts',
    shortName: 'Events',
    description: 'Live concerts, corporate summits, fashion galas, and cultural festivals',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    popularCount: '110+ Shoots'
  },
  {
    id: 'travel',
    name: 'Travel & Documentary',
    shortName: 'Travel',
    description: 'Cultural ethnography, tourism campaigns, wildlife, and expedition stories',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
    popularCount: '90+ Shoots'
  },
  {
    id: 'maternity',
    name: 'Maternity & Newborn',
    shortName: 'Maternity',
    description: 'Gentle maternity journeys, newborn milestones, and family legacy portraits',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
    popularCount: '75+ Shoots'
  }
];
