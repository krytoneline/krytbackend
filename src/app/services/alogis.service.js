const axios = require("axios");

const BASE_URL = process.env.ALOGIS_API_URL;
const TOKEN = process.env.ALOGIS_BEARER_TOKEN;

const alogisApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

module.exports = alogisApi;
