## Video Thumbnail Bot

Telegram uchun oddiy, lekin foydali bot: **video va rasm yuborasiz – bot esa shu rasmni thumbnail qilib, videoni qayta yuboradi**.

---

## Dasturchilar uchun

Loyiha **Bun** ustida ishlaydi, HTTP server sifatida **Hono**, Telegram bilan ishlash uchun **grammy**, ma’lumotlar bazasi uchun **Drizzle ORM + PostgreSQL** dan foydalanadi.  
Bot **webhook** orqali ishlashi uchun `hono` bilan integratsiya qilingan.

### Arxitektura (qisqa)

- **`src/index.ts`** – `Hono` ilovasini ishga tushiradi, `POST /bot` ni Telegram webhookiga ulaydi, `GET /` da `"Hello Hono!"` qaytaradi.
- **`src/bot.ts`** – `grammy` botini yaratadi, sessiyalar va auto-retry ni ulaydi, `start`, `message:video`, `message:photo`, `message` handlerlarini ro‘yxatdan o‘tkazadi va `handleUpdate` webhookini eksport qiladi.
- **`src/handlers/*`** – video, rasm va oddiy xabarlar uchun alohida handlerlar: sessiya orqali oxirgi video/rasmni saqlaydi va kerak bo‘lganda video + thumbnail juftligini yuboradi. Media group (albom) uchun faqat birinchi video va rasm bilan ishlaydi.
- **`src/services/*`** – foydalanuvchini saqlash, hisoblagich va log jo‘natish kabi yordamchi servislar.
- **`src/utils/*`** – umumiy constantalar, turlar (`MyContext`, sessiya turlari) va boshlang‘ich sessiya holatini (`initial`) saqlaydi.

### Ma’lumotlar bazasi

- `drizzle.config.ts` fayli orqali konfiguratsiya qilingan:
    - `schema: "./src/db/schema.ts"`
    - `out: "./drizzle"`
    - Dialect: `postgresql`
    - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – environment orqali olinadi.
- `package.json` skriptlari:
    - `bun run db:generate` → `drizzle-kit generate`
    - `bun run db:migrate` → `bun src/db/migrate.ts`
    - `bun run db:studio` → `drizzle-kit studio`

---

## O‘rnatish va ishga tushirish

### Talablar

- Bun (so‘nggi versiya, loyiha `oven/bun:1.3` imagedan foydalanadi)
- PostgreSQL
- Node ekotizimi bilan ishlash tajribasi (env, Docker, webhook va h.k.)

### git clone

```bash
git clone https://github.com/jarkurghan/video-thumbnail-bot.git
cd video-thumbnail-bot
```

### dependency'larni o‘rnatish

```bash
bun install
```

### Environment o‘zgaruvchilar

Kamida quyidagilar kerak bo‘ladi:

- **`BOT_TOKEN`** – Telegram bot tokeni (`@BotFather` dan).
- **`DB_HOST`**, **`DB_PORT`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_NAME`** – PostgreSQL uchun ma’lumotlar.
- Agar loglar alohida chatga yuboriladigan bo‘lsa, tegishli `LOG_CHAT_ID` yoki shunga o‘xshash o‘zgaruvchilar ham bo‘lishi mumkin (aniq nomlar uchun koddagi `utils/constants` va `services/log` ga qarang).

`.env` faylingizni tayyorlang va Bun/Hono ishga tushayotgan muhitga export qiling.

### Lokal ishga tushirish

```bash
bun run dev
bun run start
```

Server default `http://localhost:3000`da ishga tushadi (Docker image-da 3000 port ochilgan).

---

## Skriptlar (npm/bun scripts)

- **`bun run dev`** – `bun --watch src/index.ts` bilan dev server.
- **`bun run start`** – prodga yaqin, `bun src/index.ts`.
- **`bun run db:generate`** – Drizzle migratsiya fayllarini generatsiya qiladi.
- **`bun run db:migrate`** – `src/db/migrate.ts` orqali migratsiyalarni ishga tushiradi.
- **`bun run db:studio`** – Drizzle Studio ni ishga tushiradi.

---

## Texnologiyalar

- **Bun** – runtime va paket menejeri
- **Hono** – HTTP server/web framework
- **grammy** – Telegram bot framework
- **@grammyjs/auto-retry** – Telegram API chaqiruvlari uchun auto-retry
- **Drizzle ORM** – type-safe ORM
- **PostgreSQL** – ma’lumotlar bazasi
- **Docker** – konteynerlash

---

## Litsenziya

Ushbu loyiha **MIT** litsenziyasi ostida tarqatiladi. Batafsil ma’lumot uchun repodagi `LICENSE` fayliga qarang.

## 🤝 Hissa Qo'shish

Bu code ochiq. Agar loyihani yaxshilashga hissa qo'shmoqchi bo'lsangiz, pull request (PR) yuborishingiz mumkin.
