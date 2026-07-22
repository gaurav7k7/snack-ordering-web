export type Banner = {
  _id: string;
  heading?: string;
  subheading?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: { url: string; publicId?: string; alt?: string };
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
