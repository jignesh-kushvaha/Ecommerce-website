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
    formData.append("email", userData.email || "");
    formData.append("phoneNumber", userData.phoneNumber || "");
    formData.append("userType", userData.userType);

    // Add address as a JSON string
    if (userData.address) {
      formData.append("address", JSON.stringify(userData.address));
    }

    // Add profile image if it exists
    if (userData.profileImage instanceof File) {
      formData.append("profileImage", userData.profileImage);
    }

    // Log the actual data being sent
    const formDataObj = {};
    for (let [key, value] of formData.entries()) {
      formDataObj[key] = value;
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
