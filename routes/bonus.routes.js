const express = require("express");
const router = express.Router();
const bonusController = require("../controllers/bonus.controller");

/**
 * @route   GET /api/bonus/calculate
 * @desc    حساب البونص الشهري لجميع الفروع
 * @query   year - السنة (مثال: 2026)
 * @query   month - الشهر (1-12)
 * @example /api/bonus/calculate?year=2026&month=02
 */
router.get("/calculate", bonusController.calculateBonus.bind(bonusController));

/**
 * @route   GET /api/bonus/branch/:branchName
 * @desc    الحصول على بونص فرع معين
 * @param   branchName - اسم الفرع
 * @query   year - السنة
 * @query   month - الشهر
 * @example /api/bonus/branch/الرياض?year=2026&month=02
 */
router.get("/branch/:branchName", bonusController.getBranchBonus.bind(bonusController));

module.exports = router;
