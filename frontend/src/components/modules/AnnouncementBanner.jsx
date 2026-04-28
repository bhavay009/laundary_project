import { Sparkles } from 'lucide-react';

export default function AnnouncementBanner({ message }) {
  return (
    <div className="card-premium bg-gradient-to-r from-sky-50 to-white border border-sky-100/70 p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-sky-100 flex items-center justify-center">
          <Sparkles size={16} className="text-[var(--brand-primary)]" />
        </div>
        <p className="text-sm font-semibold text-slate-700">{message}</p>
      </div>
    </div>
  );
}
