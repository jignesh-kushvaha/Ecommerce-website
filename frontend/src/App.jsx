import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { MessageProvider } from "./context/MessageContext";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import UserProfilePage from "./pages/UserProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AdminAddProductPage from "./pages/admin/AdminAddProductPage";
import AdminEditProductPage from "./pages/admin/AdminEditProductPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminRoute from "./components/routing/AdminRoute";

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#3b82f6", // blue-500
        },
      }}
    >
      <Router>
        <AuthProvider>
          <CartProvider>
            <MessageProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/:id" element={<ProductDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/:id" element={<OrderDetailPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="profile" element={<UserProfilePage />} />

                  {/* Admin Routes */}
                  <Route path="admin" element={<AdminRoute />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route
                      path="products/add"
                      element={<AdminAddProductPage />}
                    />
                    <Route
                      path="products/edit/:id"
                      element={<AdminEditProductPage />}
                    />
                    <Route path="profile" element={<AdminProfilePage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                  </Route>
                </Route>
              </Routes>
            </MessageProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

export default App;
