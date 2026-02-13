# 🎯 Qoyod Bonus System v2.0 - النسخة النهائية

نظام متكامل لحساب بونص المبيعات من Qoyod API مع دعم فلترة المخازن/المواقع.

## ✅ التحديثات في هذه النسخة

### المشاكل التي تم إصلاحها:
- ❌ API Base URL كان خطأ (`/v1`) → ✅ الآن صحيح (`/2.0`)
- ❌ Endpoint للمدفوعات خطأ (`/payments`) → ✅ الآن صحيح (`/invoice_payments`)
- ❌ لا توجد فلترة حسب المخزن → ✅ دعم كامل للفلترة
- ❌ لا يستخدم Ransack → ✅ يستخدم Ransack syntax

### المميزات الجديدة:
- ✅ **فلترة حسب المخزن/الموقع** - اختر مخزن محدد أو جميع المخازن
- ✅ **Endpoint للمخازن** - `/api/bonus/inventories`
- ✅ **Ransack للبحث المتقدم** - فلترة قوية ومرنة
- ✅ **دعم أسماء حقول متعددة** - يعمل مع أي هيكل بيانات
- ✅ **Qoyod API v2.0** - حسب الوثائق الرسمية

## 🚀 التثبيت السريع

```bash
# 1. فك الضغط
unzip qoyod-bonus-final.zip
cd qoyod-bonus-final

# 2. تثبيت الحزم
npm install

# 3. إعداد البيئة
cp .env.example .env
nano .env
# أضف: QOYOD_API_KEY=your_key_here

# 4. التشغيل
npm start
```

## 📡 الـ Endpoints الجديدة

### 1. حساب البونص (جميع المخازن)
```
GET /api/bonus/calculate?year=2026&month=02
```

### 2. حساب البونص (مخزن محدد) - جديد! ✨
```
GET /api/bonus/calculate?year=2026&month=02&inventory_id=123
```

### 3. جلب قائمة المخازن - جديد! ✨
```
GET /api/bonus/inventories
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 123,
      "name": "مخزن الرياض",
      "code": "RYD",
      ...
    }
  ]
}
```

### 4. بونص فرع معين
```
GET /api/bonus/branch/الرياض?year=2026&month=02
```

### 5. Health Check
```
GET /health
```

## 🔧 كيفية عمل Ransack Filtering

### فلترة حسب التاريخ:
```
q[date_gteq]=2026-02-01    // >= تاريخ
q[date_lteq]=2026-02-29    // <= تاريخ
```

### فلترة حسب المخزن:
```
q[inventory_id_eq]=123     // = معرف المخزن
```

### مثال كامل:
```bash
curl "https://api.qoyod.com/2.0/invoices?q[date_gteq]=2026-02-01&q[date_lteq]=2026-02-29&q[inventory_id_eq]=123" \
  -H "API-KEY: your_key"
```

## 📂 هيكل المشروع

```
qoyod-bonus-final/
├── index.js                 # نقطة الدخول
├── package.json
├── .env.example
│
├── config/
│   └── qoyod.config.js     # إعدادات API v2.0
│
├── services/
│   ├── qoyod.service.js    # Qoyod API + Ransack
│   └── bonus.service.js    # منطق حساب البونص
│
├── controllers/
│   └── bonus.controller.js # معالجة الطلبات + فلترة المخازن
│
├── routes/
│   └── bonus.routes.js     # المسارات + endpoint المخازن
│
└── utils/
    ├── logger.js
    └── validator.js
```

## 🌐 النشر على Render

```bash
# 1. رفع على GitHub
git init
git add .
git commit -m "Bonus system v2.0 with inventory filtering"
git branch -M main
git remote add origin https://github.com/mansour42433/bonus215-v2.git
git push -u origin main

# 2. على Render
- New Web Service
- اختر المستودع
- Start Command: npm start
- Environment Variables:
  QOYOD_API_KEY=your_key_here
  QOYOD_BASE_URL=https://api.qoyod.com/2.0
```

## 🎨 استخدام مع Dashboard

Dashboard سيحتاج تحديث لإضافة:

### 1. Dropdown لاختيار المخزن
```javascript
// جلب المخازن
const inventories = await fetch('/api/bonus/inventories');

// عرضها في dropdown
<select onChange={(e) => setInventoryId(e.target.value)}>
  <option value="">جميع المخازن</option>
  {inventories.map(inv => (
    <option value={inv.id}>{inv.name}</option>
  ))}
</select>
```

### 2. تمرير inventory_id
```javascript
const url = inventoryId 
  ? `/api/bonus/calculate?year=${year}&month=${month}&inventory_id=${inventoryId}`
  : `/api/bonus/calculate?year=${year}&month=${month}`;
```

## 🐛 استكشاف الأخطاء

### خطأ: 404 Not Found
```
السبب: API Base URL خطأ
الحل: تأكد من QOYOD_BASE_URL=https://api.qoyod.com/2.0
```

### خطأ: 401 Unauthorized
```
السبب: API Key غير صحيح
الحل: تحقق من QOYOD_API_KEY في .env
```

### خطأ: لا توجد بيانات
```
الحل: 
1. اختبر API مباشرة:
   curl "https://api.qoyod.com/2.0/invoices" -H "API-KEY: xxx"
2. تحقق من وجود فواتير في الشهر المحدد
3. راجع Render Logs
```

## 📊 اختبار API

```bash
# 1. Health Check
curl https://bonus215.onrender.com/health

# 2. جلب المخازن
curl https://bonus215.onrender.com/api/bonus/inventories

# 3. حساب البونص
curl "https://bonus215.onrender.com/api/bonus/calculate?year=2026&month=02"

# 4. حساب البونص لمخزن محدد
curl "https://bonus215.onrender.com/api/bonus/calculate?year=2026&month=02&inventory_id=123"
```

## 🔐 الأمان

- ✅ API Key في Environment Variables
- ✅ CORS محمي
- ✅ Input validation
- ✅ Error handling شامل

## 📝 ملاحظات مهمة

### أسماء الحقول في Qoyod:
قد تختلف حسب إعداداتك:
- `inventory_name` أو `branch` أو `location`
- `line_items` أو `lines`
- `product_name` أو `name`

الكود يدعم جميع الأسماء! ✅

### Ransack Predicates:
- `_eq` = يساوي
- `_gteq` = أكبر من أو يساوي
- `_lteq` = أصغر من أو يساوي
- `_cont` = يحتوي على
- `_in` = ضمن قائمة

## 🎯 الخطوات التالية

1. ✅ **اختبر API محلياً:**
   ```bash
   npm start
   curl http://localhost:3000/health
   ```

2. ✅ **ارفع على GitHub**

3. ✅ **انشر على Render**

4. ✅ **حدّث Dashboard** لإضافة فلترة المخازن

5. ✅ **اختبر النظام الكامل**

---

**النسخة:** 2.0.0  
**آخر تحديث:** 2026-02-13  
**حالة:** ✅ جاهز للإنتاج مع دعم فلترة المخازن
