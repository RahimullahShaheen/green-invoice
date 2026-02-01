import { Invoice, BusinessInfo } from '@/types/invoice';

const INVOICES_KEY = 'mazzari_invoices';
const BUSINESS_INFO_KEY = 'mazzari_business_info';

// Generate unique invoice number
export function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Get all invoices
export function getInvoices(): Invoice[] {
  try {
    const data = localStorage.getItem(INVOICES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save invoice
export function saveInvoice(invoice: Invoice): Invoice {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
  
  const updatedInvoice = {
    ...invoice,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    invoices[existingIndex] = updatedInvoice;
  } else {
    invoices.unshift(updatedInvoice);
  }

  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  return updatedInvoice;
}

// Get single invoice
export function getInvoice(id: string): Invoice | null {
  const invoices = getInvoices();
  return invoices.find(inv => inv.id === id) || null;
}

// Delete invoice
export function deleteInvoice(id: string): boolean {
  const invoices = getInvoices();
  const filtered = invoices.filter(inv => inv.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(filtered));
  return filtered.length < invoices.length;
}

// Update invoice status
export function updateInvoiceStatus(id: string, status: Invoice['status']): Invoice | null {
  const invoice = getInvoice(id);
  if (!invoice) return null;
  
  invoice.status = status;
  return saveInvoice(invoice);
}

// Search invoices
export function searchInvoices(query: string): Invoice[] {
  const invoices = getInvoices();
  const lowercaseQuery = query.toLowerCase();
  
  return invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(lowercaseQuery) ||
    invoice.clientInfo.name.toLowerCase().includes(lowercaseQuery) ||
    invoice.clientInfo.email.toLowerCase().includes(lowercaseQuery)
  );
}

// Get business info
export function getBusinessInfo(): BusinessInfo | null {
  try {
    const data = localStorage.getItem(BUSINESS_INFO_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Save business info
export function saveBusinessInfo(info: BusinessInfo): void {
  localStorage.setItem(BUSINESS_INFO_KEY, JSON.stringify(info));
}

// Calculate invoice totals
export function calculateInvoiceTotals(
  items: { quantity: number; rate: number }[],
  discount: number,
  discountType: 'percentage' | 'fixed',
  gstEnabled: boolean,
  gstRate: number = 10
): { subtotal: number; discountAmount: number; gstAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount) / 100 
    : discount;
  
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = gstEnabled ? (afterDiscount * gstRate) / 100 : 0;
  const total = afterDiscount + gstAmount;

  return {
    subtotal,
    discountAmount,
    gstAmount,
    total,
  };
}

// Format currency (AUD)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

// Format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Get due date from payment terms
export function getDueDateFromTerms(issueDate: string, terms: string): string {
  const date = new Date(issueDate);
  
  switch (terms) {
    case 'due-on-receipt':
      return issueDate;
    case 'net-7':
      date.setDate(date.getDate() + 7);
      break;
    case 'net-14':
      date.setDate(date.getDate() + 14);
      break;
    case 'net-30':
      date.setDate(date.getDate() + 30);
      break;
    case 'net-60':
      date.setDate(date.getDate() + 60);
      break;
    default:
      date.setDate(date.getDate() + 14);
  }
  
  return date.toISOString().split('T')[0];
}
