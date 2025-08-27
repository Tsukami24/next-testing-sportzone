"use client";

import { useEffect, useState } from "react";
import { getProfile } from "../services/auth";
import {
  listKategori,
  createKategori,
  updateKategori,
  deleteKategori,
  KategoriRecord,
} from "../services/kategori";

export default function KategoriPage() {
  const [token, setToken] = useState<string | null>(null);
  const [canManage, setCanManage] = useState<boolean>(false);
  const [items, setItems] = useState<KategoriRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // create form
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  // edit form
  const [editId, setEditId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setError("Token tidak ditemukan. Login dulu.");
      setLoading(false);
      return;
    }
    setToken(stored);
    init(stored);
  }, []);

  async function init(currentToken: string) {
    try {
      const profile = await getProfile(currentToken);
      const roleName = profile?.user?.role?.name;
      setCanManage(roleName === "petugas" || roleName === "admin");
      await refresh(currentToken);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data awal");
    } finally {
      setLoading(false);
    }
  }

  async function refresh(currentToken: string) {
    try {
      const data = await listKategori(currentToken);
      setItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data kategori");
    }
  }

  async function handleCreate() {
    if (!token) return alert("Belum login");
    if (!canManage) return alert("Fitur ini hanya untuk petugas/admin");
    if (!nama) return alert("Nama wajib diisi");
    try {
      await createKategori(token, {
        nama,
        deskripsi: deskripsi || undefined,
      });
      setNama("");
      setDeskripsi("");
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal membuat kategori");
    }
  }

  async function handleUpdate(id: string) {
    if (!token) return alert("Belum login");
    if (!canManage) return alert("Fitur ini hanya untuk petugas/admin");
    try {
      const data: any = {};
      if (editNama) data.nama = editNama;
      if (editDeskripsi !== undefined) data.deskripsi = editDeskripsi;
      await updateKategori(token, id, data);
      setEditId(null);
      setEditNama("");
      setEditDeskripsi("");
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal update kategori");
    }
  }

  async function handleDelete(id: string) {
    if (!token) return alert("Belum login");
    if (!canManage) return alert("Fitur ini hanya untuk petugas/admin");
    if (!confirm("Hapus kategori ini?")) return;
    try {
      await deleteKategori(token, id);
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal delete kategori");
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 20 }}>CRUD Kategori</h1>
      <p style={{ marginBottom: 20 }}>
        <a href="/home">← Kembali ke Home</a>
      </p>

      {loading && <p>Memuat...</p>}
      {!loading && error && <p style={{ color: "#e74c3c" }}>{error}</p>}

      {!loading && !error && (
        <div>
          {/* Create */}
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              border: "1px solid #e1e8ed",
              borderRadius: 8,
            }}
          >
            <h3 style={{ marginBottom: 12 }}>Tambah Kategori</h3>
            {!canManage && (
              <p style={{ color: "#e67e22", marginBottom: 12 }}>
                Anda bukan petugas/admin. Form dinonaktifkan.
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 12,
                marginBottom: 12,
                opacity: canManage ? 1 : 0.6,
                pointerEvents: canManage ? "auto" : "none",
              }}
            >
              <div>
                <label>Nama *</label>
                <input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama kategori"
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #e1e8ed",
                    borderRadius: 6,
                  }}
                />
              </div>
              <div>
                <label>Deskripsi</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Masukkan deskripsi"
                  style={{
                    width: "100%",
                    minHeight: 60,
                    padding: 10,
                    border: "1px solid #e1e8ed",
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={!canManage}
              style={{
                padding: "10px 16px",
                background: canManage ? "#27ae60" : "#95a5a6",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: canManage ? "pointer" : "not-allowed",
              }}
            >
              Tambah
            </button>
          </div>

          {/* List */}
          <div>
            <h3 style={{ marginBottom: 12 }}>
              Daftar Kategori ({items.length})
            </h3>
            {items.length === 0 && <p>Tidak ada data kategori</p>}
            <div style={{ display: "grid", gap: 12 }}>
              {items.map((k) => (
                <div
                  key={k.id}
                  style={{
                    border: "1px solid #e1e8ed",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  {editId === k.id ? (
                    <div style={{ display: "grid", gap: 12 }}>
                      <h4>Edit Kategori</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                          gap: 12,
                        }}
                      >
                        <div>
                          <label>Nama</label>
                          <input
                            value={editNama}
                            onChange={(e) => setEditNama(e.target.value)}
                            style={{
                              width: "100%",
                              padding: 10,
                              border: "1px solid #e1e8ed",
                              borderRadius: 6,
                            }}
                          />
                        </div>
                        <div>
                          <label>Deskripsi</label>
                          <textarea
                            value={editDeskripsi}
                            onChange={(e) => setEditDeskripsi(e.target.value)}
                            style={{
                              width: "100%",
                              minHeight: 60,
                              padding: 10,
                              border: "1px solid #e1e8ed",
                              borderRadius: 6,
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => handleUpdate(k.id)}
                          style={{
                            padding: "8px 14px",
                            background: "#3498db",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                          }}
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => {
                            setEditId(null);
                            setEditNama("");
                            setEditDeskripsi("");
                          }}
                          style={{
                            padding: "8px 14px",
                            background: "#e74c3c",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                          }}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ margin: 0 }}>{k.nama}</h4>
                      {k.deskripsi && (
                        <p style={{ marginTop: 6 }}>{k.deskripsi}</p>
                      )}
                      {canManage && (
                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                          <button
                            onClick={() => {
                              setEditId(k.id);
                              setEditNama(k.nama || "");
                              setEditDeskripsi((k.deskripsi as any) || "");
                            }}
                            style={{
                              padding: "8px 14px",
                              background: "#f39c12",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(k.id)}
                            style={{
                              padding: "8px 14px",
                              background: "#e74c3c",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







