"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllPesanan, PesananRecord, StatusPesanan } from "../services/pesanan";
import { getPaymentStatus, updatePaymentStatus, MetodePembayaran, StatusPembayaran, PembayaranRecord } from "../services/pembayaran";
import { getProfile } from "../services/auth";

interface PesananWithPayment extends PesananRecord {
  pembayaran?: PembayaranRecord;
}

export default function AdminCODPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<PesananWithPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setError("Token tidak ditemukan. Login sebagai admin dulu.");
      setLoading(false);
      return;
    }
    setToken(stored);
    initData(stored);
  }, []);

  async function initData(currentToken: string) {
    try {
      // Get user profile to check role
      const userData = await getProfile(currentToken);
      setUser(userData?.user || userData || null);

      // Get all orders
      const allOrders = await getAllPesanan(currentToken);

      // Filter COD orders and get payment status for each
      const codOrders: PesananWithPayment[] = [];

      for (const order of allOrders) {
        try {
          const payment = await getPaymentStatus(currentToken, order.id);
          if (payment.metode === MetodePembayaran.COD) {
            codOrders.push({
              ...order,
              pembayaran: payment
            });
          }
        } catch (e) {
          // If no payment record found, skip this order
          console.log(`No payment found for order ${order.id}`);
        }
      }

      setOrders(codOrders);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data pesanan COD");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePaymentStatus(orderId: string, pembayaranId: string, newStatus: StatusPembayaran) {
    if (!token) return;

    setUpdating(pembayaranId);
    try {
      await updatePaymentStatus(token, pembayaranId, newStatus);

      // Refresh data
      await initData(token);
      alert(`Status pembayaran berhasil diupdate ke ${newStatus}`);
    } catch (e: any) {
      alert(e?.message || "Gagal update status pembayaran");
    } finally {
      setUpdating(null);
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: StatusPesanan | StatusPembayaran): string {
    switch (status) {
      case StatusPesanan.PENDING:
      case StatusPembayaran.BELUM_BAYAR:
        return '#f39c12';
      case StatusPesanan.DIPROSES:
      case StatusPembayaran.SUDAH_BAYAR:
        return '#27ae60';
      case StatusPesanan.DIKIRIM:
        return '#3498db';
      case StatusPesanan.SELESAI:
        return '#2ecc71';
      case StatusPesanan.DIBATALKAN:
      case StatusPembayaran.GAGAL:
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Memuat data pesanan COD...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>Error: {error}</h2>
        <button
          onClick={() => router.push('/login')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '20px'
          }}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: 20 }}>
        <a href="/home" style={{ textDecoration: 'none', color: '#3498db', fontWeight: 'bold', fontSize: '16px' }}>
          ← Kembali ke Home
        </a>
      </div>

      <h1 style={{ margin: '0 0 30px 0', color: '#2c3e50', fontSize: '32px', fontWeight: 'bold', textAlign: 'center' }}>
        🛠️ Admin - Manajemen Pembayaran COD
      </h1>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: '16px', color: '#7f8c8d' }}>
          Kelola status pembayaran COD yang tidak bisa diupdate otomatis seperti Midtrans
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
          <h3 style={{ color: '#7f8c8d' }}>Tidak ada pesanan COD yang perlu dikelola</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {orders.map((order) => (
            <div key={order.id} style={{
              border: "2px solid #e1e8ed",
              borderRadius: 16,
              padding: 24,
              backgroundColor: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '20px' }}>
                    Order #{order.id}
                  </h3>
                  <p style={{ margin: '0', color: '#7f8c8d', fontSize: '14px' }}>
                    {order.user?.username} - {formatDate(order.created_at)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: getStatusColor(order.status),
                    display: 'inline-block'
                  }}>
                    {order.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                  📍 Alamat Pengiriman: {order.alamat_pengiriman}
                </p>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                  💰 Total: {formatCurrency(order.total_harga)}
                </p>
              </div>

              {order.pembayaran && (
                <div style={{
                  border: '1px solid #e1e8ed',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  marginBottom: 16
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>
                    💳 Status Pembayaran COD
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getStatusColor(order.pembayaran.status)
                    }}>
                      {order.pembayaran.status.toUpperCase().replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '14px', color: '#7f8c8d' }}>
                      Metode: COD (Bayar di Tempat)
                    </span>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label htmlFor={`status-select-${order.pembayaran.id}`} style={{ fontWeight: 'bold', marginRight: '8px' }}>
                      Ubah Status Pembayaran:
                    </label>
                    <select
                      id={`status-select-${order.pembayaran.id}`}
                      value={order.pembayaran.status}
                      onChange={(e) => handleUpdatePaymentStatus(order.id, order.pembayaran!.id, e.target.value as StatusPembayaran)}
                      disabled={updating === order.pembayaran!.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px',
                        cursor: updating === order.pembayaran!.id ? 'not-allowed' : 'pointer',
                        minWidth: '180px'
                      }}
                    >
                      <option value={StatusPembayaran.BELUM_BAYAR}>Belum Bayar</option>
                      <option value={StatusPembayaran.SUDAH_BAYAR}>Sudah Bayar</option>
                      <option value={StatusPembayaran.GAGAL}>Gagal</option>
                    </select>
                    {updating === order.pembayaran!.id && <span style={{ marginLeft: '8px' }}>⏳ Updating...</span>}
                  </div>

                  {order.pembayaran.status === StatusPembayaran.SUDAH_BAYAR && (
                    <span style={{ fontSize: '14px', color: '#27ae60', fontWeight: 'bold' }}>
                      ✅ Pembayaran sudah dikonfirmasi
                    </span>
                  )}

                  {order.pembayaran.status === StatusPembayaran.GAGAL && (
                    <span style={{ fontSize: '14px', color: '#e74c3c', fontWeight: 'bold' }}>
                      ❌ Pembayaran gagal
                    </span>
                  )}
                </div>
              )}

              <div style={{ borderTop: '1px solid #e1e8ed', paddingTop: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>
                  📦 Detail Produk ({order.pesanan_items?.length || 0} item)
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {order.pesanan_items?.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{item.produk?.nama}</span>
                        {item.produk_varian && (
                          <span style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '8px' }}>
                            ({item.produk_varian.ukuran}, {item.produk_varian.warna})
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '8px' }}>
                          x{item.kuantitas}
                        </span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#27ae60' }}>
                        {formatCurrency(item.harga_satuan * item.kuantitas)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
