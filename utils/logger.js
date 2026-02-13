const dayjs = require("dayjs");

class Logger {
  log(message, data = null) {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    console.log(`[${timestamp}] ℹ️  ${message}`);
    if (data) console.log(data);
  }

  success(message, data = null) {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    console.log(`[${timestamp}] ✅ ${message}`);
    if (data) console.log(data);
  }

  error(message, error = null) {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    console.error(`[${timestamp}] ❌ ${message}`);
    if (error) {
      console.error(error.message);
      if (process.env.NODE_ENV === "development") {
        console.error(error.stack);
      }
    }
  }

  warn(message, data = null) {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    console.warn(`[${timestamp}] ⚠️  ${message}`);
    if (data) console.warn(data);
  }
}

module.exports = new Logger();
