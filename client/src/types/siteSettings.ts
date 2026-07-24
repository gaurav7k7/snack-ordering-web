export type CompanyInfo = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  cin: string;
  gstin: string;
  isoCertificationText: string;
  dataProtectionText: string;
};

export type SiteSettings = {
  _id: string;
  announcementText: string;
  b2bClientsHeading: string;
  mediaCoverageHeading: string;
  galleryHeading: string;
  company: CompanyInfo;
  createdAt: string;
  updatedAt: string;
};
