require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bonusRoutes = require("./routes/bonus.routes");
const config = require("./config/qoyod.config");
const logger = require("./utils/logger");
const validator = require("./utils/validator");

const app = express();

// ================== Middleware ==================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://bonus215.onrender.com',
    'https://systemfff215.vercel.app',
    '*'  // للتطوير - احذفه في الإنتاج
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.log(`${req.method} ${req.path}`);
  next();
});

// ================== Routes ==================

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎯 Qoyod Bonus System API v2.0",
    version: "2.0.0",
    features: [
      "✅ حساب البونص الشهري",
      "✅ فلترة حسب المخزن/الموقع",
      "✅ دعم Ransack للبحث المتقدم",
      "✅ Qoyod API v2.0"
    ],
    timestamp: new Date().toISOString(),
    endpoints: {
      calculate: "/api/bonus/calculate?year=2026&month=02",
      calculateByInventory: "/api/bonus/calculate?year=2026&month=02&inventory_id=123",
      inventories: "/api/bonus/inventories",
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
    apiVersion: "2.0",
    apiKeyConfigured: isApiKeyValid,
    apiBaseUrl: config.baseUrl,
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
      "/api/bonus/inventories",
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
  // التحقق من API Key
  if (!validator.validateApiKey(config.apiKey)) {
    logger.warn("⚠️  تحذير: QOYOD_API_KEY غير محدد أو غير صالح");
    logger.log("يرجى إضافة المفتاح في ملف .env");
  } else {
    logger.success("✅ QOYOD_API_KEY محدد");
  }

  app.listen(config.port, () => {
    logger.success(`🚀 الخادم يعمل على المنفذ ${config.port}`);
    logger.log(`📍 البيئة: ${config.nodeEnv}`);
    logger.log(`🔗 API Version: 2.0`);
    logger.log(`🌐 Base URL: ${config.baseUrl}`);
    logger.log(`🔗 الرابط: http://localhost:${config.port}`);
    logger.log(`📊 Endpoints:`);
    logger.log(`   - GET /api/bonus/calculate?year=2026&month=02`);
    logger.log(`   - GET /api/bonus/inventories`);
    logger.log(`   - GET /health`);
    console.log("\n" + "=".repeat(60) + "\n");
  });
};

startServer();

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

module.exports = app;
