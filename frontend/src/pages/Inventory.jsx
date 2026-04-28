import { AlertTriangle, Sparkles } from 'lucide-react';
import ModuleHeader from '../components/modules/ModuleHeader';
import AnnouncementBanner from '../components/modules/AnnouncementBanner';

const garmentLoadData = [
  { id: 'G001', itemName: 'Shirt', processingCount: 24, icon: '👔' },
  { id: 'G002', itemName: 'Jeans', processingCount: 18, icon: '👖' },
  { id: 'G003', itemName: 'Bedsheet', processingCount: 36, icon: '🛏️' },
  { id: 'G004', itemName: 'Blazer', processingCount: 33, icon: '🧥' },
  { id: 'G005', itemName: 'Curtains', processingCount: 9, icon: '🪟' },
  { id: 'G006', itemName: 'Towels', processingCount: 14, icon: '🧺' },
];

function getLoadStatus(count) {
  if (count < 10) return { label: 'LOW LOAD', badgeClass: 'bg-emerald-100 text-emerald-700' };
  if (count <= 30) return { label: 'NORMAL', badgeClass: 'bg-sky-100 text-sky-700' };
  return { label: 'HIGH LOAD', badgeClass: 'bg-orange-100 text-orange-700' };
}

function InventoryRow({ item }) {
  const status = getLoadStatus(item.processingCount);
  const isHighLoad = status.label === 'HIGH LOAD';

  return (
    <tr
      className={`border-b last:border-none border-slate-100 transition-colors ${
        isHighLoad ? 'bg-orange-50/60 hover:bg-orange-50' : 'hover:bg-slate-50/60'
      }`}
    >
      <td className="py-4 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-base flex items-center justify-center">
            <span aria-hidden>{item.icon}</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{item.itemName}</p>
        </div>
      </td>
      <td className="py-4 px-3 text-sm font-semibold text-slate-700">{item.processingCount}</td>
      <td className="py-4 px-3">
        <span className={`badge-premium ${status.badgeClass}`}>{status.label}</span>
      </td>
    </tr>
  );
}

export default function Inventory() {
  const highLoadCount = garmentLoadData.filter(
    (item) => getLoadStatus(item.processingCount).label === 'HIGH LOAD'
  ).length;

  return (
    <section className="space-y-6">
      <ModuleHeader
        title="Garment Load Tracker"
        subtitle="Monitor garments currently in processing pipeline to optimize workload and prevent delays"
        rightSlot={
          <div className="rounded-2xl bg-orange-50 px-4 py-2 border border-orange-100">
            <p className="text-xs font-bold text-orange-700 flex items-center gap-2">
              <AlertTriangle size={14} />
              {highLoadCount} high load categories today
            </p>
          </div>
        }
      />

      <div className="card-premium bg-gradient-to-r from-sky-50 to-white border border-sky-100/70 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-[var(--brand-primary)]" />
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">AI Insights</h3>
        </div>
        <ul className="space-y-2">
          <li className="text-sm text-slate-700">
            Bedsheets and Blazers are experiencing high load today. Consider prioritizing these for
            faster turnaround.
          </li>
          <li className="text-sm text-slate-700">
            Shirt processing volume has increased by 20% compared to yesterday.
          </li>
          <li className="text-sm text-slate-700">
            Balanced workload observed across most garment categories outside peak segments.
          </li>
        </ul>
      </div>

      <div className="card-premium p-3 sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-bold py-3 px-3">
                  Item
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-bold py-3 px-3">
                  Items in Processing
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-bold py-3 px-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {garmentLoadData.map((item) => (
                <InventoryRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnnouncementBanner message="AI-based demand prediction and auto-scaling coming soon" />
    </section>
  );
}
