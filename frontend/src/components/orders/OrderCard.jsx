import { useNavigate } from 'react-router-dom';
import { Phone, Calendar, Shirt, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';
import StatusBadge from '../ui/StatusBadge';
import DeliveryBadge from './DeliveryBadge';
import { updateOrderStatus } from '../../api/orders';

const STATUS_FLOW = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];

export default function OrderCard({ order, onUpdate }) {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const garmentCount = order.garments.reduce((sum, g) => sum + g.quantity, 0);

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  const handleStatusUpdate = async (e) => {
    e.stopPropagation();
    if (!nextStatus || updating) return;

    setUpdating(true);
    try {
      await updateOrderStatus(order._id, nextStatus);
      toast.success(`Order moved to ${nextStatus}`, {
        style: { borderRadius: '1rem', background: '#0284c7', color: '#fff' }
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/orders/${order._id}`)}
      className="card-premium p-5 cursor-pointer group hover:border-[var(--brand-primary)] animate-fade-in"
      id={`order-card-${order.orderId}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-black text-[var(--brand-primary)] tracking-widest uppercase mb-0.5">
            {order.orderId}
          </p>
          <h3 className="heading-medium group-hover:text-[var(--brand-primary)] transition-colors">
            {order.customerName}
          </h3>
        </div>
        <StatusBadge status={order.status} size="xs" />
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center">
             <Phone className="w-4 h-4 text-[var(--brand-primary)] opacity-70" />
          </div>
          <span>{order.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center">
             <Shirt className="w-4 h-4 text-[var(--brand-primary)] opacity-70" />
          </div>
          <span>
            {garmentCount} items ·{' '}
            {order.garments.length} garment types
          </span>
        </div>
        {order.estimatedDelivery && (
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center">
               <Calendar className="w-4 h-4 text-[var(--brand-primary)] opacity-70" />
            </div>
            <div className="flex items-center gap-2">
              <span>{format(new Date(order.estimatedDelivery), 'MMM dd')}</span>
              <DeliveryBadge estimatedDelivery={order.estimatedDelivery} status={order.status} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-50">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Bill</span>
        <span className="text-lg font-black text-[var(--text-main)]">₹{order.totalBill.toLocaleString()}</span>
      </div>

      {/* Action Footer */}
      {nextStatus && (
        <button 
          onClick={handleStatusUpdate}
          disabled={updating}
          className="w-full flex items-center justify-between p-3 bg-[var(--brand-light)] text-[var(--brand-primary)] rounded-xl group/btn hover:bg-[var(--brand-primary)] hover:text-white transition-all shadow-sm"
        >
          <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider">
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>Promote to {nextStatus}</span>
          </div>
          <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all" />
        </button>
      )}
    </div>
  );
}
