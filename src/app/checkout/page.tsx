"use client";

// Type declaration for Midtrans Snap
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: any) => void;
    };
  }
}

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { createPesanan, CreatePesananDto, CreatePesananItemDto } from '../services/pesanan';
import { createPembayaran, createMidtransPayment, MetodePembayaran } from '../services/pembayaran';
import { getProfile } from '../services/auth';

export default function CheckoutPage() {
  const router = useRouter();
  const { state, clearCart } = useCart();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<any[] | null>(null);
  const [draftTotal, setDraftTotal] = useState<number | null>(null);

  // Form state
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<MetodePembayaran>(MetodePembayaran.MIDTRANS);
  const snapScriptLoaded = useRef(false);

  useEffect(() => {
    async function init() {
      try {
        const stored = localStorage.getItem("token");
        if (!stored) {
          setError("Token tidak ditemukan. Login dulu.");
          return;
        }
        setToken(stored);

        // Get user profile
        const userData = await getProfile(stored);
        setUser(userData?.user || userData || null);

        // Set default order date to today
        const today = new Date().toISOString().split('T')[0];
        setOrderDate(today);

        // Load checkout draft (Buy Now flow)
        const draft = localStorage.getItem('checkoutDraft');
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            if (Array.isArray(parsed.items) && typeof parsed.total === 'number') {
              setDraftItems(parsed.items);
              setDraftTotal(parsed.total);
            }
          } catch {}
        }

        // Load Midtrans Snap script
        if (!snapScriptLoaded.current) {
          const script = document.createElement('script');
          script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
          script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YourClientKey');
          script.onload = () => {
            snapScriptLoaded.current = true;
          };
          script.onerror = () => {
            console.error('Failed to load Midtrans Snap script');
            setError('Gagal memuat sistem pembayaran. Silakan refresh halaman.');
          };
          document.body.appendChild(script);
        }
      } catch (e: any) {
        setError(e?.message || "Gagal memuat data user");
      }
    }
    init();
  }, []);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      setError("Token atau data user tidak valid");
      return;
    }

    const effectiveItems = (draftItems && draftItems.length > 0) ? draftItems : state.items;
    const effectiveTotal = (draftTotal !== null) ? draftTotal : state.total;

    if (!effectiveItems || effectiveItems.length === 0) {
      setError("Tidak ada item untuk dipesan");
      return;
    }

    if (!shippingAddress.trim()) {
      setError("Alamat pengiriman harus diisi");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare order items
      const items: CreatePesananItemDto[] = effectiveItems.map((item: any) => ({
        id_produk: item.produk.id,
        produk_varian_id: item.varian?.id,
        kuantitas: item.quantity,
        harga_satuan: item.varian?.harga || item.produk.harga
      }));

      // Create order data
      const orderData: any = {
        tanggal_pesanan: new Date(orderDate).toISOString(),
        total_harga: effectiveTotal,
        alamat_pengiriman: shippingAddress,
        items: items
      };

      if (user?.id) {
        orderData.user_id = user.id;
      }

      // Submit order
      const order = await createPesanan(token, orderData);

      // Create payment based on selected method
      const paymentData = {
        pesanan_id: order.id,
        metode: paymentMethod,
        jumlah_pembayaran: effectiveTotal,
        keterangan: `Pembayaran untuk pesanan #${order.id}`
      };

      const payment = await createPembayaran(token, paymentData);

      // Clear cart after successful order
      if (!draftItems) {
        clearCart();
      }
      try { localStorage.removeItem('checkoutDraft'); } catch {}

      // Handle different payment methods
      if (paymentMethod === MetodePembayaran.MIDTRANS) {
        setPaymentLoading(true);
        setSuccess(`Pesanan berhasil dibuat! Memproses pembayaran...`);

        // Use Midtrans Snap popup
        const midtransData = await createMidtransPayment(token, order.id);
        console.log('Midtrans snap object:', window.snap);
        console.log('Midtrans token:', midtransData.token);
        if (window.snap && midtransData.token) {
          try {
            window.snap.pay(midtransData.token, {
              onSuccess: function(result: any) {
                setPaymentLoading(false);
                setSuccess(`Pembayaran berhasil! Order ID: ${result.order_id}`);
                setTimeout(() => {
                  router.push(`/pesanan/${order.id}`);
                }, 2000);
              },
              onPending: function(result: any) {
                setPaymentLoading(false);
                setSuccess(`Pembayaran sedang diproses. Order ID: ${result.order_id}`);
                setTimeout(() => {
                  router.push(`/pesanan/${order.id}`);
                }, 2000);
              },
              onError: function(result: any) {
                setPaymentLoading(false);
                setError(`Pembayaran gagal: ${result.status_message || 'Terjadi kesalahan'}`);
              },
              onClose: function() {
                setPaymentLoading(false);
                if (!success) {
                  setError("Pembayaran dibatalkan oleh pengguna.");
                }
              }
            });
          } catch (err) {
            console.error('Error calling snap.pay:', err);
            setPaymentLoading(false);
            setError('Terjadi kesalahan saat memproses pembayaran Midtrans.');
          }
        } else if (midtransData.redirect_url) {
          window.location.href = midtransData.redirect_url;
        } else {
          // Fallback to order detail if no redirect URL
          setPaymentLoading(false);
          router.push(`/pesanan/${order.id}`);
        }
      } else {
        // For COD, redirect to order detail
        setSuccess("Pesanan berhasil dibuat! Silakan lakukan pembayaran saat barang sampai.");
        setTimeout(() => {
          router.push(`/pesanan/${order.id}`);
        }, 2000);
      }
    } catch (e: any) {
      setError(e?.message || "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  const itemsForView = (draftItems && draftItems.length > 0) ? draftItems : state.items;
  const totalForView = (draftTotal !== null) ? draftTotal : state.total;

  if (!itemsForView || itemsForView.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Keranjang Belanja Kosong</h2>
        <p>Silakan tambahkan produk ke keranjang terlebih dahulu.</p>
        <button
          onClick={() => router.push('/produk')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Lihat Produk
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: 20 }}>
        <a href="/produk" style={{ textDecoration: 'none', color: '#3498db', fontWeight: 'bold', fontSize: '16px' }}>
          ← Kembali ke Daftar Produk
        </a>
      </div>

      <h1 style={{ margin: '0 0 30px 0', color: '#2c3e50', fontSize: '32px', fontWeight: 'bold', textAlign: 'center' }}>
        🛒 Checkout
      </h1>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          ✅ {success}
        </div>
      )}

      {paymentLoading && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          color: '#856404',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔄 Memproses Pembayaran...</div>
          <div style={{ fontSize: '14px' }}>Mohon tunggu sebentar, jangan tutup halaman ini</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
        {/* Order Summary */}
        <div style={{
          border: "2px solid #e1e8ed",
          borderRadius: 16,
          padding: 30,
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          height: 'fit-content'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '24px', fontWeight: 'bold' }}>
            📋 Ringkasan Pesanan
          </h2>

          <div style={{ marginBottom: 20 }}>
            {itemsForView.map((item: any, index: number) => (
              <div key={index} style={{
                borderBottom: '1px solid #e1e8ed',
                padding: '15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 15
              }}>
                {item.produk.gambar && (
                  <img
                    src={item.produk.gambar}
                    alt={item.produk.nama}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>
                    {item.produk.nama}
                  </h4>
                  {item.varian && (
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#7f8c8d' }}>
                      {item.varian.ukuran && `Ukuran: ${item.varian.ukuran}`}
                      {item.varian.warna && ` | Warna: ${item.varian.warna}`}
                    </p>
                  )}
                  <p style={{ margin: '0', fontSize: '14px', color: '#7f8c8d' }}>
                    Jumlah: {item.quantity} x {formatCurrency(item.varian?.harga || item.produk.harga)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#27ae60' }}>
                    {formatCurrency((item.varian?.harga || item.produk.harga) * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '2px solid #e1e8ed',
            paddingTop: '20px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Total:</span>
              <span style={{ color: '#27ae60', fontSize: '24px' }}>
                {formatCurrency(totalForView)}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div style={{
          border: "2px solid #e1e8ed",
          borderRadius: 16,
          padding: 30,
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '24px', fontWeight: 'bold' }}>
            📝 Informasi Pengiriman
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#2c3e50' }}>
                Nama Pelanggan:
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: '#f8f9fa'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#2c3e50' }}>
                Email:
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: '#f8f9fa'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#2c3e50' }}>
                Tanggal Pesanan:
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: 30 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#2c3e50' }}>
                Alamat Pengiriman: *
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                rows={4}
                placeholder="Masukkan alamat pengiriman lengkap..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#2c3e50' }}>
                Metode Pembayaran: *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as MetodePembayaran)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value={MetodePembayaran.MIDTRANS}>💳 Midtrans (Online Payment)</option>
                <option value={MetodePembayaran.COD}>🚚 COD (Bayar di Tempat)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || paymentLoading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: (loading || paymentLoading) ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: (loading || paymentLoading) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              {loading ? '⏳ Memproses Pesanan...' :
               paymentLoading ? '🔄 Memproses Pembayaran...' :
               '✅ Buat Pesanan & Bayar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
