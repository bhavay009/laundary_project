import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { createOrder } from '../api/orders';
import OrderForm from '../components/orders/OrderForm';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await createOrder(data);
      toast.success(`Order ${res.data.orderId} created successfully!`);
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create order';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Create New Order</h1>
          <p className="page-subtitle">Fill in the details to create a laundry order</p>
        </div>
      </div>

      {/* Form */}
      <OrderForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
