import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/userService.js";
import { Spin, Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  PlusOutlined,
  LogoutOutlined,
  EditOutlined,
  EyeOutlined,
  KeyOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Content, Sider } = Layout;

const AdminRoute = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      if (isAuthenticated && user) {
        try {
          const userData = await getProfile();
          setIsAdmin(userData.data.userType === "admin");
        } catch (error) {
          console.error("Error checking admin status:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-8">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/admin") return ["dashboard"];
    if (path === "/admin/products") return ["products"];
    if (path === "/admin/products/add") return ["add-product"];
    if (path === "/admin/users") return ["users"];
    if (path === "/admin/orders") return ["orders"];
    if (path === "/admin/profile") return ["view-profile"];
    if (path.includes("/admin/profile?tab=edit")) return ["update-profile"];
    if (path.includes("/admin/profile?tab=password"))
      return ["change-password"];
    return ["dashboard"];
  };

  return (
    <Layout style={{ minHeight: "calc(100vh - 64px)" }}>
      <Sider width={250} theme="light" className="shadow-md">
        <Menu
          mode="inline"
          selectedKeys={getSelectedKey()}
          style={{ height: "100%", borderRight: 0 }}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/admin">Dashboard</Link>
          </Menu.Item>

          <Menu.Divider />
          <Menu.ItemGroup title="Products">
            <Menu.Item key="products" icon={<ShoppingOutlined />}>
              <Link to="/admin/products">All Products</Link>
            </Menu.Item>
            <Menu.Item key="add-product" icon={<PlusOutlined />}>
              <Link to="/admin/products/add">Add Product</Link>
            </Menu.Item>
          </Menu.ItemGroup>

          <Menu.Divider />
          <Menu.ItemGroup title="Management">
            <Menu.Item key="users" icon={<TeamOutlined />}>
              <Link to="/admin/users">Users</Link>
            </Menu.Item>
            <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
              <Link to="/admin/orders">Orders</Link>
            </Menu.Item>
          </Menu.ItemGroup>

          <Menu.Divider />
          <Menu.ItemGroup title="Profile Management">
            <Menu.Item key="view-profile" icon={<EyeOutlined />}>
              <Link to="/admin/profile">View Profile</Link>
            </Menu.Item>
            <Menu.Item key="update-profile" icon={<EditOutlined />}>
              <Link to="/admin/profile?tab=edit">Update Profile</Link>
            </Menu.Item>
            <Menu.Item key="change-password" icon={<KeyOutlined />}>
              <Link to="/admin/profile?tab=password">Change Password</Link>
            </Menu.Item>
          </Menu.ItemGroup>

          <Menu.Divider />
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            onClick={() => logout()}
            className="mt-auto"
          >
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout p-0 m-0">
        <Content
          className="site-layout-background m-0 p-6"
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminRoute;
