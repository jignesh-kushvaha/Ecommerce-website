import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Table,
  Tag,
  Divider,
  Progress,
  List,
  Avatar,
  Badge,
} from "antd";
import {
  ShoppingOutlined,
  UserOutlined,
  StarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { getProducts } from "../../services/productService.js";
import { getProfile } from "../../services/userService.js";
import {
  getDashboardStats,
  getAllOrders,
} from "../../services/adminService.js";

const { Title, Text } = Typography;

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [productsCount, setProductsCount] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [admin, setAdmin] = useState(null);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch admin dashboard statistics
        const statsData = await getDashboardStats();
        const { data } = statsData;

        // Set counts
        setProductsCount(data.counts.totalProducts);
        setTotalCustomers(data.counts.totalCustomers);

        // Set order statistics
        setOrderStats({
          total: data.counts.totalOrders,
          pending: data.orderStatus.pending,
          processing: data.orderStatus.processing,
          shipped: data.orderStatus.shipped,
          delivered: data.orderStatus.delivered,
          cancelled: data.orderStatus.cancelled,
        });

        // Set product data
        setTopProducts(data.topRatedProducts);
        setInventoryAlerts(data.lowStockProducts);

        // Set recent orders
        setRecentOrders(data.recentOrders);

        // Fetch admin profile
        const userData = await getProfile();
        setAdmin(userData.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        // Fallback to original implementation if the admin API fails
        fallbackFetchData();
      } finally {
        setLoading(false);
      }
    };

    const fallbackFetchData = async () => {
      try {
        // Fetch products for count and inventory data
        const productsData = await getProducts({ limit: 100 });
        setProductsCount(productsData.total);

        // Process products for inventory alerts and top products by avgRating
        const productsWithLowStock = productsData.data
          .filter((product) => product.stock < 10)
          .slice(0, 5);
        setInventoryAlerts(productsWithLowStock);

        const topRatedProducts = [...productsData.data]
          .sort((a, b) => {
            const ratingA = a.avgRating || 0;
            const ratingB = b.avgRating || 0;
            return ratingB - ratingA;
          })
          .slice(0, 5);
        setTopProducts(topRatedProducts);

        // Fetch orders for statistics
        const ordersData = await getAllOrders();
        const orders = ordersData.data || [];

        // Calculate order statistics
        const stats = {
          total: orders.length,
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        };

        orders.forEach((order) => {
          // Count by status
          if (order.status) {
            stats[order.status.toLowerCase()] =
              (stats[order.status.toLowerCase()] || 0) + 1;
          }
        });

        setOrderStats(stats);

        // Get recent orders
        const recent = [...orders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentOrders(recent);

        // Fetch admin profile
        const userData = await getProfile();
        setAdmin(userData.data);
      } catch (error) {
        console.error("Error in fallback fetch:", error);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-8">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // Order status column renderer with color-coded tags
  const renderOrderStatus = (status) => {
    let color = "default";

    switch (status?.toLowerCase()) {
      case "pending":
        color = "gold";
        break;
      case "processing":
        color = "blue";
        break;
      case "shipped":
        color = "cyan";
        break;
      case "delivered":
        color = "green";
        break;
      case "cancelled":
        color = "red";
        break;
      default:
        color = "default";
    }

    return <Tag color={color}>{status}</Tag>;
  };

  const recentOrdersColumns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "id",
      render: (id) => <Text ellipsis>{id}</Text>,
    },
    {
      title: "Customer",
      dataIndex: "userId",
      key: "user",
      render: (user) => user?.name || "Anonymous",
    },
    {
      title: "Amount",
      dataIndex: "totalPrice",
      key: "amount",
      render: (amount) => `₹${amount?.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderOrderStatus,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  // Calculate percentage for order status
  const getOrderStatusPercentage = (status) => {
    return orderStats.total > 0
      ? Math.round((orderStats[status.toLowerCase()] / orderStats.total) * 100)
      : 0;
  };

  return (
    <div className="admin-dashboard">
      <Title level={2} className="mb-6">
        Welcome to Admin Dashboard, {admin?.name}
      </Title>

      {/* Top Stats Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Products"
              value={productsCount}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Orders"
              value={orderStats.total}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Customers"
              value={totalCustomers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Admin Role"
              value={admin?.userType}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#fa541c" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Status Distribution */}
      <Card title="Order Status Distribution" className="mb-8 shadow-sm">
        <Row gutter={[16, 24]}>
          <Col xs={24} md={8}>
            <Card className="statistic-card border-0">
              <Progress
                type="circle"
                percent={getOrderStatusPercentage("pending")}
                format={() => orderStats.pending}
                strokeColor="#faad14"
              />
              <div className="mt-3">
                <Text strong>Pending Orders</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="statistic-card border-0">
              <Progress
                type="circle"
                percent={getOrderStatusPercentage("processing")}
                format={() => orderStats.processing}
                strokeColor="#1890ff"
              />
              <div className="mt-3">
                <Text strong>Processing Orders</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="statistic-card border-0">
              <Progress
                type="circle"
                percent={getOrderStatusPercentage("delivered")}
                format={() => orderStats.delivered}
                strokeColor="#52c41a"
              />
              <div className="mt-3">
                <Text strong>Delivered Orders</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Recent Orders & Top Products */}
      <Row gutter={16} className="mb-8">
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center">
                <ClockCircleOutlined className="mr-2" />
                <span>Recent Orders</span>
              </div>
            }
            className="shadow-sm h-full"
          >
            <Table
              dataSource={recentOrders}
              columns={recentOrdersColumns}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center">
                <StarOutlined className="mr-2" />
                <span>Top Rated Products</span>
              </div>
            }
            className="shadow-sm h-full"
          >
            <List
              dataSource={topProducts}
              renderItem={(product) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      product.image ? (
                        <Avatar
                          src={`/backend/public/${product.image}`}
                          shape="square"
                        />
                      ) : (
                        <Avatar icon={<ShoppingOutlined />} shape="square" />
                      )
                    }
                    title={product.name}
                    description={
                      <div>
                        <Text className="text-yellow-500">
                          {Array(5)
                            .fill()
                            .map((_, i) => (
                              <StarOutlined
                                key={i}
                                style={{
                                  color:
                                    i < Math.round(product.avgRating || 0)
                                      ? "#faad14"
                                      : "#d9d9d9",
                                }}
                              />
                            ))}{" "}
                          {product.avgRating?.toFixed(1) || "No ratings"}
                        </Text>
                        <div>Price: ₹{product.price?.toFixed(2)}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Inventory Alerts */}
      <Card
        title={
          <div className="flex items-center">
            <Badge status="error" />
            <span className="ml-2">Inventory Alerts</span>
          </div>
        }
        className="shadow-sm mb-8"
      >
        {inventoryAlerts.length > 0 ? (
          <List
            dataSource={inventoryAlerts}
            renderItem={(product) => (
              <List.Item
                actions={[
                  <Tag color={product.stock === 0 ? "red" : "orange"}>
                    {product.stock === 0
                      ? "Out of Stock"
                      : `Low Stock: ${product.stock}`}
                  </Tag>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    product.image ? (
                      <Avatar
                        src={`/backend/public/${product.image}`}
                        shape="square"
                      />
                    ) : (
                      <Avatar icon={<ShoppingOutlined />} shape="square" />
                    )
                  }
                  title={product.name}
                  description={`Price: ₹${product.price?.toFixed(2)}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center py-4">
            <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a" }} />
            <p className="mt-2">All products have sufficient inventory.</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card
        title={
          <div className="flex items-center">
            <RiseOutlined className="mr-2" />
            <span>Quick Actions</span>
          </div>
        }
        className="shadow-sm"
      >
        <p className="mb-2">
          Use the sidebar menu to navigate through the admin functionalities:
        </p>
        <ul className="list-disc ml-6">
          <li>View and manage all products</li>
          <li>Add new products to your inventory</li>
          <li>Update your profile information</li>
          <li>Change your password</li>
        </ul>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
