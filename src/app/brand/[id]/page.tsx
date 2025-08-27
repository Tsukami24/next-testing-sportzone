'use client';

import { useState, useEffect } from 'react';
import { getBrandById, deleteBrand } from '../../services/brand';
import { useRouter, useParams } from 'next/navigation';

export default function BrandDetailPage() {
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  // Fetch brand data for detail view
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        if (!token || !brandId) return;
        
        const brandData = await getBrandById(token, brandId);
        setBrand(brandData);
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

  const handleDelete = async () => {
    if (!token || !brandId) return;
    
    if (confirm('Apakah Anda yakin ingin menghapus brand ini?')) {
      try {
        await deleteBrand(token, brandId);
        router.push('/brand'); // Redirect to brand list after successful deletion
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus brand');
      }
    }
  };

  const handleEdit = () => {
    router.push(`/brand/${brandId}/edit`);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!brand) return <div className="p-4">Brand tidak ditemukan</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Detail Brand</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="mb-4">
        <label className="block font-bold mb-1">Nama Brand:</label>
        <p>{brand.nama}</p>
      </div>
      
      <div className="mb-4">
        <label className="block font-bold mb-1">Deskripsi:</label>
        <p>{brand.deskripsi || '-'}</p>
      </div>
      
      <div className="mb-4">
        <label className="block font-bold mb-1">Tanggal Dibuat:</label>
        <p>{brand.created_at ? new Date(brand.created_at).toLocaleString() : '-'}</p>
      </div>
      
      <div className="mb-4">
        <label className="block font-bold mb-1">Tanggal Diubah:</label>
        <p>{brand.updated_at ? new Date(brand.updated_at).toLocaleString() : '-'}</p>
      </div>
      
      <div className="mt-6">
        <button
          onClick={handleEdit}
          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Hapus
        </button>
        <button
          onClick={() => router.push('/brand')}
          className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}