import type { GalleryImage, Review } from '@/types/home';

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
