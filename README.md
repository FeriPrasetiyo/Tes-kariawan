📊 HRD Management System

Aplikasi HRD Management System berbasis Node.js (Express) untuk mengelola data karyawan, autentikasi user (HRD/Admin), serta dashboard analitik HRD lengkap dengan export Excel.

Project ini dibuat sebagai technical test dengan fokus pada:

Clean Architecture

REST API

Role-based Access Control

Data filtering & pagination

Dashboard reporting

🚀 Tech Stack
Backend

Node.js

Express.js

Sequelize ORM

PostgreSQL

JWT Authentication

ExcelJS

bcrypt

dotenv

Frontend

Express.js

EJS (Template Engine)

Bootstrap 5

Axios

🔐 Fitur Utama
1. Authentication & Authorization

Login HRD/Admin menggunakan JWT

Middleware:

authentication

isAdmin

isAdminOrOwner

2. Manajemen Karyawan (CRUD)

Tambah karyawan

Edit data karyawan

Soft delete (resign karyawan)

Aktifkan kembali karyawan (rehire)

Pagination

Search (nama & jabatan)

Filter:

Departemen

Status (aktif / resign)

3. Dashboard HRD

Filter berdasarkan:

Tahun (2020–2026)

Departemen

Statistik:

Total karyawan aktif

Total karyawan resign

Statistik per departemen

Total gaji

Rata-rata gaji

Gaji tertinggi & terendah

Detail:

Daftar karyawan aktif

Daftar karyawan resign

Export laporan ke Excel

📁 Struktur Folder (Ringkas)
backend-karyawan/
├── controllers/
│   ├── dashboard.controller.js
│   ├── karyawan.controller.js
│   └── user.controller.js
├── middleware/
│   ├── authentication.js
│   ├── isAdmin.js
│   └── isAdminOrOwner.js
├── models/
│   ├── user.js
│   ├── karyawan.js
│   └── index.js
├── routes/
│   └── index.js
├── migrations/
├── seeders/
├── .env.example
└── app.js

frontend-hrd/
├── routes/
├── views/
│   ├── dashboard.ejs
│   ├── karyawan/
│   └── partials/
├── public/
└── app.js

⚙️ Instalasi
1️⃣ Clone Repository
git clone https://github.com/FeriPrasetiyo/Tes-kariawan.git
cd Tes-kariawan

2️⃣ Install Dependencies
npm install

3️⃣ Setup Environment

Buat file .env berdasarkan .env.example

PORT=3000
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=hrd_db
DB_HOST=localhost
JWT_SECRET=your_secret_key

4️⃣ Database Migration & Seeder
npx sequelize db:create
npx sequelize db:migrate
npx sequelize db:seed:all

5️⃣ Jalankan Aplikasi
npm run dev

🔍 API Endpoint (Contoh)
Authentication
POST   /users/login
POST   /users/register

Karyawan
GET    /karyawan
POST   /karyawan
PUT    /karyawan/:id
PATCH  /karyawan/:id/resign
PATCH  /karyawan/:id/aktif
DELETE /karyawan/:id

Dashboard
GET /dashboard/hrd
GET /dashboard/hrd/export

📊 Contoh Filter Dashboard
/dashboard/hrd?year=2025&departemen=IT

🧪 Testing

API diuji menggunakan Postman

Frontend diuji menggunakan browser

Validasi error & role access sudah diterapkan

👨‍💻 Author

Feri Prasetiyo
Backend / Fullstack Developer
GitHub: https://github.com/FeriPrasetiyo
