import api from "./api";

export const getProfile = async () => {
  try {
    const response = await api.get("/user/profile");

    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const updateProfile = async (userData) => {
  try {
    const formData = new FormData();

    // Add basic user data
    formData.append("name", userData.name || "");
    formData.append("phoneNumber", userData.phoneNumber || "");
    formData.append("userType", userData.userType || "customer");

    // Add address as a JSON string - this is crucial for the backend to parse correctly
    if (userData.address) {
      const addressStr = JSON.stringify(userData.address);
      formData.append("address", addressStr);
      console.log("Address being sent:", addressStr);
    }

    // Add profile image if it exists
    if (userData.profileImage instanceof File) {
      formData.append("profileImage", userData.profileImage);
    }

    // For debugging - log the form data entries
    console.log("Form data entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await api.patch("/user/update-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update profile API error:", error);
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.patch("/user/change-password", passwordData);

    return response.data;
  } catch (error) {
    console.error("Change password API error:", error);
    throw error.response?.data || { success: false, message: error.message };
  }
};
