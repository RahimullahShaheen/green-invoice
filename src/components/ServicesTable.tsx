import { useState, useCallback } from 'react';
import { ServiceItem, DEFAULT_SERVICES } from '@/types/invoice';
import { generateId, formatCurrency } from '@/lib/invoiceUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface ServicesTableProps {
  items: ServiceItem[];
  onChange: (items: ServiceItem[]) => void;
}

export function ServicesTable({ items, onChange }: ServicesTableProps) {
  const [selectedPreset, setSelectedPreset] = useState('');

  const addItem = useCallback(() => {
    const newItem: ServiceItem = {
      id: generateId(),
      service: '',
      description: '',
      quantity: 1,
      rate: 0,
      total: 0,
    };
    onChange([...items, newItem]);
  }, [items, onChange]);

  const addPresetItem = useCallback((presetService: string) => {
    const preset = DEFAULT_SERVICES.find(s => s.service === presetService);
    if (!preset) return;

    const newItem: ServiceItem = {
      id: generateId(),
      service: preset.service,
      description: preset.description,
      quantity: 1,
      rate: preset.rate,
      total: preset.rate,
    };
    onChange([...items, newItem]);
    setSelectedPreset('');
  }, [items, onChange]);

  const updateItem = useCallback((id: string, field: keyof ServiceItem, value: string | number) => {
    onChange(
      items.map(item => {
        if (item.id !== id) return item;
        
        const updated = { ...item, [field]: value };
        
        // Recalculate total if quantity or rate changed
        if (field === 'quantity' || field === 'rate') {
          updated.total = Number(updated.quantity) * Number(updated.rate);
        }
        
        return updated;
      })
    );
  }, [items, onChange]);

  const removeItem = useCallback((id: string) => {
    onChange(items.filter(item => item.id !== id));
  }, [items, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Services</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedPreset} onValueChange={addPresetItem}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Quick add service..." />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_SERVICES.map((service) => (
                <SelectItem key={service.service} value={service.service}>
                  {service.service} - {formatCurrency(service.rate)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={addItem} className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th className="min-w-[180px]">Service</th>
              <th className="min-w-[200px]">Description</th>
              <th className="w-24 text-right">Qty</th>
              <th className="w-32 text-right">Rate</th>
              <th className="w-32 text-right">Total</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  No services added. Use the dropdown above to add common landscaping services.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="group">
                  <td className="text-muted-foreground/50">
                    <GripVertical className="h-4 w-4" />
                  </td>
                  <td>
                    <Input
                      value={item.service}
                      onChange={(e) => updateItem(item.id, 'service', e.target.value)}
                      placeholder="Service name"
                      className="border-0 bg-transparent px-0 focus-visible:ring-0"
                    />
                  </td>
                  <td>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Description"
                      className="border-0 bg-transparent px-0 focus-visible:ring-0"
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="border-0 bg-transparent px-0 text-right focus-visible:ring-0"
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="border-0 bg-transparent px-0 text-right focus-visible:ring-0"
                    />
                  </td>
                  <td className="text-right font-medium">
                    {formatCurrency(item.total)}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {items.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No services added. Use the dropdown above to add common landscaping services.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Input
                    value={item.service}
                    onChange={(e) => updateItem(item.id, 'service', e.target.value)}
                    placeholder="Service name"
                    className="font-medium"
                  />
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Description"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Qty</label>
                  <Input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Rate</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Total</label>
                  <div className="h-10 flex items-center justify-end font-medium">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
