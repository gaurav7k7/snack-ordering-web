import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from '@/layouts/AdminLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';

const HomePage = lazy(() => import('@/pages/customer/HomePage'));
const ProductsPage = lazy(() => import('@/pages/customer/ProductsPage'));
const CartPage = lazy(() => import('@/pages/customer/CartPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('@/pages/shared/NotFoundPage'));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="cart" element={<CartPage />} />
      </Route>

      <Route path="login" element={<LoginPage />} />

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
