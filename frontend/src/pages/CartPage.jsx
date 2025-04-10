import { Button, Empty, Divider, Typography, Alert } from "antd";
import { ShoppingCartOutlined, CreditCardOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/orders/CartItem";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const { Title } = Typography;

const CartPage = () => {
  const { cart, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login if user is not authenticated
      navigate("/login");
      return;
    }

    // Proceed to checkout
    navigate("/checkout");
  };

  return (
    <div>
      <Title level={2} className="mb-6">
        <ShoppingCartOutlined className="mr-2" />
        Your Shopping Cart
      </Title>

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <Empty
            description="Your cart is empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Link to="/products">
            <Button type="primary" className="mt-4 px-6">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cart.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-md shadow-sm">
              <Title level={4} className="mb-4">
                Order Summary
              </Title>

              <div className="flex justify-between mb-2">
                <span>
                  Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items)
                </span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <Divider />

              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">₹{total.toFixed(2)}</span>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<CreditCardOutlined />}
                block
                onClick={handleCheckout}
                className="mb-4 h-12 text-base font-medium shadow-md hover:shadow-lg"
              >
                Proceed to Checkout
              </Button>

              <Button
                type="default"
                danger
                block
                onClick={clearCart}
                className="border border-red-400 hover:bg-red-50"
              >
                Clear Cart
              </Button>

              {!isAuthenticated && (
                <Alert
                  message="Login Required"
                  description="Please log in to complete your purchase."
                  type="info"
                  showIcon
                  className="mt-4"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
