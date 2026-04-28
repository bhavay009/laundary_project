import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save, Loader2, Sparkles } from 'lucide-react';
import { getPricingSuggestions } from '../../api/ai';

const GARMENT_TYPES = [
  'Shirt',
  'T-Shirt',
  'Pants / Trousers',
  'Jeans',
  'Jacket / Blazer',
  'Suit (2-piece)',
  'Suit (3-piece)',
  'Dress',
  'Skirt',
  'Saree',
  'Kurta',
  'Bedsheet',
  'Curtain',
  'Blanket',
  'Other',
];

const emptyGarment = { type: '', quantity: 1, pricePerItem: '' };

export default function OrderForm({ initialData, onSubmit, loading = false }) {
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [garments, setGarments] = useState(
    initialData?.garments?.length
      ? initialData.garments.map((g) => ({
          type: g.type,
          quantity: g.quantity,
          pricePerItem: g.pricePerItem,
        }))
      : [{ ...emptyGarment }]
  );
  const [errors, setErrors] = useState({});
  const [pricingHints, setPricingHints] = useState({});

  useEffect(() => {
    const fetchHints = async () => {
      try {
        const res = await getPricingSuggestions();
        const hints = {};
        res.data.forEach(h => hints[h.type] = h);
        setPricingHints(hints);
      } catch (err) {
        console.error('Failed to fetch pricing hints:', err);
      }
    };
    fetchHints();
  }, []);

  const totalBill = garments.reduce(
    (sum, g) => sum + (Number(g.quantity) || 0) * (Number(g.pricePerItem) || 0),
    0
  );

  const addGarment = () => setGarments([...garments, { ...emptyGarment }]);

  const removeGarment = (idx) => {
    if (garments.length === 1) return;
    setGarments(garments.filter((_, i) => i !== idx));
  };

  const updateGarment = (idx, field, value) => {
    const updated = [...garments];
    updated[idx] = { ...updated[idx], [field]: value };
    setGarments(updated);
  };

  const validate = () => {
    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10}$/.test(phoneNumber.replace(/[\s-]/g, '')))
      newErrors.phoneNumber = 'Enter a valid 10-digit phone number';

    garments.forEach((g, i) => {
      if (!g.type) newErrors[`garment_${i}_type`] = 'Select a type';
      if (!g.quantity || g.quantity < 1) newErrors[`garment_${i}_qty`] = 'Min 1';
      if (!g.pricePerItem || g.pricePerItem <= 0)
        newErrors[`garment_${i}_price`] = 'Enter price';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      notes: notes.trim(),
      garments: garments.map((g) => ({
        type: g.type,
        quantity: Number(g.quantity),
        pricePerItem: Number(g.pricePerItem),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Customer Info */}
      <div className="card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Customer Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="customerName">
              Customer Name *
            </label>
            <input
              id="customerName"
              type="text"
              className={`input ${errors.customerName ? 'ring-2 ring-red-500 border-red-300' : ''}`}
              placeholder="John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            {errors.customerName && (
              <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="phoneNumber">
              Phone Number *
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className={`input ${errors.phoneNumber ? 'ring-2 ring-red-500 border-red-300' : ''}`}
              placeholder="9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="notes">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            className="input min-h-[80px] resize-y"
            placeholder="Any special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Garments */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Garments
          </h3>
          <button
            type="button"
            onClick={addGarment}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {garments.map((g, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-3 items-start bg-gray-50/60 rounded-xl p-3 border border-gray-100"
            >
              {/* Type */}
              <div className="col-span-12 sm:col-span-5">
                <label className="label text-xs">Type</label>
                <select
                  value={g.type}
                  onChange={(e) => updateGarment(idx, 'type', e.target.value)}
                  className={`input ${errors[`garment_${idx}_type`] ? 'ring-2 ring-red-500' : ''}`}
                >
                  <option value="">Select garment...</option>
                  {GARMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="col-span-5 sm:col-span-3">
                <label className="label text-xs">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={g.quantity}
                  onChange={(e) => updateGarment(idx, 'quantity', e.target.value)}
                  className={`input ${errors[`garment_${idx}_qty`] ? 'ring-2 ring-red-500' : ''}`}
                />
              </div>

              {/* Price */}
              <div className="col-span-5 sm:col-span-3">
                <label className="label text-xs">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={g.pricePerItem}
                  onChange={(e) => updateGarment(idx, 'pricePerItem', e.target.value)}
                  className={`input ${errors[`garment_${idx}_price`] ? 'ring-2 ring-red-500' : ''}`}
                  placeholder="0"
                />
                {g.type && pricingHints[g.type] && (
                  <p className="text-[10px] text-brand-600 mt-1 flex items-center gap-1 font-medium">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI Suggests: ₹{pricingHints[g.type].suggested}
                  </p>
                )}
              </div>

              {/* Remove */}
              <div className="col-span-2 sm:col-span-1 flex items-end justify-center pb-0.5">
                <button
                  type="button"
                  onClick={() => removeGarment(idx)}
                  disabled={garments.length === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 
                             transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-5"
                  aria-label="Remove garment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total & Submit */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Estimated Total</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{totalBill.toLocaleString()}
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-base px-6 py-3"
            id="submit-order-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {initialData ? 'Update Order' : 'Create Order'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
