"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listKategori, KategoriRecord } from "../services/kategori";
import {
  listSubkategoriByKategori,
  createSubkategori,
  updateSubkategori,
  deleteSubkategori,
  SubkategoriRecord,
} from "../services/subkategori";

export default function SubkategoriPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [kategoris, setKategoris] = useState<KategoriRecord[]>([]);
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>("");

  const [items, setItems] = useState<SubkategoriRecord[]>([]);

  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");
  const [editKategoriId, setEditKategoriId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setError("Token tidak ditemukan. Login sebagai admin/petugas dulu.");
      setLoading(false);
      return;
    }
    setToken(stored);
    Promise.all([listKategori(stored)])
      .then(([ks]) => {
        setKategoris(Array.isArray(ks) ? ks : []);
        setSelectedKategoriId((ks[0] as any)?.id || "");
      })
      .catch((e) => setError(e?.message || "Gagal memuat kategori"))
      .finally(() => setLoading(false));
  }, []);

  const currentKategori = useMemo(
    () => kategoris.find((k) => (k as any).id === selectedKategoriId),
    [kategoris, selectedKategoriId]
  );

  useEffect(() => {
    if (!token || !selectedKategoriId) return;
    listSubkategoriByKategori(token, selectedKategoriId)
      .then(setItems)
      .catch((e) => setError(e?.message || "Gagal memuat subkategori"));
  }, [token, selectedKategoriId]);

  async function refreshAll() {
    if (!token) return;
    await listSubkategoriByKategori(token, selectedKategoriId).then(setItems);
  }

  async function handleCreate() {
    if (!token) return alert("Belum login");
    if (!selectedKategoriId) return alert("Pilih kategori terlebih dahulu");
    try {
      await createSubkategori(token, {
        nama,
        deskripsi,
        kategori_olahraga_id: selectedKategoriId,
      });
      setNama("");
      setDeskripsi("");
      await refreshAll();
    } catch (e: any) {
      alert(e?.message || "Gagal membuat subkategori (butuh role admin)");
    }
  }

  async function handleSave(id: string) {
    if (!token) return alert("Belum login");
    try {
      await updateSubkategori(token, id, {
        nama: editNama,
        deskripsi: editDeskripsi,
        kategori_olahraga_id: editKategoriId || selectedKategoriId,
      });
      setEditId(null);
      setEditNama("");
      setEditDeskripsi("");
      setEditKategoriId("");
      await refreshAll();
    } catch (e: any) {
      alert(e?.message || "Gagal update subkategori (butuh role admin)");
    }
  }

  async function handleDelete(id: string) {
    if (!token) return alert("Belum login");
    if (!confirm("Hapus subkategori ini?")) return;
    try {
      await deleteSubkategori(token, id);
      await refreshAll();
    } catch (e: any) {
      alert(e?.message || "Gagal delete subkategori (butuh role admin)");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#5b0675ff]">
        CRUD Subkategori
      </h1>
      <p className="mb-6">
        <a href="/home" className="text-blue-600 hover:underline">
          ← Kembali ke Home
        </a>
      </p>

      {loading && <p className="text-gray-500">Memuat...</p>}
      {!loading && error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && (
        <>
          {/* Pilih Kategori */}
          <div className="mb-6">
            <label className="mr-2 font-medium">Pilih Kategori:</label>
            <select
              value={selectedKategoriId}
              onChange={(e) => setSelectedKategoriId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {kategoris.map((k) => (
                <option key={(k as any).id} value={(k as any).id}>
                  {(k as any).nama || (k as any).id}
                </option>
              ))}
            </select>
          </div>

          {/* Form Tambah Subkategori */}
          <div className="mb-6 p-4 bg-white shadow rounded-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              Tambah Subkategori
            </h2>
            <div className="flex flex-col md:flex-row gap-3 flex-wrap">
              <input
                placeholder="Nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              />
              <input
                placeholder="Deskripsi"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              />
              <button
                onClick={handleCreate}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Create
              </button>
            </div>
          </div>

          {/* List Subkategori */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Daftar Subkategori ({items.length})
            </h2>
            {items.length === 0 && (
              <p className="text-gray-500">Tidak ada data subkategori</p>
            )}
            <ul className="space-y-4">
              {items.map((s) => (
                <li
                  key={(s as any).id}
                  className="p-4 bg-white shadow rounded-md border border-gray-200"
                >
                  {editId === (s as any).id ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        placeholder="Nama"
                        value={editNama}
                        onChange={(e) => setEditNama(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                      />
                      <input
                        placeholder="Deskripsi"
                        value={editDeskripsi}
                        onChange={(e) => setEditDeskripsi(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                      />
                      <select
                        value={editKategoriId || selectedKategoriId}
                        onChange={(e) => setEditKategoriId(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                      >
                        {kategoris.map((k) => (
                          <option key={(k as any).id} value={(k as any).id}>
                            {(k as any).nama || (k as any).id}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2 mt-2 md:mt-0 md:col-span-3">
                        <button
                          onClick={() => handleSave((s as any).id)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => {
                            setEditId(null);
                            setEditNama("");
                            setEditDeskripsi("");
                            setEditKategoriId("");
                          }}
                          className="bg-gray-400 text-white px-3 py-2 rounded-md hover:bg-gray-500 transition"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div>
                        <strong className="text-gray-800">
                          {(s as any).nama}
                        </strong>
                        <p className="text-gray-500">{(s as any).deskripsi}</p>
                        <small className="text-gray-400">
                          Kategori: {(s as any).kategori_olahraga_id}
                        </small>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <button
                          onClick={() => {
                            setEditId((s as any).id);
                            setEditNama((s as any).nama || "");
                            setEditDeskripsi((s as any).deskripsi || "");
                            setEditKategoriId(
                              (s as any).kategori_olahraga_id || ""
                            );
                          }}
                          className="bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete((s as any).id)}
                          className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
