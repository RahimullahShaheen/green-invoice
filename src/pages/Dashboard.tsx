import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { usePdfExport } from '@/hooks/usePdfExport';
import { Header } from '@/components/Header';
import { InvoiceCard } from '@/components/InvoiceCard';
import { InvoicePreview } from '@/components/InvoicePreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/invoiceUtils';
import { Invoice, InvoiceStatus } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { invoices, loading, deleteInvoice, updateStatus, search } = useInvoices();
  const { previewRef, exportToPdf } = usePdfExport();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pdfInvoice, setPdfInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    search(searchQuery);
  }, [searchQuery]);

  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    return invoices.filter(inv => inv.status === statusFilter);
  }, [invoices, statusFilter]);

  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const pending = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').reduce((sum, inv) => sum + inv.total, 0);
    const overdue = invoices.filter(inv => inv.status === 'overdue').length;
    
    return { total, paid, pending, overdue };
  }, [invoices]);

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteInvoice(deleteId);
    setDeleteId(null);
    toast({
      title: 'Invoice deleted',
      description: 'The invoice has been permanently deleted.',
    });
  };

  const handleMarkPaid = (id: string) => {
    updateStatus(id, 'paid');
    toast({
      title: 'Invoice marked as paid',
      description: 'The invoice status has been updated.',
    });
  };

  const handleDownload = async (invoice: Invoice) => {
    setPdfInvoice(invoice);
    // Wait for the preview to render
    setTimeout(async () => {
      await exportToPdf(invoice, previewRef.current);
      setPdfInvoice(null);
      toast({
        title: 'PDF downloaded',
        description: `${invoice.invoiceNumber}.pdf has been saved.`,
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-premium p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.total)}</p>
              </div>
            </div>
          </div>
          <div className="card-premium p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.paid)}</p>
              </div>
            </div>
          </div>
          <div className="card-premium p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.pending)}</p>
              </div>
            </div>
          </div>
          <div className="card-premium p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <FileText className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-xl font-semibold">{stats.overdue} invoices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Manage your landscaping invoices</p>
          </div>
          <Link to="/invoice/new">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client or invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoice List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-premium p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first invoice to get started'}
            </p>
            <Link to="/invoice/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onDelete={setDeleteId}
                onMarkPaid={handleMarkPaid}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden PDF Preview for Export */}
      {pdfInvoice && (
        <div className="fixed left-[-9999px] top-0">
          <InvoicePreview ref={previewRef} invoice={pdfInvoice} />
        </div>
      )}
    </div>
  );
}
