import { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
  Inbox,
  Loader,
  Loader2,
} from 'lucide-react';
import { getBusinessInsights } from '../../api/ai';

const ICON_MAP = {
  clock: Clock,
  users: Users,
  sparkles: Sparkles,
  'alert-triangle': AlertTriangle,
  inbox: Inbox,
  loader: Loader,
};

const TYPE_STYLES = {
  warning: {
    border: 'border-amber-200',
    bg: 'bg-amber-50/60',
    icon: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  success: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/60',
    icon: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  info: {
    border: 'border-blue-200',
    bg: 'bg-blue-50/60',
    icon: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
};

/**
 * AI-powered business insights panel for the dashboard.
 * Queries the AI engine for actionable recommendations.
 */
export default function AIInsightsPanel() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getBusinessInsights();
        setInsights(res.data);
      } catch (err) {
        console.error('AI insights fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="card-premium h-full flex flex-col p-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-sky-50 to-indigo-50 border-b border-sky-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-black text-slate-900 tracking-tight">AI INTELLIGENCE</h3>
        </div>
        <span className="text-[10px] font-bold text-sky-600 bg-white px-2 py-0.5 rounded-full border border-sky-100 uppercase tracking-widest">
          Active
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          </div>
        ) : insights.length === 0 ? (
          <div className="py-12 text-center">
            <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              No new insights detected
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, idx) => {
              const Icon = ICON_MAP[insight.icon] || Sparkles;
              const style = TYPE_STYLES[insight.type] || TYPE_STYLES.info;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-4 border ${style.border} ${style.bg} transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 bg-white rounded-xl shadow-sm ${style.icon}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                          {insight.title}
                        </p>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${style.badge}`}
                        >
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {insight.message}
                      </p>
                      {insight.suggestion && (
                        <div className="mt-3 p-2.5 bg-white/60 rounded-lg border border-white/80">
                           <p className="text-[11px] text-sky-700 font-bold">
                            💡 {insight.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
