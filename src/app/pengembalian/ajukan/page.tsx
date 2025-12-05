"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createPengembalian,
  AlasanPengembalian,
} from "../../services/pengembalian";
import { getPesananById } from "../../services/pesanan-updated";

export default function AjukanPengembalianPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pesananId = searchParams.get("pesanan_id");

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [alasan, setAlasan] = useState<AlasanPengembalian>(
    AlasanPengembalian.RUSAK
  );
  const [keterangan, setKeterangan] = useState<string>("");
  const [buktiFotoFile, setBuktiFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      router.push("/login");
      return;
    }
    setToken(stored);

    if (!pesananId) {
      setError("ID Pesanan tidak ditemukan");
    }
  }, [pesananId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBuktiFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !pesananId) {
      setError("Token atau ID Pesanan tidak ditemukan");
      return;
    }

    if (!buktiFotoFile) {
      setError("Bukti foto harus diupload");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setUploadProgress("Mengajukan pengembalian...");
      await createPengembalian(
        token,
        {
          pesanan_id: pesananId,
          alasan,
          keterangan: keterangan || undefined,
        },
        buktiFotoFile
      );

      alert("Pengajuan pengembalian berhasil diajukan!");
      router.push("/pengembalian");
    } catch (e: any) {
      setError(e?.message || "Gagal mengajukan pengembalian");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  if (error && !pesananId) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "red" }}>{error}</p>
        <p>
          <a href="/pesanan">Kembali ke Daftar Pesanan</a>
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 800,
        margin: "0 auto",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <a
          href={`/pesanan/${pesananId}`}
          style={{
            textDecoration: "none",
            color: "#3498db",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          ← Kembali ke Detail Pesanan
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
          📝 Ajukan Pengembalian
        </h1>

        {error && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8d7da",
              border: "2px solid #f5c6cb",
              borderRadius: "8px",
              marginBottom: "20px",
              color: "#721c24",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 25 }}>
            <label
              style={{
                display: "block",
                marginBottom: 10,
                fontWeight: "bold",
                color: "#2c3e50",
                fontSize: "16px",
              }}
            >
              Alasan Pengembalian <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={alasan}
              onChange={(e) => setAlasan(e.target.value as AlasanPengembalian)}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #e1e8ed",
                borderRadius: "8px",
                backgroundColor: "white",
              }}
              required
            >
              <option value={AlasanPengembalian.RUSAK}>Produk Rusak</option>
              <option value={AlasanPengembalian.SALAH_VARIAN}>
                Salah Varian
              </option>
              <option value={AlasanPengembalian.TIDAK_SESUAI}>
                Tidak Sesuai Deskripsi
              </option>
              <option value={AlasanPengembalian.LAINNYA}>Lainnya</option>
            </select>
          </div>

          <div style={{ marginBottom: 25 }}>
            <label
              style={{
                display: "block",
                marginBottom: 10,
                fontWeight: "bold",
                color: "#2c3e50",
                fontSize: "16px",
              }}
            >
              Keterangan (Opsional)
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Jelaskan detail masalah atau alasan pengembalian..."
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #e1e8ed",
                borderRadius: "8px",
                minHeight: "120px",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ marginBottom: 25 }}>
            <label
              style={{
                display: "block",
                marginBottom: 10,
                fontWeight: "bold",
                color: "#2c3e50",
                fontSize: "16px",
              }}
            >
              Bukti Foto <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #e1e8ed",
                borderRadius: "8px",
                backgroundColor: "white",
              }}
              required
            />
            <p
              style={{
                marginTop: 8,
                fontSize: "14px",
                color: "#7f8c8d",
                fontStyle: "italic",
              }}
            >
              Upload foto produk yang ingin dikembalikan (format: JPG, PNG, max
              5MB)
            </p>
            {previewUrl && (
              <div
                style={{
                  marginTop: 15,
                  textAlign: "center",
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "2px solid #e1e8ed",
                }}
              >
                <p
                  style={{
                    marginBottom: 10,
                    fontWeight: "bold",
                    color: "#2c3e50",
                  }}
                >
                  Preview:
                </p>
                <img
                  src={previewUrl}
                  alt="Preview Bukti Foto"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>

          {uploadProgress && (
            <div
              style={{
                padding: "15px",
                backgroundColor: "#fff3cd",
                border: "2px solid #ffecb5",
                borderRadius: "8px",
                marginBottom: "20px",
                color: "#856404",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {uploadProgress}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 15,
              paddingTop: 25,
              borderTop: "2px solid #e1e8ed",
            }}
          >
            <button
              type="button"
              onClick={() => router.push(`/pesanan/${pesananId}`)}
              style={{
                flex: 1,
                padding: "14px",
                backgroundColor: "#95a5a6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "14px",
                backgroundColor: loading ? "#95a5a6" : "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              disabled={loading}
            >
              {loading ? "Mengajukan..." : "Ajukan Pengembalian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
