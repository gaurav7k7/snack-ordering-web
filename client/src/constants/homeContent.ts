import type { CategoryTile, GalleryImage, HomeProduct, Review, Slide } from '@/types/home';

export const heroSlides: Slide[] = [
  {
    id: 'midnight-caramel',
    eyebrow: 'Limited batch',
    title: 'Midnight caramel popcorn for movie nights.',
    description: 'Air-popped kernels glazed with deep caramel, sea salt, and a velvet cocoa finish.',
    image:
      'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=1600&q=85',
    ctaLabel: 'Shop popcorn',
    href: '/products?category=popcorn',
  },
  {
    id: 'festival-combo',
    eyebrow: 'Combo offers',
    title: 'Snack boxes that make gifting dangerously easy.',
    description: 'Curated sweet, spicy, and crunchy bundles packed for birthdays, teams, and festivals.',
    image:
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1600&q=85',
    ctaLabel: 'Explore combos',
    href: '/products?collection=combos',
  },
  {
    id: 'protein-trail',
    eyebrow: 'New arrival',
    title: 'Trail mixes built for the desk, gym, and road.',
    description: 'Roasted nuts, seeds, berries, and chocolate notes in resealable everyday packs.',
    image:
      'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=1600&q=85',
    ctaLabel: 'Try new mixes',
    href: '/products?tag=new-arrivals',
  },
];

export const categories: CategoryTile[] = [
  {
    id: 'popcorn',
    name: 'Gourmet Popcorn',
    itemCount: 18,
    image:
      'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'chips',
    name: 'Crisps & Chips',
    itemCount: 24,
    image:
      'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'nuts',
    name: 'Nuts & Trail Mix',
    itemCount: 16,
    image:
      'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'sweets',
    name: 'Sweet Treats',
    itemCount: 21,
    image:
      'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=700&q=80',
  },
];

export const products: HomeProduct[] = [
  {
    id: 'truffle-popcorn',
    name: 'Black Truffle Popcorn',
    category: 'Gourmet Popcorn',
    price: 249,
    compareAtPrice: 299,
    rating: 4.9,
    reviews: 186,
    badge: 'Best seller',
    image:
      'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'peri-peri-crisps',
    name: 'Peri Peri Crunch Crisps',
    category: 'Crisps & Chips',
    price: 149,
    compareAtPrice: 179,
    rating: 4.7,
    reviews: 142,
    badge: 'Trending',
    image:
      'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'berry-trail-mix',
    name: 'Berry Protein Trail Mix',
    category: 'Nuts & Trail Mix',
    price: 329,
    rating: 4.8,
    reviews: 98,
    badge: 'New',
    image:
      'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'sea-salt-caramel',
    name: 'Sea Salt Caramel Bites',
    category: 'Sweet Treats',
    price: 199,
    compareAtPrice: 249,
    rating: 4.9,
    reviews: 211,
    badge: "Today's deal",
    image:
      'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'nacho-combo',
    name: 'Loaded Nacho Party Combo',
    category: 'Combo Offers',
    price: 549,
    compareAtPrice: 699,
    rating: 4.6,
    reviews: 74,
    badge: 'Combo',
    image:
      'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'festive-snack-box',
    name: 'Festive Snack Box',
    category: 'Seasonal Offers',
    price: 899,
    compareAtPrice: 1099,
    rating: 4.9,
    reviews: 56,
    badge: 'Seasonal',
    image:
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=85',
  },
];

export const reviews: Review[] = [
  {
    id: 'rhea',
    name: 'Rhea Kapoor',
    role: 'Verified buyer',
    rating: 5,
    quote:
      'The caramel popcorn tastes premium, arrives fresh, and the packaging feels gift-ready.',
  },
  {
    id: 'arjun',
    name: 'Arjun Mehta',
    role: 'Corporate gifting',
    rating: 5,
    quote:
      'We ordered combo boxes for our team. Smooth checkout, quick delivery, excellent variety.',
  },
  {
    id: 'naina',
    name: 'Naina Shah',
    role: 'Snack subscriber',
    rating: 5,
    quote:
      'The best part is discovering new flavors without losing the familiar comfort snacks.',
  },
];

export const brands = ['SnackCo Reserve', 'Kernel Craft', 'Crunch Lab', 'NutriTrail', 'Sweet Barrel'];

export const galleryImages: GalleryImage[] = [
  {
    id: 'gallery-popcorn',
    alt: 'Caramel popcorn served in a ceramic bowl',
    src: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'gallery-chips',
    alt: 'Crispy chips with seasoning',
    src: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'gallery-mix',
    alt: 'Trail mix with nuts and berries',
    src: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'gallery-gift',
    alt: 'Packed snack gift box',
    src: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=500&q=80',
  },
];
