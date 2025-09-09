# Sistem Pemesanan E-Commerce

## Overview
Sistem pemesanan yang lengkap untuk aplikasi e-commerce dengan fitur keranjang belanja, checkout, dan manajemen pesanan.

## Fitur Utama

### 🛒 Keranjang Belanja
- **Tambah Produk**: Pelanggan dapat menambahkan produk ke keranjang dari halaman detail produk
- **Pilih Varian**: Mendukung pemilihan varian produk (ukuran, warna, dll)
- **Atur Kuantitas**: Kontrol jumlah produk yang dibeli
- **Hitung Total**: Kalkulasi otomatis total harga
- **Penyimpanan Lokal**: Data keranjang tersimpan di localStorage

### 📋 Checkout
- **Review Pesanan**: Tampilan ringkasan produk yang dipilih
- **Informasi Pengiriman**: Form untuk alamat pengiriman
- **Validasi**: Pengecekan data sebelum submit
- **Integrasi API**: Terhubung dengan backend NestJS

### 📦 Manajemen Pesanan
- **Daftar Pesanan**: Halaman untuk melihat semua pesanan customer
- **Detail Pesanan**: Informasi lengkap setiap pesanan
- **Status Tracking**: Monitoring status pesanan (pending, diproses, dikirim, selesai, dibatalkan)
- **Riwayat**: Timestamp pembuatan dan update pesanan

## Struktur File

```
src/app/
├── contexts/
│   └── CartContext.tsx          # Context untuk state management keranjang
├── components/
│   └── Cart.tsx                 # Komponen keranjang belanja
├── services/
│   └── pesanan.ts               # Service untuk API pesanan
├── checkout/
│   └── page.tsx                 # Halaman checkout
├── pesanan/
│   ├── page.tsx                 # Daftar pesanan
│   └── [id]/
│       └── page.tsx             # Detail pesanan
└── produk/
    └── [id]/
        └── page.tsx             # Detail produk dengan fitur add to cart
```

## Cara Penggunaan

### 1. Menambahkan Produk ke Keranjang
1. Buka halaman detail produk (`/produk/[id]`)
2. Pilih varian produk (jika tersedia)
3. Atur kuantitas yang diinginkan
4. Klik tombol "Tambah ke Keranjang"
5. Produk akan ditambahkan ke keranjang dengan notifikasi

### 2. Mengelola Keranjang
1. Klik ikon keranjang di header
2. Lihat daftar produk dalam keranjang
3. Atur kuantitas dengan tombol +/- 
4. Hapus produk yang tidak diinginkan
5. Klik "Checkout" untuk melanjutkan

### 3. Proses Checkout
1. Review ringkasan pesanan
2. Isi alamat pengiriman
3. Klik "Buat Pesanan"
4. Sistem akan membuat pesanan di backend
5. Redirect ke halaman detail pesanan

### 4. Melihat Pesanan
1. Klik "Lihat Pesanan" di header
2. Lihat daftar semua pesanan
3. Klik pesanan untuk melihat detail
4. Monitor status pesanan

## API Endpoints

### Pesanan
- `POST /pesanan` - Membuat pesanan baru
- `GET /pesanan` - Mendapatkan semua pesanan
- `GET /pesanan/:id` - Mendapatkan detail pesanan
- `PUT /pesanan/:id` - Update pesanan
- `DELETE /pesanan/:id` - Hapus pesanan

### Item Pesanan
- `POST /pesanan/item` - Membuat item pesanan
- `GET /pesanan/item` - Mendapatkan semua item pesanan
- `GET /pesanan/item/:id` - Mendapatkan detail item pesanan
- `PUT /pesanan/item/:id` - Update item pesanan
- `DELETE /pesanan/item/:id` - Hapus item pesanan

## Data Models

### Pesanan
```typescript
interface PesananRecord {
  id: string;
  user_id: string;
  tanggal_pesanan: string;
  total_harga: number;
  status: StatusPesanan;
  alamat_pengiriman: string;
  created_at: string;
  updated_at: string;
  pesanan_items?: PesananItemRecord[];
  user?: {
    id: string;
    username: string;
    email: string;
  };
}
```

### Item Pesanan
```typescript
interface PesananItemRecord {
  id: string;
  pesanan_id: string;
  id_produk: string;
  produk_varian_id?: string;
  kuantitas: number;
  harga_satuan: number;
  produk?: {
    id: string;
    nama: string;
    gambar?: string;
  };
  produk_varian?: {
    id: string;
    ukuran?: string;
    warna?: string;
  };
}
```

### Status Pesanan
```typescript
enum StatusPesanan {
  PENDING = "pending",
  DIPROSES = "diproses", 
  DIKIRIM = "dikirim",
  SELESAI = "selesai",
  DIBATALKAN = "dibatalkan"
}
```

## State Management

### CartContext
Menggunakan React Context untuk mengelola state keranjang belanja:

```typescript
interface CartContextType {
  state: CartState;
  addItem: (produk: ProdukRecord, quantity: number, varian?: ProdukVarianRecord) => void;
  removeItem: (produkId: string, varianId?: string) => void;
  updateQuantity: (produkId: string, quantity: number, varianId?: string) => void;
  clearCart: () => void;
  getItemQuantity: (produkId: string, varianId?: string) => number;
  getItemTotal: (produkId: string, varianId?: string) => number;
}
```

## Fitur Keamanan

### Role-Based Access
- **Customer**: Dapat membuat dan melihat pesanan sendiri
- **Admin**: Dapat melihat dan mengelola semua pesanan
- **Petugas**: Akses terbatas sesuai role

### Authentication
- Semua endpoint memerlukan JWT token
- Validasi token di setiap request
- Redirect ke login jika token tidak valid

## UI/UX Features

### Responsive Design
- Layout yang responsif untuk desktop dan mobile
- Grid system yang fleksibel
- Komponen yang dapat diakses

### Visual Feedback
- Loading states untuk operasi async
- Error handling dengan pesan yang jelas
- Success notifications
- Hover effects dan transitions

### Accessibility
- Semantic HTML elements
- Proper ARIA labels
- Keyboard navigation support
- Color contrast compliance

## Integrasi dengan Backend

### NestJS Controller
```typescript
@Controller('pesanan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PesananController {
  @Roles('customer')
  @Post()
  async create(@Body() createPesananDto: CreatePesananDto): Promise<PesananDto> {
    // Implementation
  }
  
  @Roles('admin', 'customer')
  @Get()
  async findAll(): Promise<PesananDto[]> {
    // Implementation
  }
}
```

### Database Entities
```typescript
@Entity('pesanan')
export class Pesanan {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ type: 'uuid' })
  user_id: string;
  
  @Column({ type: 'timestamp' })
  tanggal_pesanan: Date;
  
  @Column({ type: 'int' })
  total_harga: number;
  
  @Column({
    type: 'enum',
    enum: StatusPesanan,
    default: StatusPesanan.PENDING
  })
  status: StatusPesanan;
}
```

## Error Handling

### Frontend
- Try-catch blocks untuk API calls
- User-friendly error messages
- Fallback UI untuk error states
- Validation feedback

### Backend
- HTTP status codes yang sesuai
- Detailed error messages
- Logging untuk debugging
- Input validation

## Performance Optimization

### Frontend
- Lazy loading untuk komponen besar
- Memoization untuk expensive calculations
- Debounced API calls
- Optimized re-renders

### Backend
- Database indexing
- Query optimization
- Caching strategies
- Pagination untuk large datasets

## Testing

### Unit Tests
- Component testing dengan React Testing Library
- Service function testing
- Context testing

### Integration Tests
- API endpoint testing
- User flow testing
- Error scenario testing

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Build Process
```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues
1. **Token expired**: Redirect ke login
2. **Cart not persisting**: Check localStorage
3. **API errors**: Check network tab
4. **Role access denied**: Verify user permissions

### Debug Tips
- Check browser console for errors
- Verify API endpoints are accessible
- Confirm database connections
- Test with different user roles

## Future Enhancements

### Planned Features
- Payment gateway integration
- Email notifications
- Order tracking
- Review system
- Wishlist functionality
- Bulk ordering
- Discount codes
- Shipping calculator

### Technical Improvements
- Real-time updates with WebSocket
- Offline support with Service Workers
- Progressive Web App features
- Advanced search and filtering
- Analytics dashboard
- Multi-language support






