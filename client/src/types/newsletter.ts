export type Subscriber = {
  _id: string;
  email: string;
  isActive: boolean;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SubscriberStatusFilter = 'active' | 'unsubscribed';
export type SubscriberDateRange = '7d' | '30d' | '6m' | 'all';
export type SubscriberSortBy = 'createdAt' | 'email';
export type SubscriberSortDir = 'asc' | 'desc';
export type SubscriberExportFormat = 'csv' | 'xlsx' | 'json';
