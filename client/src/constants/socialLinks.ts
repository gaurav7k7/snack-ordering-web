// Shared between SiteFooter (rendered as icon links) and structuredData
// (Organization.sameAs) so the URLs only live in one place.
export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Twitter / X', href: 'https://twitter.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
] as const;
