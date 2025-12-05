"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPengembalianByUser,
  PengembalianRecord,
  StatusPengembalian,
  AlasanPengembalian,
} from "../services/pengembalian";

export default function PengembalianListPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [pengembalians, setPengembalians] = useState<PengembalianRecord[]>([]);
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

        const data = await getPengembalianByUser(stored);
        setPengembalians(data);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat data pengembalian");
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
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusColor(status: StatusPengembalian): string {
    switch (status) {
      case StatusPengembalian.PENDING:
        return "#f39c12";
      case StatusPengembalian.APPROVED:
        return "#27ae60";
      case StatusPengembalian.REJECTED:
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  }

  function getStatusText(status: StatusPengembalian): string {
    switch (status) {
      case StatusPengembalian.PENDING:
        return "⏳ Menunggu Persetujuan";
      case StatusPengembalian.APPROVED:
        return "✅ Disetujui";
      case StatusPengembalian.REJECTED:
        return "❌ Ditolak";
      default:
        return "❓ Status Tidak Diketahui";
    }
  }

  function getAlasanText(alasan: AlasanPengembalian): string {
    switch (alasan) {
      case AlasanPengembalian.RUSAK:
        return "Produk Rusak";
      case AlasanPengembalian.SALAH_VARIAN:
        return "Salah Varian";
      case AlasanPengembalian.TIDAK_SESUAI:
        return "Tidak Sesuai Deskripsi";
      case AlasanPengembalian.LAINNYA:
        return "Lainnya";
      default:
        return alasan;
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Memuat data pengembalian...</p>
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
    <div
      style={{
        padding: 20,
        maxWidth: 1200,
        margin: "0 auto",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <a
          href="/pesanan"
          style={{
            textDecoration: "none",
            color: "#3498db",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          ← Kembali ke Daftar Pesanan
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
        <h1
          style={{
            margin: "0 0 30px 0",
            color: "#2c3e50",
            fontSize: "32px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          📋 Daftar Pengembalian
        </h1>

        {pengembalians.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: "18px", color: "#7f8c8d" }}>
              Belum ada pengajuan pengembalian
            </p>
            <button
              onClick={() => router.push("/pesanan")}
              style={{
                marginTop: 20,
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
              Lihat Pesanan
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {pengembalians.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "2px solid #e1e8ed",
                  borderRadius: 12,
                  padding: 20,
                  backgroundColor: "#f8f9fa",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onClick={() => router.push(`/pengembalian/${item.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3498db";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(52,152,219,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e1e8ed";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 15,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#2c3e50",
                      }}
                    >
                      Pengembalian #{item.id.substring(0, 8)}
                    </h3>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "14px",
                        color: "#7f8c8d",
                      }}
                    >
                      Pesanan ID: {item.pesanan_id.substring(0, 8)}
                    </p>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "14px",
                        color: "#7f8c8d",
                      }}
                    >
                      Diajukan: {formatDate(item.created_at)}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      backgroundColor: getStatusColor(item.status),
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    {getStatusText(item.status)}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 15,
                    marginBottom: 15,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#7f8c8d",
                        marginBottom: 5,
                        fontWeight: "bold",
                      }}
                    >
                      Alasan:
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#2c3e50",
                        fontWeight: "bold",
                      }}
                    >
                      {getAlasanText(item.alasan)}
                    </div>
                  </div>
                  {item.pesanan && (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#7f8c8d",
                          marginBottom: 5,
                          fontWeight: "bold",
                        }}
                      >
                        Total Pesanan:
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "#27ae60",
                          fontWeight: "bold",
                        }}
                      >
                        {formatCurrency(item.pesanan.total_harga)}
                      </div>
                    </div>
                  )}
                </div>

                {item.keterangan && (
                  <div style={{ marginBottom: 15 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#7f8c8d",
                        marginBottom: 5,
                        fontWeight: "bold",
                      }}
                    >
                      Keterangan:
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#2c3e50",
                        fontStyle: "italic",
                      }}
                    >
                      {item.keterangan}
                    </div>
                  </div>
                )}

                {item.catatan_admin && (
                  <div
                    style={{
                      marginTop: 15,
                      padding: 15,
                      backgroundColor:
                        item.status === StatusPengembalian.APPROVED
                          ? "#d4edda"
                          : "#f8d7da",
                      borderRadius: 8,
                      border: `2px solid ${
                        item.status === StatusPengembalian.APPROVED
                          ? "#c3e6cb"
                          : "#f5c6cb"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#2c3e50",
                        marginBottom: 5,
                        fontWeight: "bold",
                      }}
                    >
                      Catatan Admin:
                    </div>
                    <div style={{ fontSize: "14px", color: "#2c3e50" }}>
                      {item.catatan_admin}
                    </div>
                    {item.processed_at && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#7f8c8d",
                          marginTop: 5,
                        }}
                      >
                        Diproses: {formatDate(item.processed_at)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
