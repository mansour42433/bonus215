// services/qoyod.service.js
const axios = require("axios");
const config = require("../config/qoyod.config");
const dayjs = require("dayjs");

class QoyodService {
  constructor() {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 120000, // زيادة المهلة إلى دقيقتين
      headers: {
        "API-KEY": config.apiKey,
        "Content-Type": "application/json"
      }
    });
  }

  /**
   * جلب الفواتير مع فلترة التاريخ (آخر 3 شهور فقط لتفادي Timeout)
   */
  async fetchInvoices(year, month) {
    try {
      // نحدد نطاق 3 شهور (الشهر الحالي + شهرين سابقين)
      // مثال: لو نحسب بونص شهر 2، نجلب فواتير شهر 12 و 1 و 2
      const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
      const startDate = dayjs(`${year}-${month}-01`).subtract(2, 'month').startOf('month').format('YYYY-MM-DD');

      console.log(`📥 جلب الفواتير من ${startDate} إلى ${endDate}...`);

      const response = await this.client.get("/invoices", {
        params: {
          "q[date_gteq]": startDate, // أكبر من أو يساوي البداية
          "q[date_lteq]": endDate,   // أصغر من أو يساوي النهاية
          "per_page": 1000           // محاولة جلب أكبر عدد ممكن في صفحة واحدة
        }
      });
      return response.data.invoices || [];
    } catch (error) {
      console.error("خطأ في جلب الفواتير:", error.message);
      throw error;
    }
  }

  /**
   * جلب المدفوعات للشهر المحدد فقط
   */
  async fetchPayments(year, month) {
    try {
      // المدفوعات نجلبها لنفس الشهر المحدد بالضبط
      const startDate = dayjs(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
      const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');

      console.log(`📥 جلب المدفوعات من ${startDate} إلى ${endDate}...`);

      const response = await this.client.get("/invoice_payments", {
        params: {
          "q[date_gteq]": startDate,
          "q[date_lteq]": endDate,
          "per_page": 1000
        }
      });
      return response.data.invoice_payments || [];
    } catch (error) {
      console.error("خطأ في جلب المدفوعات:", error.message);
      throw error;
    }
  }

  /**
   * جلب قائمة المخازن
   */
  async fetchInventories() {
    try {
      const response = await this.client.get("/inventories");
      return response.data.inventories || [];
    } catch (error) {
      console.error("خطأ في جلب المخازن:", error.message);
      return [];
    }
  }
}

module.exports = new QoyodService();