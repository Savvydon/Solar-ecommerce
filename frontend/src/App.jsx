import { useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  if (isAdminRoute) return <AppRoutes />;
  return (
    <>
      <Header />
      <AppRoutes />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
