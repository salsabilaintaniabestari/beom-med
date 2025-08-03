# BeomMed - Hospital Medication Reminder System

BeomMed adalah sistem pengingat obat untuk rumah sakit yang mendukung multi-role (Administrator, Dokter, Pasien) dengan fitur analytics lengkap.

## Fitur Utama

### Administrator
- Dashboard dengan statistik lengkap
- Manajemen pasien (CRUD operations)
- Manajemen obat dan jadwal
- Rekap dan riwayat konsumsi obat
- Analisis konsumsi dengan visualisasi
- Manajemen akun dokter

### Dokter
- Dashboard pasien yang ditangani
- Manajemen data pasien
- Manajemen obat dan jadwal untuk pasien
- Riwayat dan analisis kepatuhan pasien

### Pasien
- Dashboard jadwal obat harian
- Profil dan riwayat kesehatan
- Jadwal obat personal
- Analisis konsumsi pribadi

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation

## Setup Instructions

### 1. Supabase Setup

1. Buat project baru di [Supabase](https://supabase.com)
2. Klik tombol "Connect to Supabase" di Bolt untuk setup otomatis
3. Atau copy environment variables dari Supabase dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 2. Database Setup

Database schema akan otomatis dibuat melalui migrasi Supabase yang sudah disediakan.

### 3. Authentication Setup

1. Di Supabase dashboard, buka **Authentication > Settings**
2. Pastikan **Email confirmation** dinonaktifkan untuk testing
3. Konfigurasikan site URL: `http://localhost:5173`

### 4. Development

```bash
npm install
npm run dev
```

### 5. Default Accounts

Untuk testing, buat akun dengan role:
- Administrator: `admin@beommed.com`
- Dokter: `dokter@beommed.com` 
- Pasien: `pasien@beommed.com`

## Database Schema

- **users**: User authentication dengan role-based access
- **patients**: Data pasien dan informasi medis
- **medications**: Resep obat untuk setiap pasien
- **medication_schedules**: Jadwal harian konsumsi obat
- **consumption_logs**: Log tracking konsumsi untuk analytics

## Security

- Row Level Security (RLS) enabled untuk semua tabel
- Role-based access control
- Data isolation per role
- Secure authentication dengan Supabase Auth

## Deployment

Ready untuk deploy ke Netlify atau platform hosting lainnya dengan konfigurasi environment variables yang tepat.