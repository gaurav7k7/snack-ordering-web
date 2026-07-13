import type { GalleryImage, Review, Slide } from '@/types/home';

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
