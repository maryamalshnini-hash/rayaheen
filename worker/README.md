# ربط المساعد الذكي (Claude) بموقع رياحين — 10 دقائق

المساعد يعمل عبر «وسيط» صغير مجاني على Cloudflare يحفظ مفتاح Claude عنده، فلا يظهر المفتاح في الموقع أبدًا.

## 1) مفتاح Claude
1. افتحي https://console.anthropic.com وسجّلي (بريدك).
2. Billing ← أضيفي رصيدًا (5 دولارات تكفي شهورًا لحلقة صغيرة).
3. API Keys ← Create Key ← سمّيه `rayaheen` ← انسخي المفتاح (يبدأ بـ `sk-ant-`). **لا ترسليه لأحد.**

## 2) الوسيط على Cloudflare (مجاني)
1. افتحي https://dash.cloudflare.com وسجّلي.
2. من القائمة: **Workers & Pages** ← **Create** ← **Create Worker** ← الاسم: `rayaheen-ai` ← **Deploy**.
3. اضغطي **Edit code** ← احذفي كل الكود الموجود ← الصقي محتوى ملف `worker.js` (في مجلد رياحين ← worker) ← **Deploy**.
4. ارجعي لصفحة الـ Worker ← **Settings** ← **Variables and Secrets** ← **Add**:
   - Type: **Secret** ← Name: `ANTHROPIC_API_KEY` ← Value: الصقي المفتاح ← **Deploy**.
5. انسخي رابط الوسيط من أعلى الصفحة، شكله:
   `https://rayaheen-ai.xxxxx.workers.dev`
6. للتأكد: افتحي الرابط في المتصفح؛ يجب أن يظهر `{"ok":true,...,"keySet":true}`.

## 3) ربطه بالموقع
- افتحي رياحين بحساب الأستاذة ← **المزيد ← الإعدادات ← رابط وسيط المساعد الذكي** ← الصقي الرابط ← **حفظ**.
  يُنشر تلقائيًا لجميع الطالبات.
- أو أرسلي الرابط لي في المحادثة وأثبّته داخل الموقع نفسه.

## 4) قواعد Firestore (مرة واحدة)
Firebase ← Firestore ← Rules ← أضيفي هذا السطر داخل القواعد (موجود أيضًا في firebase-rules.txt):
```
match /config/{id} { allow read: if signedIn(); allow write: if isTeacher(); }
```
ثم **Publish**.

## إعدادات اختيارية (في Variables)
- `MODEL` = `claude-sonnet-4-5` لجودة أعلى (أغلى قليلًا). الافتراضي `claude-haiku-4-5`.
- `DAILY_LIMIT` = عدد الأسئلة اليومية لكل طالبة (الافتراضي 25).
- `REQUIRE_LOGIN` = `false` للسماح بدون تسجيل دخول (غير مستحسن).
