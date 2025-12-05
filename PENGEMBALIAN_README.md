# 📦 Sistem Pengembalian Produk

Dokumentasi lengkap untuk fitur pengembalian produk dengan approval workflow.

## 📋 Daftar Isi

- [Overview](#overview)
- [Flow Pengembalian](#flow-pengembalian)
- [Fitur Utama](#fitur-utama)
- [Struktur File](#struktur-file)
- [API Endpoints](#api-endpoints)
- [Cara Penggunaan](#cara-penggunaan)

---

## Overview

Sistem pengembalian produk memungkinkan customer untuk mengajukan pengembalian barang dengan alasan tertentu (rusak, salah varian, dll). Admin dapat menyetujui atau menolak pengajuan tersebut.

### Alur Kerja:
1. **Customer** mengajukan pengembalian dengan mengisi form dan upload bukti foto
2. **Admin** mereview pengajuan dan memberikan keputusan (approve/reject)
3. **Sistem** otomatis memproses berdasarkan keputusan:
   - **Approved**: Status pesanan dan pembayaran diubah, stok dikembalikan (jika salah varian), atau masuk ke tabel produk rusak
   - **Rejected**: Status pesanan tetap selesai, tidak ada perubahan

---

## Flow Pengembalian

### 1. Customer Flow

```
Pesanan Selesai/Dikirim
    ↓
Klik "Ajukan Pengembalian"
    ↓
Isi Form:
  - Pilih alasan (Rusak/Salah Varian/Tidak Sesuai/Lainnya)
  - Keterangan (opsional)
  - Upload bukti foto (required)
    ↓
Submit → Status: PENDING
    ↓
Tunggu Review Admin
    ↓
Status: APPROVED atau REJECTED
```

### 2. Admin Flow

```
Dashboard Admin
    ↓
Kelola Pengembalian
    ↓
Review Pengajuan Pending:
  - Lihat bukti foto
  - Cek detail pesanan
  - Baca keterangan customer
    ↓
Keputusan:
  ├── APPROVE
  │   ├── Status pesanan → DIKEMBALIKAN
  │   ├── Status pembayaran → DIKEMBALIKAN
  │   ├── Alasan RUSAK → Masuk tabel produk_rusak
  │   └── Alasan SALAH_VARIAN → Stok produk dikembalikan
  │
  └── REJECT
      └── Status tetap SELESAI (tidak ada perubahan)
```

---

## Fitur Utama

### ✨ Fitur Customer
- ✅ Ajukan pengembalian untuk pesanan dengan status DIKIRIM atau SELESAI
- ✅ Upload bukti foto produk
- ✅ Pilih alasan pengembalian
- ✅ Tambah keterangan detail
- ✅ Lihat status pengembalian (Pending/Approved/Rejected)
- ✅ Lihat catatan dari admin
- ✅ Riwayat semua pengajuan pengembalian

### ⚙️ Fitur Admin
- ✅ Lihat semua pengajuan pengembalian
- ✅ Filter berdasarkan status (Pending/Processed)
- ✅ Review detail lengkap termasuk bukti foto
- ✅ Approve/Reject pengajuan dengan catatan
- ✅ Lihat produk rusak yang tercatat
- ✅ Tracking jumlah total produk rusak

### 🔄 Otomasi Sistem
- ✅ **Approve dengan alasan RUSAK**: Produk masuk ke tabel `produk_rusak`
- ✅ **Approve dengan alasan SALAH_VARIAN**: Stok produk/varian dikembalikan
- ✅ **Status pesanan** otomatis berubah menjadi DIKEMBALIKAN (jika approved)
- ✅ **Status pembayaran** otomatis berubah menjadi DIKEMBALIKAN (jika approved)
- ✅ **Reject**: Tidak ada perubahan pada pesanan/pembayaran

---

## Struktur File

```
src/app/
├── services/
│   └── pengembalian.ts          # API service untuk pengembalian & produk rusak
│
├── pengembalian/                # Customer pages
│   ├── page.tsx                 # List pengembalian user
│   ├── [id]/
│   │   └── page.tsx             # Detail pengembalian
│   └── ajukan/
│       └── page.tsx             # Form ajukan pengembalian
│
└── admin/
    ├── pengembalian/
    │   └── page.tsx             # Admin kelola pengembalian
    └── produk-rusak/
        └── page.tsx             # Admin lihat produk rusak
```

---

## API Endpoints

### Customer Endpoints

#### 1. Ajukan Pengembalian
```typescript
POST /pengembalian
Body: {
  pesanan_id: string,
  alasan: "rusak" | "salah varian" | "tidak sesuai" | "lainnya",
  keterangan?: string,
  bukti_foto: string  // URL hasil upload
}
```

#### 2. Lihat Pengembalian User
```typescript
GET /pengembalian/user
```

#### 3. Detail Pengembalian
```typescript
GET /pengembalian/:id
```

### Admin Endpoints

#### 4. Lihat Semua Pengembalian
```typescript
GET /pengembalian
```

#### 5. Approve Pengembalian
```typescript
PUT /pengembalian/:id/approve
Body: {
  catatan_admin?: string
}
```

#### 6. Reject Pengembalian
```typescript
PUT /pengembalian/:id/reject
Body: {
  catatan_admin?: string
}
```

#### 7. Lihat Produk Rusak
```typescript
GET /pengembalian/produk-rusak/all
```

#### 8. Produk Rusak by Pengembalian
```typescript
GET /pengembalian/produk-rusak/:pengembalianId
```

### Upload Endpoint

#### 9. Upload Bukti Foto
```typescript
POST /upload
Body: FormData with file
Response: { url: string }
```

---

## Cara Penggunaan

### 🛒 Untuk Customer

#### 1. Ajukan Pengembalian

1. Buka detail pesanan yang sudah DIKIRIM atau SELESAI
2. Scroll ke bawah, klik tombol **"↩️ Ajukan Pengembalian"**
3. Isi form:
   - Pilih alasan pengembalian
   - (Opsional) Tambahkan keterangan detail
   - Upload foto bukti produk
4. Klik **"Ajukan Pengembalian"**
5. Tunggu admin mereview pengajuan Anda

#### 2. Cek Status Pengembalian

1. Buka menu **"📋 Lihat Pengembalian Saya"**
2. Lihat status setiap pengajuan:
   - ⏳ **Menunggu Persetujuan**: Masih direview admin
   - ✅ **Disetujui**: Pengembalian diterima, dana akan dikembalikan
   - ❌ **Ditolak**: Pengembalian ditolak dengan catatan dari admin

#### 3. Lihat Detail

- Klik pada item pengembalian untuk melihat detail lengkap
- Lihat catatan dari admin (jika ada)
- Lihat bukti foto yang diupload
- Akses detail pesanan terkait

---

### 🔧 Untuk Admin

#### 1. Kelola Pengembalian

1. Login sebagai admin/petugas
2. Buka **Dashboard Admin**
3. Klik tombol **"↩️ Kelola Pengembalian"**

#### 2. Review Pengajuan Pending

Di section **"⏳ Menunggu Persetujuan"**:
- Lihat detail customer dan pesanan
- Klik pada bukti foto untuk memperbesar
- Baca keterangan dari customer
- Lihat item-item dalam pesanan

#### 3. Approve Pengembalian

1. Klik tombol **"✅ Setujui"**
2. (Opsional) Tambahkan catatan untuk customer
3. Klik **"✅ Setujui"** di modal
4. Sistem otomatis:
   - Ubah status pesanan → DIKEMBALIKAN
   - Ubah status pembayaran → DIKEMBALIKAN
   - Jika alasan RUSAK → Masuk ke produk rusak
   - Jika alasan SALAH_VARIAN → Kembalikan stok

#### 4. Reject Pengembalian

1. Klik tombol **"❌ Tolak"**
2. Tambahkan catatan alasan penolakan
3. Klik **"❌ Tolak"** di modal
4. Status pesanan tetap SELESAI

#### 5. Lihat Produk Rusak

1. Dari Dashboard Admin
2. Klik **"📦❌ Lihat Produk Rusak"**
3. Lihat daftar semua produk yang dikembalikan karena rusak
4. Statistik total unit produk rusak

---

## Status Pengembalian

| Status | Keterangan | Aksi Selanjutnya |
|--------|-----------|------------------|
| `PENDING` | Menunggu review admin | Admin review dan buat keputusan |
| `APPROVED` | Disetujui admin | Pesanan & pembayaran diproses, stok/produk rusak diupdate |
| `REJECTED` | Ditolak admin | Tidak ada perubahan, customer diberi catatan |

---

## Alasan Pengembalian

| Alasan | Kode | Aksi Sistem |
|--------|------|-------------|
| Produk Rusak | `rusak` | Masuk ke tabel `produk_rusak` |
| Salah Varian | `salah varian` | Stok dikembalikan ke produk/varian |
| Tidak Sesuai Deskripsi | `tidak sesuai` | Tidak ada aksi khusus |
| Lainnya | `lainnya` | Tidak ada aksi khusus |

---

## Database Schema

### Tabel: `pengembalian`
```sql
- id: UUID (PK)
- pesanan_id: UUID (FK → pesanan)
- user_id: UUID (FK → users)
- alasan: ENUM (rusak, salah varian, tidak sesuai, lainnya)
- keterangan: TEXT (nullable)
- bukti_foto: TEXT
- status: ENUM (pending, approved, rejected)
- catatan_admin: TEXT (nullable)
- processed_by: UUID (FK → users, nullable)
- processed_at: TIMESTAMP (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabel: `produk_rusak`
```sql
- id: UUID (PK)
- pengembalian_id: UUID (FK → pengembalian)
- produk_id: UUID (FK → produk)
- produk_varian_id: UUID (FK → produk_varian, nullable)
- jumlah: INTEGER
- deskripsi_kerusakan: TEXT (nullable)
- created_at: TIMESTAMP
```

---

## Tips & Best Practices

### ✅ Untuk Customer
- Upload foto yang jelas dan menunjukkan kondisi produk
- Berikan keterangan detail untuk mempercepat review
- Ajukan pengembalian sesegera mungkin setelah menerima produk
- Cek status secara berkala

### ✅ Untuk Admin
- Review pengajuan secepat mungkin (max 2x24 jam)
- Berikan catatan yang jelas saat reject
- Verifikasi bukti foto dengan teliti
- Pastikan alasan pengembalian sesuai dengan kondisi actual

---

## Troubleshooting

### ❓ Tombol ajukan pengembalian tidak muncul
- Pastikan status pesanan adalah DIKIRIM atau SELESAI
- Login sebagai customer (bukan admin/petugas)

### ❓ Upload foto gagal
- Cek ukuran file (max 5MB)
- Format yang didukung: JPG, PNG, JPEG
- Pastikan koneksi internet stabil

### ❓ Status tidak berubah setelah approve
- Cek log backend untuk error
- Pastikan pesanan memiliki pembayaran terkait
- Verifikasi stok produk/varian tersedia

---

## Contact & Support

Jika ada pertanyaan atau bug report, silakan hubungi tim development.

**Happy returning! 🎉**
