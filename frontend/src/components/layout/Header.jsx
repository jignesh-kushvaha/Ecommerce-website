import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Badge, Drawer, Button, Dropdown } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  DownOutlined,
  KeyOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getProfile } from "../../services/userService";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated) {
        try {
          const response = await getProfile();
          setName(response.data.name);
          console.log("response.data ",response.data);
          setIsAdmin(response.data.userType === "admin");
          setUserType(response.data.userType);
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      } else {
        // Reset all user data when not authenticated
        setIsAdmin(false);
        setName(null);
        setUserType(null);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    // Reset state before logging out
    setIsAdmin(false);
    setName(null);
    setUserType(null);

    logout();
    navigate("/");
  };

  const handleProductStoreClick = (e) => {
    if (isAdmin) {
      e.preventDefault();
      navigate("/admin");
    }
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
    ...(isAdmin
      ? [
          {
            key: "adminDashboard",
            label: <Link to="/admin">Admin Dashboard</Link>,
            icon: <DashboardOutlined />,
          },
        ]
      : []),
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
        <Link
          to={isAdmin ? "/admin" : "/"}
          className="text-2xl font-bold text-blue-600"
          onClick={handleProductStoreClick}
        >
          ProductStore
        </Link>

        {isAuthenticated && isAdmin && <div className="flex-grow"></div>}

        {/* For admin, only show "Hello, name" on the right */}
        {isAuthenticated && isAdmin && (
          <div className="flex items-center">
            <p className="text-gray-700">Hello, {name}</p>
          </div>
        )}

        {/* Desktop Navigation for non-admin users */}
        {!isAdmin && (
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-500">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-500">
              Products
            </Link>
            {isAuthenticated && userType === "customer" && (
              <Link to="/orders" className="text-gray-700 hover:text-blue-500">
                My Orders
              </Link>
            )}
            {isAuthenticated && userType === "customer" && (
              <Link to="/cart" className="text-gray-700 hover:text-blue-500">
                <Badge count={itemCount} showZero>
                  <ShoppingCartOutlined className="text-2xl" />
                </Badge>
              </Link>
            )}
            {isAuthenticated && userType === "customer" ? (
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
            ) : !isAuthenticated ? (
              <Link to="/login" className="text-gray-700 hover:text-blue-500">
                <UserOutlined className="mr-1" /> Login
              </Link>
            ) : null}
          </div>
        )}

        {/* Mobile menu button - don't show for admin */}
        {!isAdmin && (
          <div className="md:hidden">
            <button
              className="text-gray-700 hover:text-blue-500"
              onClick={toggleMenu}
            >
              <MenuOutlined className="text-2xl" />
            </button>
          </div>
        )}
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
          {isAuthenticated && userType === "customer" && (
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
          {isAdmin && (
            <Menu.Item
              key="admin"
              onClick={() => {
                navigate("/admin");
                toggleMenu();
              }}
            >
              <DashboardOutlined className="mr-1" /> Admin Dashboard
            </Menu.Item>
          )}
          {isAuthenticated && userType === "customer" && (
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
          {isAuthenticated && userType === "customer" ? (
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
          ) : !isAuthenticated ? (
            <Menu.Item
              key="login"
              onClick={() => {
                navigate("/login");
                toggleMenu();
              }}
            >
              Login
            </Menu.Item>
          ) : null}
        </Menu>
      </Drawer>
    </header>
  );
};

export default Header;
