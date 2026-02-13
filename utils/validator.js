class Validator {
  /**
   * التحقق من صحة السنة والشهر
   */
  validateYearMonth(year, month) {
    if (!year || !month) {
      return {
        valid: false,
        error: "يجب تحديد السنة والشهر"
      };
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return {
        valid: false,
        error: "السنة غير صالحة (يجب أن تكون بين 2000 و 2100)"
      };
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return {
        valid: false,
        error: "الشهر غير صالح (يجب أن يكون بين 1 و 12)"
      };
    }

    return {
      valid: true,
      year: yearNum,
      month: monthNum
    };
  }

  /**
   * التحقق من صحة API Key
   */
  validateApiKey(apiKey) {
    return apiKey && typeof apiKey === "string" && apiKey.length > 10;
  }
}

module.exports = new Validator();
