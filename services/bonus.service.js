const dayjs = require("dayjs");

class BonusService {
  /**
   * حساب نسبة البونص حسب قيمة السطر
   */
  calculateBonusPercentage(lineTotal) {
    return lineTotal >= 70 ? 0.02 : 0.01;
  }

  /**
   * حساب البونص الشهري مع دعم فلترة المخازن
   */
  calculateMonthlyBonus(invoices, payments) {
    const results = {};

    payments.forEach(payment => {
      // البحث عن الفاتورة المرتبطة
      const invoice = invoices.find(inv => inv.id === payment.invoice_id);
      if (!invoice) return;

      const invoiceTotal = invoice.total || invoice.grand_total || 0;
      const paymentRatio = invoiceTotal > 0 ? (payment.amount / invoiceTotal) : 0;
      
      // تحديد المخزن/الفرع - يدعم أسماء مختلفة
      const branch = invoice.inventory_name 
        || invoice.inventory?.name 
        || invoice.branch 
        || invoice.location 
        || "غير محدد";

      // تهيئة بيانات الفرع
      if (!results[branch]) {
        results[branch] = {
          totalSales: 0,
          totalBonus: 0,
          invoiceCount: 0,
          paymentCount: 0,
          inventoryId: invoice.inventory_id,
          details: []
        };
      }

      results[branch].paymentCount++;

      // معالجة أسطر الفاتورة
      const lines = invoice.lines || invoice.line_items || [];
      
      if (lines.length > 0) {
        lines.forEach(line => {
          // دعم أسماء حقول مختلفة
          const lineTotal = line.total 
            || line.amount 
            || line.line_total 
            || line.subtotal 
            || 0;
          
          const bonusPercent = this.calculateBonusPercentage(lineTotal);
          const fullBonus = lineTotal * bonusPercent;
          const monthBonus = fullBonus * paymentRatio;

          results[branch].totalSales += lineTotal * paymentRatio;
          results[branch].totalBonus += monthBonus;

          results[branch].details.push({
            invoiceNumber: invoice.reference 
              || invoice.number 
              || invoice.invoice_number 
              || invoice.id,
            invoiceDate: invoice.date || invoice.invoice_date,
            paymentDate: payment.date 
              || payment.payment_date 
              || payment.created_at,
            paymentAmount: parseFloat(payment.amount.toFixed(2)),
            product: line.product_name 
              || line.name 
              || line.item_name 
              || line.description 
              || "غير محدد",
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
   */
  getSummary(bonusData) {
    const branches = Object.keys(bonusData);
    const totalSales = branches.reduce((sum, branch) => sum + bonusData[branch].totalSales, 0);
    const totalBonus = branches.reduce((sum, branch) => sum + bonusData[branch].totalBonus, 0);
    const totalInvoices = branches.reduce((sum, branch) => sum + bonusData[branch].invoiceCount, 0);
    const totalPayments = branches.reduce((sum, branch) => sum + bonusData[branch].paymentCount, 0);

    return {
      totalBranches: branches.length,
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalBonus: parseFloat(totalBonus.toFixed(2)),
      totalInvoices,
      totalPayments,
      averageBonusPerInvoice: totalInvoices > 0 
        ? parseFloat((totalBonus / totalInvoices).toFixed(2))
        : 0,
      branches: branches
    };
  }
}

module.exports = new BonusService();
