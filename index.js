require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bonusRoutes = require("./routes/bonus.routes");
const config = require("./config/qoyod.config");

const app = express();

// إعدادات الأمان والاتصال
app.use(cors({
  origin: '*', // السماح للجميع مؤقتاً لضمان عمل الواجهة
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/bonus", bonusRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "Qoyod Bonus System v2.0"
  });
});

// تشغيل السيرفر
app.listen(config.port, () => {
  console.log(`✅ Server running on port ${config.port}`);
});