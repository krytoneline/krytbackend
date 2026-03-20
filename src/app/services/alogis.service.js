const axios = require("axios");

const BASE_URL = process.env.ALOGIS_API_URL;
const EMAIL = process.env.ALOGIS_Email;
const PASSWORD = process.env.ALOGIS_Password;

let token = null;

const getToken = async () => {
  try {
    const res = await axios.post(`${BASE_URL}/login`, {
      email: EMAIL,
      password: PASSWORD,
    });

    token = res.data.token;
    console.log("✅ Token fetched successfully");
    return token;
  } catch (error) {
    console.error("❌ Error fetching token:", error.response?.data || error.message);
    throw error;
  }
};

const alogisApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

alogisApi.interceptors.request.use(
  async (config) => {
    if (!token) {
      token = await getToken(); // login call
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

module.exports = alogisApi;
