export type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  ctaLabel: string;
  href: string;
};

export type CategoryTile = {
  id: string;
  name: string;
  itemCount: number;
  image: string;
};

export type HomeProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviews: number;
  badge: string;
  image: string;
};

export type Review = {
  id: string;
  name: string;
  role: string;
  rating: number;
  quote: string;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
};
