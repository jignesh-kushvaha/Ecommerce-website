// API configuration
const API_BASE_URL = import.meta.env.API_BASE_URL || "http://localhost:3000";
const API_ENDPOINTS = {
  base: API_BASE_URL,
  api: `${API_BASE_URL}`,
};

export default API_ENDPOINTS;
