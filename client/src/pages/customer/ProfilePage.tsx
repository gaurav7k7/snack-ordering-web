import {
  Bell,
  CreditCard,
  Eye,
  Heart,
  Lock,
  MessageSquareText,
  Package,
  Shield,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch } from '@/hooks/redux';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useGetNotificationsQuery,
  useGetOrderHistoryQuery,
  useGetProfileQuery,
  useGetRecentlyViewedQuery,
  useGetReviewHistoryQuery,
  useGetSupportTicketsQuery,
  useGetWalletQuery,
  useGetWishlistQuery,
  useUpdateAddressesMutation,
  useUpdateProfileMutation,
  useUploadProfilePictureMutation,
} from '@/redux/api/profileApi';
import { setUser } from '@/redux/slices/authSlice';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatCurrency } from '@/utils/formatCurrency';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery();
  const { data: ordersData } = useGetOrderHistoryQuery();
  const { data: wishlistData } = useGetWishlistQuery();
  const { data: walletData } = useGetWalletQuery();
  const { data: notificationsData } = useGetNotificationsQuery();
  const { data: ticketsData } = useGetSupportTicketsQuery();
  const { data: recentlyViewedData } = useGetRecentlyViewedQuery();
  const { data: reviewData } = useGetReviewHistoryQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadProfilePictureMutation();
  const [updateAddresses, { isLoading: isUpdatingAddresses }] = useUpdateAddressesMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteAccount] = useDeleteAccountMutation();
  const pushNotifications = usePushNotifications();

  const profile = profileData?.data?.user;
  const orders = ordersData?.data?.orders ?? [];
  const wishlist = wishlistData?.data?.wishlist ?? [];
  const wallet = walletData?.data?.wallet;
  const notifications = notificationsData?.data?.notifications ?? [];
  const supportTickets = ticketsData?.data?.supportTickets ?? [];
  const recentlyViewed = recentlyViewedData?.data?.recentlyViewed ?? [];
  const reviews = reviewData?.data?.reviews ?? [];

  const [profileForm, setProfileForm] = useState({ name: '', phone: '', avatar: '' });
  const [addressInput, setAddressInput] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name ?? '',
        phone: profile.phone ?? '',
        avatar: profile.avatar ?? '',
      });
    }
  }, [profile]);

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        avatar: profileForm.avatar,
      }).unwrap();
      dispatch(setUser(result.data?.user as any));
      toast.success('Profile updated.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to update profile.');
    }
  };

  const handleAvatarSave = async () => {
    try {
      const result = await uploadAvatar({ avatar: profileForm.avatar }).unwrap();
      dispatch(setUser(result.data?.user as any));
      toast.success('Avatar updated.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to update avatar.');
    }
  };

  const handleAddressSave = async () => {
    if (!addressInput.trim()) {
      toast.error('Add an address to save it.');
      return;
    }

    try {
      const nextAddresses = [...(profile?.addresses ?? []), addressInput.trim()];
      await updateAddresses({ addresses: nextAddresses }).unwrap();
      setAddressInput('');
      toast.success('Address added.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to save address.');
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password changed.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to change password.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account and keep your orders archived?')) return;

    try {
      await deleteAccount().unwrap();
      toast.success('Account deactivated.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to delete account.');
    }
  };

  return (
    <main className="bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <Helmet>
        <title>My account | SnackCo</title>
      </Helmet>

      <div className="container space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                {profile?.avatar ? (
                  <img
                    src={cldUrl(profile.avatar, 'avatar')}
                    alt={profile.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="h-8 w-8" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Account overview
                </p>
                <h1 className="text-3xl font-black">{profile?.name ?? 'Your account'}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm">
                <p className="text-muted-foreground">Verified</p>
                <p className="font-semibold">{profile?.isEmailVerified ? 'Yes' : 'Pending'}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm">
                <p className="text-muted-foreground">Wallet balance</p>
                <p className="font-semibold">
                  {wallet ? `${wallet.currency} ${wallet.balance}` : '—'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Profile details</h2>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handleProfileSave}>
              <label className="grid gap-2 text-sm">
                <span>Full name</span>
                <input
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Phone number</span>
                <input
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Avatar URL</span>
                <input
                  value={profileForm.avatar}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, avatar: event.target.value }))
                  }
                  className="rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isUpdatingProfile || isLoadingProfile}>
                  {isUpdatingProfile ? 'Saving…' : 'Save profile'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAvatarSave}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? 'Updating avatar…' : 'Save avatar'}
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Security</h2>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handlePasswordChange}>
              <label className="grid gap-2 text-sm">
                <span>Current password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>New password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                  }
                  className="rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"
                />
              </label>
              <Button type="submit" variant="outline" disabled={isChangingPassword}>
                {isChangingPassword ? 'Changing…' : 'Change password'}
              </Button>
            </form>
            <Button variant="ghost" className="mt-6 text-destructive" onClick={handleDelete}>
              Deactivate account
            </Button>
          </section>
        </div>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black">Saved addresses</h2>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="space-y-3">
              {(profile?.addresses ?? []).length ? (
                (profile?.addresses ?? []).map((address: string, index: number) => (
                  <div
                    key={`${address}-${index}`}
                    className="rounded-2xl border border-border/70 bg-background p-4 text-sm"
                  >
                    {address}
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-border/70 bg-background p-4 text-sm text-muted-foreground">
                  Add a delivery address to speed up checkout.
                </p>
              )}
            </div>
            <div className="space-y-3">
              <textarea
                value={addressInput}
                onChange={(event) => setAddressInput(event.target.value)}
                rows={4}
                placeholder="House number, street, city, pincode"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
              <Button type="button" onClick={handleAddressSave} disabled={isUpdatingAddresses}>
                {isUpdatingAddresses ? 'Saving…' : 'Add address'}
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black">Order history</h2>
              </div>
              <Link to={ROUTES.orders} className="text-sm font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {orders.length ? (
                orders.slice(0, 4).map((order: any) => (
                  <Link
                    key={order._id}
                    to={ROUTES.orderDetail(order._id)}
                    className="block rounded-2xl border border-border/70 bg-background p-4 text-sm transition hover:border-primary/50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">Order #{order.orderNumber ?? order._id?.slice(-6)}</span>
                      {order.status && <OrderStatusBadge status={order.status} />}
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {order.items?.length ?? 0} items • {formatCurrency(order.total ?? 0)}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-border/70 bg-background p-4 text-sm text-muted-foreground">
                  Your recent orders will appear here.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black">Wishlist</h2>
              </div>
              <Link to={ROUTES.wishlist} className="text-sm font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {wishlist.length ? (
                wishlist.slice(0, 4).map((item: any) => (
                  <Link
                    key={item._id}
                    to={`/products/${item.slug}`}
                    className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-3 text-sm transition hover:border-primary/50"
                  >
                    <img
                      src={cldUrl(item.images?.[0]?.url, 'avatar')}
                      alt={item.name}
                      loading="lazy"
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-muted-foreground">{formatCurrency(item.offerPrice ?? 0)}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-border/70 bg-background p-4 text-sm text-muted-foreground">
                  Save favorites from the catalog to revisit later.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Wallet & notifications</h2>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm">
                <p className="text-muted-foreground">Current balance</p>
                <p className="mt-1 text-xl font-black">
                  {wallet ? `${wallet.currency} ${wallet.balance}` : '—'}
                </p>
              </div>
              {pushNotifications.isSupported ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background p-4 text-sm">
                  <div>
                    <p className="font-semibold">Push notifications</p>
                    <p className="text-muted-foreground">
                      {pushNotifications.permission === 'granted'
                        ? 'Enabled for this browser.'
                        : pushNotifications.permission === 'denied'
                          ? 'Blocked — enable in browser settings.'
                          : 'Get order and offer alerts on this device.'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pushNotifications.permission !== 'default'}
                    onClick={() => pushNotifications.requestPermission()}
                  >
                    {pushNotifications.permission === 'granted' ? 'Enabled' : 'Enable'}
                  </Button>
                </div>
              ) : null}
              {notifications.length ? (
                notifications.slice(0, 4).map((notification: any, index: number) => (
                  <div
                    key={`${notification.message ?? 'note'}-${index}`}
                    className="rounded-2xl border border-border/70 bg-background p-4 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span>{notification.message ?? 'New update'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-border/70 bg-background p-4 text-sm text-muted-foreground">
                  You’ll receive updates about offers and delivery here.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Support & activity</h2>
            </div>
            <div className="mt-4 space-y-3">
              {supportTickets.length ? (
                supportTickets.slice(0, 4).map((ticket: any, index: number) => (
                  <div
                    key={`${ticket.subject ?? 'ticket'}-${index}`}
                    className="rounded-2xl border border-border/70 bg-background p-4 text-sm"
                  >
                    {ticket.subject ?? 'Support ticket'}
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-border/70 bg-background p-4 text-sm text-muted-foreground">
                  Contact support if you need help with an order.
                </p>
              )}
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Recently viewed</span>
                </div>
                <p className="mt-2 text-muted-foreground">
                  {recentlyViewed.length
                    ? recentlyViewed.slice(0, 3).join(', ')
                    : 'No recent views yet.'}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Reviews</span>
                </div>
                <div className="mt-2 space-y-2">
                  {reviews.length ? (
                    reviews.slice(0, 3).map((review: any) => (
                      <Link
                        key={review._id}
                        to={`/products/${review.productSlug}#reviews`}
                        className="block rounded-lg border border-border/70 bg-card px-3 py-2 transition hover:border-primary/50"
                      >
                        <p className="font-semibold">{review.productName}</p>
                        <p className="text-muted-foreground">
                          {review.rating}/5 · {review.title}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Your reviews will show up here.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
