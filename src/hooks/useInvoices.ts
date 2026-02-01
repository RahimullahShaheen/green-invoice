import { useState, useEffect } from 'react';
import { Invoice, BusinessInfo, DEFAULT_BUSINESS_INFO } from '@/types/invoice';
import {
  getInvoices,
  saveInvoice as saveInvoiceToStorage,
  deleteInvoice as deleteInvoiceFromStorage,
  getBusinessInfo,
  saveBusinessInfo as saveBusinessInfoToStorage,
  searchInvoices,
  updateInvoiceStatus,
} from '@/lib/invoiceUtils';

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
    const stored = getBusinessInfo();
    if (stored) {
      setBusinessInfo(stored);
    }
    setLoading(false);
  }, []);

  const saveBusinessInfo = (info: BusinessInfo) => {
    saveBusinessInfoToStorage(info);
    setBusinessInfo(info);
  };

  return {
    businessInfo,
    loading,
    saveBusinessInfo,
  };
}
