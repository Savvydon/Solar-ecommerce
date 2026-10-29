import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AccountPage from "../pages/AccountPage";
import AdminPage from "../admin/pages/AdminPage";
import AdminLoginPage from "../admin/pages/AdminLoginPage";
import CartPage from "../pages/CartPage";
import CategoryPage from "../pages/CategoryPage";
import CheckoutPage from "../pages/CheckoutPage";
import HomePage from "../pages/HomePage";
import { AboutPage, SolutionsPage } from "../pages/InfoPage";
import LoginPage from "../pages/LoginPage";
import PaymentReturnPage from "../pages/PaymentReturnPage";
import ProductPage from "../pages/ProductPage";
import QuotePage from "../pages/QuotePage";
import ShopPage from "../pages/ShopPage";
import LoadingState from "../components/common/LoadingState";

function ProtectedAccountRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState message="Loading account…" />;
  return user ? <AccountPage /> : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/category/:categorySlug" element={<CategoryPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/quote" element={<QuotePage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="/account" element={<ProtectedAccountRoute />} />
      <Route path="/payment/return" element={<PaymentReturnPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/solutions" element={<SolutionsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
