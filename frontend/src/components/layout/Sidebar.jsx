import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Settings,
  LogOut,
  User,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';

const topNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/orders/new', icon: PlusCircle, label: 'New Order' },
  { to: '/inventory', icon: Package, label: 'Garment Load Tracker' },
  { to: '/customers', icon: User, label: 'Customers' },
];

const bottomNavItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();

  const NavIcon = ({ to, icon: Icon, label }) => {
    const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
    return (
      <NavLink
        to={to}
        title={label}
        className={`sidebar-icon ${isActive ? 'sidebar-icon-active' : 'sidebar-icon-inactive'}`}
      >
        <Icon size={20} />
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-20 bg-white rounded-full flex flex-col items-center py-8 shadow-sm border border-white z-50">
      {/* Brand Logo */}
      <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mb-10">
        <div className="w-8 h-8 rounded-full bg-sky-600 animate-pulse" />
      </div>

      {/* Main Nav */}
      <nav className="flex-1 flex flex-col gap-4">
        {topNavItems.map((item) => (
          <NavIcon key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="flex flex-col gap-4 mt-auto">
        {bottomNavItems.map((item) => (
          <NavIcon key={item.to} {...item} />
        ))}
        
        <button 
          onClick={() => {
            toast.success('Logged out successfully (Demo)', {
              style: { borderRadius: '1rem', background: '#0284c7', color: '#fff' }
            });
          }}
          className="sidebar-icon sidebar-icon-inactive mt-2"
        >
          <LogOut size={20} />
        </button>

        {/* User Profile avatar */}
        <div className="mt-4 w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden translate-y-2">
          <img 
            src="https://ui-avatars.com/api/?name=Admin&background=0284c7&color=fff" 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </aside>
  );
}
