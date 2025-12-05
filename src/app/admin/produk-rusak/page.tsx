"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllProdukRusak,
  ProdukRusakRecord,
} from "../../services/pengembalian";

export default function AdminProdukRusakPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [produkRusak, setProdukRusak] = useState<ProdukRusakRecord[]>([]);
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

        const data = await getAllProdukRusak(stored);
        setProdukRusak(data);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat data produk rusak");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Memuat data produk rusak...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "red" }}>{error}</p>
        <p>
          <a href="/admin">Kembali ke Dashboard Admin</a>
        </p>
      </div>
    );
  }

  const totalProdukRusak = produkRusak.reduce(
    (sum, item) => sum + item.jumlah,
    0
  );

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
          href="/admin"
          style={{
            textDecoration: "none",
            color: "#3498db",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          ← Kembali ke Dashboard Admin
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
            margin: "0 0 10px 0",
            color: "#2c3e50",
            fontSize: "32px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          📦❌ Daftar Produk Rusak
        </h1>
        <p
          style={{
            margin: "0 0 30px 0",
            textAlign: "center",
            fontSize: "16px",
            color: "#7f8c8d",
          }}
        >
          Produk yang dikembalikan dengan alasan rusak
        </p>

        <div
          style={{
            marginBottom: 30,
            padding: 20,
            backgroundColor: "#fff3e0",
            borderRadius: 12,
            border: "2px solid #ffcc80",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#2c3e50",
              marginBottom: 10,
            }}
          >
            📊 Total Produk Rusak
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              color: "#f39c12",
            }}
          >
            {totalProdukRusak} Unit
          </div>
          <div style={{ fontSize: "14px", color: "#7f8c8d", marginTop: 5 }}>
            Dari {produkRusak.length} pengembalian
          </div>
        </div>

        {produkRusak.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: "18px", color: "#7f8c8d" }}>
              Tidak ada produk rusak yang tercatat
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {produkRusak.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "2px solid #e74c3c",
                  borderRadius: 12,
                  padding: 20,
                  backgroundColor: "#ffebee",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    alignItems: "flex-start",
                  }}
                >
                  {item.produk?.gambar && (
                    <div>
                      <img
                        src={item.produk.gambar}
                        alt={item.produk.nama}
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "2px solid #e1e8ed",
                        }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#2c3e50",
                      }}
                    >
                      {item.produk?.nama || "Produk"}
                    </h3>
                    {item.produk_varian && (
                      <div
                        style={{
                          marginBottom: 10,
                          fontSize: "14px",
                          color: "#7f8c8d",
                        }}
                      >
                        <strong>Varian:</strong>{" "}
                        {item.produk_varian.ukuran &&
                          `Ukuran: ${item.produk_varian.ukuran}`}
                        {item.produk_varian.warna &&
                          ` | Warna: ${item.produk_varian.warna}`}
                      </div>
                    )}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 15,
                        marginBottom: 10,
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
                          Jumlah Rusak:
                        </div>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: "#e74c3c",
                          }}
                        >
                          {item.jumlah} Unit
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#7f8c8d",
                            marginBottom: 5,
                            fontWeight: "bold",
                          }}
                        >
                          Tanggal Dicatat:
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#2c3e50",
                          }}
                        >
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                    </div>
                    {item.deskripsi_kerusakan && (
                      <div
                        style={{
                          marginTop: 15,
                          padding: 15,
                          backgroundColor: "white",
                          borderRadius: 8,
                          border: "1px solid #e1e8ed",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#7f8c8d",
                            marginBottom: 5,
                            fontWeight: "bold",
                          }}
                        >
                          Deskripsi Kerusakan:
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#2c3e50",
                            fontStyle: "italic",
                          }}
                        >
                          {item.deskripsi_kerusakan}
                        </div>
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: 15,
                        fontSize: "14px",
                        color: "#7f8c8d",
                      }}
                    >
                      <strong>ID Pengembalian:</strong>{" "}
                      {item.pengembalian_id.substring(0, 8)}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() =>
                        router.push(`/pengembalian/${item.pengembalian_id}`)
                      }
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      📋 Lihat Pengembalian
                    </button>
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
