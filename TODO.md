# Update Frontend to Match Revised Backend Payment System

## Information Gathered
- Backend has new Pembayaran entity with metode enum: COD, GOPAY, OVO, DANA, QRIS, SHOPEEPAY
- Status enum: BELUM_BAYAR, SUDAH_BAYAR, GAGAL, DIKEMBALIKAN
- New fields: bukti_pembayaran (nullable)
- New endpoints: POST /pembayaran (createPayment), POST /pembayaran/initiate, POST /pembayaran/cod, POST /notification, GET /:pesananId, PUT /:id/status
- Frontend currently uses old API with createPembayaran for COD, createMidtransPayment for Midtrans
- Checkout creates pesanan first, then payment
- Order detail syncs status, but new backend handles via notifications

## Plan
1. Update src/app/services/pembayaran.ts
   - Update MetodePembayaran enum to match backend
   - Update PembayaranRecord interface (remove jumlah_pembayaran, keterangan; add bukti_pembayaran)
   - Update createPembayaran to POST /pembayaran with {pesananId}
   - Keep createMidtransPayment as POST /pembayaran/initiate
   - Add createCodPayment function
   - Remove syncOrderStatusWithPayment

2. Update src/app/checkout/page.tsx
   - Change paymentMethod to string 'midtrans' | 'cod'
   - Import createCodPayment
   - Update handleSubmit to call createCodPayment for COD instead of createPembayaran

3. Update src/app/pesanan/[id]/page.tsx
   - Remove syncOrderStatusWithPayment call

4. Update src/app/admin/page.tsx
   - Update MetodePembayaran import
   - Update filter to use MetodePembayaran.COD

## Dependent Files
- src/app/services/pembayaran.ts
- src/app/checkout/page.tsx
- src/app/pesanan/[id]/page.tsx
- src/app/admin/page.tsx

## Followup Steps
- Test checkout flow for both Midtrans and COD
- Verify payment status updates work
- Ensure admin can update COD payments
