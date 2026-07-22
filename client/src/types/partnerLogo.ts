export type PartnerLogoCategory = 'b2b_client' | 'media_coverage';

export type PartnerLogo = {
  _id: string;
  name: string;
  logo: { url: string; publicId?: string; alt?: string };
  link?: string;
  category: PartnerLogoCategory;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
