import api from "./api";

// Get admin dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/admin/dashboard-stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all users
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get("/admin/users", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all orders (admin access)
export const getAllOrders = async (params = {}) => {
  try {
    const response = await api.get("/admin/orders", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.patch(`/orders/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
