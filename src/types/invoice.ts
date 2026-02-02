// Invoice types for the application
export interface BusinessInfo {
  id?: number;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  abn?: string;
  logoUrl?: string;
  bankAccountNumber?: string;
  bankBSB?: string;
}

export interface ClientInfo {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ServiceItem {
  id: string;
  service: string;
  description?: string;
  dates: string[]; // ✅ array of ISO strings
  quantity: number;
  rate: number;
  total: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  status: InvoiceStatus;
  businessInfo: BusinessInfo;
  clientInfo: ClientInfo;
  items: ServiceItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  gstEnabled: boolean;
  gstRate: number;
  gstAmount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Default landscaping services
export const DEFAULT_SERVICES = [
  { service: 'Lawn Maintanance', description: 'Lawn Maintainance of all areas cleaning all common areas and spraying of weeds', rate: 180 },
  { service: 'Hedge Trimming', description: 'Hedge and shrub trimming', rate: 85 },
  { service: 'Garden Clean Up', description: 'General garden cleanup and waste removal', rate: 120 },
  { service: 'Mulching', description: 'Mulch supply and spreading', rate: 95 },
  { service: 'Tree Pruning', description: 'Tree pruning and shaping', rate: 150 },
  { service: 'Strata Maintenance', description: 'Body corporate grounds maintenance', rate: 200 },
  { service: 'Weeding', description: 'Garden bed weeding', rate: 55 },
  { service: 'Fertilizing', description: 'Lawn and garden fertilization', rate: 75 },
  { service: 'Irrigation Repair', description: 'Irrigation system repairs', rate: 90 },
  { service: 'Pressure Washing', description: 'Driveway and path pressure cleaning', rate: 110 },
];

export const PAYMENT_TERMS = [
  { value: 'due-on-receipt', label: 'Due on Receipt' },
  { value: 'net-7', label: 'Net 7 Days' },
  { value: 'net-14', label: 'Net 14 Days' },
  { value: 'net-30', label: 'Net 30 Days' },
  { value: 'net-60', label: 'Net 60 Days' },
];

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  id: 1,
  businessName: 'Mazzari Landscape Management',
  email: 'info@mazzarilandscape.com.au',
  phone: '0400 000 000',
  address: 'Sydney, NSW, Australia',
  abn: '',
  bankAccountNumber: '',
  bankBSB: '',
};
