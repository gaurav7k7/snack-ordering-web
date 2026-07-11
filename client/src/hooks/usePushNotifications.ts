import { useCallback, useEffect, useState } from 'react';

const isPushSupported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

/**
 * Push-notification-ready scaffolding: requests permission and registers the
 * service worker, but there is no VAPID key / web-push backend wired up yet,
 * so no push subscription is actually created. Wire `subscribeToPush` once a
 * server endpoint exists to store subscriptions.
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    isPushSupported() ? Notification.permission : 'unsupported',
  );

  useEffect(() => {
    if (isPushSupported()) setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isPushSupported()) return 'unsupported' as const;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return {
    isSupported: isPushSupported(),
    permission,
    requestPermission,
  };
}
