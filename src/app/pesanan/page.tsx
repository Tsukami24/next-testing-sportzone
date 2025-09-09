"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllPesanan, PesananRecord, StatusPesanan } from "../services/pesanan";

export default function PesananListPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [pesanan, setPesanan] = useState<PesananRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const stored = localStorage.getItem("token");
        if (!stored) {
          setError("Token tidak ditemukan. Login dulu.");
          setLoading(false);
          return;
        }
        setToken(stored);

        const data = await getAllPesanan(stored);
        setPesanan(data);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat daftar pesanan");
      } finally {
        setLoading(false);
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

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: StatusPesanan): string {
    switch (status) {
      case StatusPesanan.PENDING:
        return '#f39c12';
      case StatusPesanan.DIPROSES:
        return '#3498db';
      case StatusPesanan.DIKIRIM:
        return '#9b59b6';
      case StatusPesanan.SELESAI:
        return '#27ae60';
      case StatusPesanan.DIBATALKAN:
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  }

  function getStatusText(status: StatusPesanan): string {
    switch (status) {
      case StatusPesanan.PENDING:
        return '⏳ Menunggu Konfirmasi';
      case StatusPesanan.DIPROSES:
        return '🔧 Sedang Diproses';
      case StatusPesanan.DIKIRIM:
        return '🚚 Sedang Dikirim';
      case StatusPesanan.SELESAI:
        return '✅ Selesai';
      case StatusPesanan.DIBATALKAN:
        return '❌ Dibatalkan';
      default:
        return '❓ Status Tidak Diketahui';
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Memuat daftar pesanan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "red" }}>{error}</p>
        <p>
          <a href="/produk">Kembali ke Daftar Produk</a>
        </p>
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

      <div style={{ 
        border: "2px solid #e1e8ed", 
        borderRadius: 16, 
        padding: 30, 
        backgroundColor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 30, textAlign: 'center' }}>
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '32px', fontWeight: 'bold' }}>
            📋 Daftar Pesanan
          </h1>
          <p style={{ margin: '10px 0', color: '#7f8c8d', fontSize: '16px' }}>
            Total {pesanan.length} pesanan ditemukan
          </p>
        </div>

        {pesanan.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '24px' }}>
              Belum Ada Pesanan
            </h3>
            <p style={{ margin: '0 0 30px 0', color: '#7f8c8d', fontSize: '16px' }}>
              Anda belum memiliki pesanan. Mulai berbelanja sekarang!
            </p>
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
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {pesanan.map((order) => (
              <div key={order.id} style={{ 
                border: '2px solid #e1e8ed', 
                borderRadius: 12, 
                padding: 20,
                backgroundColor: '#f8f9fa',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => router.push(`/pesanan/${order.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3498db';
                e.currentTarget.style.backgroundColor = '#ebf8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e1e8ed';
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                      Pesanan #{order.id.slice(0, 8)}...
                    </h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#7f8c8d' }}>
                      {formatDate(order.tanggal_pesanan)}
                    </p>
                  </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      padding: '6px 12px', 
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                      {getStatusText(order.status)}
                    </div>
                    {/* Add status update dropdown for admin */}
                    <select
                      value={order.status}
                      onChange={async (e) => {
                        e.stopPropagation(); // Prevent card click navigation
                        const newStatus = e.target.value as import("../services/pesanan-updated").StatusPesanan;
                        if (newStatus === order.status) return;
                        if (!token) {
                          alert("Token tidak ditemukan. Silakan login ulang.");
                          return;
                        }
                        try {
                          // Check if user is admin before allowing certain status changes
                          const { isAdmin } = await import("../services/auth");
                          const admin = await isAdmin(token);
                          if ((newStatus === "dikirim" || newStatus === "selesai") && !admin) {
                            alert("Hanya admin yang dapat mengubah status ke dikirim atau selesai");
                            return;
                          }
                          await import("../services/pesanan-updated").then(({ updatePesanan }) =>
                            updatePesanan(token, order.id, { status: newStatus })
                          );
                          alert("Status pesanan berhasil diperbarui");
                          // Refresh pesanan list
                          const data = await import("../services/pesanan-updated").then(({ getAllPesanan }) =>
                            getAllPesanan(token)
                          );
                          setPesanan(data);
                        } catch (error: any) {
                          alert(error?.message || "Gagal memperbarui status pesanan");
                        }
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent card click when clicking dropdown
                      style={{
                        marginTop: 8,
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        fontSize: 14,
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      <option value="pending">⏳ Menunggu Konfirmasi</option>
                      <option value="diproses">🔧 Sedang Diproses</option>
                      <option value="dikirim">🚚 Sedang Dikirim</option>
                      <option value="selesai">✅ Selesai</option>
                      <option value="dibatalkan">❌ Dibatalkan</option>
                    </select>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                      {formatCurrency(order.total_harga)}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  padding: '15px', 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '1px solid #e1e8ed'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#2c3e50' }}>Alamat Pengiriman:</strong>
                  </div>
                  <p style={{ 
                    margin: '0', 
                    fontSize: '14px', 
                    color: '#34495e',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {order.alamat_pengiriman}
                  </p>
                </div>

                {order.pesanan_items && order.pesanan_items.length > 0 && (
                  <div style={{ marginTop: 15 }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ color: '#2c3e50' }}>Item ({order.pesanan_items.length} produk):</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {order.pesanan_items.slice(0, 3).map((item, index) => (
                        <div key={item.id} style={{ 
                          padding: '8px 12px', 
                          backgroundColor: '#ecf0f1', 
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#2c3e50',
                          border: '1px solid #bdc3c7'
                        }}>
                          {item.produk?.nama || `Produk ${index + 1}`} ({item.kuantitas})
                        </div>
                      ))}
                      {order.pesanan_items.length > 3 && (
                        <div style={{ 
                          padding: '8px 12px', 
                          backgroundColor: '#f39c12', 
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: 'white',
                          border: '1px solid #e67e22'
                        }}>
                          +{order.pesanan_items.length - 3} lainnya
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ 
                  marginTop: 15, 
                  paddingTop: 15, 
                  borderTop: '1px solid #e1e8ed',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    Dibuat: {formatDate(order.created_at)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#3498db', fontWeight: 'bold' }}>
                    Klik untuk detail →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}






