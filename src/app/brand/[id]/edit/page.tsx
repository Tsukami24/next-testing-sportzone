'use client';

import { useState, useEffect } from 'react';
import { getBrandById, updateBrand } from '../../../services/brand';
import { useRouter, useParams } from 'next/navigation';

export default function EditBrandPage() {
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const brandId = typeof params.id === 'string' ? params.id : '';

  // Get token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  // Fetch brand data for editing
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        if (!token || !brandId) return;
        
        const brandData = await getBrandById(token, brandId);
        setNama(brandData.nama);
        setDeskripsi(brandData.deskripsi || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data brand');
      } finally {
        setLoading(false);
      }
    };

    if (token && brandId) {
      fetchBrand();
    }
  }, [token, brandId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!token) {
        throw new Error('Unauthorized');
      }

      await updateBrand(token, brandId, { nama, deskripsi });
      router.push('/brand'); // Redirect to brand list after successful update
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui brand');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Brand</h1>
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
            disabled={saving}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
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