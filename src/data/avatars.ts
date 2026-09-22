/**
 * Modern Cartoon & Illustrated Avatars Collection
 * Curated playful SVG avatars for user accounts and artists.
 */

export interface CartoonAvatar {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const CARTOON_AVATARS: CartoonAvatar[] = [
  {
    id: 'cartoon-felix',
    name: 'Camera Pro',
    category: 'creative',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9'
  },
  {
    id: 'cartoon-aneka',
    name: 'Creative Lens',
    category: 'creative',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=ffd5dc,c0aede,ffdfbf'
  },
  {
    id: 'cartoon-precious',
    name: 'Golden Frame',
    category: 'portrait',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Precious&backgroundColor=ffd5dc,ffdfbf,b6e3f4'
  },
  {
    id: 'cartoon-buster',
    name: 'Artistic Eye',
    category: 'portrait',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster&backgroundColor=d1d4f9,b6e3f4'
  },
  {
    id: 'cartoon-bella',
    name: 'Studio Master',
    category: 'creative',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bella&backgroundColor=ffd5dc,c0aede'
  },
  {
    id: 'cartoon-milo',
    name: 'Candid Artist',
    category: 'portrait',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=b6e3f4,c0aede'
  },
  {
    id: 'cartoon-gizmo',
    name: 'Robo Camera',
    category: 'bot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo&backgroundColor=b6e3f4,c0aede'
  },
  {
    id: 'cartoon-sparky',
    name: 'Cyber Flash',
    category: 'bot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=ffd5dc,ffdfbf'
  },
  {
    id: 'cartoon-sasha',
    name: 'Visual Storyteller',
    category: 'creative',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha&backgroundColor=d1d4f9,ffd5dc'
  },
  {
    id: 'cartoon-oliver',
    name: 'Film Director',
    category: 'portrait',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Oliver&backgroundColor=b6e3f4,ffdfbf'
  },
  {
    id: 'cartoon-zoe',
    name: 'Colorist',
    category: 'character',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=ffdfbf,ffd5dc'
  },
  {
    id: 'cartoon-leo',
    name: 'Aerial Ace',
    category: 'character',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=c0aede,d1d4f9'
  }
];

export const DEFAULT_CARTOON_AVATAR = CARTOON_AVATARS[0].url;

export function getRandomCartoonAvatar(): string {
  const randomIndex = Math.floor(Math.random() * CARTOON_AVATARS.length);
  return CARTOON_AVATARS[randomIndex].url;
}
