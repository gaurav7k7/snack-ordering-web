import type { HomeProduct, ProductImage } from '@/types/home';
import type { ApiProduct, ApiProductCard } from '@/types/product';

function mapImages(images: ApiProductCard['images'] = []): ProductImage[] {
  return images.map((image, index) => ({
    id: image.publicId || String(index),
    url: image.url,
    publicId: image.publicId,
    alt: image.alt ?? '',
  }));
}

function deriveStockStatus(availableQuantity = 0): HomeProduct['stock'] {
  if (availableQuantity <= 0) return 'out_of_stock';
  if (availableQuantity < 10) return 'low_stock';
  return 'in_stock';
}

function getCategoryName(category: ApiProductCard['category']): string {
  if (!category) return '';
  return typeof category === 'string' ? category : category.name;
}

export function mapApiProductCardToHomeProduct(product: ApiProductCard): HomeProduct {
  const images = mapImages(product.images);

  return {
    id: product._id,
    slug: product.slug,
    name: product.name,
    category: getCategoryName(product.category),
    subCategory: product.subCategory ?? '',
    brand: product.brand ?? '',
    sku: '',
    description: '',
    ingredients: [],
    weight: '',
    nutritionFacts: {
      servingSize: '',
      calories: 0,
      protein: '',
      carbs: '',
      fat: '',
      sugar: '',
      sodium: '',
    },
    mrp: product.mrp,
    discount: product.discount,
    offerPrice: product.offerPrice,
    price: product.offerPrice,
    compareAtPrice: product.mrp,
    stock: deriveStockStatus(product.availableQuantity),
    availableQuantity: product.availableQuantity ?? 0,
    tags: [],
    rating: product.averageRating ?? 0,
    reviews: product.reviewCount ?? 0,
    averageRating: product.averageRating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    isFeatured: product.isFeatured,
    isTrending: product.isTrending,
    isBestSeller: product.isBestSeller,
    recommendedProductIds: [],
    relatedProductIds: [],
    deliveryEstimate: '',
    returnPolicy: '',
    shippingInformation: '',
    badge: '',
    image: images[0]?.url ?? '',
    images,
    customerReviews: [],
  };
}

export function mapApiProductToHomeProduct(product: ApiProduct): HomeProduct {
  return {
    ...mapApiProductCardToHomeProduct(product),
    sku: product.sku,
    description: product.description,
    ingredients: product.ingredients ?? [],
    weight: product.weight,
    nutritionFacts: product.nutritionFacts,
    tags: product.tags ?? [],
    deliveryEstimate: product.deliveryEstimate,
    returnPolicy: product.returnPolicy,
    shippingInformation: product.shippingInformation,
  };
}
