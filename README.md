#Health Tracker

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

۴. در Authentication → URL Configuration، `https://ahmadiftme8.github.io/healthplan/` را به‌عنوان Site URL تنظیم کن و همین آدرس را در Redirect URLs مجاز اضافه کن. برای توسعهٔ محلی نیز `http://127.0.0.1:5500/**` را جداگانه به Redirect URLs اضافه کن.

۵. فایل `config.js` را با Project URL و کلید publishable/anon پروژه پر کن و `accountEmail` را روی `devftme@gmail.com` و `redirectUrl` را روی `https://ahmadiftme8.github.io/healthplan/` بگذار. کلید secret/service_role را هرگز در این پروژه قرار نده.

۶. فایل‌ها را commit و push کن.

پس از تنظیم، در هر دستگاه روی «ارسال لینک ورود» بزن و لینک ایمیل `devftme@gmail.com` را باز کن؛ نشست ورود در همان مرورگر ذخیره می‌شود. برای انتقال داده‌های قدیمی دسکتاپ که هنوز به حساب ناشناس وصل هستند، ابتدا لینک را روی همان دسکتاپ باز کن تا داده‌ها به حساب ایمیل منتقل شوند، سپس روی گوشی لینک ورود تازه بگیر و باز کن. برای نمایش تغییرات هم‌زمان بین دستگاه‌ها، اسکریپت SQL جدول `user_data` را به Realtime اضافه می‌کند.

اگر Supabase تنظیم نشده باشد، برنامه همچنان با localStorage کار می‌کند و هیچ داده‌ای از بین نمی‌رود.