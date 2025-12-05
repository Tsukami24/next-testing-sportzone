"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllPengembalian,
  PengembalianRecord,
  StatusPengembalian,
  AlasanPengembalian,
  approvePengembalian,
  rejectPengembalian,
} from "../../services/pengembalian";

export default function AdminPengembalianPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [pengembalians, setPengembalians] = useState<PengembalianRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"approve" | "reject">("approve");
  const [selectedPengembalian, setSelectedPengembalian] =
    useState<PengembalianRecord | null>(null);
  const [catatanAdmin, setCatatanAdmin] = useState<string>("");

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

        const data = await getAllPengembalian(stored);
        setPengembalians(data);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat data pengembalian");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleOpenModal = (
    pengembalian: PengembalianRecord,
    type: "approve" | "reject"
  ) => {
    setSelectedPengembalian(pengembalian);
    setModalType(type);
    setCatatanAdmin("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPengembalian(null);
    setCatatanAdmin("");
  };

  const handleProcess = async () => {
    if (!token || !selectedPengembalian) return;

    setProcessingId(selectedPengembalian.id);

    try {
      if (modalType === "approve") {
        await approvePengembalian(
          token,
          selectedPengembalian.id,
          catatanAdmin || undefined
        );
        alert("Pengembalian berhasil disetujui!");
      } else {
        await rejectPengembalian(
          token,
          selectedPengembalian.id,
          catatanAdmin || undefined
        );
        alert("Pengembalian berhasil ditolak!");
      }

      const updatedData = await getAllPengembalian(token);
      setPengembalians(updatedData);
      handleCloseModal();
    } catch (e: any) {
      alert(e?.message || "Gagal memproses pengembalian");
    } finally {
      setProcessingId(null);
    }
  };

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
        return "⏳ Menunggu";
      case StatusPengembalian.APPROVED:
        return "✅ Disetujui";
      case StatusPengembalian.REJECTED:
        return "❌ Ditolak";
      default:
        return "❓ Tidak Diketahui";
    }
  }

  function getAlasanText(alasan: AlasanPengembalian): string {
    switch (alasan) {
      case AlasanPengembalian.RUSAK:
        return "Produk Rusak";
      case AlasanPengembalian.SALAH_VARIAN:
        return "Salah Varian";
      case AlasanPengembalian.TIDAK_SESUAI:
        return "Tidak Sesuai";
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
          <a href="/admin">Kembali ke Dashboard Admin</a>
        </p>
      </div>
    );
  }

  const pendingPengembalians = pengembalians.filter(
    (p) => p.status === StatusPengembalian.PENDING
  );
  const processedPengembalians = pengembalians.filter(
    (p) => p.status !== StatusPengembalian.PENDING
  );

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 1400,
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
            margin: "0 0 30px 0",
            color: "#2c3e50",
            fontSize: "32px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          🔧 Kelola Pengembalian (Admin)
        </h1>

        {/* Pending Section */}
        <div style={{ marginBottom: 40 }}>
          <h2
            style={{
              margin: "0 0 20px 0",
              color: "#f39c12",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            ⏳ Menunggu Persetujuan ({pendingPengembalians.length})
          </h2>
          {pendingPengembalians.length === 0 ? (
            <p style={{ color: "#7f8c8d", textAlign: "center", padding: 20 }}>
              Tidak ada pengembalian yang menunggu persetujuan
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {pendingPengembalians.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "2px solid #f39c12",
                    borderRadius: 12,
                    padding: 20,
                    backgroundColor: "#fff9e6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      marginBottom: 15,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        window.open(item.bukti_foto, "_blank")
                      }
                    >
                      <img
                        src={item.bukti_foto}
                        alt="Bukti Foto"
                        style={{
                          width: "100%",
                          maxWidth: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "2px solid #e1e8ed",
                          cursor: "pointer",
                        }}
                      />
                      <p
                        style={{
                          margin: "5px 0 0 0",
                          fontSize: "12px",
                          color: "#7f8c8d",
                          fontStyle: "italic",
                        }}
                      >
                        Klik untuk memperbesar
                      </p>
                    </div>
                    <div style={{ flex: 2 }}>
                      <h3
                        style={{
                          margin: "0 0 10px 0",
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        ID: {item.id.substring(0, 8)}
                      </h3>
                      <div style={{ marginBottom: 10 }}>
                        <strong>Customer:</strong> {item.user?.username} (
                        {item.user?.email})
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <strong>Pesanan ID:</strong>{" "}
                        {item.pesanan_id.substring(0, 8)}
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <strong>Alasan:</strong> {getAlasanText(item.alasan)}
                      </div>
                      {item.keterangan && (
                        <div style={{ marginBottom: 10 }}>
                          <strong>Keterangan:</strong> {item.keterangan}
                        </div>
                      )}
                      {item.pesanan && (
                        <div style={{ marginBottom: 10 }}>
                          <strong>Total Pesanan:</strong>{" "}
                          {formatCurrency(item.pesanan.total_harga)}
                        </div>
                      )}
                      <div style={{ marginBottom: 10, fontSize: "14px" }}>
                        <strong>Diajukan:</strong>{" "}
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>

                  {item.pesanan?.pesanan_items &&
                    item.pesanan.pesanan_items.length > 0 && (
                      <div
                        style={{
                          marginTop: 15,
                          padding: 15,
                          backgroundColor: "white",
                          borderRadius: 8,
                          border: "1px solid #e1e8ed",
                        }}
                      >
                        <strong style={{ marginBottom: 10, display: "block" }}>
                          Item Pesanan:
                        </strong>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                          {item.pesanan.pesanan_items.map((pesananItem) => (
                            <div
                              key={pesananItem.id}
                              style={{
                                padding: 10,
                                backgroundColor: "#f8f9fa",
                                borderRadius: 6,
                                fontSize: "14px",
                                border: "1px solid #e1e8ed",
                              }}
                            >
                              <div style={{ fontWeight: "bold" }}>
                                {pesananItem.produk?.nama || "Produk"}
                              </div>
                              {pesananItem.produk_varian && (
                                <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                                  {pesananItem.produk_varian.ukuran &&
                                    `Ukuran: ${pesananItem.produk_varian.ukuran}`}
                                  {pesananItem.produk_varian.warna &&
                                    ` | Warna: ${pesananItem.produk_varian.warna}`}
                                </div>
                              )}
                              <div style={{ fontSize: "12px" }}>
                                Qty: {pesananItem.kuantitas}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 15,
                      paddingTop: 15,
                      borderTop: "2px solid #e1e8ed",
                    }}
                  >
                    <button
                      onClick={() => handleOpenModal(item, "approve")}
                      disabled={processingId === item.id}
                      style={{
                        flex: 1,
                        padding: "12px",
                        backgroundColor:
                          processingId === item.id ? "#95a5a6" : "#27ae60",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor:
                          processingId === item.id ? "not-allowed" : "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      ✅ Setujui
                    </button>
                    <button
                      onClick={() => handleOpenModal(item, "reject")}
                      disabled={processingId === item.id}
                      style={{
                        flex: 1,
                        padding: "12px",
                        backgroundColor:
                          processingId === item.id ? "#95a5a6" : "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor:
                          processingId === item.id ? "not-allowed" : "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      ❌ Tolak
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/pengembalian/${item.id}`)
                      }
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
                      📋 Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processed Section */}
        <div>
          <h2
            style={{
              margin: "0 0 20px 0",
              color: "#2c3e50",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            📊 Riwayat Pengembalian ({processedPengembalians.length})
          </h2>
          {processedPengembalians.length === 0 ? (
            <p style={{ color: "#7f8c8d", textAlign: "center", padding: 20 }}>
              Belum ada riwayat pengembalian
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {processedPengembalians.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: `2px solid ${getStatusColor(item.status)}`,
                    borderRadius: 12,
                    padding: 20,
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/pengembalian/${item.id}`)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: "0 0 10px 0",
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        ID: {item.id.substring(0, 8)}
                      </h3>
                      <div style={{ fontSize: "14px", marginBottom: 5 }}>
                        <strong>Customer:</strong> {item.user?.username}
                      </div>
                      <div style={{ fontSize: "14px", marginBottom: 5 }}>
                        <strong>Alasan:</strong> {getAlasanText(item.alasan)}
                      </div>
                      <div style={{ fontSize: "14px", marginBottom: 5 }}>
                        <strong>Diproses:</strong>{" "}
                        {item.processed_at
                          ? formatDate(item.processed_at)
                          : "-"}
                      </div>
                      {item.catatan_admin && (
                        <div
                          style={{
                            fontSize: "14px",
                            marginTop: 10,
                            fontStyle: "italic",
                          }}
                        >
                          <strong>Catatan:</strong> {item.catatan_admin}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        backgroundColor: getStatusColor(item.status),
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      {getStatusText(item.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedPengembalian && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 30,
              borderRadius: 16,
              maxWidth: 500,
              width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                color: "#2c3e50",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {modalType === "approve" ? "✅ Setujui" : "❌ Tolak"} Pengembalian
            </h2>
            <p style={{ marginBottom: 20, color: "#7f8c8d" }}>
              Pengembalian ID: {selectedPengembalian.id.substring(0, 8)}
            </p>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 10,
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                Catatan untuk Customer (Opsional):
              </label>
              <textarea
                value={catatanAdmin}
                onChange={(e) => setCatatanAdmin(e.target.value)}
                placeholder={
                  modalType === "approve"
                    ? "Pengembalian Anda telah disetujui..."
                    : "Mohon maaf, pengembalian Anda tidak dapat diproses karena..."
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  border: "2px solid #e1e8ed",
                  borderRadius: "8px",
                  minHeight: "100px",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleCloseModal}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#95a5a6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
                disabled={processingId === selectedPengembalian.id}
              >
                Batal
              </button>
              <button
                onClick={handleProcess}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor:
                    processingId === selectedPengembalian.id
                      ? "#95a5a6"
                      : modalType === "approve"
                      ? "#27ae60"
                      : "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    processingId === selectedPengembalian.id
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
                disabled={processingId === selectedPengembalian.id}
              >
                {processingId === selectedPengembalian.id
                  ? "Memproses..."
                  : modalType === "approve"
                  ? "✅ Setujui"
                  : "❌ Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
