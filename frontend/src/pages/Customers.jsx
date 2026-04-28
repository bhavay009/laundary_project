import { useMemo, useState } from 'react';
import { Search, Phone, ShoppingBag, IndianRupee, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import ModuleHeader from '../components/modules/ModuleHeader';

const mockCustomers = [
  {
    id: 'C001',
    name: 'Aarav Sharma',
    phone: '9876543210',
    totalOrders: 28,
    totalSpend: 18750,
    lastOrderDate: '2026-04-25T10:30:00.000Z',
    status: 'Active',
  },
  {
    id: 'C002',
    name: 'Priya Mehta',
    phone: '9890012345',
    totalOrders: 14,
    totalSpend: 9920,
    lastOrderDate: '2026-04-21T16:10:00.000Z',
    status: 'Active',
  },
  {
    id: 'C003',
    name: 'Rohan Malhotra',
    phone: '9812398765',
    totalOrders: 9,
    totalSpend: 6210,
    lastOrderDate: '2026-03-29T09:45:00.000Z',
    status: 'Inactive',
  },
  {
    id: 'C004',
    name: 'Neha Iyer',
    phone: '9823412789',
    totalOrders: 19,
    totalSpend: 14160,
    lastOrderDate: '2026-04-24T13:15:00.000Z',
    status: 'Active',
  },
  {
    id: 'C005',
    name: 'Kunal Verma',
    phone: '9807654321',
    totalOrders: 6,
    totalSpend: 3780,
    lastOrderDate: '2026-03-11T18:00:00.000Z',
    status: 'Inactive',
  },
];

function CustomerCard({ customer }) {
  return (
    <article className="card-premium p-5 group">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">{customer.name}</h3>
          <p className="text-xs text-slate-500 mt-1">ID: {customer.id}</p>
        </div>
        <span
          className={`badge-premium ${
            customer.status === 'Active'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {customer.status}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-sky-500" />
          <span>{customer.phone}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShoppingBag size={12} /> Total Orders
            </p>
            <p className="font-extrabold text-slate-800 mt-1">{customer.totalOrders}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <IndianRupee size={12} /> Total Spend
            </p>
            <p className="font-extrabold text-slate-800 mt-1">₹{customer.totalSpend.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-slate-500">
          <CalendarDays size={14} />
          Last order on {format(new Date(customer.lastOrderDate), 'dd MMM yyyy')}
        </div>
      </div>
    </article>
  );
}

export default function Customers() {
  const [search, setSearch] = useState('');

  const filteredCustomers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return mockCustomers;
    return mockCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(normalized) || customer.phone.includes(normalized)
    );
  }, [search]);

  return (
    <section className="space-y-6">
      <ModuleHeader
        title="Customers"
        subtitle="Track customer relationships, order history, and lifetime value."
      />

      <div className="card-premium p-4 sm:p-5">
        <div className="relative max-w-xl">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer name or phone number"
            className="input-premium w-full pl-11 pr-4 h-11 bg-slate-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCustomers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="card-premium p-10 text-center">
          <p className="text-sm font-semibold text-slate-500">
            No matching customers found. Try a different name or number.
          </p>
        </div>
      ) : null}
    </section>
  );
}
