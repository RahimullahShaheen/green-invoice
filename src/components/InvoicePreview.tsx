import { forwardRef } from 'react';
import { Invoice } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/lib/invoiceUtils';
import { Logo } from './Logo';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ invoice }, ref) => {
    const { businessInfo, clientInfo, items } = invoice;

    return (
      <div
        ref={ref}
        className="bg-card p-8 rounded-xl shadow-lg max-w-[800px] mx-auto"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <Logo size="lg" className="mb-8"/>
            <div className="mt-4 text-sm text-muted-foreground space-y-1">
              <p>{businessInfo.email}</p>
              <p>{businessInfo.phone}</p>
              <p>{businessInfo.address}</p>
              {businessInfo.abn && <p>ABN: {businessInfo.abn}</p>}
              {/* Bank Details */}
              {(businessInfo.bankAccountNumber || businessInfo.bankBSB) && (
                <div className="mt-2">
                  <p className="font-semibold">Bank Details:</p>

                  {businessInfo.bankAccountNumber && <p>Account: {businessInfo.bankAccountNumber}</p>}
                  {businessInfo.bankBSB && <p>BSB: {businessInfo.bankBSB}</p>}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-primary mb-2">INVOICE</h1>
            <p className="text-sm text-muted-foreground">
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Client & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Bill To
            </h3>
            <p className="font-semibold text-lg max-w-[150px] break-words whitespace-normal">
  {clientInfo.name}
</p>
            <div className="text-sm text-muted-foreground mt-1 space-y-1">
              <p>{clientInfo.email}</p>
              <p>{clientInfo.phone}</p>
              <p><b>{clientInfo.address}</b></p>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-muted-foreground">Issue Date:</span>
                <span className="font-medium">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium">{formatDate(invoice.dueDate)}</span>
              </div>
              {/* <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`font-semibold ${
                    invoice.status === 'paid'
                      ? 'text-success'
                      : invoice.status === 'overdue'
                      ? 'text-destructive'
                      : 'text-foreground'
                  }`}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div> */}
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="mb-8">
  <table className="w-full">
    <thead>
      <tr className="border-b border-border">
        <th className="text-left py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Service
        </th>

        <th className="text-right py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Qty
        </th>

        <th className="text-right py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Rate
        </th>

        <th className="text-right py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Total
        </th>
      </tr>
    </thead>

    <tbody>
      {items.map((item) => (
        <tr key={item.id} className="border-b border-border/50">
          {/* ✅ Service + Visits + Dates */}
          <td className="py-4">
            {/* Service */}
            <p className="font-medium">{item.service}</p>

            {/* Visits */}
            <p className="text-sm text-muted-foreground mt-1 max-w-[250px] break-words whitespace-normal">
              {item.description}
            </p>

            {/* Dates */}
            {item.dates && item.dates.length > 0 && (
              <div className="mt-2">
                {/* Dates label */}
                <p className="text-sm font-semibold">Visits:</p>

                {/* Each date on new row */}
                <div className="ml-2 mt-1 space-y-1">
                  {item.dates.map((iso, index) => {
                    const d = new Date(iso);
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();

                    return (
                      <p
                        key={index}
                        className="text-sm text-muted-foreground"
                      >
                        {day}/{month}/{year}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </td>

          {/* Qty */}
          <td className="py-4 text-right">{item.quantity}</td>

          {/* Rate */}
          <td className="py-4 text-right">
            {formatCurrency(item.rate)}
          </td>

          {/* Total */}
          <td className="py-4 text-right font-medium">
            {formatCurrency(item.total)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Discount{' '}
                  {invoice.discountType === 'percentage'
                    ? `(${invoice.discount}%)`
                    : ''}
                </span>
                <span className="text-destructive">
                  -{formatCurrency(
                    invoice.discountType === 'percentage'
                      ? (invoice.subtotal * invoice.discount) / 100
                      : invoice.discount
                  )}
                </span>
              </div>
            )}
            {invoice.gstEnabled && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  GST ({invoice.gstRate}%)
                </span>
                <span>{formatCurrency(invoice.gstAmount)}</span>
              </div>
            )}
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold">Total Due</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Notes
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6" style={{marginTop:"100px"}}>
  <div className="rounded-lg px-6 py-5 text-center space-y-2" style={{color: "#4b4d4b"}}>
    
    {/* Thank You Message */}
    <p className="text-sm font-medium">
      Thank you for choosing Mazzari Landscape Management
    </p>

    {/* Website Link */}
    <a
      href="https://mazzari.com.au"
      target="_blank"
      rel="noopener noreferrer"
      className="text-base font-semibold underline underline-offset-4 hover:text-green-200 transition"
    >
      mazzari.com.au
    </a>
  </div>
</div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';
