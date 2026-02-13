require("dotenv").config();

module.exports = {
  apiKey: process.env.QOYOD_API_KEY,
  baseUrl: process.env.QOYOD_BASE_URL || "https://api.qoyod.com/v1",
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development"
};
