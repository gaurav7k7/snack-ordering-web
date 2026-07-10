export type SubCategory = {
  _id: string;
  name: string;
  slug: string;
  category: string | { _id: string; name: string; slug: string };
  description?: string;
  isActive: boolean;
  createdAt: string;
};

export type Brand = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: { url: string; publicId: string };
  isActive: boolean;
  createdAt: string;
};

export type Tag = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
};
