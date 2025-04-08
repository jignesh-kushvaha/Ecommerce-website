import { Typography } from "antd";
import OrderList from "../components/orders/OrderList";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const { Title } = Typography;

const OrdersPage = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Title level={2} className="mb-6">
        Your Orders
      </Title>
      <OrderList />
    </div>
  );
};

export default OrdersPage;
