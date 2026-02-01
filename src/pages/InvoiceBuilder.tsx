import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ServicesTable } from '@/components/ServicesTable';
import { InvoiceTotals } from '@/components/InvoiceTotals';
import { useBusinessInfo, useInvoices } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import {
  Invoice,
  ServiceItem,
  ClientInfo,
  DEFAULT_BUSINESS_INFO,
  PAYMENT_TERMS,
} from '@/types/invoice';
import {
  generateInvoiceNumber,
  generateId,
  getDueDateFromTerms,
  calculateInvoiceTotals,
  getInvoice,
} from '@/lib/invoiceUtils';
import { useToast } from '@/hooks/use-toast';

export default function InvoiceBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { businessInfo, saveBusinessInfo } = useBusinessInfo();
  const { saveInvoice } = useInvoices();

  const isEditing = !!id && id !== 'new';

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('net-14');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<Invoice['status']>('draft');

  const [client, setClient] = useState<ClientInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [items, setItems] = useState<ServiceItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [gstEnabled, setGstEnabled] = useState(true);
  const [notes, setNotes] = useState('');

  // Load existing invoice if editing
  useEffect(() => {
    if (isEditing) {
      const existing = getInvoice(id);
      if (existing) {
        setInvoiceNumber(existing.invoiceNumber);
        setIssueDate(existing.issueDate);
        setPaymentTerms(existing.paymentTerms);
        setDueDate(existing.dueDate);
        setStatus(existing.status);
        setClient(existing.clientInfo);
        setItems(existing.items);
        setDiscount(existing.discount);
        setDiscountType(existing.discountType);
        setGstEnabled(existing.gstEnabled);
        setNotes(existing.notes || '');
      }
    } else {
      setInvoiceNumber(generateInvoiceNumber());
    }
  }, [id, isEditing]);

  // Update due date when payment terms or issue date changes
  useEffect(() => {
    setDueDate(getDueDateFromTerms(issueDate, paymentTerms));
  }, [issueDate, paymentTerms]);

  const totals = useMemo(() => {
    return calculateInvoiceTotals(items, discount, discountType, gstEnabled, 10);
  }, [items, discount, discountType, gstEnabled]);

  const handleSave = useCallback(() => {
    // Validation
    if (!client.name.trim()) {
      toast({
        title: 'Missing client name',
        description: 'Please enter a client name.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'No services added',
        description: 'Please add at least one service to the invoice.',
        variant: 'destructive',
      });
      return;
    }

    const invoice: Invoice = {
      id: isEditing ? id : generateId(),
      invoiceNumber,
      issueDate,
      dueDate,
      paymentTerms,
      status,
      businessInfo: businessInfo || DEFAULT_BUSINESS_INFO,
      clientInfo: client,
      items,
      subtotal: totals.subtotal,
      discount,
      discountType,
      gstEnabled,
      gstRate: 10,
      gstAmount: totals.gstAmount,
      total: totals.total,
      notes,
      createdAt: isEditing ? id : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveInvoice(invoice);
    toast({
      title: isEditing ? 'Invoice updated' : 'Invoice created',
      description: `Invoice ${invoiceNumber} has been saved.`,
    });
    navigate(`/invoice/${invoice.id}`);
  }, [
    client,
    items,
    isEditing,
    id,
    invoiceNumber,
    issueDate,
    dueDate,
    paymentTerms,
    status,
    businessInfo,
    discount,
    discountType,
    gstEnabled,
    totals,
    notes,
    saveInvoice,
    toast,
    navigate,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Edit Invoice' : 'New Invoice'}
              </h1>
              <p className="text-muted-foreground">{invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button variant="outline" onClick={() => navigate(`/invoice/${id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Invoice
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Invoice Details */}
          <div className="card-premium p-6">
            <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input value={invoiceNumber} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="card-premium p-6">
            <h2 className="text-lg font-semibold mb-4">Client Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={client.phone}
                  onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  placeholder="0400 000 000"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={client.address}
                  onChange={(e) => setClient({ ...client, address: e.target.value })}
                  placeholder="123 Main St, Sydney NSW"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="card-premium p-6">
            <ServicesTable items={items} onChange={setItems} />
          </div>

          {/* Totals */}
          <div className="card-premium p-6">
            <InvoiceTotals
              items={items}
              discount={discount}
              discountType={discountType}
              gstEnabled={gstEnabled}
              gstRate={10}
              onDiscountChange={setDiscount}
              onDiscountTypeChange={setDiscountType}
              onGstToggle={setGstEnabled}
            />
          </div>

          {/* Notes */}
          <div className="card-premium p-6">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or payment instructions..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Invoice
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
