import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

import { CHART_STATUS } from '@/constants/chartPalette';

type Notification = { type: 'warning' | 'info' | 'success'; message: string };

const ICONS = { warning: AlertTriangle, info: Info, success: CheckCircle2 };
const COLORS = { warning: CHART_STATUS.warning, info: '#2a78d6', success: CHART_STATUS.good };

export function NotificationsPanel({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="space-y-2.5">
      {notifications.map((notification, index) => {
        const Icon = ICONS[notification.type];
        return (
          <div
            key={index}
            className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-background p-3 text-sm"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: COLORS[notification.type] }} />
            <p>{notification.message}</p>
          </div>
        );
      })}
    </div>
  );
}
