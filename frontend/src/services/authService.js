import api from "./api";

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    // Store access token in localStorage (refresh token is stored in httpOnly cookie)
    if (response.data.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.data.accessToken);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.patch(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  }
  localStorage.removeItem("accessToken");
};

export const refreshToken = async () => {
  try {
    const response = await api.post("/auth/refresh");
    if (response.data.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.data.accessToken);
    }
    return response.data;
  } catch (error) {
    localStorage.removeItem("accessToken");
    throw error.response?.data || error.message;
  }
};
