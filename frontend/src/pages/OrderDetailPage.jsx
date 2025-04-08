import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Spin,
  Alert,
  Breadcrumb,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import * as orderService from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

// Status color mapping
const statusColors = {
  Pending: "orange",
  Shipped: "blue",
  Delivered: "green",
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrder(id);
        console.log(response.data);

        if (response?.data) {
          setOrder(response.data);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        setError(err.message || "Failed to load order details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && id) {
      fetchOrder();
    }
  }, [id, isAuthenticated]);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
        <Alert
          type="error"
          message="Error"
          description={error || "Order not found"}
          showIcon
        />
        <Link to="/orders">
          <Button className="mt-4" icon={<ArrowLeftOutlined />}>
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (product) => (
        <div className="flex items-center">
          {product?.images && product.images.length > 0 && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-12 h-12 object-cover mr-3 rounded"
            />
          )}
          <div>
            <div className="font-medium">
              {product?.name || "Product Name Not Available"}
            </div>
            <div className="text-gray-500 text-sm">
              {product?.category || "Category Not Available"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "product",
      key: "price",
      render: (product) => `₹${product?.price?.toFixed(2) || "0.00"}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => quantity || 0,
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_, record) =>
        `₹${((record.product?.price || 0) * (record.quantity || 0)).toFixed(
          2
        )}`,
    },
  ];

  return (
    <div>
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Home
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/orders">
            <ShoppingOutlined /> Orders
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          Order #{order._id?.slice(-8) || "N/A"}
        </Breadcrumb.Item>
      </Breadcrumb>
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Title level={3}>Order #{order._id?.slice(-8) || "N/A"}</Title>
          <Tag
            color={statusColors[order.status] || "default"}
            className="text-base px-3 py-1"
          >
            {order.status || "Unknown"}
          </Tag>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Title level={5}>Order Information</Title>
            <Paragraph>
              <Text strong>Order Date: </Text>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "N/A"}
            </Paragraph>
            <Paragraph>
              <Text strong>Order ID: </Text>
              {order._id || "N/A"}
            </Paragraph>
          </div>

          <div>
            <Title level={5}>Shipping Information</Title>
            <Paragraph>
              <Text strong>Name: </Text>
              {order.shippingAddress?.name || "N/A"}
            </Paragraph>
            <Paragraph>
              <Text strong>Address: </Text>
              {order.shippingAddress?.address || "N/A"}
            </Paragraph>
            <Paragraph>
              <Text strong>City: </Text>
              {order.shippingAddress?.city || "N/A"}
            </Paragraph>
            <Paragraph>
              <Text strong>Postal Code: </Text>
              {order.shippingAddress?.postalCode || "N/A"}
            </Paragraph>
            <Paragraph>
              <Text strong>Country: </Text>
              {order.shippingAddress?.country || "N/A"}
            </Paragraph>
          </div>
        </div>

        <Divider />

        <Title level={5} className="mb-4">
          Order Items
        </Title>
        <Table
          dataSource={order.products || []}
          columns={columns}
          rowKey={(record) => record.product?._id || Math.random()}
          pagination={false}
        />

        <div className="mt-6 flex justify-end">
          <div className="w-full md:w-1/3">
            <div className="flex justify-between mb-2">
              <Text>Subtotal:</Text>
              <Text>₹{order.totalPrice?.toFixed(2) || "0.00"}</Text>
            </div>
            <div className="flex justify-between mb-2">
              <Text>Shipping:</Text>
              <Text>Free</Text>
            </div>
            <Divider />
            <div className="flex justify-between font-bold text-lg">
              <Text>Total:</Text>
              <Text>₹{order.totalPrice?.toFixed(2) || "0.00"}</Text>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </Button>
      </div>
    </div>
  );
};

export default OrderDetailPage;
