import { env } from '@/config/env';
import { SOCIAL_LINKS } from '@/constants/socialLinks';
import type { HomeProduct } from '@/types/home';

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lotus Delight',
    description:
      'Lotus Delight is a premium Indian makhana (fox nuts) brand offering multiple flavours and healthy snack options.',
    url: env.siteUrl,
    logo: `${env.siteUrl}/icon.svg`,
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lotus Delight',
    url: env.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${env.siteUrl}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbSchema(items: Array<{ label: string; href?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${env.siteUrl}${item.href}` } : {}),
    })),
  };
}

export function buildProductSchema(product: HomeProduct) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image ? [product.image] : undefined,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    aggregateRating:
      product.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      '@type': 'Offer',
      url: `${env.siteUrl}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.offerPrice,
      availability:
        product.stock === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  };
}
