export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  stock: number;
  isActive: boolean;
};

export type SearchProduct = {
  id?: string;
  _id?: string;
  slug: string;
  name: string;
  category: ApiProductCategory | string;
  subCategory?: string;
  brand?: string;
  sku?: string;
  description?: string;
  price?: number;
  offerPrice?: number;
  compareAtPrice?: number;
  discount?: number;
  image?: string;
  images?: { url: string }[];
  tags?: string[];
  rating?: number;
  averageRating?: number;
  reviews?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  badge?: string;
  availableQuantity?: number;
  stock?: 'in_stock' | 'low_stock' | 'out_of_stock';
};

export type ApiProductImage = { url: string; publicId: string; alt: string };
export type ApiProductCategory = { _id: string; name: string; slug: string };

export type ApiProductCard = {
  _id: string;
  name: string;
  slug: string;
  images: ApiProductImage[];
  offerPrice: number;
  mrp: number;
  discount: number;
  averageRating: number;
  reviewCount: number;
  category?: ApiProductCategory | string;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  availableQuantity: number;
  brand: string;
  subCategory: string;
  stock: number;
  sku?: string;
  createdAt?: string;
};

export type NutritionFacts = {
  servingSize: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
  sodium: string;
};

export type ApiProduct = ApiProductCard & {
  description: string;
  ingredients: string[];
  weight: string;
  nutritionFacts: NutritionFacts;
  sku: string;
  tags: string[];
  deliveryEstimate: string;
  returnPolicy: string;
  shippingInformation: string;
  recommendedProducts: ApiProductCard[];
  relatedProducts: ApiProductCard[];
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; publicId: string; alt?: string };
  isActive: boolean;
  createdAt: string;
};

export type ProductFormInput = {
  name: string;
  slug?: string;
  description: string;
  ingredients: string[];
  weight: string;
  nutritionFacts: NutritionFacts;
  mrp: number;
  discount: number;
  offerPrice: number;
  images: ApiProductImage[];
  category: string;
  subCategory: string;
  stock: number;
  availableQuantity: number;
  sku: string;
  brand: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  deliveryEstimate: string;
  returnPolicy: string;
  shippingInformation: string;
};
