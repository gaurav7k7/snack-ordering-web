export type CategoryTile = {
  id: string;
  name: string;
  itemCount?: number;
  image?: string;
};

export type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryId: string;
  subCategory: string;
  brand: string;
  sku: string;
  description: string;
  ingredients: string[];
  weight: string;
  nutritionFacts: {
    servingSize: string;
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    sugar: string;
    sodium: string;
  };
  mrp: number;
  discount: number;
  offerPrice: number;
  price: number;
  compareAtPrice?: number;
  stock: 'in_stock' | 'low_stock' | 'out_of_stock';
  availableQuantity: number;
  tags: string[];
  rating: number;
  reviews: number;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  recommendedProductIds: string[];
  relatedProductIds: string[];
  deliveryEstimate: string;
  returnPolicy: string;
  shippingInformation: string;
  badge: string;
  image: string;
  images: ProductImage[];
  /** @deprecated superseded by ProductReviewsSection, which fetches live review data by product id */
  customerReviews?: ProductReview[];
};

export type ProductImage = {
  id: string;
  url: string;
  publicId: string;
  alt: string;
};

export type ProductReview = {
  id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
};

export type Review = {
  id: string;
  name: string;
  role: string;
  rating: number;
  quote: string;
};
