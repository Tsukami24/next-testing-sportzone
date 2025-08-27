# Fitur CRUD Produk untuk Petugas

## Deskripsi
Fitur CRUD (Create, Read, Update, Delete) Produk yang dikhususkan untuk staff/petugas dengan autentikasi dan otorisasi berbasis role.

## Fitur yang Tersedia

### 1. Manajemen Produk (`/produk`)
- **Create**: Menambah produk baru dengan validasi input
- **Read**: Melihat daftar semua produk dengan informasi lengkap
- **Update**: Mengedit informasi produk yang sudah ada
- **Delete**: Menghapus produk dengan konfirmasi

### 2. Detail Produk (`/produk/[id]`)
- Tampilan detail lengkap produk
- Informasi harga dan stok
- Gambar produk (jika tersedia)
- Informasi kategori dan subkategori
- Timestamp pembuatan dan update

### 3. Filter dan Pencarian
- Filter berdasarkan Kategori ID
- Filter berdasarkan Subkategori ID
- Clear filter untuk reset pencarian

## Struktur Data Produk

```typescript
interface ProdukRecord {
    id: string;                    // UUID primary key
    subkategori_id: string;        // Foreign key ke subkategori
    brand_id: string;             // Foreign key ke brand
    nama: string;                  // Nama produk
    deskripsi: string;             // Deskripsi produk
    harga: number;                 // Harga dalam decimal
    gambar?: string;               // URL gambar (opsional)
    status: StatusProduk;         // Status produk (aktif/nonaktif/stok habis)
    created_at: string;            // Timestamp pembuatan
    updated_at: string;            // Timestamp update terakhir
    deleted_at?: string;           // Timestamp soft delete
    subkategori?: {                // Relasi ke subkategori
        id: string;
        nama: string;
    };
    brand?: {                     // Relasi ke brand
        id: string;
        nama: string;
    };
    varian?: ProdukVarianRecord[]; // Varian produk
}
```

## Struktur Data Varian Produk

```typescript
interface ProdukVarianRecord {
    id: string;                    // UUID primary key
    produk_id: string;            // Foreign key ke produk
    ukuran?: string;               // Ukuran produk (opsional)
    warna?: string;                // Warna produk (opsional)
    stok: number;                  // Jumlah stok varian
    harga?: number;                // Harga varian (opsional)
    sku?: string;                  // Kode unik varian (opsional)
    created_at: string;            // Timestamp pembuatan
    updated_at: string;            // Timestamp update terakhir
}
```

## API Endpoints

### Produk Service (`src/app/services/produk.ts`)

```typescript
// Mendapatkan semua produk
listProduk(token: string): Promise<ProdukRecord[]>

// Mendapatkan produk berdasarkan ID
getProdukById(token: string, id: string): Promise<ProdukRecord>

// Mendapatkan produk berdasarkan subkategori
getProdukBySubkategori(token: string, subkategoriId: string): Promise<ProdukRecord[]>

// Mendapatkan produk berdasarkan brand
getProdukByBrand(token: string, brandId: string): Promise<ProdukRecord[]>

// Membuat produk baru
createProduk(token: string, data: {
    subkategori_id: string;
    brand_id: string;
    nama: string;
    deskripsi: string;
    harga: number;
    gambar?: string;
    status?: StatusProduk;
}): Promise<ProdukRecord>

// Mengupdate produk
updateProduk(token: string, id: string, data: Partial<{
    subkategori_id: string;
    brand_id: string;
    nama: string;
    deskripsi: string;
    harga: number;
    gambar: string;
    status: StatusProduk;
}>): Promise<ProdukRecord>

// Menghapus produk
deleteProduk(token: string, id: string): Promise<void>

// Varian Produk functions
listProdukVarian(token: string, produkId: string): Promise<ProdukVarianRecord[]>
getProdukVarianById(token: string, varianId: string): Promise<ProdukVarianRecord>
createProdukVarian(token: string, data: {
    produk_id: string;
    ukuran?: string;
    warna?: string;
    stok: number;
    harga?: number;
    sku?: string;
}): Promise<ProdukVarianRecord>
updateProdukVarian(token: string, varianId: string, data: Partial<{
    ukuran: string;
    warna: string;
    stok: number;
    harga: number;
    sku: string;
}>): Promise<ProdukVarianRecord>
deleteProdukVarian(token: string, varianId: string): Promise<void>
```

## Halaman yang Tersedia

### 1. Halaman Utama Produk (`/produk`)
- **URL**: `/produk`
- **File**: `src/app/produk/page.tsx`
- **Fitur**:
  - Form tambah produk baru
  - Daftar semua produk
  - Filter berdasarkan kategori/subkategori
  - Edit dan delete produk
  - Link ke detail produk

### 2. Halaman Detail Produk (`/produk/[id]`)
- **URL**: `/produk/[id]` (dinamis berdasarkan ID produk)
- **File**: `src/app/produk/[id]/page.tsx`
- **Fitur**:
  - Tampilan detail lengkap produk
  - Informasi harga dan stok
  - Gambar produk
  - Informasi kategori
  - Timestamp sistem
  - Tombol edit dan kembali

## Keamanan dan Otorisasi

### Autentikasi
- Menggunakan JWT token dari localStorage
- Validasi token sebelum setiap request
- Redirect ke login jika token tidak valid

### Otorisasi
- Hanya user dengan role `petugas` yang dapat mengakses
- Menggunakan JWT Auth Guard dan Roles Guard
- Validasi role di backend API

## Validasi Input

### Create Produk
- `subkategori_id`: Wajib diisi (UUID)
- `brand_id`: Wajib diisi (UUID)
- `nama`: Wajib diisi (string)
- `deskripsi`: Wajib diisi (text)
- `harga`: Wajib diisi (number > 0)
- `gambar`: Opsional (URL string)
- `status`: Opsional (default: aktif)

### Update Produk
- Semua field opsional
- Hanya field yang diisi yang akan diupdate
- Validasi tipe data tetap dilakukan

### Create Varian Produk
- `produk_id`: Wajib diisi (UUID)
- `stok`: Wajib diisi (integer >= 0)
- `ukuran`: Opsional (string)
- `warna`: Opsional (string)
- `harga`: Opsional (number > 0)
- `sku`: Opsional (string, unique)

### Update Varian Produk
- Semua field opsional
- Hanya field yang diisi yang akan diupdate
- Validasi tipe data tetap dilakukan

## UI/UX Features

### Responsive Design
- Grid layout yang responsif
- Flexbox untuk alignment
- Mobile-friendly interface

### Visual Feedback
- Loading states
- Error handling dengan pesan yang jelas
- Success feedback untuk operasi CRUD
- Konfirmasi untuk delete operation

### Styling
- Modern card-based design
- Color-coded buttons (hijau untuk create, biru untuk detail, orange untuk edit, merah untuk delete)
- Currency formatting untuk harga (IDR)
- Proper spacing dan typography

## Integrasi dengan Backend

### Base URL
- Menggunakan environment variable `NEXT_PUBLIC_API_URL`
- Default: `http://localhost:3000`

### Headers
```typescript
{
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
}
```

### Error Handling
- HTTP status code validation
- Custom error messages
- Graceful fallback untuk network errors

## Cara Penggunaan

### 1. Login sebagai Petugas
```bash
# Login dengan kredensial petugas
# Token akan disimpan di localStorage
```

### 2. Akses Halaman Produk
```bash
# Dari home page, klik "Kelola Produk"
# Atau akses langsung ke /produk
```

### 3. Tambah Produk Baru
1. Isi form "Tambah Produk Baru"
2. Masukkan subkategori_id dan brand_id (UUID)
3. Isi nama, deskripsi, dan harga
4. Klik "Tambah Produk"

### 4. Edit Produk
1. Klik tombol "Edit" pada produk yang ingin diedit
2. Modifikasi field yang diinginkan
3. Klik "Simpan" untuk update atau "Batal" untuk cancel

### 5. Hapus Produk
1. Klik tombol "Delete" pada produk yang ingin dihapus
2. Konfirmasi penghapusan
3. Produk akan dihapus dari database

### 6. Lihat Detail Produk
1. Klik tombol "Detail" pada produk
2. Halaman detail akan menampilkan informasi lengkap
3. Dapat mengedit dari halaman detail

## Troubleshooting

### Error "Token tidak ditemukan"
- Pastikan sudah login sebagai petugas
- Cek localStorage untuk token
- Login ulang jika token expired

### Error "Gagal memuat data produk"
- Cek koneksi internet
- Pastikan backend API berjalan
- Cek console browser untuk error detail

### Error "Create/Update/Delete produk gagal"
- Pastikan role user adalah `petugas`
- Cek validasi input
- Pastikan subkategori_id dan brand_id valid

## Dependencies

### Frontend
- Next.js 15.5.0
- React 19.1.0
- TypeScript

### Backend (NestJS)
- TypeORM
- JWT Authentication
- Role-based Authorization

## File Structure

```
src/app/
├── produk/
│   ├── page.tsx              # Halaman utama CRUD produk
│   └── [id]/
│       └── page.tsx          # Halaman detail produk
├── services/
│   ├── produk.ts             # Service untuk API calls produk
│   └── brand.ts              # Service untuk API calls brand
└── home/
    └── page.tsx              # Link ke halaman produk
```

## Future Enhancements

1. **Image Upload**: Integrasi dengan cloud storage untuk upload gambar
2. **Bulk Operations**: Import/export produk dalam format CSV/Excel
3. **Advanced Filtering**: Filter berdasarkan range harga, stok, tanggal
4. **Search**: Pencarian berdasarkan nama produk
5. **Pagination**: Pagination untuk daftar produk yang besar
6. **Real-time Updates**: WebSocket untuk update real-time
7. **Audit Trail**: Log perubahan produk
8. **Export Reports**: Generate laporan produk dalam PDF/Excel




