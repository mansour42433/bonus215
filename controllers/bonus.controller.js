const qoyodService = require("../services/qoyod.service");
const bonusService = require("../services/bonus.service");

class BonusController {
  async calculateBonus(req, res) {
    try {
      const { year, month, inventory_id } = req.query;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          error: "يجب تحديد السنة والشهر (year & month)"
        });
      }

      console.log(`🚀 بدء حساب البونص لـ ${year}-${month}`);

      // جلب البيانات بالتوازي مع تمرير التاريخ للفلترة
      const [invoices, payments] = await Promise.all([
        qoyodService.fetchInvoices(year, month),
        qoyodService.fetchPayments(year, month)
      ]);

      console.log(`✅ تم جلب ${invoices.length} فاتورة و ${payments.length} عملية دفع`);

      // حساب البونص
      const result = bonusService.calculateMonthlyBonus(
        invoices,
        payments,
        year,
        month,
        inventory_id
      );

      res.json({
        success: true,
        period: `${year}-${month}`,
        inventory_filter: inventory_id || "الكل",
        data: result
      });

    } catch (error) {
      console.error("🔥 خطأ في النظام:", error);
      res.status(500).json({
        success: false,
        error: error.message || "حدث خطأ أثناء الحساب"
      });
    }
  }

  async getInventories(req, res) {
    try {
      const inventories = await qoyodService.fetchInventories();
      res.json({ success: true, count: inventories.length, data: inventories });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new BonusController();