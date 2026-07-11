import { toast } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearCompare, MAX_COMPARE_ITEMS, removeFromCompare, toggleCompare } from '@/redux/slices/compareSlice';

export function useCompare() {
  const dispatch = useAppDispatch();
  const productIds = useAppSelector((state) => state.compare.productIds);

  const isComparing = (productId: string) => productIds.includes(productId);

  const toggle = (productId: string) => {
    if (!isComparing(productId) && productIds.length >= MAX_COMPARE_ITEMS) {
      toast.error(`You can compare up to ${MAX_COMPARE_ITEMS} products at a time.`);
      return;
    }
    dispatch(toggleCompare(productId));
  };

  return {
    productIds,
    count: productIds.length,
    isComparing,
    toggle,
    remove: (productId: string) => dispatch(removeFromCompare(productId)),
    clear: () => dispatch(clearCompare()),
  };
}
