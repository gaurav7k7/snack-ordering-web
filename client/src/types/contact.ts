export type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: string;
  updatedAt: string;
};

export type ContactMessageStatusFilter = 'new' | 'read' | 'resolved';
export type ContactMessageDateRange = '7d' | '30d' | '6m' | 'all';
