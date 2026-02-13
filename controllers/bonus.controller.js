const qoyodService = require("../services/qoyod.service");
const bonusService = require("../services/bonus.service");

class BonusController {
  /**
   * حساب البونص الشهري مع فلترة اختيارية حسب المخزن
   * GET /api/bonus/calculate?year=2026&month=02&inventory_id=123
   */
  async calculateBonus(req, res) {
    try {
      const { year, month, inventory_id } = req.query;

      // التحقق من المدخلات
      if (!year || !month) {
        return res.status(400).json({ 
          success: false,
          error: "يجب تحديد السنة والشهر (year & month)",
          example: "/api/bonus/calculate?year=2026&month=02"
        });
      }

      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({ success: false, error: "السنة غير صالحة" });
      }

      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ success: false, error: "الشهر يجب أن يكون بين 1 و 12" });
      }

      console.log(`📊 حساب البونص: ${year}-${String(month).padStart(2, '0')}${inventory_id ? ` - مخزن: ${inventory_id}` : ' - جميع المخازن'}`);

      // بناء queries للفلترة
      const dateQuery = qoyodService.buildDateRangeQuery(yearNum, monthNum);
      const paymentDateQuery = qoyodService.buildPaymentDateQuery(yearNum, monthNum);
      
      // إضافة فلتر المخزن إن وُجد
      const invoiceQuery = inventory_id 
        ? { ...dateQuery, ...qoyodService.buildInventoryQuery(inventory_id) }
        : dateQuery;

      // جلب البيانات
      const [invoices, payments] = await Promise.all([
        qoyodService.fetchInvoices(invoiceQuery),
        qoyodService.fetchInvoicePayments(paymentDateQuery)
      ]);

      console.log(`✅ تم جلب ${invoices.length} فاتورة و ${payments.length} عملية دفع`);

      // حساب البونص
      const bonusData = bonusService.calculateMonthlyBonus(invoices, payments);
      const summary = bonusService.getSummary(bonusData);

      res.json({
        success: true,
        period: {
          year: yearNum,
          month: monthNum,
          monthName: this.getMonthName(monthNum)
        },
        filter: inventory_id ? { inventory_id } : null,
        summary,
        data: bonusData
      });

    } catch (error) {
      console.error("❌ خطأ في حساب البونص:", error);
      res.status(500).json({ 
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  }

  /**
   * جلب قائمة المخازن/المواقع
   * GET /api/bonus/inventories
   */
  async getInventories(req, res) {
    try {
      console.log("📦 جلب قائمة المخازن...");
      
      const inventories = await qoyodService.fetchInventories();
      
      console.log(`✅ تم جلب ${inventories.length} مخزن`);
      
      res.json({
        success: true,
        count: inventories.length,
        data: inventories
      });

    } catch (error) {
      console.error("❌ خطأ في جلب المخازن:", error);
      res.status(500).json({ 
        success: false,
        error: error.message
      });
    }
  }

  /**
   * الحصول على بونص فرع/مخزن معين
   * GET /api/bonus/branch/:branchName?year=2026&month=02
   */
  async getBranchBonus(req, res) {
    try {
      const { branchName } = req.params;
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({ 
          success: false,
          error: "يجب تحديد السنة والشهر"
        });
      }

      const dateQuery = qoyodService.buildDateRangeQuery(year, month);
      const paymentDateQuery = qoyodService.buildPaymentDateQuery(year, month);

      const [invoices, payments] = await Promise.all([
        qoyodService.fetchInvoices(dateQuery),
        qoyodService.fetchInvoicePayments(paymentDateQuery)
      ]);

      const bonusData = bonusService.calculateMonthlyBonus(invoices, payments);
      const branchData = bonusData[branchName];

      if (!branchData) {
        return res.status(404).json({
          success: false,
          error: `الفرع "${branchName}" غير موجود`,
          availableBranches: Object.keys(bonusData)
        });
      }

      res.json({
        success: true,
        branch: branchName,
        period: { year, month, monthName: this.getMonthName(parseInt(month)) },
        data: branchData
      });

    } catch (error) {
      console.error("❌ خطأ في جلب بونص الفرع:", error);
      res.status(500).json({ 
        success: false,
        error: error.message
      });
    }
  }

  /**
   * الحصول على اسم الشهر بالعربية
   */
  getMonthName(month) {
    const months = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    return months[month - 1] || "";
  }
}

module.exports = new BonusController();
