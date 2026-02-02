import { useState, useEffect } from 'react';
import { Invoice, BusinessInfo, DEFAULT_BUSINESS_INFO } from '@/types/invoice';
import {
  getInvoices,
  saveInvoice as saveInvoiceToStorage,
  deleteInvoice as deleteInvoiceFromStorage,
  searchInvoices,
  updateInvoiceStatus,
} from '@/lib/invoiceUtils';
import { getBusinessInfoFromSupabase, saveBusinessInfoToSupabase } from '@/lib/supabaseBusiness';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    setLoading(true);
    const data = getInvoices();
    setInvoices(data);
    setLoading(false);
  };

  const saveInvoice = (invoice: Invoice) => {
    const saved = saveInvoiceToStorage(invoice);
    loadInvoices();
    return saved;
  };

  const deleteInvoice = (id: string) => {
    const success = deleteInvoiceFromStorage(id);
    if (success) {
      loadInvoices();
    }
    return success;
  };

  const search = (query: string) => {
    if (!query.trim()) {
      loadInvoices();
      return;
    }
    const results = searchInvoices(query);
    setInvoices(results);
  };

  const updateStatus = (id: string, status: Invoice['status']) => {
    const updated = updateInvoiceStatus(id, status);
    if (updated) {
      loadInvoices();
    }
    return updated;
  };

  return {
    invoices,
    loading,
    saveInvoice,
    deleteInvoice,
    search,
    updateStatus,
    refresh: loadInvoices,
  };
}

export function useBusinessInfo() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(DEFAULT_BUSINESS_INFO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinessInfo() {
      const stored = await getBusinessInfoFromSupabase();
      if (stored) {
        setBusinessInfo({
          businessName: stored.businessName,
          email: stored.email,
          phone: stored.phone,
          address: stored.address,
          abn: stored.abn || '',
          logoUrl: stored.logoUrl || '',
          bankAccountNumber: stored.bankAccountNumber || '',
          bankBSB: stored.bankBSB || '',
        });
      }
      setLoading(false);
    }
    fetchBusinessInfo();
  }, []);

  const saveBusinessInfo = async (info: BusinessInfo) => {
    await saveBusinessInfoToSupabase(info);
    setBusinessInfo(info);
  };

  return {
    businessInfo,
    loading,
    saveBusinessInfo,
  };
}
