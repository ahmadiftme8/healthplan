# مسیر وزن‌گیری من

یک داشبورد فارسی و موبایل‌پسند برای ثبت وعده‌ها، تمرین‌ها، وزن و یادداشت‌های روزانه.

## اجرا

فقط `index.html` را در مرورگر باز کن یا این پوشه را روی GitHub Pages / Vercel منتشر کن.

## ذخیره‌سازی

داده‌ها در `localStorage` مرورگر ذخیره می‌شوند؛ پس روی همان دستگاه و همان مرورگر باقی می‌مانند. برای انتقال گزارش هفتگی از دکمهٔ «خروجی گزارش» استفاده کن.

## انتشار با GitHub Pages

۱. فایل‌های این پوشه را در ریشهٔ یک repository قرار بده.

۲. از مسیر Settings → Pages، گزینهٔ Deploy from a branch را انتخاب کن.

۳. شاخهٔ `main` و پوشهٔ `/root` را انتخاب کن.

## انتشار با Vercel

پوشه را به‌عنوان پروژهٔ جدید Import کن. Framework را روی Other یا Static بگذار و Build Command را خالی بگذار.

## اتصال Supabase برای همگام‌سازی بین دستگاه‌ها

۱. در Supabase یک پروژهٔ جدید بساز.

۲. از SQL Editor محتوای `supabase-schema.sql` را اجرا کن.

۳. در Authentication → Providers، گزینهٔ Anonymous را فعال کن.

۴. در Authentication → URL Configuration، آدرس GitHub Pages یا Vercel را در Site URL و Redirect URLs اضافه کن.

۵. فایل `config.js` را با Project URL و کلید publishable/anon پروژه پر کن. کلید service_role را هرگز در این پروژه قرار نده.

۶. فایل‌ها را commit و push کن.

پس از تنظیم، برنامه ابتدا با حساب موقت ناشناس کار می‌کند. برای دسترسی به همان داده‌ها روی دستگاه دیگر، ایمیل خودت را در نوار بالای برنامه وارد کن و لینک ورود را باز کن. تنظیمات Email Provider و ارسال ایمیل باید در Supabase فعال باشد.

اگر Supabase تنظیم نشده باشد، برنامه همچنان با localStorage کار می‌کند و هیچ داده‌ای از بین نمی‌رود.