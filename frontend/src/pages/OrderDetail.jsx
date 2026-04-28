import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Phone,
  Calendar,
  Shirt,
  Clock,
  ChevronRight,
  Loader2,
  StickyNote,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  getOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from '../api/orders';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import OrderForm from '../components/orders/OrderForm';
import AISuggestions from '../components/orders/AISuggestions';


const STATUS_FLOW = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];
const STATUS_LABELS = {
  RECEIVED: 'Received',
  PROCESSING: 'Processing',
  READY: 'Ready for Pickup',
  DELIVERED: 'Delivered',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await getOrder(id);
        setOrder(res.data);
      } catch (err) {
        toast.error('Order not found');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handleAdvanceStatus = async () => {
    if (!order) return;
    const currentIdx = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentIdx + 1];
    if (!nextStatus) return;

    setStatusLoading(true);
    try {
      const res = await updateOrderStatus(id, nextStatus);
      setOrder(res.data);
      toast.success(`Status updated to ${STATUS_LABELS[nextStatus]}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setEditLoading(true);
    try {
      const res = await updateOrder(id, data);
      setOrder(res.data);
      setShowEdit(false);
      toast.success('Order updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
      navigate('/orders');
    } catch (err) {
      toast.error('Failed to delete order');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentStatusIdx + 1];
  const garmentCount = order.garments.reduce((s, g) => s + g.quantity, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Back to orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{order.orderId}</h1>
              <StatusBadge status={order.status} size="md" />
            </div>
            <p className="page-subtitle">
              Created {format(new Date(order.createdAt), 'MMM dd, yyyy · h:mm a')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.status !== 'DELIVERED' && (
            <button
              onClick={() => setShowEdit(true)}
              className="btn-secondary text-sm"
              id="edit-order-btn"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}
          <button
            onClick={() => setShowDelete(true)}
            className="btn-secondary text-sm text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
            id="delete-order-btn"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="card p-6 animate-fade-in">
        <h3 className="text-sm font-semibold text-gray-900 mb-5">Order Progress</h3>
        <div className="flex items-center justify-between relative">
          {/* Progress bar background */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 mx-8" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-brand-500 mx-8 transition-all duration-500"
            style={{ width: `${(currentStatusIdx / (STATUS_FLOW.length - 1)) * 100}%` }}
          />

          {STATUS_FLOW.map((s, idx) => {
            const isComplete = idx <= currentStatusIdx;
            const isCurrent = idx === currentStatusIdx;
            return (
              <div key={s} className="flex flex-col items-center relative z-10">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all duration-300
                    ${isComplete
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }
                    ${isCurrent ? 'ring-4 ring-brand-100 scale-110' : ''}
                  `}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-[11px] font-medium mt-2 ${
                    isComplete ? 'text-brand-600' : 'text-gray-400'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </span>
              </div>
            );
          })}
        </div>

        {nextStatus && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleAdvanceStatus}
              disabled={statusLoading}
              className="btn-primary"
              id="advance-status-btn"
            >
              {statusLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Mark as {STATUS_LABELS[nextStatus]}
            </button>
          </div>
        )}
      </div>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer Info */}
        <div className="card p-6 space-y-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Customer
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-gray-900">{order.customerName}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              {order.phoneNumber}
            </div>
            {order.estimatedDelivery && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                Est. {format(new Date(order.estimatedDelivery), 'MMM dd, yyyy')}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shirt className="w-4 h-4 text-gray-400" />
              {garmentCount} item{garmentCount !== 1 ? 's' : ''}
            </div>
          </div>
          {order.notes && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <StickyNote className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Garments */}
        <div className="card p-6 lg:col-span-2 animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Garments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 text-gray-500 font-medium">Type</th>
                  <th className="text-center py-2.5 text-gray-500 font-medium">Qty</th>
                  <th className="text-right py-2.5 text-gray-500 font-medium">Price</th>
                  <th className="text-right py-2.5 text-gray-500 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.garments.map((g, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-gray-900">{g.type}</td>
                    <td className="py-3 text-center text-gray-600">{g.quantity}</td>
                    <td className="py-3 text-right text-gray-600">
                      ₹{g.pricePerItem.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      ₹{(g.quantity * g.pricePerItem).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan="3" className="py-3 text-right font-semibold text-gray-900">
                    Total
                  </td>
                  <td className="py-3 text-right text-xl font-bold text-brand-600">
                    ₹{order.totalBill.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* AI Intelligence Panel */}
      <AISuggestions order={order} />

      {/* Status History */}
      {order.statusHistory?.length > 0 && (
        <div className="card p-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Status History
          </h3>
          <div className="space-y-3">
            {order.statusHistory.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-400" />
                <div className="flex items-center gap-3">
                  <StatusBadge status={entry.status} size="xs" />
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(entry.timestamp), 'MMM dd, yyyy · h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Order"
        maxWidth="max-w-3xl"
      >
        <OrderForm
          initialData={order}
          onSubmit={handleEdit}
          loading={editLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Order"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete order{' '}
            <strong className="text-gray-900">{order.orderId}</strong>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDelete(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="btn-danger"
              id="confirm-delete-btn"
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Order
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
