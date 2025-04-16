import api from "./api";

export const getOrders = async (params = {}) => {
  try {
    const response = await api.get("/orders", { params });
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getOrder = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const placeOrder = async (orderData) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.patch(`/orders/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
