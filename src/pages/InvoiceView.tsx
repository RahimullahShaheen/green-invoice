import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { InvoicePreview } from '@/components/InvoicePreview';
import { StatusBadge } from '@/components/StatusBadge';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useInvoices } from '@/hooks/useInvoices';
import { getInvoice } from '@/lib/invoiceUtils';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Download,
  Edit,
  MoreHorizontal,
  CheckCircle,
  Send,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { previewRef, exportToPdf } = usePdfExport();
  const { updateStatus, deleteInvoice } = useInvoices();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      const data = getInvoice(id);
      setInvoice(data);
      setLoading(false);
    }
  }, [id]);

  const handleExport = async () => {
    if (!invoice) return;
    setExporting(true);
    try {
      await exportToPdf(invoice, previewRef.current);
      toast({
        title: 'PDF downloaded',
        description: `${invoice.invoiceNumber}.pdf has been saved.`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error generating the PDF.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = (status: Invoice['status']) => {
    if (!invoice || !id) return;
    updateStatus(id, status);
    setInvoice({ ...invoice, status });
    toast({
      title: 'Status updated',
      description: `Invoice marked as ${status}.`,
    });
  };

  const handleDelete = () => {
    if (!id) return;
    deleteInvoice(id);
    toast({
      title: 'Invoice deleted',
      description: 'The invoice has been permanently deleted.',
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Invoice not found</h2>
            <p className="text-muted-foreground mb-6">
              The invoice you're looking for doesn't exist.
            </p>
            <Link to="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
                <StatusBadge status={invoice.status} />
              </div>
              <p className="text-muted-foreground">{invoice.clientInfo.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 sm:flex-none"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
            <Link to={`/invoice/${id}/edit`} className="flex-1 sm:flex-none">
              <Button className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {invoice.status === 'draft' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('sent')}>
                    <Send className="h-4 w-4 mr-2" />
                    Mark as Sent
                  </DropdownMenuItem>
                )}
                {invoice.status !== 'paid' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('paid')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Invoice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Invoice Preview */}
        <InvoicePreview ref={previewRef} invoice={invoice} />
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoice.invoiceNumber}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
