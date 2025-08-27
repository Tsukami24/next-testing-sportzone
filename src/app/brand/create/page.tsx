'use client';

import { useState } from 'react';
import { createBrand } from '../../services/brand';
import { useRouter } from 'next/navigation';

export default function CreateBrandPage() {
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Get token from localStorage
  if (typeof window !== "undefined" && !token) {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        throw new Error('Unauthorized');
      }

      await createBrand(token, { nama, deskripsi });
      router.push('/brand'); // Redirect to brand list after successful creation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat brand');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tambah Brand Baru</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nama" className="block mb-1">Nama Brand</label>
          <input
            id="nama"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="deskripsi" className="block mb-1">Deskripsi</label>
          <textarea
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/brand')}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}