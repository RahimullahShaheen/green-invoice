import { supabase } from './supabaseClient';
import { Invoice } from '@/types/invoice';

// Fetch a single invoice by id
export async function getInvoiceFromSupabase(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as Invoice;
}

// Fetch all invoices
export async function getInvoicesFromSupabase(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*');
  if (error || !data) return [];
  return data as Invoice[];
}

// Upsert (insert or update) an invoice
export async function upsertInvoiceToSupabase(invoice: Invoice): Promise<boolean> {
  // Map all camelCase keys to lowercase for Supabase
  const invoiceToSave: any = {};
  for (const key in invoice) {
    if (Object.prototype.hasOwnProperty.call(invoice, key)) {
      invoiceToSave[key.toLowerCase()] = (invoice as any)[key];
    }
  }
  // Also ensure nested businessInfo, clientInfo, items are mapped to lowercase keys
  if (invoice.businessInfo) invoiceToSave['businessinfo'] = invoice.businessInfo;
  if (invoice.clientInfo) invoiceToSave['clientinfo'] = invoice.clientInfo;
  if (invoice.items) invoiceToSave['items'] = invoice.items;

  const { error } = await supabase
    .from('invoices')
    .upsert([invoiceToSave], { onConflict: 'id' });
  if (error) {
    console.error('Supabase upsert error:', error);
  }
  return !error;
}

// Delete an invoice by id
export async function deleteInvoiceFromSupabase(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  return !error;
}
