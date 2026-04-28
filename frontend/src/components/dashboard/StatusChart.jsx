import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

const STATUS_COLORS = {
  RECEIVED: '#0284c7', /* Sky Blue */
  PROCESSING: '#c5a059', /* Muted Gold */
  READY: '#0ea5e9', /* Clear Sky */
  DELIVERED: '#cbd5e1', /* Neutral Gray */
};

const STATUS_LABELS = {
  RECEIVED: 'RECEIVED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
};

export function StatusChart({ data = {} }) {
  const chartData = Object.entries(data).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    status,
  }));

  return (
    <div className="h-full">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{
                borderRadius: '1rem',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1e293b'
              }}
            />
            <Bar dataKey="value" radius={[12, 12, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RevenueChart({ data = [] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="h-full">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
              contentStyle={{
                borderRadius: '1rem',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1e293b'
              }}
            />
            <Bar dataKey="revenue" fill="#38bdf8" radius={[12, 12, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
