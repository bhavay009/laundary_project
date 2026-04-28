import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, MessageSquare, Plus, ArrowUpRight, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import Modal from '../ui/Modal';

const mockOrders = [
  { id: 'LD-4832', customerName: 'Rajesh Khanna' },
  { id: 'LD-4835', customerName: 'Neha Agarwal' },
  { id: 'LD-4840', customerName: 'Rohan Gupta' },
  { id: 'LD-4847', customerName: 'Deepa Iyer' },
];

const mockCustomers = [
  { name: 'Aarav Sharma', phone: '9876543210' },
  { name: 'Priya Mehta', phone: '9890012345' },
  { name: 'Rohan Malhotra', phone: '9812398765' },
  { name: 'Neha Iyer', phone: '9823412789' },
];

const initialNotifications = [
  { id: 'n1', text: 'New order received from Rajesh', time: '2 mins ago', read: false },
  { id: 'n2', text: 'Bedsheets are in high load today', time: '8 mins ago', read: false },
  { id: 'n3', text: 'Order #LD-4835 marked as Ready', time: '22 mins ago', read: false },
  { id: 'n4', text: 'Daily revenue summary is ready', time: '1 hour ago', read: true },
  { id: 'n5', text: 'Customer Priya Mehta requested express delivery', time: '2 hours ago', read: true },
];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightMatch({ text, query }) {
  if (!query.trim()) return <>{text}</>;

  const pattern = new RegExp(`(${escapeRegex(query)})`, 'ig');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={`${part}-${index}`} className="bg-sky-100 text-sky-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 250);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const searchResults = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return [];

    const orderResults = mockOrders
      .filter(
        (order) =>
          order.id.toLowerCase().includes(query) || order.customerName.toLowerCase().includes(query)
      )
      .map((order) => ({
        id: `order-${order.id}`,
        type: 'Order',
        title: order.id,
        subtitle: order.customerName,
        href: '/orders',
      }));

    const customerResults = mockCustomers
      .filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) || customer.phone.toLowerCase().includes(query)
      )
      .map((customer) => ({
        id: `customer-${customer.phone}`,
        type: 'Customer',
        title: customer.name,
        subtitle: customer.phone,
        href: '/customers',
      }));

    return [...orderResults, ...customerResults].slice(0, 7);
  }, [debouncedSearch]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content pl-28">
        {/* Top Header */}
        <header className="flex items-center justify-between py-6 px-2 mb-2">
          <div>
            <h2 className="heading-large">Hello, CleanQ!</h2>
            <p className="text-sub mt-1">Efficiently managing your laundry operations today</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/orders/new')}
              className="btn-premium btn-premium-primary h-12 px-6"
            >
              <Plus size={18} />
              <span>Create Order</span>
            </button>

            <div className="relative group" ref={searchRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search orders, customers..." 
                className="input-premium pl-12 pr-6 w-72 h-12 shadow-sm border border-transparent focus:border-[var(--brand-primary)]"
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
              />
              {searchOpen && debouncedSearch.trim() && (
                <div className="absolute top-[calc(100%+0.5rem)] right-0 w-[24rem] bg-white rounded-2xl border border-slate-100 shadow-xl z-50 p-2 animate-fade-in">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-slate-500 px-3 py-5 text-center">No results found</p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto">
                      {searchResults.map((result) => (
                        <li key={result.id}>
                          <button
                            type="button"
                            className="w-full rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
                            onClick={() => {
                              navigate(result.href);
                              setSearchOpen(false);
                            }}
                          >
                            <div>
                              <p className="text-xs text-sky-600 font-bold uppercase tracking-wide">
                                {result.type}
                              </p>
                              <p className="text-sm font-bold text-slate-800 mt-0.5">
                                <HighlightMatch text={result.title} query={debouncedSearch} />
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                <HighlightMatch text={result.subtitle} query={debouncedSearch} />
                              </p>
                            </div>
                            <ArrowUpRight size={15} className="text-slate-300 mt-1" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setAssistantOpen(true)}
              className="p-3 bg-white rounded-full text-gray-500 hover:text-[var(--brand-primary)] shadow-sm border border-white transition-all"
            >
              <MessageSquare size={20} />
            </button>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="p-3 bg-white rounded-full text-gray-500 hover:text-[var(--brand-primary)] shadow-sm border border-white transition-all relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute top-[calc(100%+0.5rem)] right-0 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 animate-fade-in overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-extrabold text-slate-800">Notifications</h3>
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <ul className="max-h-80 overflow-y-auto p-2">
                    {notifications.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <Circle
                            size={8}
                            className={`mt-1.5 ${item.read ? 'text-slate-200' : 'text-sky-500 fill-current'}`}
                          />
                          <div>
                            <p className="text-sm text-slate-700">{item.text}</p>
                            <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="animate-premium pb-10">
          {children}
        </div>
      </main>

      <Modal isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} title="AI Assistant" maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">AI-powered support and insights coming soon.</p>
          <div className="space-y-2">
            <label className="label">Ask CleanQ Assistant</label>
            <input
              type="text"
              disabled
              placeholder="Type your question here..."
              className="input-premium w-full h-11 rounded-xl bg-slate-100 cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" className="btn-premium btn-premium-secondary" onClick={() => setAssistantOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
