import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Shirt, Loader2 } from 'lucide-react';
import { getTopGarments } from '../../api/orders';

/**
 * Top 5 garment types chart for the dashboard.
 * Horizontal bar chart showing most-ordered garment types by quantity.
 */
export default function TopGarments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getTopGarments();
        setData(res.data);
      } catch (err) {
        console.error('Top garments fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <Shirt className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900">
          Top Garment Types
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          No data yet
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              barCategoryGap="20%"
              margin={{ left: 10, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="type"
                width={100}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val, name) => {
                  if (name === 'totalQuantity') return [val, 'Items'];
                  return [val, name];
                }}
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '0.813rem',
                }}
              />
              <Bar
                dataKey="totalQuantity"
                fill="#818cf8"
                radius={[0, 6, 6, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
