import { lazy, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AdminLayout } from '@/layouts/AdminLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { PageTransition } from '@/components/shared/PageTransition';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { initAnalytics, trackPageView } from '@/utils/analytics';

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
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const VerifyRegistrationOtpPage = lazy(() => import('@/pages/auth/VerifyRegistrationOtpPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage'));
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminCouponsPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('@/pages/admin/AdminProductFormPage'));
const AdminInventoryPage = lazy(() => import('@/pages/admin/AdminInventoryPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'));
const AdminCustomerDetailPage = lazy(() => import('@/pages/admin/AdminCustomerDetailPage'));
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage'));
const AdminNewsletterPage = lazy(() => import('@/pages/admin/AdminNewsletterPage'));
const NotFoundPage = lazy(() => import('@/pages/shared/NotFoundPage'));
const AboutPage = lazy(() => import('@/pages/static/AboutPage'));
const ContactPage = lazy(() => import('@/pages/static/ContactPage'));
const FaqPage = lazy(() => import('@/pages/static/FaqPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/static/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@/pages/static/TermsPage'));
const RefundPolicyPage = lazy(() => import('@/pages/static/RefundPolicyPage'));
const ShippingPolicyPage = lazy(() => import('@/pages/static/ShippingPolicyPage'));
const CareersPage = lazy(() => import('@/pages/static/CareersPage'));
const BlogPage = lazy(() => import('@/pages/static/BlogPage'));
const ComparePage = lazy(() => import('@/pages/customer/ComparePage'));

export function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // React Router doesn't reset scroll position on navigation the way a full
  // page load does — without this, opening a product from partway down a
  // scrolled listing/search-results page lands the new page mid-scroll too.
  // Keyed on pathname only (not search) so filtering/sorting within the same
  // page doesn't yank the user back to the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
          <Route
            path="compare"
            element={
              <PageTransition>
                <ComparePage />
              </PageTransition>
            }
          />
          <Route
            path="about"
            element={
              <PageTransition>
                <AboutPage />
              </PageTransition>
            }
          />
          <Route
            path="contact"
            element={
              <PageTransition>
                <ContactPage />
              </PageTransition>
            }
          />
          <Route
            path="faq"
            element={
              <PageTransition>
                <FaqPage />
              </PageTransition>
            }
          />
          <Route
            path="privacy"
            element={
              <PageTransition>
                <PrivacyPolicyPage />
              </PageTransition>
            }
          />
          <Route
            path="terms"
            element={
              <PageTransition>
                <TermsPage />
              </PageTransition>
            }
          />
          <Route
            path="refund-policy"
            element={
              <PageTransition>
                <RefundPolicyPage />
              </PageTransition>
            }
          />
          <Route
            path="shipping-policy"
            element={
              <PageTransition>
                <ShippingPolicyPage />
              </PageTransition>
            }
          />
          <Route
            path="careers"
            element={
              <PageTransition>
                <CareersPage />
              </PageTransition>
            }
          />
          <Route
            path="blog"
            element={
              <PageTransition>
                <BlogPage />
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
        <Route
          path="verify-email"
          element={
            <PageTransition>
              <VerifyEmailPage />
            </PageTransition>
          }
        />
        <Route
          path="verify-registration"
          element={
            <PageTransition>
              <VerifyRegistrationOtpPage />
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
            <Route
              path="customers"
              element={
                <PageTransition>
                  <AdminCustomersPage />
                </PageTransition>
              }
            />
            <Route
              path="customers/:id"
              element={
                <PageTransition>
                  <AdminCustomerDetailPage />
                </PageTransition>
              }
            />
            <Route
              path="reviews"
              element={
                <PageTransition>
                  <AdminReviewsPage />
                </PageTransition>
              }
            />
            <Route
              path="newsletter"
              element={
                <PageTransition>
                  <AdminNewsletterPage />
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
