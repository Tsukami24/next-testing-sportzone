"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProdukById, ProdukRecord, StatusProduk } from "../../services/produk";

export default function ProdukDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [produk, setProduk] = useState<ProdukRecord | null>(null);
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

        const id = params.id as string;
        if (!id) {
          setError("ID produk tidak ditemukan");
          setLoading(false);
          return;
        }

        const data = await getProdukById(stored, id);
        setProduk(data);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat detail produk");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [params.id]);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Memuat detail produk...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "red" }}>{error}</p>
        <p>
          <a href="/produk">Kembali ke Daftar Produk</a>
        </p>
      </div>
    );
  }

  if (!produk) {
    return (
      <div style={{ padding: 20 }}>
        <p>Produk tidak ditemukan</p>
        <p>
          <a href="/produk">Kembali ke Daftar Produk</a>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: 20 }}>
        <a href="/produk" style={{ textDecoration: 'none', color: '#3498db', fontWeight: 'bold', fontSize: '16px' }}>
          ← Kembali ke Daftar Produk
        </a>
      </div>

      <div style={{ 
        border: "2px solid #e1e8ed", 
        borderRadius: 16, 
        padding: 30, 
        backgroundColor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '32px', fontWeight: 'bold' }}>{produk.nama}</h1>
          <p style={{ margin: '10px 0', color: '#7f8c8d', fontSize: '16px', fontFamily: 'monospace' }}>
            ID: {produk.id}
          </p>
        </div>

        {/* Image */}
        {produk.gambar && (
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <img 
              src={produk.gambar} 
              alt={produk.nama}
              style={{ 
                maxWidth: '100%', 
                maxHeight: 300, 
                borderRadius: 8,
                border: '1px solid #ddd'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Price and Status */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 30,
          padding: '20px',
          backgroundColor: '#ecf0f1',
          borderRadius: 12,
          border: '2px solid #bdc3c7'
        }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>
              {formatCurrency(produk.harga)}
            </div>
            <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>
              Harga per unit
            </div>
          </div>
          <div style={{ 
            fontSize: '14px', 
            padding: '6px 12px', 
            backgroundColor: produk.status === StatusProduk.AKTIF ? '#d4edda' : produk.status === StatusProduk.NONAKTIF ? '#f8d7da' : '#fff3cd',
            borderRadius: '20px',
            fontWeight: 'bold'
          }}>
            {produk.status === StatusProduk.AKTIF ? '✅ Aktif' : produk.status === StatusProduk.NONAKTIF ? '❌ Nonaktif' : '⚠️ Stok Habis'}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '22px', fontWeight: 'bold' }}>📝 Deskripsi</h3>
          <p style={{ 
            margin: 0, 
            color: '#34495e', 
            lineHeight: '1.8',
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: 12,
            fontSize: '16px',
            border: '2px solid #e1e8ed'
          }}>
            {produk.deskripsi}
          </p>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '22px', fontWeight: 'bold' }}>🏷️ Kategori</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: 12,
              border: '2px solid #bbdefb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#2c3e50', marginBottom: 8, fontWeight: 'bold' }}>Subkategori ID</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2', fontFamily: 'monospace', marginBottom: 8 }}>
                {produk.subkategori_id}
              </div>
              {produk.subkategori && (
                <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>
                  {produk.subkategori.nama}
                </div>
              )}
            </div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f3e5f5', 
              borderRadius: 12,
              border: '2px solid #e1bee7',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#2c3e50', marginBottom: 8, fontWeight: 'bold' }}>Brand ID</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#7b1fa2', fontFamily: 'monospace', marginBottom: 8 }}>
                {produk.brand_id}
              </div>
              {produk.brand && (
                <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>
                  {produk.brand.nama}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '22px', fontWeight: 'bold' }}>⚙️ Informasi Sistem</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 20,
            fontSize: '16px'
          }}>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '2px solid #e1e8ed' }}>
              <div style={{ color: '#7f8c8d', marginBottom: 8, fontWeight: 'bold' }}>📅 Dibuat pada</div>
              <div style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                {formatDate(produk.created_at)}
              </div>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '2px solid #e1e8ed' }}>
              <div style={{ color: '#7f8c8d', marginBottom: 8, fontWeight: 'bold' }}>🔄 Terakhir diperbarui</div>
              <div style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                {formatDate(produk.updated_at)}
              </div>
            </div>
          </div>
          {produk.deleted_at && (
            <div style={{ marginTop: 15, padding: '15px', backgroundColor: '#fdf2f2', borderRadius: '8px', border: '2px solid #fecaca' }}>
              <div style={{ color: '#e74c3c', marginBottom: 8, fontWeight: 'bold' }}>🗑️ Dihapus pada</div>
              <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                {formatDate(produk.deleted_at)}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ 
          display: 'flex', 
          gap: 15, 
          paddingTop: 25,
          borderTop: '2px solid #e1e8ed'
        }}>
          <button 
            onClick={() => router.push(`/produk`)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ← Kembali ke Daftar
          </button>
          <button 
            onClick={() => router.push(`/produk`)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#f39c12', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ✏️ Edit Produk
          </button>
        </div>
      </div>
    </div>
  );
}