import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrdersContext } from '../context/OrdersContext';
import OrderForm from '../components/orders/OrderForm';

export default function CreateOrder() {
  const navigate = useNavigate();
  const { addOrder } = useOrdersContext();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (data) => {
    setLoading(true);
    try {
      // Transform form data to match our order model
      const orderData = {
        customerName: data.customerName,
        phone: data.phoneNumber,
        garments: data.garments.map((g) => ({
          name: g.type,
          quantity: g.quantity,
          price: g.pricePerItem,
        })),
      };

      const newOrder = addOrder(orderData);
      toast.success(`Order ${newOrder.id} created successfully!`);
      navigate(`/orders/${newOrder.id}`);
    } catch (err) {
      toast.error('Failed to create order');
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
