# 🥗 NourishSearch — Healthy Menu Finder

เว็บค้นหาเมนูอาหารเพื่อสุขภาพ พร้อม AI วิเคราะห์โภชนาการ

---

## 🚀 วิธีติดตั้งและรัน

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ใส่ API Keys

แก้ไขไฟล์ `.env.local`:

```env
GEMINI_API_KEY=ใส่_key_ของคุณ_ที่นี่
SPOONACULAR_API_KEY=ใส่_key_ของคุณ_ที่นี่
```

**หา API Keys ได้ที่:**
- 🟦 Gemini: https://aistudio.google.com → Get API Key (ฟรี!)
- 🟧 Spoonacular: https://spoonacular.com/food-api → ฟรี 150 req/วัน

### 3. รัน Development Server
```bash
npm run dev
```

เปิดที่ http://localhost:3000

---

## 📁 โครงสร้างโปรเจค

```
healthy-menu/
├── app/
│   ├── page.tsx              ← หน้าหลัก
│   ├── globals.css           ← สไตล์ทั้งหมด
│   ├── layout.tsx            ← Layout wrapper
│   ├── components/
│   │   ├── SearchBar.tsx     ← ช่องค้นหา + Autocomplete
│   │   ├── FilterPanel.tsx   ← ตัวกรอง (exclude, diet, calories)
│   │   ├── MenuCard.tsx      ← การ์ดแสดงเมนู
│   │   └── SkeletonCard.tsx  ← Loading placeholder
│   └── api/
│       ├── search/route.ts   ← API: ค้นหา + Gemini AI
│       └── recipe/[id]/route.ts ← API: รายละเอียดเมนู
├── .env.local                ← API Keys (ห้าม commit!)
└── .gitignore
```

---

## ✨ Features

- 🔍 **ค้นหา** ด้วยชื่อเมนู หรือส่วนผสม
- 🚫 **Filter ส่วนผสมที่ไม่เอา** (ไข่, นม, กลูเตน, ถั่ว ฯลฯ)
- 🥗 **Filter ประเภทอาหาร** (Vegan, Keto, Mediterranean ฯลฯ)
- 🔥 **Filter แคลอรี่สูงสุด**
- 🤖 **AI Insight** โดย Gemini วิเคราะห์ประโยชน์ของเมนู
- 📊 **Nutrition Facts** Protein / Carbs / Fat
- ⚡ **Mock Data** ใช้งานได้ก่อนมี API Key (Spoonacular)

---

## 🛠️ Tech Stack

| | |
|---|---|
| Framework | Next.js 14 |
| Styling | Tailwind CSS |
| AI | Google Gemini API |
| Food DB | Spoonacular API |
| Deploy | Vercel |

---

## 🌐 Deploy บน Vercel

```bash
npx vercel
```

แล้วไปใส่ Environment Variables ใน Vercel Dashboard ด้วย
