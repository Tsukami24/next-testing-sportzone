'use client';

import { useEffect, useState } from 'react';
import { listBrand } from '../services/brand';
import { BrandRecord } from '../services/brand';
import { deleteBrand } from '../services/brand';

export default function BrandPage() {
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        if (!token) {
          throw new Error('Unauthorized');
        }
        const data = await listBrand(token);
        setBrands(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBrands();
    }
  }, [token]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Daftar Brand</h1>
      <div className="mb-4">
        <a
          href="/brand/create"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Tambah Brand
        </a>
      </div>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nama</th>
            <th className="py-2 px-4 border-b">Deskripsi</th>
            <th className="py-2 px-4 border-b">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id}>
              <td className="py-2 px-4 border-b">{brand.nama}</td>
              <td className="py-2 px-4 border-b">{brand.deskripsi || "-"}</td>
              <td className="py-2 px-4 border-b">
                <a
                  href={`/brand/${brand.id}`}
                  className="text-blue-500 hover:underline"
                >
                  Detail
                </a>
                {" | "}
                <a
                  href={`/brand/${brand.id}/edit`}
                  className="text-yellow-500 hover:underline"
                >
                  Edit
                </a>
                {" | "}
                <button
                  onClick={async () => {
                    if (
                      confirm("Apakah Anda yakin ingin menghapus brand ini?")
                    ) {
                      try {
                        if (!token) throw new Error("Unauthorized");
                        await deleteBrand(token, brand.id); // urutannya token dulu, baru id
                        // update state agar list langsung refresh
                        setBrands((prev) =>
                          prev.filter((b) => b.id !== brand.id)
                        );
                      } catch (err) {
                        alert(
                          err instanceof Error
                            ? err.message
                            : "Gagal menghapus brand"
                        );
                      }
                    }
                  }}
                  className="text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}