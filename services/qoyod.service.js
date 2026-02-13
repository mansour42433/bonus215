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

    // إضافة interceptor لتسجيل الأخطاء
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error("Qoyod API Error:", {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        });
        throw error;
      }
    );
  }

  /**
   * جلب الفواتير من Qoyod
   * @param {Object} params - معاملات البحث
   * @returns {Promise<Array>} قائمة الفواتير
   */
  async fetchInvoices(params = {}) {
    try {
      const response = await this.client.get("/invoices", { params });
      return response.data;
    } catch (error) {
      throw new Error(`خطأ في جلب الفواتير: ${error.message}`);
    }
  }

  /**
   * جلب المدفوعات من Qoyod
   * @param {Object} params - معاملات البحث
   * @returns {Promise<Array>} قائمة المدفوعات
   */
  async fetchPayments(params = {}) {
    try {
      const response = await this.client.get("/payments", { params });
      return response.data;
    } catch (error) {
      throw new Error(`خطأ في جلب المدفوعات: ${error.message}`);
    }
  }

  /**
   * جلب فاتورة محددة
   * @param {string} invoiceId - معرف الفاتورة
   * @returns {Promise<Object>} بيانات الفاتورة
   */
  async fetchInvoiceById(invoiceId) {
    try {
      const response = await this.client.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw new Error(`خطأ في جلب الفاتورة ${invoiceId}: ${error.message}`);
    }
  }
}

module.exports = new QoyodService();
