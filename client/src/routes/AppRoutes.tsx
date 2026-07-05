import { lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AdminLayout } from '@/layouts/AdminLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { PageTransition } from '@/components/shared/PageTransition';

const HomePage = lazy(() => import('@/pages/customer/HomePage'));
const ProductsPage = lazy(() => import('@/pages/customer/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/customer/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/customer/CartPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
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
        </Route>

        <Route
          path="login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />

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
