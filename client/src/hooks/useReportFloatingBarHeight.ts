import { useEffect, useRef } from 'react';

import { useAppDispatch } from '@/hooks/redux';
import { setFloatingBarHeight, type FloatingBarName } from '@/redux/slices/floatingBarsSlice';

// Lets a full-width, bottom-docked bar (compare tray, sticky add-to-cart
// bar) report its own rendered height into the shared registry so other
// fixed-position UI can reserve space instead of overlapping it. Pass
// `isVisible` through rather than conditionally calling this hook — the
// height is reported as 0 (and the bar effectively un-registers) whenever
// it's hidden or unmounts, so stale reservations never linger.
export function useReportFloatingBarHeight(name: FloatingBarName, isVisible: boolean) {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) {
      dispatch(setFloatingBarHeight({ name, height: 0 }));
      return;
    }

    const element = ref.current;
    if (!element) return;

    const report = () => dispatch(setFloatingBarHeight({ name, height: element.offsetHeight }));
    report();

    const observer = new ResizeObserver(report);
    observer.observe(element);
    return () => observer.disconnect();
  }, [dispatch, name, isVisible]);

  useEffect(() => () => {
    dispatch(setFloatingBarHeight({ name, height: 0 }));
  }, [dispatch, name]);

  return ref;
}
