import { lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AdminLayout } from '@/layouts/AdminLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { PageTransition } from '@/components/shared/PageTransition';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

const HomePage = lazy(() => import('@/pages/customer/HomePage'));
const ProductsPage = lazy(() => import('@/pages/customer/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/customer/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/customer/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/customer/OrderConfirmationPage'));
const OrdersPage = lazy(() => import('@/pages/customer/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/customer/OrderDetailPage'));
const WishlistPage = lazy(() => import('@/pages/customer/WishlistPage'));
const ProfilePage = lazy(() => import('@/pages/customer/ProfilePage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage'));
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminCouponsPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('@/pages/admin/AdminProductFormPage'));
const AdminInventoryPage = lazy(() => import('@/pages/admin/AdminInventoryPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'));
const NotFoundPage = lazy(() => import('@/pages/shared/NotFoundPage'));

export function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<CustomerLayout />}>
          <Route
            index
            element={
              <PageTransition>
                <HomePage />
              </PageTransition>
            }
          />
          <Route
            path="products"
            element={
              <PageTransition>
                <ProductsPage />
              </PageTransition>
            }
          />
          <Route
            path="products/:slug"
            element={
              <PageTransition>
                <ProductDetailPage />
              </PageTransition>
            }
          />
          <Route
            path="cart"
            element={
              <PageTransition>
                <CartPage />
              </PageTransition>
            }
          />
          <Route
            path="checkout"
            element={
              <PageTransition>
                <CheckoutPage />
              </PageTransition>
            }
          />
          <Route
            path="order-confirmation"
            element={
              <PageTransition>
                <OrderConfirmationPage />
              </PageTransition>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="profile"
              element={
                <PageTransition>
                  <ProfilePage />
                </PageTransition>
              }
            />
            <Route
              path="orders"
              element={
                <PageTransition>
                  <OrdersPage />
                </PageTransition>
              }
            />
            <Route
              path="orders/:id"
              element={
                <PageTransition>
                  <OrderDetailPage />
                </PageTransition>
              }
            />
            <Route
              path="wishlist"
              element={
                <PageTransition>
                  <WishlistPage />
                </PageTransition>
              }
            />
          </Route>
        </Route>

        <Route
          path="login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="register"
          element={
            <PageTransition>
              <RegisterPage />
            </PageTransition>
          }
        />
        <Route
          path="forgot-password"
          element={
            <PageTransition>
              <ForgotPasswordPage />
            </PageTransition>
          }
        />
        <Route
          path="reset-password"
          element={
            <PageTransition>
              <ResetPasswordPage />
            </PageTransition>
          }
        />

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <PageTransition>
                  <AdminDashboardPage />
                </PageTransition>
              }
            />
            <Route
              path="orders"
              element={
                <PageTransition>
                  <AdminOrdersPage />
                </PageTransition>
              }
            />
            <Route
              path="orders/:id"
              element={
                <PageTransition>
                  <AdminOrderDetailPage />
                </PageTransition>
              }
            />
            <Route
              path="coupons"
              element={
                <PageTransition>
                  <AdminCouponsPage />
                </PageTransition>
              }
            />
            <Route
              path="products"
              element={
                <PageTransition>
                  <AdminProductsPage />
                </PageTransition>
              }
            />
            <Route
              path="products/new"
              element={
                <PageTransition>
                  <AdminProductFormPage />
                </PageTransition>
              }
            />
            <Route
              path="products/:id/edit"
              element={
                <PageTransition>
                  <AdminProductFormPage />
                </PageTransition>
              }
            />
            <Route
              path="inventory"
              element={
                <PageTransition>
                  <AdminInventoryPage />
                </PageTransition>
              }
            />
            <Route
              path="categories"
              element={
                <PageTransition>
                  <AdminCategoriesPage />
                </PageTransition>
              }
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <PageTransition>
              <NotFoundPage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
