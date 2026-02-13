require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bonusRoutes = require("./routes/bonus.routes");
const config = require("./config/qoyod.config");
const logger = require("./utils/logger");
const validator = require("./utils/validator");

const app = express();

// ================== Middleware ==================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.log(`${req.method} ${req.path}`);
  next();
});

// ================== Routes ==================

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎯 Qoyod Bonus System API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      calculate: "/api/bonus/calculate?year=2026&month=02",
      branch: "/api/bonus/branch/:branchName?year=2026&month=02",
      health: "/health"
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  const isApiKeyValid = validator.validateApiKey(config.apiKey);
  
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    apiKeyConfigured: isApiKeyValid,
    uptime: process.uptime()
  });
});

// Bonus routes
app.use("/api/bonus", bonusRoutes);

// ================== Error Handling ==================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "المسار غير موجود",
    path: req.path,
    availableEndpoints: [
      "/api/bonus/calculate?year=2026&month=02",
      "/api/bonus/branch/:branchName?year=2026&month=02",
      "/health"
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error("خطأ في التطبيق:", err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "حدث خطأ في الخادم",
    ...(config.nodeEnv === "development" && { stack: err.stack })
  });
});

// ================== Server Startup ==================

const startServer = () => {
  // التحقق من API Key قبل البدء
  if (!validator.validateApiKey(config.apiKey)) {
    logger.warn("⚠️  تحذير: QOYOD_API_KEY غير محدد أو غير صالح في ملف .env");
    logger.log("يرجى نسخ ملف .env.example إلى .env وإضافة المفتاح الصحيح");
  }

  app.listen(config.port, () => {
    logger.success(`🚀 الخادم يعمل على المنفذ ${config.port}`);
    logger.log(`📍 البيئة: ${config.nodeEnv}`);
    logger.log(`🔗 الرابط: http://localhost:${config.port}`);
    logger.log(`📊 API: http://localhost:${config.port}/api/bonus/calculate?year=2026&month=02`);
    console.log("\n" + "=".repeat(60) + "\n");
  });
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

module.exports = app;
