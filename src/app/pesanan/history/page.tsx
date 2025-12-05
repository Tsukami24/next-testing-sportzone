"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPesananHistory,
  PesananRecord,
  StatusPesanan,
  cancelPesanan,
} from "../../services/pesanan-updated";

export default function PesananHistoryPage() {
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
        const data = await getPesananHistory(stored);
        console.log("History Pesanan Data:", data);
        if (data.length > 0) {
          console.log("First Order Kota:", data[0].kota);
          console.log("First Order Provinsi:", data[0].provinsi);
        }
        setPesanan(data);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat riwayat pesanan");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const getStatus = (status: StatusPesanan) => {
    const statusMap = {
      [StatusPesanan.PENDING]: {
        text: "⏳ Menunggu Konfirmasi",
        color: "#f1c40f",
      },
      [StatusPesanan.DIPROSES]: {
        text: "🔧 Sedang Diproses",
        color: "#3498db",
      },
      [StatusPesanan.DIKIRIM]: { text: "🚚 Sedang Dikirim", color: "#9b59b6" },
      [StatusPesanan.SELESAI]: { text: "✅ Selesai", color: "#27ae60" },
      [StatusPesanan.DIBATALKAN]: { text: "❌ Dibatalkan", color: "#e74c3c" },
    };
    return (
      statusMap[status] || { text: "❓ Tidak Diketahui", color: "#7f8c8d" }
    );
  };

  function calculateEtaDate(orderDate: string, etaDays: number): string {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + etaDays);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <p style={{ fontSize: 18, color: "#7f8c8d" }}>
          Memuat riwayat pesanan...
        </p>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "red", fontSize: 18 }}>{error}</p>
        <a href="/produk" style={{ color: "#3498db", fontWeight: "bold" }}>
          ← Kembali ke Daftar Produk
        </a>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: 30 }}>
        <a href="/produk" style={styles.backLink}>
          ← Kembali ke Daftar Produk
        </a>
      </div>

      <div style={styles.header}>
        <h1 style={styles.title}>🛍️ Riwayat Pesanan Saya</h1>
        <p style={styles.subtitle}>Total {pesanan.length} pesanan ditemukan</p>
      </div>

      {pesanan.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: "60px", marginBottom: 10 }}>📦</div>
          <h2 style={{ color: "#2c3e50" }}>Belum Ada Pesanan</h2>
          <p style={{ color: "#7f8c8d" }}>Mulai berbelanja sekarang!</p>
          <button
            onClick={() => router.push("/produk")}
            style={styles.primaryButton}
          >
            Lihat Produk
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {pesanan.map((order) => {
            const status = getStatus(order.status);
            return (
              <div
                key={order.id}
                style={styles.card}
                onClick={() => router.push(`/pesanan/${order.id}`)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(52,152,219,0.3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 2px 10px rgba(0,0,0,0.08)")
                }
              >
                {/* HEADER */}
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.orderId}>
                      Pesanan #{order.id.slice(0, 8)}
                    </h3>
                    <p style={styles.date}>
                      {formatDate(order.tanggal_pesanan)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: status.color,
                      }}
                    >
                      {status.text}
                    </span>
                    <div style={styles.totalPrice}>
                      {formatCurrency(order.total_harga)}
                    </div>
                  </div>
                </div>

                {/* DETAIL ALAMAT */}
                <div style={styles.section}>
                  <p style={styles.sectionTitle}>📍 Alamat Pengiriman</p>
                  <p style={styles.address}>
                    {order.alamat_pengiriman}
                    {order.kota && order.provinsi && (
                      <span
                        style={{
                          display: "block",
                          marginTop: 5,
                          fontSize: "12px",
                          color: "#7f8c8d",
                          fontWeight: "bold",
                        }}
                      >
                        {order.kota}, {order.provinsi}
                      </span>
                    )}
                  </p>
                </div>

                {/* ESTIMASI PENGIRIMAN */}
                {order.eta_min &&
                  order.eta_max &&
                  order.status !== StatusPesanan.SELESAI &&
                  order.status !== StatusPesanan.DIBATALKAN && (
                    <div style={styles.section}>
                      <p style={styles.sectionTitle}>🚚 Estimasi Pengiriman</p>
                      <div
                        style={{
                          backgroundColor: "#e8f5e9",
                          borderRadius: 6,
                          padding: 10,
                          fontSize: "13px",
                          border: "1px solid #a5d6a7",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <div>
                            <span style={{ color: "#27ae60", fontWeight: "bold" }}>
                              📅 {calculateEtaDate(order.tanggal_pesanan, order.eta_min)}
                            </span>
                            <span style={{ color: "#7f8c8d", fontSize: "11px", marginLeft: 5 }}>
                              ({order.eta_min} hari)
                            </span>
                          </div>
                          <div style={{ color: "#7f8c8d" }}>-</div>
                          <div>
                            <span style={{ color: "#f39c12", fontWeight: "bold" }}>
                              📅 {calculateEtaDate(order.tanggal_pesanan, order.eta_max)}
                            </span>
                            <span style={{ color: "#7f8c8d", fontSize: "11px", marginLeft: 5 }}>
                              ({order.eta_max} hari)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* ITEM PRODUK */}
                {(order.pesanan_items?.length ?? 0) > 0 && (
                  <div style={styles.section}>
                    <p style={styles.sectionTitle}>
                      🛒 Produk ({order.pesanan_items?.length ?? 0})
                    </p>
                    <div style={styles.itemList}>
                      {(order.pesanan_items ?? [])
                        .slice(0, 3)
                        .map((item, i) => (
                          <div key={item.id} style={styles.item}>
                            {item.produk?.nama || `Produk ${i + 1}`} (
                            {item.kuantitas})
                          </div>
                        ))}
                      {(order.pesanan_items?.length ?? 0) > 3 && (
                        <div style={styles.moreBadge}>
                          +{(order.pesanan_items?.length ?? 0) - 3} lainnya
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FOOTER */}
                <div style={styles.footer}>
                  <span style={styles.footerDate}>
                    Dibuat: {formatDate(order.created_at)}
                  </span>
                  <div style={styles.footerActions}>
                    {order.status !== StatusPesanan.SELESAI &&
                      order.status !== StatusPesanan.DIBATALKAN && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (
                              confirm("Yakin ingin membatalkan pesanan ini?")
                            ) {
                              try {
                                const token = localStorage.getItem("token");
                                if (!token) return alert("Login dulu");
                                await cancelPesanan(token, order.id);
                                alert("Pesanan dibatalkan");
                                window.location.reload();
                              } catch (error: any) {
                                alert("Gagal membatalkan pesanan");
                              }
                            }
                          }}
                          style={styles.cancelButton}
                        >
                          Batalkan
                        </button>
                      )}
                    <span style={styles.detailLink}>Lihat Detail →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === STYLES ===
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "40px 20px",
    backgroundColor: "#f6f8fa",
    minHeight: "100vh",
  },
  backLink: {
    textDecoration: "none",
    color: "#3498db",
    fontWeight: "bold",
    fontSize: "16px",
  },
  header: { textAlign: "center", marginBottom: 40 },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 0,
  },
  subtitle: {
    color: "#7f8c8d",
    fontSize: "16px",
    marginTop: 10,
  },
  grid: {
    display: "grid",
    gap: 20,
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    transition: "box-shadow 0.2s ease",
    cursor: "pointer",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderId: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  date: { color: "#7f8c8d", fontSize: "14px" },
  statusBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: 5,
  },
  totalPrice: {
    fontWeight: "bold",
    color: "#27ae60",
    fontSize: "18px",
  },
  section: { marginTop: 10 },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#2c3e50",
    marginBottom: 5,
  },
  address: {
    backgroundColor: "#ecf0f1",
    borderRadius: 6,
    padding: 10,
    fontSize: "13px",
    color: "#34495e",
  },
  itemList: { display: "flex", flexWrap: "wrap", gap: 8 },
  item: {
    backgroundColor: "#ecf0f1",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: "12px",
    color: "#2c3e50",
    border: "1px solid #d0d7de",
  },
  moreBadge: {
    backgroundColor: "#f39c12",
    color: "white",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: "1px solid #e1e8ed",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerDate: {
    fontSize: "12px",
    color: "#7f8c8d",
  },

  footerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  cancelButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: 4,
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  cancelButtonHover: {
    backgroundColor: "#c0392b",
  },

  detailLink: {
    color: "#3498db",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: 60,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  primaryButton: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 15,
  },
};
