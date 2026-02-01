import { InvoiceStatus } from '@/types/invoice';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
  },
  sent: {
    label: 'Sent',
    className: 'bg-info/10 text-info',
  },
  paid: {
    label: 'Paid',
    className: 'bg-success/10 text-success',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-destructive/10 text-destructive',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
