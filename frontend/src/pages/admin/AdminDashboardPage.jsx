import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography, Spin } from "antd";
import { ShoppingOutlined, UserOutlined } from "@ant-design/icons";
import { getProducts } from "../../services/productService.js";
import { getProfile } from "../../services/userService.js";

const { Title } = Typography;

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [productsCount, setProductsCount] = useState(0);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products for count
        const productsData = await getProducts();
        setProductsCount(productsData.total);

        // Fetch admin profile
        const userData = await getProfile();
        setAdmin(userData.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
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

  return (
    <div>
      <Title level={2} className="mb-6">
        Welcome to Admin Dashboard, {admin?.name}
      </Title>

      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Products"
              value={productsCount}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Admin Role"
              value={admin?.userType}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Title level={4}>Quick Actions</Title>
        <p className="mb-2">
          Use the sidebar menu to navigate through the admin functionalities:
        </p>
        <ul className="list-disc ml-6">
          <li>View and manage all products</li>
          <li>Add new products to your inventory</li>
          <li>Update your profile information</li>
        </ul>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
