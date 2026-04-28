import { differenceInDays, differenceInHours } from 'date-fns';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Delivery urgency badge — shows time-based ETA status.
 * Green = on time / delivered, Amber = due within 24h, Red = overdue
 */
export default function DeliveryBadge({ estimatedDelivery, status }) {
  if (status === 'DELIVERED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        Delivered
      </span>
    );
  }

  if (!estimatedDelivery) return null;

  const now = new Date();
  const delivery = new Date(estimatedDelivery);
  const daysLeft = differenceInDays(delivery, now);
  const hoursLeft = differenceInHours(delivery, now);

  let color, bg, icon, label;

  if (daysLeft < 0) {
    color = 'text-red-600';
    bg = 'bg-red-50';
    icon = <AlertTriangle className="w-3 h-3" />;
    label = `${Math.abs(daysLeft)}d overdue`;
  } else if (hoursLeft <= 24) {
    color = 'text-amber-600';
    bg = 'bg-amber-50';
    icon = <Clock className="w-3 h-3" />;
    label = hoursLeft <= 0 ? 'Due now' : `${hoursLeft}h left`;
  } else {
    color = 'text-emerald-600';
    bg = 'bg-emerald-50';
    icon = <Clock className="w-3 h-3" />;
    label = `${daysLeft}d left`;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${color} ${bg} px-2 py-0.5 rounded-full`}>
      {icon}
      {label}
    </span>
  );
}
