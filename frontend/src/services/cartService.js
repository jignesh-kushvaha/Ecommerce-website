import api from "./api";

export const getCart = async () => {
  try {
    const response = await api.get("/cart");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addToCart = async (variant_id, quantity) => {
  try {
    const response = await api.post("/cart", { variant_id, quantity });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCartItem = async (cart_item_id, quantity) => {
  try {
    const response = await api.patch(`/cart/${cart_item_id}`, { quantity });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const removeFromCart = async (cart_item_id) => {
  try {
    const response = await api.delete(`/cart/${cart_item_id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const clearCart = async () => {
  try {
    const response = await api.post("/cart/clear");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const validateCart = async () => {
  try {
    const response = await api.post("/cart/validate");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const mergeGuestCart = async (guestCartItems) => {
  try {
    const response = await api.post("/cart/merge-guest", { guestCartItems });
    return response.data;
  } catch (error) {
    console.error("Error merging guest cart:", error);
    throw error.response?.data || error.message;
  }
};
