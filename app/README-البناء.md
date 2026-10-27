# رياحين — مشروع تطبيق أندرويد وآيفون (Capacitor)

هذا المشروع يغلّف تطبيق رياحين (مجلد `www`) داخل تطبيق أصلي.

## أندرويد (APK)
1. ثبّتي Android Studio و Node.js (LTS).
2. في مجلد المشروع: `npm install` ثم `npx cap sync android`.
3. `npx cap open android` ← في Android Studio: Build ▸ Build Bundle(s)/APK(s) ▸ Build APK.
4. الملف الناتج: `android/app/build/outputs/apk/debug/app-debug.apk` — انقليه للجوال وثبّتيه (فعّلي «مصادر غير معروفة»).
   للنشر في Google Play ابني AAB موقّعًا من Build ▸ Generate Signed Bundle.

## آيفون (iOS)
1. على جهاز Mac: Xcode + Node.js. ثم `npm install` و `npx cap sync ios`.
2. `npx cap open ios` ← اختاري فريق التوقيع (Apple ID) في Signing & Capabilities، ثم شغّلي على جهازك أو ارفعي عبر TestFlight.

## تحديث التطبيق بعد أي تعديل
انسخي ملفات الويب الجديدة إلى `www/` ثم `npx cap sync`.

## ملاحظات
- أذونات الميكروفون والتعرف على الكلام مضافة في AndroidManifest.xml و Info.plist.
- التعرّف على الكلام داخل التطبيق الأصلي يعمل عبر إضافة `@capacitor-community/speech-recognition` (مدمجة).
- البديل الأسرع بلا بناء: رفع مجلد `www` على استضافة ويب وتثبيته كتطبيق من المتصفح (PWA).
