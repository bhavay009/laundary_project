import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  IndianRupee,
  TrendingUp,
  PackageCheck,
  ArrowRight,
  Sparkles,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getDashboardStats, getRevenueTrend, getOrders, getTodayStats, updateOrderStatus } from '../api/orders';
import StatCard from '../components/dashboard/StatCard';
import { StatusChart, RevenueChart } from '../components/dashboard/StatusChart';
import StatusBadge from '../components/ui/StatusBadge';
import { StatCardSkeleton, DashboardChartSkeleton } from '../components/ui/Skeleton';
import AIInsightsPanel from '../components/dashboard/AIInsightsPanel';
import TopGarments from '../components/dashboard/TopGarments';
import ProfileCard from '../components/dashboard/ProfileCard';

const STATUS_FLOW = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendRes, ordersRes, todayRes] = await Promise.all([
        getDashboardStats(),
        getRevenueTrend(),
        getOrders({ limit: 5, sort: '-createdAt' }),
        getTodayStats(),
      ]);
      setStats(statsRes.data);
      setRevenueTrend(trendRes.data);
      setRecentOrders(ordersRes.data);
      setTodayData(todayRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickStatusUpdate = async (id, currentStatus) => {
    const currentIdx = STATUS_FLOW.indexOf(currentStatus);
    const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;
    
    if (!nextStatus) return;

    try {
      await updateOrderStatus(id, nextStatus);
      toast.success(`Order moved to ${nextStatus}`, {
        style: { borderRadius: '1rem', background: '#0284c7', color: '#fff' }
      });
      fetchData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's High-Level Snapshot */}
      {!loading && todayData && (
        <div className="card-premium bg-gradient-to-r from-sky-800 to-sky-600 p-6 text-white border-none shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/4 -translate-y-1/4">
            <Sparkles className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-emerald-200" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-100/70">Operating Status: Active</span>
              </div>
              <h2 className="heading-large text-white">Daily Summary</h2>
              <p className="text-emerald-50/70 text-sm mt-1 max-w-md">Your facility has processed {todayData.ordersToday} orders today with a total turnover of ₹{todayData.revenueToday.toLocaleString()}.</p>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center min-w-[140px]">
                <p className="text-[10px] uppercase font-bold text-emerald-100/50 mb-1">Incoming</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black">{todayData.ordersToday}</p>
                  <span className="text-[10px] font-bold text-emerald-300">+2</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center min-w-[140px]">
                <p className="text-[10px] uppercase font-bold text-emerald-100/50 mb-1">Revenue</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black">₹{todayData.revenueToday.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats && (
          <>
            <StatCard title="Total Orders" value={stats.totalOrders} trend={12} icon={ClipboardList} />
            <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} trend={8.4} icon={IndianRupee} />
            <StatCard title="Avg Check" value={`₹${stats.avgOrderValue.toLocaleString()}`} trend={-2.1} icon={TrendingUp} />
            <StatCard title="Ready Pool" value={stats.pendingPickup} trend={0} icon={PackageCheck} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Content Area (spans 3 columns) */}
        <div className="xl:col-span-3 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-premium p-4 min-h-[350px]">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="heading-medium">Revenue Trends</h3>
                <div className="bg-[var(--bg-main)] px-3 py-1 rounded-full text-[10px] font-bold text-[var(--brand-secondary)] uppercase">Weekly</div>
              </div>
              {loading ? <DashboardChartSkeleton /> : <RevenueChart data={revenueTrend} />}
            </div>
            
            <div className="card-premium p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="heading-medium">Job Status</h3>
              </div>
              {loading ? <DashboardChartSkeleton /> : <StatusChart data={stats?.statusBreakdown} />}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIInsightsPanel />
            <TopGarments />
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="heading-medium">Recent Operations</h3>
              <button onClick={() => navigate('/orders')} className="btn-premium btn-premium-secondary">
                Explore All <ArrowRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right px-4">Action</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {!loading && recentOrders.map((order) => (
                    <tr 
                      key={order._id} 
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="group cursor-pointer hover:bg-[var(--bg-main)] transition-colors"
                    >
                      <td className="py-4 px-2 font-black text-sm text-[var(--brand-primary)] uppercase">{order.orderId}</td>
                      <td className="py-4">
                        <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                        <p className="text-[10px] text-gray-400">{order.phoneNumber}</p>
                      </td>
                      <td className="py-4 text-right font-black text-sm">₹{order.totalBill.toLocaleString()}</td>
                      <td className="py-4">
                        <div className="flex justify-center">
                           <StatusBadge status={order.status} size="xs" />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                         {order.status !== 'DELIVERED' && (
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleQuickStatusUpdate(order._id, order.status);
                             }}
                             className="p-2 bg-[var(--brand-light)] text-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary)] hover:text-white transition-all group/action"
                             title="Advance Status"
                           >
                             <ChevronRight size={14} className="group-hover/action:translate-x-0.5 transition-transform" />
                           </button>
                         )}
                      </td>
                      <td className="py-4 text-right">
                         <p className="text-[10px] font-bold text-gray-500 uppercase">{format(new Date(order.createdAt), 'MMM dd')}</p>
                         <p className="text-[9px] text-gray-400">{format(new Date(order.createdAt), 'hh:mm a')}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && recentOrders.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">No active orders in the queue</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Area (spans 1 column) */}
        <div className="xl:col-span-1 h-full">
          <ProfileCard />
        </div>
      </div>
    </div>
  );
}
