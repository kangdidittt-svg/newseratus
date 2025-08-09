# Neumorphic UI Style Guide

Panduan untuk mengubah tampilan aplikasi musik dengan gaya neumorphic/soft UI.

## 🎨 Komponen yang Telah Diperbarui

- **Sidebar.tsx** - Navigasi kiri dengan menu Explore, Songs, Artists, Albums
- **PlayerCircle.tsx** - Player musik utama berbentuk lingkaran dengan ring progress
- **TrackCard.tsx** - Kartu lagu individual dengan animasi hover
- **DownloadList.tsx** - Daftar lagu di sisi kanan dengan animasi staggered
- **LoginCard.tsx** - Form login dengan gaya neumorphic
- **Dashboard.tsx** - Layout utama dengan 3 kolom sesuai referensi

## 🎛️ Kustomisasi Warna dan Style

Semua variabel CSS tersimpan di `src/styles/neumorphic.css`:

```css
:root {
  /* Background Colors */
  --neuro-bg: #f0f2f5;
  --neuro-bg-dark: #e1e5e9;
  
  /* Text Colors */
  --neuro-text-primary: #2d3748;
  --neuro-text-secondary: #4a5568;
  --neuro-text-muted: #718096;
  
  /* Accent Colors */
  --neuro-accent: #ff6b6b;
  --neuro-accent-hover: #ff5252;
  
  /* Shadows */
  --neuro-shadow-light: #ffffff;
  --neuro-shadow-dark: #d1d9e6;
  
  /* Border Radius */
  --neuro-radius: 20px;
  --neuro-radius-small: 12px;
  --neuro-radius-large: 32px;
  
  /* Transitions */
  --neuro-transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

### Mengubah Warna Utama

1. **Background**: Ubah `--neuro-bg` dan `--neuro-bg-dark`
2. **Accent**: Ubah `--neuro-accent` dan `--neuro-accent-hover`
3. **Text**: Ubah `--neuro-text-primary`, `--neuro-text-secondary`, `--neuro-text-muted`

### Mengubah Bentuk

1. **Border Radius**: Ubah `--neuro-radius`, `--neuro-radius-small`, `--neuro-radius-large`
2. **Shadow**: Ubah `--neuro-shadow-light` dan `--neuro-shadow-dark`

## ⚡ Mengatur Animasi

### Mematikan Semua Animasi

Tambahkan CSS berikut di `src/styles/neumorphic.css`:

```css
/* Disable all animations */
.no-animations * {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}
```

Kemudian tambahkan class `no-animations` ke body:

```html
<body className="no-animations">
```

### Mengubah Kecepatan Animasi

Ubah variabel `--neuro-transition`:

```css
/* Animasi lebih cepat */
--neuro-transition: all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);

/* Animasi lebih lambat */
--neuro-transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
```

### Mengubah Easing

```css
/* Linear */
--neuro-transition: all 0.3s linear;

/* Ease-in-out */
--neuro-transition: all 0.3s ease-in-out;

/* Custom cubic-bezier */
--neuro-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## 📱 Responsivitas

Layout otomatis menyesuaikan di layar kecil:
- Desktop: 3 kolom (Sidebar | Main | Download List)
- Mobile: 1 kolom (Download List pindah ke bawah)

## 🔧 Struktur File

```
src/
├── components/
│   ├── Sidebar.tsx          # Navigasi kiri
│   ├── PlayerCircle.tsx     # Player utama
│   ├── TrackCard.tsx        # Kartu lagu
│   ├── DownloadList.tsx     # Daftar lagu kanan
│   ├── LoginCard.tsx        # Form login
│   └── Dashboard.tsx        # Layout utama
├── styles/
│   └── neumorphic.css       # Variabel dan style neumorphic
└── app/
    ├── globals.css          # Import neumorphic.css
    └── login/page.tsx       # Halaman login
```

## 🎵 Fitur yang Dipertahankan

- ✅ Edinburgh Time Clock
- ✅ Semua teks dan label asli
- ✅ State management dan logika aplikasi
- ✅ API calls dan data fetching
- ✅ Routing dan authentication

## 🚀 Tips Pengembangan

1. **Konsistensi**: Gunakan class `neuro-card`, `neuro-button`, `neuro-input` untuk konsistensi
2. **Hover Effects**: Semua elemen interaktif memiliki efek hover dengan `translateY(-3px)`
3. **Loading States**: Gunakan animasi loading yang konsisten dengan tema
4. **Accessibility**: Semua animasi respect `prefers-reduced-motion`

## 🎨 Contoh Penggunaan

```tsx
// Kartu neumorphic
<div className="neuro-card p-6">
  <h3>Judul Kartu</h3>
  <p>Konten kartu</p>
</div>

// Tombol neumorphic
<button className="neuro-button">
  Klik Saya
</button>

// Input neumorphic
<input className="neuro-input" placeholder="Masukkan teks" />
```

Selamat menggunakan! 🎉