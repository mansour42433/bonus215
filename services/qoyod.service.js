const axios = require("axios");
const config = require("../config/qoyod.config");

class QoyodService {
  constructor() {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        "API-KEY": config.apiKey,
        "Content-Type": "application/json"
      },
      timeout: 30000
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error("❌ Qoyod API Error:", {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }
    );
  }

  /**
   * جلب الفواتير مع الفلترة
   * @param {Object} filters - معاملات Ransack
   */
  async fetchInvoices(filters = {}) {
    try {
      const response = await this.client.get("/invoices", { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(`خطأ في جلب الفواتير: ${error.message}`);
    }
  }

  /**
   * جلب المدفوعات - الـ endpoint الصحيح
   * @param {Object} filters - معاملات Ransack
   */
  async fetchInvoicePayments(filters = {}) {
    try {
      const response = await this.client.get("/invoice_payments", { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(`خطأ في جلب المدفوعات: ${error.message}`);
    }
  }

  /**
   * جلب المخازن/المواقع
   */
  async fetchInventories() {
    try {
      const response = await this.client.get("/inventories");
      return response.data;
    } catch (error) {
      throw new Error(`خطأ في جلب المخازن: ${error.message}`);
    }
  }

  /**
   * جلب فاتورة محددة مع التفاصيل
   */
  async fetchInvoiceById(invoiceId) {
    try {
      const response = await this.client.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw new Error(`خطأ في جلب الفاتورة: ${error.message}`);
    }
  }

  /**
   * بناء Ransack query للفلترة حسب التاريخ
   * Ransack syntax: q[field_predicate]=value
   */
  buildDateRangeQuery(year, month) {
    const paddedMonth = String(month).padStart(2, '0');
    const start = `${year}-${paddedMonth}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${paddedMonth}-${lastDay}`;

    return {
      'q[date_gteq]': start,  // >= تاريخ البداية
      'q[date_lteq]': end     // <= تاريخ النهاية
    };
  }

  /**
   * بناء Ransack query للفلترة حسب المخزن
   */
  buildInventoryQuery(inventoryId) {
    return {
      'q[inventory_id_eq]': inventoryId
    };
  }

  /**
   * فلترة المدفوعات حسب تاريخ الدفع
   */
  buildPaymentDateQuery(year, month) {
    const paddedMonth = String(month).padStart(2, '0');
    const start = `${year}-${paddedMonth}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${paddedMonth}-${lastDay}`;

    return {
      'q[payment_date_gteq]': start,
      'q[payment_date_lteq]': end
    };
  }
}

module.exports = new QoyodService();
