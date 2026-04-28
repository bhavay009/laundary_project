import { User, Shield, Key, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileCard() {
  const handleFeatureClick = (feature) => {
    toast.success(`${feature} module is coming soon!`, {
      icon: '🚀',
      style: { 
        borderRadius: '1rem', 
        background: '#0284c7', 
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    });
  };

  return (
    <div className="card-premium h-full flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full border-4 border-sky-100 p-1">
          <img 
            src="https://ui-avatars.com/api/?name=CleanQ+Admin&background=0284c7&color=fff&size=200" 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 right-1 w-6 h-6 bg-sky-500 border-2 border-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      </div>

      <h3 className="heading-medium">CleanQ Admin</h3>
      <p className="text-sub">admin@cleanq.laundry</p>

      <div className="grid grid-cols-3 gap-4 w-full mt-6 pb-6 border-b border-gray-50">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Orders</p>
          <p className="text-sm font-extrabold text-[var(--text-main)]">1.2k</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Clients</p>
          <p className="text-sm font-extrabold text-[var(--text-main)]">356</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Rating</p>
          <p className="text-sm font-extrabold text-[var(--text-main)]">4.9</p>
        </div>
      </div>

      <div className="w-full mt-6 space-y-3">
        <button 
          onClick={() => handleFeatureClick('Privacy Guard')}
          className="flex items-center justify-between w-full p-4 bg-[var(--bg-main)] rounded-2xl group hover:bg-[var(--brand-light)] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl text-[var(--brand-primary)] group-hover:scale-110 transition-transform">
              <Shield size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[var(--text-main)]">Privacy Guard</p>
              <p className="text-[10px] text-gray-400">Settings & Security</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={() => handleFeatureClick('Password Update')}
          className="flex items-center justify-between w-full p-4 bg-[var(--bg-main)] rounded-2xl group hover:bg-[var(--brand-light)] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl text-[var(--brand-primary)] group-hover:scale-110 transition-transform">
              <Key size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[var(--text-main)]">Change Pass</p>
              <p className="text-[10px] text-gray-400">Update credentials</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <button 
        onClick={() => handleFeatureClick('Monthly Report Generation')}
        className="mt-8 btn-premium btn-premium-primary w-full"
      >
        Generate Monthly Report
      </button>
    </div>
  );
}
