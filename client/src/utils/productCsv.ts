import { generateCsv, parseCsv } from '@/utils/csv';
import type { ApiProduct, ProductFormInput } from '@/types/product';

export const PRODUCT_CSV_COLUMNS = [
  'name',
  'sku',
  'brand',
  'category',
  'subCategory',
  'description',
  'ingredients',
  'weight',
  'servingSize',
  'calories',
  'protein',
  'carbs',
  'fat',
  'sugar',
  'sodium',
  'mrp',
  'discount',
  'offerPrice',
  'imageUrl',
  'tags',
  'stock',
  'availableQuantity',
  'isActive',
  'isFeatured',
  'isTrending',
  'isBestSeller',
  'deliveryEstimate',
  'returnPolicy',
  'shippingInformation',
] as const;

function categoryName(category: ApiProduct['category']): string {
  if (!category) return '';
  return typeof category === 'string' ? category : category.name;
}

export function productToCsvRow(product: ApiProduct): Record<string, unknown> {
  return {
    name: product.name,
    sku: product.sku,
    brand: product.brand,
    category: categoryName(product.category),
    subCategory: product.subCategory,
    description: product.description,
    ingredients: product.ingredients?.join('; ') ?? '',
    weight: product.weight,
    servingSize: product.nutritionFacts?.servingSize ?? '',
    calories: product.nutritionFacts?.calories ?? '',
    protein: product.nutritionFacts?.protein ?? '',
    carbs: product.nutritionFacts?.carbs ?? '',
    fat: product.nutritionFacts?.fat ?? '',
    sugar: product.nutritionFacts?.sugar ?? '',
    sodium: product.nutritionFacts?.sodium ?? '',
    mrp: product.mrp,
    discount: product.discount,
    offerPrice: product.offerPrice,
    imageUrl: product.images?.[0]?.url ?? '',
    tags: product.tags?.join('; ') ?? '',
    stock: product.stock,
    availableQuantity: product.availableQuantity,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isTrending: product.isTrending,
    isBestSeller: product.isBestSeller,
    deliveryEstimate: product.deliveryEstimate,
    returnPolicy: product.returnPolicy,
    shippingInformation: product.shippingInformation,
  };
}

export function exportProductsToCsv(products: ApiProduct[]): string {
  return generateCsv(products.map(productToCsvRow), [...PRODUCT_CSV_COLUMNS]);
}

const TEMPLATE_EXAMPLE_ROW: Record<string, unknown> = {
  name: 'Classic Masala Chips',
  sku: 'SNK-CHIPS-101',
  brand: 'SnackCo',
  category: 'Namkeen & Chips',
  subCategory: 'Chips',
  description: 'Crispy potato chips tossed in a bold masala seasoning, at least 20 characters.',
  ingredients: 'Potato; Sunflower oil; Masala spice mix; Salt',
  weight: '150g',
  servingSize: '30g',
  calories: 150,
  protein: '3g',
  carbs: '18g',
  fat: '7g',
  sugar: '1g',
  sodium: '180mg',
  mrp: 99,
  discount: 20,
  offerPrice: 79,
  imageUrl: 'https://example.com/chips.jpg',
  tags: 'chips; masala; best seller',
  stock: 100,
  availableQuantity: 100,
  isActive: true,
  isFeatured: false,
  isTrending: false,
  isBestSeller: false,
  deliveryEstimate: '2-4 business days',
  returnPolicy: '7-day replacement if unopened.',
  shippingInformation: 'Ships within 24 hours.',
};

export function generateProductCsvTemplate(): string {
  return generateCsv([TEMPLATE_EXAMPLE_ROW], [...PRODUCT_CSV_COLUMNS]);
}

function toBoolean(value: string, fallback: boolean): boolean {
  if (!value) return fallback;
  return ['true', '1', 'yes', 'y'].includes(value.trim().toLowerCase());
}

export function csvRowToProductInput(row: Record<string, string>): Partial<ProductFormInput> {
  return {
    name: row.name,
    sku: row.sku,
    brand: row.brand,
    category: row.category,
    subCategory: row.subCategory,
    description: row.description,
    ingredients: row.ingredients
      ? row.ingredients.split(';').map((value) => value.trim()).filter(Boolean)
      : [],
    weight: row.weight,
    nutritionFacts: {
      servingSize: row.servingSize,
      calories: Number(row.calories) || 0,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      sugar: row.sugar,
      sodium: row.sodium,
    },
    mrp: Number(row.mrp) || 0,
    discount: Number(row.discount) || 0,
    offerPrice: Number(row.offerPrice) || 0,
    images: row.imageUrl
      ? [{ url: row.imageUrl, publicId: `csv-import-${row.sku || Date.now()}`, alt: row.name }]
      : [],
    tags: row.tags ? row.tags.split(';').map((value) => value.trim()).filter(Boolean) : [],
    stock: Number(row.stock) || 0,
    availableQuantity: Number(row.availableQuantity) || 0,
    isActive: toBoolean(row.isActive, true),
    isFeatured: toBoolean(row.isFeatured, false),
    isTrending: toBoolean(row.isTrending, false),
    isBestSeller: toBoolean(row.isBestSeller, false),
    deliveryEstimate: row.deliveryEstimate,
    returnPolicy: row.returnPolicy,
    shippingInformation: row.shippingInformation,
  };
}

export function parseProductsCsv(text: string): Partial<ProductFormInput>[] {
  return parseCsv(text).map(csvRowToProductInput);
}
