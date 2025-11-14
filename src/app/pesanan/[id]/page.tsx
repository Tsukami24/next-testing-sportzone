"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getPesananById,
  PesananRecord,
  StatusPesanan,
  updatePesanan,
} from "../../services/pesanan-updated";
import { cancelPesanan } from "../../services/pesanan-updated";
import { isPetugas, isCustomer } from "../../services/auth";
import { syncOrderStatusWithPayment } from "../../services/pembayaran";

export default function PesananDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [pesanan, setPesanan] = useState<PesananRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserPetugas, setIsUserPetugas] = useState<boolean>(false);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);

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

        // Check if user is petugas
        const petugasStatus = await isPetugas(stored);
        setIsUserPetugas(petugasStatus);

        const id = params.id as string;
        if (!id) {
          setError("ID pesanan tidak ditemukan");
          setLoading(false);
          return;
        }

        const data = await getPesananById(stored, id);
        setPesanan(data);

        // Sync order status with payment status
        try {
          const syncResult = await syncOrderStatusWithPayment(stored, id);
          if (syncResult.updated) {
            // If status was updated, refresh the order data
            const updatedData = await getPesananById(stored, id);
            setPesanan(updatedData);
          }
        } catch (syncError) {
          // Don't show error for sync failure, just continue with existing data
          console.log("Status sync failed:", syncError);
        }
      } catch (e: any) {
        setError(e?.message || "Gagal memuat detail pesanan");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [params.id]);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusColor(status: StatusPesanan): string {
    switch (status) {
      case StatusPesanan.PENDING:
        return "#f39c12";
      case StatusPesanan.DIPROSES:
        return "#3498db";
      case StatusPesanan.DIKIRIM:
        return "#9b59b6";
      case StatusPesanan.SELESAI:
        return "#27ae60";
      case StatusPesanan.DIBATALKAN:
        return "#e74c3c";
      case StatusPesanan.DIKEMBALIKAN:
        return "#8e44ad";
      default:
        return "#95a5a6";
    }
  }

  function getStatusText(status: StatusPesanan): string {
    switch (status) {
      case StatusPesanan.PENDING:
        return "⏳ Menunggu Konfirmasi";
      case StatusPesanan.DIPROSES:
        return "🔧 Sedang Diproses";
      case StatusPesanan.DIKIRIM:
        return "🚚 Sedang Dikirim";
      case StatusPesanan.SELESAI:
        return "✅ Selesai";
      case StatusPesanan.DIBATALKAN:
        return "❌ Dibatalkan";
      case StatusPesanan.DIKEMBALIKAN:
        return "↩️ Dikembalikan";
      default:
        return "❓ Status Tidak Diketahui";
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Memuat detail pesanan...</p>
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

  if (!pesanan) {
    return (
      <div style={{ padding: 20 }}>
        <p>Pesanan tidak ditemukan</p>
        <p>
          <a href="/produk">Kembali ke Daftar Produk</a>
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 1000,
        margin: "0 auto",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <a
          href="/produk"
          style={{
            textDecoration: "none",
            color: "#3498db",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          ← Kembali ke Daftar Produk
        </a>
      </div>

      <div
        style={{
          border: "2px solid #e1e8ed",
          borderRadius: 16,
          padding: 30,
          backgroundColor: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 30, textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              color: "#2c3e50",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            📦 Detail Pesanan
          </h1>
          <p
            style={{
              margin: "10px 0",
              color: "#7f8c8d",
              fontSize: "16px",
              fontFamily: "monospace",
            }}
          >
            ID: {pesanan.id}
          </p>
        </div>

        {/* Order Status */}
        <div
          style={{
            marginBottom: 30,
            padding: "20px",
            backgroundColor: "#ecf0f1",
            borderRadius: 12,
            border: "2px solid #bdc3c7",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: getStatusColor(pesanan.status),
              marginBottom: "10px",
            }}
          >
            {getStatusText(pesanan.status)}
          </div>
          <div style={{ fontSize: "16px", color: "#2c3e50" }}>
            Status: {pesanan.status.toUpperCase()}
          </div>
        </div>

        {/* Order Information */}
        <div style={{ marginBottom: 30 }}>
          <h3
            style={{
              margin: "0 0 15px 0",
              color: "#2c3e50",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            📋 Informasi Pesanan
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <div
              style={{
                padding: "20px",
                backgroundColor: "#e3f2fd",
                borderRadius: 12,
                border: "2px solid #bbdefb",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#2c3e50",
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                Tanggal Pesanan
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#1976d2",
                }}
              >
                {formatDate(pesanan.tanggal_pesanan)}
              </div>
            </div>
            <div
              style={{
                padding: "20px",
                backgroundColor: "#e8f5e8",
                borderRadius: 12,
                border: "2px solid #c8e6c9",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#2c3e50",
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                Total Harga
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#27ae60",
                }}
              >
                {formatCurrency(pesanan.total_harga)}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        {pesanan.user && (
          <div style={{ marginBottom: 30 }}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#2c3e50",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              👤 Informasi Pelanggan
            </h3>
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f3e5f5",
                borderRadius: 12,
                border: "2px solid #e1bee7",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#2c3e50",
                      marginBottom: 8,
                      fontWeight: "bold",
                    }}
                  >
                    Nama
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#7b1fa2",
                    }}
                  >
                    {pesanan.user.username}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#2c3e50",
                      marginBottom: 8,
                      fontWeight: "bold",
                    }}
                  >
                    Email
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#7b1fa2",
                    }}
                  >
                    {pesanan.user.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        <div style={{ marginBottom: 30 }}>
          <h3
            style={{
              margin: "0 0 15px 0",
              color: "#2c3e50",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            📍 Alamat Pengiriman
          </h3>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#fff3e0",
              borderRadius: 12,
              border: "2px solid #ffcc80",
            }}
          >
            <div
              style={{ fontSize: "16px", color: "#2c3e50", lineHeight: "1.6" }}
            >
              {pesanan.alamat_pengiriman}
            </div>
          </div>
        </div>

        {/* Order Items */}
        {pesanan.pesanan_items && pesanan.pesanan_items.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#2c3e50",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              🛍️ Item Pesanan
            </h3>
            <div
              style={{
                border: "2px solid #e1e8ed",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {pesanan.pesanan_items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    padding: "20px",
                    borderBottom:
                      index < pesanan.pesanan_items!.length - 1
                        ? "1px solid #e1e8ed"
                        : "none",
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 15,
                  }}
                >
                  {item.produk?.gambar && (
                    <img
                      src={item.produk.gambar}
                      alt={item.produk.nama}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: "0 0 5px 0",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {item.produk?.nama || `Produk ID: ${item.id_produk}`}
                    </h4>
                    {item.produk_varian && (
                      <p
                        style={{
                          margin: "0 0 5px 0",
                          fontSize: "14px",
                          color: "#7f8c8d",
                        }}
                      >
                        {item.produk_varian.ukuran &&
                          `Ukuran: ${item.produk_varian.ukuran}`}
                        {item.produk_varian.warna &&
                          ` | Warna: ${item.produk_varian.warna}`}
                      </p>
                    )}
                    <p
                      style={{
                        margin: "0",
                        fontSize: "14px",
                        color: "#7f8c8d",
                      }}
                    >
                      Jumlah: {item.kuantitas} x{" "}
                      {formatCurrency(item.harga_satuan)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#27ae60",
                      }}
                    >
                      {formatCurrency(item.harga_satuan * item.kuantitas)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div style={{ marginBottom: 30 }}>
          <h3
            style={{
              margin: "0 0 15px 0",
              color: "#2c3e50",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            ⚙️ Informasi Sistem
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              fontSize: "16px",
            }}
          >
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "2px solid #e1e8ed",
              }}
            >
              <div
                style={{
                  color: "#7f8c8d",
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                📅 Dibuat pada
              </div>
              <div style={{ color: "#2c3e50", fontWeight: "bold" }}>
                {formatDate(pesanan.created_at)}
              </div>
            </div>
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "2px solid #e1e8ed",
              }}
            >
              <div
                style={{
                  color: "#7f8c8d",
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                🔄 Terakhir diperbarui
              </div>
              <div style={{ color: "#2c3e50", fontWeight: "bold" }}>
                {formatDate(pesanan.updated_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Status Update Section */}
        {isUserPetugas && (
          <div style={{ marginBottom: 30 }}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#2c3e50",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              🔧 Update Status Pesanan (Petugas)
            </h3>
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fff9c4",
                borderRadius: 12,
                border: "2px solid #ffeb3b",
              }}
            >
              <div style={{ marginBottom: 15 }}>
                <strong style={{ color: "#2c3e50" }}>Status Saat Ini:</strong>{" "}
                {getStatusText(pesanan.status)}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {pesanan.status === StatusPesanan.PENDING && (
                  <>
                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            "Apakah Anda yakin ingin memproses pesanan ini?"
                          )
                        ) {
                          try {
                            await updatePesanan(token!, pesanan.id, {
                              status: StatusPesanan.DIPROSES,
                            });
                            alert("Status pesanan berhasil diperbarui");
                            window.location.reload();
                          } catch (error: any) {
                            alert(
                              error?.message ||
                                "Gagal memperbarui status pesanan"
                            );
                          }
                        }
                      }}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      🔧 Proses Pesanan
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            "Apakah Anda yakin ingin membatalkan pesanan ini?"
                          )
                        ) {
                          try {
                            await cancelPesanan(token!, pesanan.id);
                            alert("Pesanan berhasil dibatalkan");
                            window.location.reload();
                          } catch (error: any) {
                            alert(
                              error?.message || "Gagal membatalkan pesanan"
                            );
                          }
                        }
                      }}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ❌ Batalkan Pesanan
                    </button>
                  </>
                )}
                {pesanan.status === StatusPesanan.DIPROSES && (
                  <button
                    onClick={async () => {
                      if (
                        confirm("Apakah Anda yakin ingin mengirim pesanan ini?")
                      ) {
                        try {
                          await updatePesanan(token!, pesanan.id, {
                            status: StatusPesanan.DIKIRIM,
                          });
                          alert("Status pesanan berhasil diperbarui");
                          window.location.reload();
                        } catch (error: any) {
                          alert(
                            error?.message || "Gagal memperbarui status pesanan"
                          );
                        }
                      }
                    }}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#9b59b6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    🚚 Kirim Pesanan
                  </button>
                )}
                {pesanan.status === StatusPesanan.DIKIRIM && (
                  <button
                    onClick={async () => {
                      if (
                        confirm(
                          "Apakah Anda yakin ingin menandai pesanan ini sebagai selesai?"
                        )
                      ) {
                        try {
                          await updatePesanan(token!, pesanan.id, {
                            status: StatusPesanan.SELESAI,
                          });
                          alert("Status pesanan berhasil diperbarui");
                          window.location.reload();
                        } catch (error: any) {
                          alert(
                            error?.message || "Gagal memperbarui status pesanan"
                          );
                        }
                      }
                    }}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    ✅ Selesaikan Pesanan
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 15,
            paddingTop: 25,
            borderTop: "2px solid #e1e8ed",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => router.push(`/produk`)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            ← Kembali ke Daftar Produk
          </button>
          <button
            onClick={() => router.push(`/pesanan`)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#f39c12",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            📋 Lihat Semua Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
