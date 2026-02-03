import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import * as authService from "../services/authService";
import { getProfile } from "../services/userService";
import { mergeGuestCart } from "../services/cartService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken);

          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            // Try to refresh token
            try {
              await authService.refreshToken();
              const newToken = localStorage.getItem("accessToken");
              const newDecoded = jwtDecode(newToken);
              setUser({ id: newDecoded.id });
            } catch (refreshError) {
              localStorage.removeItem("accessToken");
              navigate("/login");
              setLoading(false);
              return;
            }
          } else {
            // First set the basic user info
            setUser({ id: decoded.id });
          }

          try {
            const userProfile = await getProfile();
            // Store userType in user state
            setUser((prev) => ({
              ...prev,
              userType: userProfile.data.userType,
            }));

            // Check if we're on a non-admin page and user is admin, or vice versa
            const isOnAdminPage = window.location.pathname.startsWith("/admin");
            const isAdmin = userProfile.data.userType === "admin";

            // If we're at root path and user is admin, redirect to admin
            if (window.location.pathname === "/" && isAdmin) {
              navigate("/admin");
            }
            // If on other non-admin pages and user is admin
            else if (isAdmin && !isOnAdminPage) {
              navigate("/admin");
            }
            // If non-admin user tries to access admin pages
            else if (!isAdmin && isOnAdminPage) {
              navigate("/");
            }
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);
            // On error, clear user state and redirect to login
            setUser(null);
            navigate("/login");
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [navigate]);

  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await authService.register(userData);
      navigate("/login");
      return result;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await authService.login(credentials);

      if (result.data?.accessToken) {
        const decoded = jwtDecode(result.data.accessToken);
        setUser({ id: decoded.id });

        // Get user profile to check userType
        try {
          const userProfile = await getProfile();
          setUser((prev) => ({ ...prev, userType: userProfile.data.userType }));

          // Merge guest cart with user's cart after successful login
          try {
            const guestCart = localStorage.getItem("guestCart");
            if (guestCart) {
              const guestCartItems = JSON.parse(guestCart);
              if (Array.isArray(guestCartItems) && guestCartItems.length > 0) {
                await mergeGuestCart(guestCartItems);
                // Clear guest cart from localStorage after merging
                localStorage.removeItem("guestCart");
              }
            }
          } catch (cartError) {
            console.error("Error merging guest cart:", cartError);
            // Don't fail login if cart merge fails
          }

          if (userProfile.data.userType === "admin") {
            navigate("/admin"); // Redirect admin to admin dashboard
          } else {
            navigate("/"); // Redirect regular users to home page
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          navigate("/"); // Default to home page if there's an error
        }
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    navigate("/login");
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      return await authService.forgotPassword(email);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      return await authService.resetPassword(token, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
