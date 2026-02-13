const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

class BonusService {
  /**
   * حساب نسبة البونص بناءً على إجمالي السطر
   * @param {number} lineTotal - إجمالي السطر
   * @returns {number} نسبة البونص (0.01 أو 0.02)
   */
  calculateBonusPercentage(lineTotal) {
    return lineTotal >= 70 ? 0.02 : 0.01;
  }

  /**
   * فلترة المدفوعات حسب الشهر
   * @param {Array} payments - قائمة المدفوعات
   * @param {string|number} year - السنة
   * @param {string|number} month - الشهر
   * @returns {Array} المدفوعات المفلترة
   */
  filterPaymentsByMonth(payments, year, month) {
    const start = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf("month");
    const end = start.endOf("month");

    return payments.filter(payment => {
      const paymentDate = dayjs(payment.date);
      return paymentDate.isBetween(start, end, null, "[]");
    });
  }

  /**
   * حساب البونص الشهري
   * @param {Array} invoices - قائمة الفواتير
   * @param {Array} payments - قائمة المدفوعات
   * @param {string|number} year - السنة
   * @param {string|number} month - الشهر
   * @returns {Object} نتائج البونص مجمعة حسب الفرع
   */
  calculateMonthlyBonus(invoices, payments, year, month) {
    const filteredPayments = this.filterPaymentsByMonth(payments, year, month);
    const results = {};

    filteredPayments.forEach(payment => {
      const invoice = invoices.find(inv => inv.id === payment.invoice_id);
      if (!invoice) return;

      const invoiceTotal = invoice.total;
      const paymentRatio = payment.amount / invoiceTotal;
      const branch = invoice.branch || "غير محدد";

      // تهيئة بيانات الفرع
      if (!results[branch]) {
        results[branch] = {
          totalSales: 0,
          totalBonus: 0,
          invoiceCount: 0,
          paymentCount: 0,
          details: []
        };
      }

      results[branch].paymentCount++;

      // معالجة أسطر الفاتورة
      if (invoice.lines && invoice.lines.length > 0) {
        invoice.lines.forEach(line => {
          const lineTotal = line.total || 0;
          const bonusPercent = this.calculateBonusPercentage(lineTotal);
          const fullBonus = lineTotal * bonusPercent;
          const monthBonus = fullBonus * paymentRatio;

          results[branch].totalSales += lineTotal * paymentRatio;
          results[branch].totalBonus += monthBonus;

          results[branch].details.push({
            invoiceNumber: invoice.number,
            invoiceDate: invoice.date,
            paymentDate: payment.date,
            paymentAmount: parseFloat(payment.amount.toFixed(2)),
            product: line.name || "غير محدد",
            lineTotal: parseFloat(lineTotal.toFixed(2)),
            bonusPercent: bonusPercent * 100,
            paymentRatio: parseFloat((paymentRatio * 100).toFixed(2)),
            bonus: parseFloat(monthBonus.toFixed(2))
          });
        });
        
        results[branch].invoiceCount++;
      }
    });

    // تنسيق النتائج النهائية
    Object.keys(results).forEach(branch => {
      results[branch].totalSales = parseFloat(results[branch].totalSales.toFixed(2));
      results[branch].totalBonus = parseFloat(results[branch].totalBonus.toFixed(2));
      results[branch].averageBonus = results[branch].invoiceCount > 0 
        ? parseFloat((results[branch].totalBonus / results[branch].invoiceCount).toFixed(2))
        : 0;
    });

    return results;
  }

  /**
   * الحصول على ملخص شامل
   * @param {Object} bonusData - بيانات البونص
   * @returns {Object} ملخص إحصائي
   */
  getSummary(bonusData) {
    const branches = Object.keys(bonusData);
    const totalSales = branches.reduce((sum, branch) => sum + bonusData[branch].totalSales, 0);
    const totalBonus = branches.reduce((sum, branch) => sum + bonusData[branch].totalBonus, 0);
    const totalInvoices = branches.reduce((sum, branch) => sum + bonusData[branch].invoiceCount, 0);

    return {
      totalBranches: branches.length,
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalBonus: parseFloat(totalBonus.toFixed(2)),
      totalInvoices,
      averageBonusPerInvoice: totalInvoices > 0 
        ? parseFloat((totalBonus / totalInvoices).toFixed(2))
        : 0,
      branches: branches
    };
  }
}

module.exports = new BonusService();
