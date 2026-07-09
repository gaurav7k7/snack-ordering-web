import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { CHART_STATUS } from '@/constants/chartPalette';

type OrderStatusChartProps = {
  pending: number;
  delivered: number;
  cancelled: number;
  refunded: number;
};

export function OrderStatusChart({ pending, delivered, cancelled, refunded }: OrderStatusChartProps) {
  const data = [
    { name: 'Pending', value: pending, color: CHART_STATUS.warning },
    { name: 'Delivered', value: delivered, color: CHART_STATUS.good },
    { name: 'Cancelled', value: cancelled, color: CHART_STATUS.critical },
    { name: 'Refunded', value: refunded, color: CHART_STATUS.serious },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 13, fill: '#898781' }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
          <LabelList dataKey="value" position="right" style={{ fill: 'currentColor', fontSize: 13, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
