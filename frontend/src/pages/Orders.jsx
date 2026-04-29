import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOrdersContext } from '../context/OrdersContext';
import OrderCard from '../components/orders/OrderCard';
import OrderFilters from '../components/orders/OrderFilters';
import EmptyState from '../components/ui/EmptyState';

const ITEMS_PER_PAGE = 12;

export default function Orders() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useOrdersContext();
  
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.phone.includes(search) ||
        order.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        !status || status === 'ALL' || order.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when filters change
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">
            {filteredOrders.length} total order{filteredOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/orders/new')}
          className="btn-primary"
          id="create-order-btn"
        >
          <PlusCircle className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Filters */}
      <OrderFilters
        status={status}
        onStatusChange={handleStatusChange}
        search={search}
        onSearchChange={handleSearchChange}
      />

      {/* Grid */}
      {paginatedOrders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={
            search || status !== 'ALL'
              ? 'Try adjusting your filters or search query.'
              : 'Get started by creating your first laundry order.'
          }
          actionLabel={!search && status === 'ALL' ? 'Create Order' : undefined}
          actionTo="/orders/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onStatusUpdate={updateOrderStatus}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`
                w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150
                ${
                  currentPage === i + 1
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
