"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listPetugas,
  createPetugas,
  updatePetugas,
  deletePetugas,
  PetugasRecord,
} from "../services/petugas";

export default function PetugasPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<PetugasRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setError("Token tidak ditemukan. Login sebagai admin dulu.");
      setLoading(false);
      return;
    }
    setToken(stored);
    refresh(stored).finally(() => setLoading(false));
  }, []);

  async function refresh(currentToken: string) {
    try {
      const data = await listPetugas(currentToken);
      setItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data petugas");
    }
  }

  async function handleCreate() {
    if (!token) return alert("Belum login");
    try {
      await createPetugas(token, { username, email, password });
      setUsername("");
      setEmail("");
      setPassword("");
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal membuat petugas (butuh role admin)");
    }
  }

  async function handleUpdate(id: string) {
    if (!token) return alert("Belum login");
    try {
      await updatePetugas(token, id, {
        username: editUsername || undefined,
        email: editEmail || undefined,
        password: editPassword || undefined,
      });
      setEditId(null);
      setEditUsername("");
      setEditEmail("");
      setEditPassword("");
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal update petugas (butuh role admin)");
    }
  }

  async function handleDelete(id: string) {
    if (!token) return alert("Belum login");
    if (!confirm("Hapus petugas ini?")) return;
    try {
      await deletePetugas(token, id);
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal delete petugas (butuh role admin)");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#5b0675ff]">
        CRUD Petugas (Admin Only)
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
          {/* Form Create */}
          <div className="mb-8 p-4 bg-white shadow rounded-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              Tambah Petugas
            </h2>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 text-black"
              />
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 text-black"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 text-black"
              />
              <button
                onClick={handleCreate}
                className="bg-[#5b0675ff] text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
              >
                Create
              </button>
            </div>
          </div>

          {/* List Petugas */}
          <div className="bg-white shadow rounded-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Daftar Petugas
            </h2>

            {items.length === 0 ? (
              <p className="text-gray-500">Tidak ada data</p>
            ) : (
              <ul className="space-y-4">
                {items.map((p) => (
                  <li
                    key={p.id}
                    className="p-4 border border-gray-200 rounded-md flex flex-col md:flex-row md:justify-between md:items-center gap-3"
                  >
                    {/* Info Petugas */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <strong className="text-gray-800">
                        {p.username || p.email || p.id}
                      </strong>
                      <span className="text-gray-500">({p.email})</span>
                    </div>

                    {/* Edit / Action Buttons */}
                    {editId === p.id ? (
                      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-3 md:mt-0">
                        <input
                          placeholder="Username"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black flex-1"
                        />
                        <input
                          placeholder="Email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black flex-1"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black flex-1"
                        />
                        <button
                          onClick={() => handleUpdate(p.id)}
                          className="bg-[#5b0675ff] text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => {
                            setEditId(null);
                            setEditUsername("");
                            setEditEmail("");
                            setEditPassword("");
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-3 md:mt-0">
                        <button
                          onClick={() => {
                            setEditId(p.id);
                            setEditUsername(p.username || "");
                            setEditEmail(p.email || "");
                            setEditPassword("");
                          }}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
