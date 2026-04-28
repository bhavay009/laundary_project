import { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Shield,
  Package,
  TrendingUp,
  FileText,
  Droplets,
  ThermometerSun,
  Wind,
  Loader2,
} from 'lucide-react';
import { analyzeOrder } from '../../api/ai';

const ICON_MAP = {
  'package': Package,
  'trending-up': TrendingUp,
  'shield': Shield,
  'alert-triangle': AlertTriangle,
};

/**
 * AI Suggestions panel for order detail page.
 * Shows care instructions, anomaly flags, and AI-generated summary.
 */
export default function AISuggestions({ order }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyze = async () => {
      setLoading(true);
      try {
        const res = await analyzeOrder({
          garments: order.garments,
          customerName: order.customerName,
          phoneNumber: order.phoneNumber,
          notes: order.notes,
          totalBill: order.totalBill,
        });
        setAnalysis(res.data);
      } catch (err) {
        console.error('AI analysis failed:', err);
      } finally {
        setLoading(false);
      }
    };
    if (order) analyze();
  }, [order]);

  if (loading) {
    return (
      <div className="card p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-gray-900">AI Analysis</h3>
          <span className="text-[10px] font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full">
            Analyzing...
          </span>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-brand-50 to-purple-50 border-b border-brand-100/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-900">AI Intelligence Report</h3>
          <span className="text-[10px] font-medium text-brand-600 bg-white/80 px-1.5 py-0.5 rounded-full border border-brand-100">
            Powered by CleanQ AI
          </span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* AI Summary */}
        {analysis.summary && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Order Summary
              </h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
              {analysis.summary}
            </p>
          </div>
        )}

        {/* Anomaly Flags */}
        {analysis.anomalies?.flags?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Smart Alerts ({analysis.anomalies.totalFlags})
              </h4>
            </div>
            <div className="space-y-2">
              {analysis.anomalies.flags.map((flag, idx) => {
                const FlagIcon = ICON_MAP[flag.icon] || AlertTriangle;
                return (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 border ${
                      flag.type === 'warning'
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-blue-50/50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <FlagIcon
                        className={`w-4 h-4 mt-0.5 ${
                          flag.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {flag.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">{flag.message}</p>
                        {flag.suggestion && (
                          <p className="text-xs text-brand-600 mt-1 font-medium">
                            💡 {flag.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Care Instructions */}
        {analysis.careInstructions?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-3.5 h-3.5 text-gray-400" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Care Instructions
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.careInstructions.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg p-3 bg-gray-50 border border-gray-100 text-xs"
                >
                  <p className="font-semibold text-gray-900 mb-1.5">{item.type}</p>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex items-start gap-1.5">
                      <Droplets className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{item.care.wash}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Wind className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{item.care.dry}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <ThermometerSun className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>{item.care.iron}</span>
                    </div>
                    {item.care.special && (
                      <p className="text-amber-600 font-medium mt-1">
                        ⚠ {item.care.special}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Estimate */}
        {analysis.deliveryEstimate && (
          <div className="bg-brand-50/50 rounded-lg p-3 border border-brand-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              AI Delivery Prediction
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-bold text-brand-600">
                {analysis.deliveryEstimate.estimatedDays} business days
              </span>
              {' '}— {analysis.deliveryEstimate.reason}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Confidence: {Math.round(analysis.deliveryEstimate.confidence * 100)}%
              · {analysis.deliveryEstimate.currentPendingOrders} orders in queue
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
