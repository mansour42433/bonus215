# 🎯 نظام حساب البونص من Qoyod API - Backend

نظام متكامل لحساب بونص المبيعات من واجهة Qoyod API بناءً على الفواتير والمدفوعات الشهرية.

## ✅ التصحيحات في هذه النسخة

- ✅ **تم إصلاح** `package.json` - إضافة `"start": "node index.js"`
- ✅ **تم إضافة** `"engines"` لتحديد Node.js version
- ✅ **جاهز للنشر** على Render مباشرة بدون أخطاء
- ✅ **Start Command:** `npm start` يعمل الآن بنجاح

## 📋 المميزات

✅ حساب البونص بناءً على تاريخ الدفع الفعلي  
✅ تطبيق نسب مختلفة (1% أو 2%) حسب قيمة الفاتورة  
✅ توزيع البونص حسب نسبة التحصيل الجزئي  
✅ تجميع النتائج حسب الفرع (المندوب)  
✅ معمارية MVC نظيفة وقابلة للتوسع  

## 🚀 التثبيت المحلي

```bash
# 1. فك الضغط
unzip qoyod-bonus-system-fixed.zip
cd qoyod-bonus-system-fixed

# 2. تثبيت الحزم
npm install

# 3. إعداد البيئة
cp .env.example .env
# عدّل .env وأضف QOYOD_API_KEY

# 4. التشغيل
npm start
```

## 🌐 النشر على Render.com

### الخطوة 1: رفع على GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/qoyod-bonus-backend.git
git push -u origin main
```

### الخطوة 2: إنشاء Web Service على Render

1. سجل دخول على [render.com](https://render.com)
2. **New +** → **Web Service**
3. **Connect GitHub** واختر المستودع
4. إعدادات النشر:

```
Name: qoyod-bonus-api
Region: Oregon (US West)
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm start        ← يعمل الآن! ✅
Instance Type: Free
```

### الخطوة 3: Environment Variables ⚠️ مهم جداً

اضغط **"Advanced"** وأضف:

```
Key:   QOYOD_API_KEY
Value: your_actual_qoyod_api_key_here
```

يمكنك أيضاً إضافة:
```
QOYOD_BASE_URL=https://api.qoyod.com/v1
NODE_ENV=production
```

### الخطوة 4: Deploy

اضغط **"Create Web Service"** - سيعمل بنجاح! ✅

## 📡 Endpoints

### 1. حساب البونص الشهري
```
GET /api/bonus/calculate?year=2026&month=02
```

### 2. بونص فرع معين
```
GET /api/bonus/branch/:branchName?year=2026&month=02
```

### 3. Health Check
```
GET /health
```

## 📂 هيكل المشروع

```
qoyod-bonus-system-fixed/
├── index.js                 ← نقطة الدخول ✅
├── package.json             ← محدث مع "start" script ✅
├── .env.example
├── config/
│   └── qoyod.config.js
├── services/
│   ├── qoyod.service.js
│   └── bonus.service.js
├── controllers/
│   └── bonus.controller.js
├── routes/
│   └── bonus.routes.js
└── utils/
    ├── logger.js
    └── validator.js
```

## 🐛 استكشاف الأخطاء

### ✅ تم حل: "Missing script: start"
في النسخة السابقة كان هناك خطأ، الآن تم إصلاحه!

### خطأ: "QOYOD_API_KEY غير محدد"
**الحل:** تأكد من إضافة المفتاح في Render Environment Variables

### خطأ: "Application failed to respond"
**الحل:** تحقق من صحة QOYOD_API_KEY

## 🔒 الأمان

- ✅ اسم المفتاح: **QOYOD_API_KEY** (يجب أن يكون بالضبط كما هو)
- ✅ جميع المفاتيح في Environment Variables
- ✅ .env مستبعد من Git
- ✅ CORS محمي

## 🧪 الاختبار

### محلياً:
```bash
npm start
curl http://localhost:3000/health
```

### على Render:
```bash
curl https://your-api.onrender.com/health
curl "https://your-api.onrender.com/api/bonus/calculate?year=2026&month=02"
```

## 📝 ملاحظات مهمة

⚠️ **اسم المفتاح:** `QOYOD_API_KEY` (حساس لحالة الأحرف)
⚠️ **Start Command:** `npm start` (يعمل تلقائياً الآن)
⚠️ **Node.js Version:** 18+ (محدد في package.json)

## 🔄 التحديثات

```bash
git add .
git commit -m "Update"
git push
# Render يعيد النشر تلقائياً
```

---

**النسخة المحدثة - جاهزة للنشر بدون أخطاء! ✅**
