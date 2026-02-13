const qoyodService = require("../services/qoyod.service");
const bonusService = require("../services/bonus.service");

class BonusController {
  /**
   * حساب البونص الشهري
   * GET /api/bonus/calculate?year=2026&month=02
   */
  async calculateBonus(req, res) {
    try {
      const { year, month } = req.query;

      // التحقق من المدخلات
      if (!year || !month) {
        return res.status(400).json({ 
          success: false,
          error: "يجب تحديد السنة والشهر (year & month)",
          example: "/api/bonus/calculate?year=2026&month=02"
        });
      }

      // التحقق من صحة القيم
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({
          success: false,
          error: "السنة غير صالحة"
        });
      }

      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          success: false,
          error: "الشهر يجب أن يكون بين 1 و 12"
        });
      }

      console.log(`📊 جاري حساب البونص لـ: ${year}-${String(month).padStart(2, '0')}`);

      // جلب البيانات من Qoyod
      const [invoices, payments] = await Promise.all([
        qoyodService.fetchInvoices(),
        qoyodService.fetchPayments()
      ]);

      console.log(`✅ تم جلب ${invoices.length} فاتورة و ${payments.length} عملية دفع`);

      // حساب البونص
      const bonusData = bonusService.calculateMonthlyBonus(
        invoices, 
        payments, 
        year, 
        month
      );

      // الحصول على الملخص
      const summary = bonusService.getSummary(bonusData);

      res.json({
        success: true,
        period: {
          year: yearNum,
          month: monthNum,
          monthName: this.getMonthName(monthNum)
        },
        summary,
        data: bonusData
      });

    } catch (error) {
      console.error("❌ خطأ في حساب البونص:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "حدث خطأ أثناء الحساب",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  }

  /**
   * الحصول على ملخص فرع معين
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

      const [invoices, payments] = await Promise.all([
        qoyodService.fetchInvoices(),
        qoyodService.fetchPayments()
      ]);

      const bonusData = bonusService.calculateMonthlyBonus(
        invoices, 
        payments, 
        year, 
        month
      );

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
        period: `${year}-${month}`,
        data: branchData
      });

    } catch (error) {
      console.error("Error fetching branch bonus:", error);
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
