import { formatCurrency, calculateInvoiceTotals } from '@/lib/invoiceUtils';
import { ServiceItem } from '@/types/invoice';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InvoiceTotalsProps {
  items: ServiceItem[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  gstEnabled: boolean;
  gstRate: number;
  onDiscountChange: (discount: number) => void;
  onDiscountTypeChange: (type: 'percentage' | 'fixed') => void;
  onGstToggle: (enabled: boolean) => void;
}

export function InvoiceTotals({
  items,
  discount,
  discountType,
  gstEnabled,
  gstRate,
  onDiscountChange,
  onDiscountTypeChange,
  onGstToggle,
}: InvoiceTotalsProps) {
  const { subtotal, discountAmount, gstAmount, total } = calculateInvoiceTotals(
    items,
    discount,
    discountType,
    gstEnabled,
    gstRate
  );

  return (
    <div className="bg-muted/30 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>

      {/* Discount */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-muted-foreground">Discount</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={discount}
            onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
            className="w-24 text-right"
          />
          <Select value={discountType} onValueChange={(v) => onDiscountTypeChange(v as 'percentage' | 'fixed')}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">%</SelectItem>
              <SelectItem value="fixed">$</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Discount Amount</span>
          <span className="text-destructive">-{formatCurrency(discountAmount)}</span>
        </div>
      )}

      {/* GST */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="gst-toggle"
            checked={gstEnabled}
            onCheckedChange={onGstToggle}
          />
          <Label htmlFor="gst-toggle" className="text-muted-foreground cursor-pointer">
            GST ({gstRate}%)
          </Label>
        </div>
        {gstEnabled && (
          <span className="font-medium">{formatCurrency(gstAmount)}</span>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Total Amount Due</span>
        <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
