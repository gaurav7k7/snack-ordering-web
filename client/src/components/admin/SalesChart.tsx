import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CHART_GRID_DARK, CHART_GRID_LIGHT, CHART_SEQUENTIAL } from '@/constants/chartPalette';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatCompactNumber } from '@/utils/formatCompactNumber';

type SalesChartProps = {
  data: Array<{ date: string; revenue: number; orders: number }>;
};

function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border/70 bg-card px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold">{formatShortDate(label)}</p>
      <p className="mt-1 text-muted-foreground">
        Revenue: <span className="font-semibold text-foreground">{formatCurrency(payload[0].value)}</span>
      </p>
      <p className="text-muted-foreground">
        Orders: <span className="font-semibold text-foreground">{payload[0].payload.orders}</span>
      </p>
    </div>
  );
}

export function SalesChart({ data }: SalesChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const lineColor = isDark ? CHART_SEQUENTIAL.dark : CHART_SEQUENTIAL.light;
  const fillColor = isDark ? CHART_SEQUENTIAL.fillDark : CHART_SEQUENTIAL.fillLight;
  const gridColor = isDark ? CHART_GRID_DARK : CHART_GRID_LIGHT;
  const tickColor = '#898781';

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity={1} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fontSize: 12, fill: tickColor }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
          interval={Math.ceil(data.length / 8)}
        />
        <YAxis
          tickFormatter={(value) => formatCompactNumber(value)}
          tick={{ fontSize: 12, fill: tickColor }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: gridColor, strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={lineColor}
          strokeWidth={2}
          fill="url(#salesFill)"
          activeDot={{ r: 4, stroke: '#fcfcfb', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
