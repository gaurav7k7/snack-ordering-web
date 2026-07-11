import { Router } from 'express';

import { env } from '../config/env.js';
import { CategoryModel } from '../models/Category.model.js';
import { ProductModel } from '../models/Product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const sitemapRoutes = Router();

const STATIC_PATHS = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/products', priority: '0.9', changefreq: 'daily' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/faq', priority: '0.4', changefreq: 'monthly' },
  { path: '/careers', priority: '0.3', changefreq: 'monthly' },
  { path: '/blog', priority: '0.3', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.2', changefreq: 'yearly' },
  { path: '/terms', priority: '0.2', changefreq: 'yearly' },
  { path: '/refund-policy', priority: '0.2', changefreq: 'yearly' },
  { path: '/shipping-policy', priority: '0.2', changefreq: 'yearly' },
];

function xmlEscape(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function urlEntry(loc: string, changefreq: string, priority: string, lastmod?: Date) {
  const lastmodTag = lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
  return `<url><loc>${xmlEscape(loc)}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

sitemapRoutes.get('/sitemap.xml', asyncHandler(async (_req, res) => {
  const [products, categories] = await Promise.all([
    ProductModel.find({ isActive: true }).select('slug updatedAt').lean(),
    CategoryModel.find({ isActive: true }).select('slug updatedAt').lean(),
  ]);

  const entries = [
    ...STATIC_PATHS.map((entry) => urlEntry(`${env.siteUrl}${entry.path}`, entry.changefreq, entry.priority)),
    ...products.map((product) =>
      urlEntry(`${env.siteUrl}/products/${product.slug}`, 'weekly', '0.7', product.updatedAt),
    ),
    ...categories.map((category) =>
      urlEntry(`${env.siteUrl}/products?category=${category.slug}`, 'weekly', '0.6', category.updatedAt),
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(xml);
}));

sitemapRoutes.get('/robots.txt', (_req, res) => {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /checkout',
    'Disallow: /orders',
    'Disallow: /profile',
    '',
    `Sitemap: ${env.siteUrl}/sitemap.xml`,
  ].join('\n');

  res.set('Content-Type', 'text/plain');
  res.send(body);
});
