import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import * as authService from "../services/authService";
import { getProfile } from "../services/userService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);

          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            logout();
            return;
          }

          // First set the basic user info
          setUser({ id: decoded.id });

          try {
            const userProfile = await getProfile();
            // Store userType in user state
            setUser(prev => ({ ...prev, userType: userProfile.data.userType }));

            // Check if we're on a non-admin page and user is admin, or vice versa
            const isOnAdminPage = window.location.pathname.startsWith('/admin');
            const isAdmin = userProfile.data.userType === "admin";

            // If we're at root path and user is admin, redirect to admin
            if (window.location.pathname === '/' && isAdmin) {
              navigate('/admin');
            } 
            // If on other non-admin pages and user is admin
            else if (isAdmin && !isOnAdminPage) {
              navigate('/admin');
            } 
            // If non-admin user tries to access admin pages
            else if (!isAdmin && isOnAdminPage) {
              navigate('/');
            }
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);
            // On error, clear user state and redirect to login
            setUser(null);
            navigate('/login');
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
          logout(false);
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

      if (result.token) {
        const decoded = jwtDecode(result.token);
        setUser({ id: decoded.id });

        // Get user profile to check userType
        try {
          const userProfile = await getProfile();
          setUser(prev => ({ ...prev, userType: userProfile.data.userType }));
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

  const logout = (shouldRedirect = true) => {
    authService.logout();
    setUser(null);
    if (shouldRedirect) {
      navigate("/login");
    }
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
