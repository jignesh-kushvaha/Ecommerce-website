import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Badge, Drawer, Button, Dropdown } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  DownOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profileMenuItems = [
    {
      key: "profile",
      label: <Link to="/profile">My Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "changePassword",
      label: <Link to="/profile?tab=password">Change Password</Link>,
      icon: <KeyOutlined />,
    },
    {
      key: "divider",
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          ProductStore
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-blue-500">
            Home
          </Link>
          <Link to="/products" className="text-gray-700 hover:text-blue-500">
            Products
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className="text-gray-700 hover:text-blue-500">
              My Orders
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/cart" className="text-gray-700 hover:text-blue-500">
              <Badge count={itemCount} showZero>
                <ShoppingCartOutlined className="text-2xl" />
              </Badge>
            </Link>
          )}
          {isAuthenticated ? (
            <Dropdown
              menu={{ items: profileMenuItems }}
              placement="bottomRight"
            >
              <Button type="text" className="flex items-center">
                <UserOutlined className="text-lg mr-1" />
                My Account
                <DownOutlined className="ml-1 text-xs" />
              </Button>
            </Dropdown>
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-blue-500">
              <UserOutlined className="mr-1" /> Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            className="text-gray-700 hover:text-blue-500"
            onClick={toggleMenu}
          >
            <MenuOutlined className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={toggleMenu}
        open={menuOpen}
        styles={{ body: { padding: 0 } }}
      >
        <Menu mode="vertical">
          <Menu.Item
            key="home"
            onClick={() => {
              navigate("/");
              toggleMenu();
            }}
          >
            Home
          </Menu.Item>
          <Menu.Item
            key="products"
            onClick={() => {
              navigate("/products");
              toggleMenu();
            }}
          >
            Products
          </Menu.Item>
          {isAuthenticated && (
            <Menu.Item
              key="orders"
              onClick={() => {
                navigate("/orders");
                toggleMenu();
              }}
            >
              My Orders
            </Menu.Item>
          )}
          {isAuthenticated && (
            <Menu.Item
              key="cart"
              onClick={() => {
                navigate("/cart");
                toggleMenu();
              }}
            >
              <Badge count={itemCount} showZero>
                Cart
              </Badge>
            </Menu.Item>
          )}
          {isAuthenticated ? (
            <>
              <Menu.Item
                key="profile"
                onClick={() => {
                  navigate("/profile");
                  toggleMenu();
                }}
              >
                My Profile
              </Menu.Item>
              <Menu.Item
                key="changePassword"
                onClick={() => {
                  navigate("/profile?tab=password");
                  toggleMenu();
                }}
              >
                Change Password
              </Menu.Item>
              <Menu.Item key="logout" onClick={handleLogout}>
                Logout
              </Menu.Item>
            </>
          ) : (
            <Menu.Item
              key="login"
              onClick={() => {
                navigate("/login");
                toggleMenu();
              }}
            >
              Login
            </Menu.Item>
          )}
        </Menu>
      </Drawer>
    </header>
  );
};

export default Header;
