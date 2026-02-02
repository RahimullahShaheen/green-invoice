import { useState } from 'react';
import { Header } from '@/components/Header';
import { useBusinessInfo } from '@/hooks/useInvoices';
import { saveBusinessInfoToSupabase } from '@/lib/supabaseBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const { businessInfo, saveBusinessInfo } = useBusinessInfo();
  const [formData, setFormData] = useState(businessInfo);

  const handleSave = async () => {
    const success = await saveBusinessInfoToSupabase(formData);
    if (success) {
      toast({
        title: 'Settings saved',
        description: 'Your business information has been updated.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save business information to the database.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your business information
          </p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Business Information</h2>
              <p className="text-sm text-muted-foreground">
                This information will appear on your invoices
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                placeholder="Your Business Name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="0400 000 000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 Main St, Sydney NSW"
              />
            </div>

            <div className="space-y-2">
              <Label>ABN (Optional)</Label>
              <Input
                value={formData.abn || ''}
                onChange={(e) =>
                  setFormData({ ...formData, abn: e.target.value })
                }
                placeholder="12 345 678 901"
              />
            </div>

            {/* Bank Details */}
            <div className="pt-4 border-t border-border mt-4">
              <h3 className="text-base font-semibold mb-2">Bank Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    value={formData.bankAccountNumber || ''}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    placeholder="Account Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>BSB</Label>
                  <Input
                    value={formData.bankBSB || ''}
                    onChange={(e) => setFormData({ ...formData, bankBSB: e.target.value })}
                    placeholder="BSB"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
