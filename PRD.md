# Product Requirement Document (PRD) - StudioManager Workstation

## 1. Executive Summary & Vision

**StudioManager** (NewSeratus) adalah platform workstation *Single-Page Application (SPA)* serba-ada yang dirancang khusus untuk freelancer, profesional kreatif, dan studio mandiri. Aplikasi ini mengintegrasikan manajemen proyek, pencatatan tugas harian (*To-Do List*), generator invoice otomatis beserta ekspor PDF, asisten harian cerdas (*Studio Robot*), serta analitik keuangan secara *real-time*.

---

## 2. Target Persona & Problem Statement

### Persona Pengguna
- **Freelancer / Creative Professional**: Desainer, pengembang perangkat lunak, animator, atau desainer 3D yang mengelola banyak klien dan proyek sekaligus.
- **Kebutuhan Utama**:
  - Transparansi rincian harga pekerjaan (*Scope & Sub-description*) pada invoice agar klien memahami perincian biaya.
  - Kecepatan pemantauan estimasi pendapatan, invoice pending, dan deadline proyek harian.
  - Tampilan yang bersih, cepat, tanpa reload halaman yang lambat.

---

## 3. Arsitektur Sistem & Spesifikasi Teknologi

| Layer | Teknologi |
| :--- | :--- |
| **Framework Utama** | Next.js (App Router, Node.js runtime) |
| **Bahasa Pemrograman** | TypeScript |
| **Database** | MongoDB Atlas via Mongoose ODM |
| **Styling & Theme** | Vanilla CSS + TailwindCSS (`globals.css`, `neumorphic.css`) |
| **Desain UI/UX** | *Obsidian Neon Executive & Glassmorphism* (Responsif Desktop & Mobile) |
| **Realtime Protocol** | Server-Sent Events (SSE) via `/api/dashboard/stream` |
| **Dokumen Generator** | PDFKit & JSZip (Generasi PDF Invoice & Bulk ZIP Download) |
| **Visualisasi Data** | Recharts (Responsive Line & Bar Charts) |

---

## 4. Modul & Fitur Utama

### 4.1. Dashboard Overview & Real-Time Analytics
- **Kartu Statistik Keuangan**:
  - Total Proyek (Aktif, Selesai, Pending, On-Hold).
  - Total Pendapatan (*Total Earnings* dalam USD/IDR).
  - Pembayaran Tertunda (*Pending Payments*).
  - Rata-rata Tarif Per Jam (*Average Hourly Rate*).
- **Jam Digital Edinburgh**: Display waktu digital sesuai zona jam kerja global.
- **Studio Robot (Asisten Harian)**:
  - Mengkalkulasi ringkasan proyek aktif, invoice pending, proyek selesai bulan ini, dan kategori pekerjaan terbanyak.
- **Grafik Tren Pendapatan Bulanan**: Visualisasi pendapatan 6-12 bulan terakhir dengan dukungan auto-sync *real-time*.

### 4.2. Manajemen Proyek (Projects Module)
- **Atribut Proyek**: Judul, Deskripsi Detail, Nama Klien, Status (`ongoing`, `completed`, `cancelled`), Prioritas (`low`, `medium`, `high`), Kategori, Tanggal Mulai, Deadline, Anggaran/Budget, Hourly Rate, Jam Kerja, Master Link, dan Catatan Khusus.
- **Operasi**: Filter berdasarkan status/kategori, pencarian cepat, pencatatan waktu selesai proyek (`completedAt`).

### 4.3. Manajemen Tugas (Tasks / To-Do List)
- **Pencatatan Tugas**: Judul tugas, status (`pending`, `done`), prioritas, tanggal jatuh tempo (`dueDate`), asosiasi ke ID proyek terkait.
- **Navigasi Cepat**: Filter "Today's Tasks", pindah tugas ke besok (*Move to tomorrow*), tandai selesai (*Mark as done*).

### 4.4. Generator & Manajemen Invoice (Invoice Module)
- **Generasi Invoice Tunggal & Gabungan (Batch)**:
  - Menggabungkan beberapa proyek menjadi 1 dokumen invoice.
- **Sub-Deskripsi Transparansi Biaya**:
  - Setiap item invoice mendukung `subDescription` (rincian cakupan proyek) yang otomatis terisi dari deskripsi proyek atau diisi manual.
- **Cetak & Ekspor PDF**:
  - Penomoran invoice otomatis unik (misal: `#INV-202607-001`).
  - Ekspor PDF berkualitas tinggi menggunakan PDFKit.
  - Ekspor Bulk ZIP untuk mengunduh banyak invoice sekaligus.
- **Status Invoice**: `pending`, `paid`, `overdue`.

### 4.5. Pengaturan & Sistem Tema (Settings & Design System)
- Mode *Dark Obsidian Neon Cyan* & *Clean Minimalist*.
- Pengaturan profil pengguna dan manajemen notifikasi *real-time*.

---

## 5. Schema Data (Data Models)

### `User`
- `username`: String (Unique)
- `email`: String (Unique)
- `password`: String (Hashed)
- `avatar`: String
- `createdAt`, `updatedAt`: Date

### `Project`
- `title`: String
- `description`: String
- `client`: String
- `status`: String (`ongoing` | `completed`)
- `priority`: String (`low` | `medium` | `high`)
- `category`: String
- `startDate`, `endDate`, `completedAt`: Date
- `budget`, `hourlyRate`, `hoursWorked`, `totalEarned`: Number
- `masterLink`, `masterNotes`: String
- `userId`: ObjectId (Ref `User`)

### `Invoice`
- `invoiceNumber`: String (Unique)
- `projectId`: ObjectId (Ref `Project`)
- `projectTitle`: String
- `billedToName`: String
- `items`: Array of `InvoiceItem`
  - `description`: String
  - `subDescription`: String (Optional)
  - `quantity`: Number
  - `rate`: Number
  - `amount`: Number
- `subtotal`, `taxPercent`, `total`: Number
- `status`: String (`pending` | `paid` | `overdue`)
- `userId`: ObjectId (Ref `User`)

### `Todo`
- `title`: String
- `status`: String (`pending` | `done`)
- `priority`: String
- `dueDate`: Date
- `projectId`: ObjectId (Ref `Project`)
- `userId`: ObjectId (Ref `User`)

---

## 6. Peta Jalan Pengembangan Masa Depan (Product Roadmap)

### Fase 1: Peningkatan UX & Produktivitas (Short-Term)
1. **Fitur Pengingat Otomatis (Automatic Payment Reminder)**:
   - Pengiriman email notifikasi tagihan ke klien untuk invoice berstatus `overdue`.
2. **Kalkulator Kurs Mata Uang Otomatis**:
   - Integrasi API live exchange rate (USD ↔ IDR ↔ EUR) pada form invoice.
3. **Ekspor Laporan Keuangan (CSV / Excel)**:
   - Fitur download laporan bulanan & tahunan dalam format spreadsheet.

### Fase 2: Kolaborasi & AI Intelligence (Mid-Term)
1. **Portal Klien (Client Portal)**:
   - Halaman khusus (tanpa login) bagi klien untuk melihat progres proyek & mengunduh invoice milik mereka.
2. **Studio Robot AI Integration**:
   - Menghubungkan Studio Robot dengan LLM (misal: Gemini API) untuk memberikan rincian rekomendasi harga proyek & estimasi waktu pengerjaan otomatis.
3. **Timer / Time Tracker Terintegrasi**:
   - Stopwatch bawaan di dalam aplikasi untuk mencatat jam kerja proyek secara presisi saat mengerjakan proyek per jam.

---

## 7. Kesimpulan

Dokumen PRD ini menjadi fondasi utama dalam analisis, arsitektur, serta arah pengawasan kualitas pengembangan aplikasi **StudioManager**. Fokus utama pengembangannya adalah memastikan stabilitas, kecepatan antarmuka *Single-Page Application*, kontras visual yang sempurna, dan kemudahan pengelolaan bisnis freelance.
