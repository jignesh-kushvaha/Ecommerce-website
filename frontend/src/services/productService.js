import api from "./api";

export const getProducts = async (params = {}) => {
  try {
    const response = await api.get("/products", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createProduct = async (productData) => {
  try {
    // We need to use FormData for file uploads
    const formData = new FormData();

    // Append regular fields
    Object.keys(productData).forEach((key) => {
      if (key !== "images") {
        formData.append(key, productData[key]);
      }
    });

    // Append image files
    if (productData.images && productData.images.length) {
      productData.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    // Create a FormData object for file uploads
    const formData = new FormData();

    // Append regular fields
    Object.keys(productData).forEach((key) => {
      if (key !== "images" && key !== "newImages") {
        formData.append(key, productData[key]);
      }
    });

    // Append existing image filenames
    if (productData.images && productData.images.length) {
      // For existing images that are kept
      productData.images.forEach((filename) => {
        formData.append("existingImages", filename);
      });
    }

    // Append new image files if any
    if (productData.newImages && productData.newImages.length) {
      productData.newImages.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await api.patch(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addReview = async (productId, reviewData) => {
  try {
    const response = await api.post(
      `/products/${productId}/reviews`,
      reviewData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
