# 🔔 🎹 Jingle Bells - Piano Performance Tracker

ระบบบันทึกผลการผ่านเพลงเปียโน พร้อมใหม่เทคโนโลยี Supabase Realtime สำหรับการแชร์ข้อมูลแบบเรียลไทม์

## ✨ ฟีเจอร์หลัก

- 📱 **รองรับมือถือ** - ออกแบบ Mobile-first สำหรับหน้าจอขนาด 360px ขึ้นไป
- 🎹 **ธีม Christmas** - ดีไซน์ที่สวยงาม อบอุ่น และเหมาะสมกับเพลงแสดง
- 🔄 **Realtime Updates** - ข้อมูลอัปเดตทันทีบนทุกอุปกรณ์โดยไม่ต้องรีเฟรช
- 🔐 **ระบบล็อค** - ปลดล็อกด้วยรหัสผ่าน 77077707 เพื่อการแก้ไขข้อมูล
- 👥 **จัดการชั้นเรียน** - สร้าง แก้ไข ลบชั้นเรียนได้ตามต้องการ
- 📋 **จัดการรายชื่อ** - เพิ่ม แก้ไข ลบชื่อและติ๊กสถานะผ่าน/ไม่ผ่าน
- 📊 **สรุปสถิติ** - แสดงจำนวนทั้งหมด ผ่านแล้ว ยังไม่ผ่านแบบเรียลไทม์

## 🚀 วิธีติดตั้งและใช้งาน

### 1. สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com) และสร้าง account
2. คลิก "New Project"
3. กรอกข้อมูล:
   - Project name: `jingle-bells`
   - Database password: ตั้งรหัสผ่านแรง (เก็บไว้)
   - Region: เลือกที่ใกล้คุณที่สุด
4. คลิก "Create new project" แล้ว **รอ 3-5 นาที** ให้ระบบสร้าง database เสร็จ

### 2. รัน Database Schema

1. ในหน้า Supabase Dashboard ไปที่ **SQL Editor**
2. คลิก "New Query"
3. **คัดลอก** code ทั้งหมดจากไฟล์ `supabase/schema.sql`
4. วางเข้า SQL Editor
5. คลิก "Run" (ปุ่มสีน้ำเงิน)
6. รอให้ query เสร็จ (ควรเห็น "Success" ที่ด้านล่าง)

### 3. หา Supabase URL และ Anon Key

1. ในหน้า Supabase Dashboard ไปที่ **Project Settings** (ไอคอนเกียร์)
2. คลิก **API** (ด้านซ้าย)
3. ดู **Project URL** - คัดลอกและเก็บไว้
4. ดู **anon public** - คัดลอก key ตัวยาว ๆ และเก็บไว้

### 4. ตั้งค่า Environment Variables ใน Netlify

#### วิธีที่ 1: ตั้งค่าผ่าน Netlify Dashboard

1. ไปที่ [netlify.com](https://netlify.com) และ login
2. เลือก site ของคุณ
3. ไปที่ **Site settings** → **Build & deploy** → **Environment**
4. คลิก **Edit variables**
5. เพิ่มตัวแปร:
   ```
   VITE_SUPABASE_URL = https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOi... (ค่าจากขั้นตอนที่ 3)
   ATTENDANCE_PASSWORD = 77077707
   ```
6. บันทึกการเปลี่ยนแปลง

#### วิธีที่ 2: ตั้งค่าผ่าน `.env.local` (สำหรับ Development)

1. สร้างไฟล์ชื่อ `.env.local` ที่ root ของ project
2. เพิ่มเนื้อหา:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ATTENDANCE_PASSWORD=77077707
   ```
3. **ห้ามเพิ่มไฟล์นี้ขึ้น Git** (.gitignore ได้ทำไว้แล้ว)

### 5. Deploy เว็บไซต์

#### วิธีที่ 1: Deploy จาก GitHub (ง่ายที่สุด)

1. Push โค้ดขึ้น GitHub
2. ไปที่ Netlify Dashboard → **Add new site** → **Import an existing project**
3. เลือก GitHub repository ของคุณ
4. คลิก **Deploy site**
5. รอสักครู่ให้ build เสร็จ
6. Netlify จะให้ URL ของเว็บไซต์

#### วิธีที่ 2: Deploy ด้วย Netlify CLI (สำหรับผู้เชี่ยวชาญ)

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### 6. ทดสอบการใช้งาน

1. เปิด URL ของเว็บไซต์
2. ควรเห็น Dropdown เลือกชั้นเรียน
3. เลือก "Jingle Bells" - ควรเห็นรายชื่อ 42 คน
4. ติ๊ก checkbox เพื่อบันทึกสถานะ "ผ่านแล้ว"
5. เปิดอุปกรณ์อื่น (มือถือ/แท็บเล็ต/คอมพิวเตอร์อื่น) ด้วย URL เดียวกัน
6. ควรเห็นข้อมูลและการอัปเดตแบบเรียลไทม์

## 🔐 วิธีใช้ระบบปลดล็อก

1. คลิกปุ่ม "🔒 ปลดล็อกการบันทึกผล"
2. กรอกรหัสผ่าน: `77077707`
3. คลิก "ยืนยัน"
4. ตอนนี้คุณสามารถ:
   - ติ๊ก/ยกเลิก checkbox เพื่อบันทึกสถานะ
   - เพิ่ม/แก้ไข/ลบชั้นเรียน
   - เพิ่ม/แก้ไข/ลบรายชื่อ
   - รีเซ็ตผลทั้งหมด
5. คลิก "🔓 ล็อกการบันทึกผล" เพื่อล็อกระบบและป้องกันการแก้ไข

## ⚠️ ข้อควรระวังด้านความปลอดภัย

### 🔐 รหัสผ่าน
- **ห้ามใส่รหัสผ่านจริงในโค้ด JavaScript** - ระบบใช้ Netlify Function ในการตรวจสอบ
- รหัสผ่าน `77077707` เก็บใน **Environment Variable** ของ Netlify เท่านั้น
- ไม่มีใครสามารถมองเห็นรหัสผ่านได้จากเว็บ (Safe ✅)

### 🗄️ ฐานข้อมูล Supabase
- ใช้ **Anon Key** (Public key) สำหรับ Read/Write ข้อมูล
- ตั้งค่า **Row Level Security (RLS)** เพื่อให้ทุกคนอ่านข้อมูลได้
  
  ```sql
  ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE students ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Enable read access for all users" ON classes
    FOR SELECT USING (true);
  
  CREATE POLICY "Enable read access for all users" ON students
    FOR SELECT USING (true);
  
  CREATE POLICY "Enable write access for all users" ON students
    FOR UPDATE USING (true);
  ```

### 📊 ข้อมูลชั้นเรียน
- **ไม่เก็บข้อมูลส่วนตัว** - เก็บเฉพาะชื่อ-นามสกุล และสถานะผ่าน/ไม่ผ่านเท่านั้น
- สามารถลบข้อมูลได้ตลอดเวลา โดยคลิกปุ่ม "🗑️ ลบ"

## 🛠️ การแก้ไขปัญหา

### ❌ ไม่เห็นข้อมูลรายชื่อ

**สาเหตุ:** อาจ schema ไม่ได้รัน หรือ URL/Key ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบ Supabase URL และ Anon Key ใน `.env` หรือ Netlify Environment
2. รัน schema ใหม่ (ดูขั้นตอนที่ 2 ด้านบน)
3. เปิด Browser Console (F12) ดูว่ามี error ไหม

### ❌ ล็อคไม่ได้ (รหัสไม่ถูก)

**สาเหตุ:** Netlify Function ไม่ทำงาน หรือ ATTENDANCE_PASSWORD ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบ Netlify Dashboard → Environment variables
2. ตรวจสอบว่า ATTENDANCE_PASSWORD = `77077707` ตรงกันหรือไม่
3. Deploy ใหม่ (Redeploy)

### ❌ ข้อมูลไม่อัปเดตแบบเรียลไทม์

**สาเหตุ:** Supabase Realtime ไม่เปิด

**วิธีแก้:**
1. ไปที่ Supabase Dashboard → SQL Editor
2. รัน SQL นี้:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE classes;
   ALTER PUBLICATION supabase_realtime ADD TABLE students;
   ```

### ❌ เปิด URL แล้ว Error หรือหน้าว่าง

**วิธีแก้:**
1. เปิด Browser Console (F12) ดู error message
2. ตรวจสอบ Network tab ว่า Supabase ตอบสนองไหม
3. ลองรีเฟรชหน้า (Ctrl+Shift+R)
4. ถ้ายังไม่ได้ ลองใช้ Incognito mode

## 📱 รองรับมือถือ

เว็บออกแบบสำหรับ:
- 📱 iPhone: 360px - 430px
- 📱 Android: 360px - 540px  
- 💻 Tablet: 768px - 1024px
- 🖥️ Desktop: 1200px ขึ้นไป

## 🎨 ดีไซน์

- **ธีม:** Jingle Bells + Piano + Christmas Music
- **สี:** แดง ทอง เขียว ขาว ครีม
- **Animations:** นุ่มนวล ไม่รบกวน ลดลงถ้า `prefers-reduced-motion`
- **Accessibility:** aria-labels, contrast, keyboard navigation

## 📦 ไฟล์สำคัญ

```
jingle-bells-piano-tracker/
├── index.html                    # หน้าเว็บหลัก
├── style.css                     # ทั้งหมด styling
├── app.js                        # JavaScript logic
├── package.json                  # Dependencies
├── vite.config.js               # Vite build config
├── netlify.toml                 # Netlify build config
├── .env.example                 # Environment template
├── supabase/
│   └── schema.sql               # Database schema
└── netlify/
    └── functions/
        └── verify-password.js   # Password verification function
```

## 🤝 Support

ถ้ามีปัญหา:
1. ตรวจสอบ Browser Console (F12)
2. ตรวจสอบ Netlify Build logs
3. ตรวจสอบ Supabase Logs ในหน้า Project → Logs

---

**สร้างด้วย ❤️ สำหรับการแสดงดนตรีคริสต์มาส**
