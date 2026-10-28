# ربط المساعد الذكي بموقع رياحين — مجانًا (10 دقائق)

المساعد يعمل عبر «وسيط» صغير مجاني على Cloudflare يحفظ المفتاح عنده، فلا يظهر في الموقع أبدًا.
الخيار المجاني: نموذج **Gemini** من جوجل. (ويمكن لاحقًا التبديل إلى Claude بمفتاح مدفوع.)

## 1) مفتاح Gemini المجاني (لا يحتاج بطاقة)
1. افتحي https://aistudio.google.com وادخلي بحساب جوجل.
2. اضغطي **Get API key** ← **Create API key** ← انسخي المفتاح (يبدأ بـ `AIza`). **لا ترسليه لأحد.**

## 2) الوسيط على Cloudflare (مجاني)
1. افتحي https://dash.cloudflare.com وسجّلي (بريدك فقط).
2. **Workers & Pages** ← **Create** ← **Create Worker** ← الاسم: `rayaheen-ai` ← **Deploy**.
3. **Edit code** ← احذفي الكود الموجود ← الصقي محتوى ملف `worker.js` ← **Deploy**.
4. **Settings** ← **Variables and Secrets** ← **Add**:
   Type: **Secret** ← Name: `GEMINI_API_KEY` ← Value: المفتاح ← **Deploy**.
5. انسخي رابط الوسيط: `https://rayaheen-ai.xxxxx.workers.dev`
   افتحيه في المتصفح؛ يجب أن يظهر `"keySet":true,"provider":"gemini"`.

## 3) ربطه بالموقع
- رياحين بحساب الأستاذة ← **المزيد ← الإعدادات ← رابط وسيط المساعد الذكي** ← الصقي ← **حفظ**. يُنشر لجميع الطالبات تلقائيًا.
- أو أرسلي الرابط لي في المحادثة وأثبّته داخل الموقع.

## 4) قواعد Firestore (مرة واحدة)
Firebase ← Firestore ← Rules ← أضيفي داخل القواعد:
```
match /config/{id} { allow read: if signedIn(); allow write: if isTeacher(); }
```
ثم **Publish**.

## اختياري
- للتبديل إلى Claude: أضيفي Secret باسم `ANTHROPIC_API_KEY` واحذفي `GEMINI_API_KEY`.
- `MODEL` = `gemini-2.5-flash` لنموذج أحدث، `DAILY_LIMIT` = عدد الأسئلة اليومية للطالبة (25).
