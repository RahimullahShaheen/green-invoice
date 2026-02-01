import { Invoice } from '@/types/invoice';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '@/lib/invoiceUtils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Download, Trash2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onDownload: (invoice: Invoice) => void;
}

export function InvoiceCard({ invoice, onDelete, onMarkPaid, onDownload }: InvoiceCardProps) {
  return (
    <div className="card-premium p-4 sm:p-5 animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link 
              to={`/invoice/${invoice.id}`}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              {invoice.invoiceNumber}
            </Link>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {invoice.clientInfo.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(invoice.issueDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-lg">
              {formatCurrency(invoice.total)}
            </p>
            <p className="text-xs text-muted-foreground">
              Due: {formatDate(invoice.dueDate)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to={`/invoice/${invoice.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/invoice/${invoice.id}/edit`} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(invoice)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              {invoice.status !== 'paid' && (
                <DropdownMenuItem onClick={() => onMarkPaid(invoice.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Paid
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(invoice.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
