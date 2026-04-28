import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="stat-card-small group">
      <div className="flex flex-col">
        <p className="text-[11px] font-bold text-[var(--brand-secondary)] uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-extrabold text-[var(--text-main)] transition-transform group-hover:scale-105 origin-left duration-300">
            {value}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trendColor} bg-white/50 px-1 rounded-full`}>
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Simple mini-graph visual flair */}
        <div className="hidden sm:flex items-end gap-[2px] h-6 px-3">
          {[40, 70, 45, 90, 65].map((h, i) => (
            <div 
              key={i} 
              className={`w-[3px] rounded-full transition-all duration-700 ${trend >= 0 ? 'bg-[var(--brand-primary)] opacity-20' : 'bg-red-400 opacity-20'}`} 
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <div className="w-10 h-10 rounded-full bg-[var(--brand-light)] flex items-center justify-center text-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all duration-300">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}
