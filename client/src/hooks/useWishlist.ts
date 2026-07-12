import { useMemo } from 'react';
import { toast } from 'react-hot-toast';

import { useAppSelector } from '@/hooks/redux';
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from '@/redux/api/profileApi';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function useWishlist() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data, isLoading } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

  const wishlist = data?.data?.wishlist ?? [];
  const wishlistIds = useMemo(() => new Set(wishlist.map((product) => product._id)), [wishlist]);

  const isWishlisted = (productId: string) => wishlistIds.has(productId);

  const toggleWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Sign in to save items to your wishlist.');
      return;
    }

    try {
      if (isWishlisted(productId)) {
        await removeFromWishlist(productId).unwrap();
        toast.success('Removed from wishlist.');
      } else {
        await addToWishlist(productId).unwrap();
        toast.success('Added to wishlist.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update your wishlist.'));
    }
  };

  return {
    wishlist,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    isLoading,
    isMutating: isAdding || isRemoving,
    count: wishlist.length,
  };
}
