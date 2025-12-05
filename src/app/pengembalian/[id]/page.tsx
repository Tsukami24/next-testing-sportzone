"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getPengembalianById,
  PengembalianRecord,
  StatusPengembalian,
  AlasanPengembalian,
} from "../../services/pengembalian";

export default function PengembalianDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [pengembalian, setPengembalian] = useState<PengembalianRecord | null>(
    null
  );
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

        const id = params.id as string;
        if (!id) {
          setError("ID pengembalian tidak ditemukan");
          setLoading(false);
          return;
        }

        const data = await getPengembalianById(stored, id);
        setPengembalian(data);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat detail pengembalian");
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
        <p>Memuat detail pengembalian...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "red" }}>{error}</p>
        <p>
          <a href="/pengembalian">Kembali ke Daftar Pengembalian</a>
        </p>
      </div>
    );
  }

  if (!pengembalian) {
    return (
      <div style={{ padding: 20 }}>
        <p>Pengembalian tidak ditemukan</p>
        <p>
          <a href="/pengembalian">Kembali ke Daftar Pengembalian</a>
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
          href="/pengembalian"
          style={{
            textDecoration: "none",
            color: "#3498db",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          ← Kembali ke Daftar Pengembalian
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
        <div style={{ marginBottom: 30, textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              color: "#2c3e50",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            📦 Detail Pengembalian
          </h1>
          <p
            style={{
              margin: "10px 0",
              color: "#7f8c8d",
              fontSize: "16px",
              fontFamily: "monospace",
            }}
          >
            ID: {pengembalian.id}
          </p>
        </div>

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
              color: getStatusColor(pengembalian.status),
              marginBottom: "10px",
            }}
          >
            {getStatusText(pengembalian.status)}
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <h3
            style={{
              margin: "0 0 15px 0",
              color: "#2c3e50",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            📋 Informasi Pengembalian
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
                Alasan Pengembalian
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#1976d2",
                }}
              >
                {getAlasanText(pengembalian.alasan)}
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
                Tanggal Pengajuan
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#27ae60",
                }}
              >
                {formatDate(pengembalian.created_at)}
              </div>
            </div>
          </div>
        </div>

        {pengembalian.keterangan && (
          <div style={{ marginBottom: 30 }}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#2c3e50",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              📝 Keterangan
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
                style={{
                  fontSize: "16px",
                  color: "#2c3e50",
                  lineHeight: "1.6",
                }}
              >
                {pengembalian.keterangan}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 30 }}>
          <h3
            style={{
              margin: "0 0 15px 0",
              color: "#2c3e50",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            📸 Bukti Foto
          </h3>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: 12,
              border: "2px solid #e1e8ed",
              textAlign: "center",
            }}
          >
            <img
              src={pengembalian.bukti_foto}
              alt="Bukti Foto Pengembalian"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {pengembalian.pesanan && (
          <div style={{ marginBottom: 30 }}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#2c3e50",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              📦 Informasi Pesanan
            </h3>
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f3e5f5",
                borderRadius: 12,
                border: "2px solid #e1bee7",
              }}
            >
              <div style={{ marginBottom: 15 }}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#7f8c8d",
                    marginBottom: 5,
                    fontWeight: "bold",
                  }}
                >
                  ID Pesanan:
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#2c3e50",
                    fontFamily: "monospace",
                  }}
                >
                  {pengembalian.pesanan_id}
                </div>
              </div>
              <div style={{ marginBottom: 15 }}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#7f8c8d",
                    marginBottom: 5,
                    fontWeight: "bold",
                  }}
                >
                  Total Harga:
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    color: "#27ae60",
                    fontWeight: "bold",
                  }}
                >
                  {formatCurrency(pengembalian.pesanan.total_harga)}
                </div>
              </div>
              {pengembalian.pesanan.pesanan_items &&
                pengembalian.pesanan.pesanan_items.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#7f8c8d",
                        marginBottom: 10,
                        fontWeight: "bold",
                      }}
                    >
                      Item Pesanan:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {pengembalian.pesanan.pesanan_items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            padding: "15px",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #e1e8ed",
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
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "bold",
                                color: "#2c3e50",
                                marginBottom: 5,
                              }}
                            >
                              {item.produk?.nama || "Produk"}
                            </div>
                            {item.produk_varian && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#7f8c8d",
                                  marginBottom: 3,
                                }}
                              >
                                {item.produk_varian.ukuran &&
                                  `Ukuran: ${item.produk_varian.ukuran}`}
                                {item.produk_varian.warna &&
                                  ` | Warna: ${item.produk_varian.warna}`}
                              </div>
                            )}
                            <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                              Jumlah: {item.kuantitas} x{" "}
                              {formatCurrency(item.harga_satuan)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {pengembalian.catatan_admin && (
          <div style={{ marginBottom: 30 }}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#2c3e50",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              💬 Catatan Admin
            </h3>
            <div
              style={{
                padding: "20px",
                backgroundColor:
                  pengembalian.status === StatusPengembalian.APPROVED
                    ? "#d4edda"
                    : "#f8d7da",
                borderRadius: 12,
                border: `2px solid ${
                  pengembalian.status === StatusPengembalian.APPROVED
                    ? "#c3e6cb"
                    : "#f5c6cb"
                }`,
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  color: "#2c3e50",
                  lineHeight: "1.6",
                  marginBottom: 10,
                }}
              >
                {pengembalian.catatan_admin}
              </div>
              {pengembalian.processed_at && (
                <div
                  style={{
                    fontSize: "14px",
                    color: "#7f8c8d",
                    fontStyle: "italic",
                  }}
                >
                  Diproses pada: {formatDate(pengembalian.processed_at)}
                </div>
              )}
            </div>
          </div>
        )}

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
            onClick={() => router.push("/pengembalian")}
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
            ← Kembali ke Daftar Pengembalian
          </button>
          {pengembalian.pesanan && (
            <button
              onClick={() => router.push(`/pesanan/${pengembalian.pesanan_id}`)}
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
              📦 Lihat Detail Pesanan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
