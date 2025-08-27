"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "../services/auth";
import {
  listProduk,
  createProduk,
  updateProduk,
  deleteProduk,
  getProdukBySubkategori,
  getProdukByBrand,
  ProdukRecord,
  StatusProduk,
  listProdukVarian,
  createProdukVarian,
  updateProdukVarian,
  deleteProdukVarian,
  ProdukVarianRecord
} from "../services/produk";
import { listSubkategori, listSubkategoriByKategori, SubkategoriRecord } from "../services/subkategori";
import { listKategori, KategoriRecord } from "../services/kategori";
import { listBrand, BrandRecord } from "../services/brand";

export default function ProdukPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [produks, setProduks] = useState<ProdukRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState<boolean>(false);

  // Form state for create produk
  const [kategori_id, setKategoriId] = useState("");
  const [subkategori_id, setSubkategoriId] = useState("");
  const [brand_id, setBrandId] = useState("");
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState("");
  const [gambar, setGambar] = useState<File | null>(null);
  const [gambarPreview, setGambarPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusProduk>(StatusProduk.AKTIF);

// Edit state per produk
  const [editId, setEditId] = useState<string | null>(null);
  const [editKategoriId, setEditKategoriId] = useState("");
  const [editSubkategoriId, setEditSubkategoriId] = useState("");
  const [editBrandId, setEditBrandId] = useState("");
  const [editNama, setEditNama] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");
  const [editHarga, setEditHarga] = useState("");
  const [editGambar, setEditGambar] = useState("");
  const [editGambarFile, setEditGambarFile] = useState<File | null>(null);
  const [editGambarPreview, setEditGambarPreview] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<StatusProduk>(StatusProduk.AKTIF);

  // Filter state
  const [filterSubkategori, setFilterSubkategori] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  // Dropdown data state
  const [subkategoriList, setSubkategoriList] = useState<SubkategoriRecord[]>([]);
  const [brandList, setBrandList] = useState<BrandRecord[]>([]);
const [kategoriList, setKategoriList] = useState<KategoriRecord[]>([]);
  const [filteredSubkategoriList, setFilteredSubkategoriList] = useState<SubkategoriRecord[]>([]);

  // Varian state
  const [selectedProdukId, setSelectedProdukId] = useState<string | null>(null);
  const [varianUkuran, setVarianUkuran] = useState("");
  const [varianWarna, setVarianWarna] = useState("");
  const [varianStok, setVarianStok] = useState("");
  const [varianHarga, setVarianHarga] = useState("");
  const [varianSku, setVarianSku] = useState("");

  // Edit varian state
  const [editVarianId, setEditVarianId] = useState<string | null>(null);
  const [editVarianUkuran, setEditVarianUkuran] = useState("");
  const [editVarianWarna, setEditVarianWarna] = useState("");
  const [editVarianStok, setEditVarianStok] = useState("");
  const [editVarianHarga, setEditVarianHarga] = useState("");
  const [editVarianSku, setEditVarianSku] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setError("Token tidak ditemukan. Login sebagai petugas dulu.");
      setLoading(false);
      return;
    }
    setToken(stored);
    loadInitialData(stored).finally(() => setLoading(false));
  }, []);

  async function loadInitialData(currentToken: string) {
    try {
      // Cek role pengguna
      const profile = await getProfile(currentToken);
      const roleName = profile?.user?.role?.name;
      setCanManage(roleName === "petugas" || roleName === "admin");
      
      // Load subkategori, brand, and produk data
      const [subkategoriData, brandData, produkData, kategoriData] = await Promise.all([
        listSubkategori(currentToken),
        listBrand(currentToken),
        listProduk(currentToken),
        listKategori(currentToken)
      ]);
      
      setSubkategoriList(subkategoriData);
      setBrandList(brandData);
      setProduks(produkData);
      setKategoriList(kategoriData);
      setFilteredSubkategoriList(subkategoriData);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data awal");
    }
  }

  async function refresh(currentToken: string) {
    try {
      let data;
      if (filterSubkategori) {
        data = await getProdukBySubkategori(currentToken, filterSubkategori);
      } else if (filterBrand) {
        data = await getProdukByBrand(currentToken, filterBrand);
      } else {
        data = await listProduk(currentToken);
      }
      
      // Load varian data for each produk
      const produksWithVarian = await Promise.all(data.map(async (produk) => {
        try {
          const varian = await listProdukVarian(currentToken, produk.id);
          return { ...produk, varian };
        } catch (e) {
          return { ...produk, varian: [] };
        }
      }));
      
      setProduks(produksWithVarian);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data produk");
    }
  }

  async function handleCreateProduk() {
    if (!token) return alert("Belum login");
    if (!canManage) return alert("Fitur ini hanya untuk petugas/admin");
    if (!kategori_id || !subkategori_id || !brand_id || !nama || !deskripsi || !harga) {
      return alert("Semua field wajib diisi kecuali gambar");
    }
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("kategori_id", kategori_id);
      formData.append("subkategori_id", subkategori_id);
      formData.append("brand_id", brand_id);
      formData.append("nama", nama);
      formData.append("deskripsi", deskripsi);
      formData.append("harga", harga);
      formData.append("status", status);
      if (gambar) {
        formData.append("gambar", gambar);
      }
      
      // For now, we'll keep using the existing createProduk function
      // but we'll need to modify it to handle file uploads later
      await createProduk(token, {
        subkategori_id,
        brand_id,
        nama,
        deskripsi,
        harga: parseFloat(harga),
        gambar: gambar ? URL.createObjectURL(gambar) : undefined,
        status
      });
      
      // Reset form
      setKategoriId("");
      setSubkategoriId("");
      setBrandId("");
      setNama("");
      setDeskripsi("");
      setHarga("");
      setGambar(null);
      setGambarPreview(null);
      setStatus(StatusProduk.AKTIF);
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal membuat produk");
    }
  }

  async function handleUpdateProduk(id: string) {
    if (!token) return alert("Belum login");
    if (!canManage) return alert("Fitur ini hanya untuk petugas/admin");
    try {
      const updateData: any = {};
      if (editKategoriId) updateData.kategori_id = editKategoriId;
      if (editSubkategoriId) updateData.subkategori_id = editSubkategoriId;
      if (editBrandId) updateData.brand_id = editBrandId;
      if (editNama) updateData.nama = editNama;
      if (editDeskripsi) updateData.deskripsi = editDeskripsi;
      if (editHarga) updateData.harga = parseFloat(editHarga);
      if (editGambar !== undefined) updateData.gambar = editGambar;
      if (editStatus) updateData.status = editStatus;

      await updateProduk(token, id, updateData);
      // Reset edit form
      setEditId(null);
      setEditKategoriId("");
      setEditSubkategoriId("");
      setEditBrandId("");
      setEditNama("");
      setEditDeskripsi("");
      setEditHarga("");
      setEditGambar("");
      setEditGambarFile(null);
      setEditGambarPreview(null);
      setEditStatus(StatusProduk.AKTIF);
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal update produk");
    }
  }

  async function handleDeleteProduk(id: string) {
    if (!token) return alert("Belum login");
    if (!canManage) return alert("Fitur ini hanya untuk petugas/admin");
    if (!confirm("Hapus produk ini?")) return;
    try {
      await deleteProduk(token, id);
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal delete produk");
    }
  }

  async function handleCreateVarian() {
    if (!token) return alert("Belum login");
    if (!canManage) return alert("Fitur ini hanya untuk petugas/admin");
    if (!selectedProdukId || !varianStok) {
      return alert("Produk dan stok wajib diisi");
    }
    try {
      await createProdukVarian(token, {
        produk_id: selectedProdukId,
        ukuran: varianUkuran || undefined,
        warna: varianWarna || undefined,
        stok: parseInt(varianStok),
        harga: varianHarga ? parseFloat(varianHarga) : undefined,
        sku: varianSku || undefined
      });
      // Reset form
      setVarianUkuran("");
      setVarianWarna("");
      setVarianStok("");
      setVarianHarga("");
      setVarianSku("");
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal membuat varian produk");
    }
  }

  async function handleUpdateVarian(varianId: string) {
    if (!token) return alert("Belum login");
    if (!canManage) return alert("Fitur ini hanya untuk petugas/admin");
    try {
      const updateData: any = {};
      if (editVarianUkuran !== undefined) updateData.ukuran = editVarianUkuran || null;
      if (editVarianWarna !== undefined) updateData.warna = editVarianWarna || null;
      if (editVarianStok) updateData.stok = parseInt(editVarianStok);
      if (editVarianHarga !== undefined) updateData.harga = editVarianHarga ? parseFloat(editVarianHarga) : null;
      if (editVarianSku !== undefined) updateData.sku = editVarianSku || null;

      await updateProdukVarian(token, varianId, updateData);
      // Reset edit form
      setEditVarianId(null);
      setEditVarianUkuran("");
      setEditVarianWarna("");
      setEditVarianStok("");
      setEditVarianHarga("");
      setEditVarianSku("");
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal update varian produk");
    }
  }

  async function handleDeleteVarian(varianId: string) {
    if (!token) return alert("Belum login");
    if (!canManage) return alert("Fitur ini hanya untuk petugas/admin");
    if (!confirm("Hapus varian ini?")) return;
    try {
      await deleteProdukVarian(token, varianId);
      await refresh(token);
    } catch (e: any) {
      alert(e?.message || "Gagal delete varian produk");
    }
  }

  async function handleFilter() {
    if (!token) return;
    await refresh(token);
  }

  async function handleClearFilter() {
    setFilterSubkategori("");
    setFilterBrand("");
    if (token) {
      await refresh(token);
    }
  }

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

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: 20, fontSize: '32px', fontWeight: 'bold' }}>CRUD Produk (Khusus Petugas)</h1>
      <p style={{ marginBottom: 20 }}>
        <a href="/home" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>← Kembali ke Home</a>
      </p>
      
      {loading && <p style={{ color: '#2c3e50', fontSize: '18px' }}>Memuat...</p>}
      {!loading && error && <p style={{ color: "#e74c3c", fontSize: '16px', padding: '10px', backgroundColor: '#fdf2f2', borderRadius: '5px', border: '1px solid #fecaca' }}>{error}</p>}
      
      {!loading && !error && (
        <div>
          {/* Filter Section */}
          <div style={{ marginBottom: 20, padding: 20, backgroundColor: '#ffffff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: '1px solid #e1e8ed' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: 15, fontSize: '20px' }}>Filter Produk</h3>
            <div style={{ display: "flex", gap: 12, marginBottom: 15, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <select 
                  value={filterSubkategori} 
                  onChange={(e) => setFilterSubkategori(e.target.value)}
                  style={{ 
                    padding: '10px 15px', 
                    border: '2px solid #e1e8ed', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    width: '100%',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Semua Subkategori</option>
                  {subkategoriList.map((subkategori) => (
                    <option key={subkategori.id} value={subkategori.id}>
                      {subkategori.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <select 
                  value={filterBrand} 
                  onChange={(e) => setFilterBrand(e.target.value)}
                  style={{ 
                    padding: '10px 15px', 
                    border: '2px solid #e1e8ed', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    width: '100%',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Semua Brand</option>
                  {brandList.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.nama}
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={handleFilter} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Filter</button>
              <button onClick={handleClearFilter} style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Clear Filter</button>
            </div>
          </div>

          {/* Create Form */}
          <div style={{ marginBottom: 20, padding: 20, backgroundColor: '#ffffff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: '1px solid #e1e8ed' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: 15, fontSize: '20px' }}>Tambah Produk Baru</h3>
            {!canManage && (
              <p style={{ color: '#e67e22', marginBottom: 12 }}>Anda bukan petugas/admin. Form dinonaktifkan.</p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15, marginBottom: 15, opacity: canManage ? 1 : 0.6, pointerEvents: canManage ? 'auto' : 'none' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Kategori *
                </label>
                <select
                  value={kategori_id}
                  onChange={(e) => setKategoriId(e.target.value)}
                  style={{
                    padding: '12px 15px',
                    border: '2px solid #e1e8ed',
                    borderRadius: '8px',
                    fontSize: '14px',
                    width: '100%',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Pilih Kategori</option>
                  {kategoriList.map((kategori) => (
                    <option key={kategori.id} value={kategori.id}>
                      {kategori.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Subkategori *
                </label>
                <select
                  value={subkategori_id}
                  onChange={(e) => setSubkategoriId(e.target.value)}
                  style={{
                    padding: '12px 15px',
                    border: '2px solid #e1e8ed',
                    borderRadius: '8px',
                    fontSize: '14px',
                    width: '100%',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Pilih Subkategori</option>
                  {subkategoriList.map((subkategori) => (
                    <option key={subkategori.id} value={subkategori.id}>
                      {subkategori.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Brand *
                </label>
                <select 
                  value={brand_id} 
                  onChange={(e) => setBrandId(e.target.value)}
                  style={{ 
                    padding: '12px 15px', 
                    border: '2px solid #e1e8ed', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    width: '100%',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Pilih Brand</option>
                  {brandList.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Nama Produk *
                </label>
                <input 
                  placeholder="Masukkan nama produk" 
                  value={nama} 
                  onChange={(e) => setNama(e.target.value)}
                  style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Deskripsi *
                </label>
                <textarea 
                  placeholder="Masukkan deskripsi produk" 
                  value={deskripsi} 
                  onChange={(e) => setDeskripsi(e.target.value)}
                  style={{ minHeight: 60, padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', resize: 'vertical', width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Harga (Rp) *
                </label>
                <input 
                  placeholder="Masukkan harga" 
                  type="number"
                  value={harga} 
                  onChange={(e) => setHarga(e.target.value)}
                  style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Status
                </label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as StatusProduk)}
                  style={{ 
                    padding: '12px 15px', 
                    border: '2px solid #e1e8ed', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    width: '100%',
                    backgroundColor: 'white'
                  }}
                >
                  <option value={StatusProduk.AKTIF}>Aktif</option>
                  <option value={StatusProduk.NONAKTIF}>Nonaktif</option>
                  <option value={StatusProduk.STOK_HABIS}>Stok Habis</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Gambar (opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setGambar(e.target.files[0]);
                      setGambarPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                />
                {gambarPreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={gambarPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  </div>
                )}
              </div>
            </div>
            <button onClick={handleCreateProduk} disabled={!canManage} style={{ padding: '12px 24px', backgroundColor: canManage ? '#27ae60' : '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: canManage ? 'pointer' : 'not-allowed' }}>Tambah Produk</button>
          </div>

          {/* Varian Form */}
          <div style={{ marginBottom: 20, padding: 20, backgroundColor: '#ffffff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: '1px solid #e1e8ed' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: 15, fontSize: '20px' }}>Tambah Varian Produk</h3>
            {!canManage && (
              <p style={{ color: '#e67e22', marginBottom: 12 }}>Anda bukan petugas/admin. Form dinonaktifkan.</p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15, marginBottom: 15, opacity: canManage ? 1 : 0.6, pointerEvents: canManage ? 'auto' : 'none' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Pilih Produk *
                </label>
                <select 
                  value={selectedProdukId || ""} 
                  onChange={(e) => setSelectedProdukId(e.target.value)}
                  style={{ 
                    padding: '12px 15px', 
                    border: '2px solid #e1e8ed', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    width: '100%',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Pilih Produk</option>
                  {produks.map((produk) => (
                    <option key={produk.id} value={produk.id}>
                      {produk.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Ukuran (opsional)
                </label>
                <input 
                  placeholder="Ukuran produk"
                  value={varianUkuran} 
                  onChange={(e) => setVarianUkuran(e.target.value)}
                  style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Warna (opsional)
                </label>
                <input 
                  placeholder="Warna produk"
                  value={varianWarna} 
                  onChange={(e) => setVarianWarna(e.target.value)}
                  style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Stok *
                </label>
                <input 
                  placeholder="Jumlah stok"
                  type="number"
                  value={varianStok} 
                  onChange={(e) => setVarianStok(e.target.value)}
                  style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  Harga (opsional)
                </label>
                <input 
                  placeholder="Harga varian"
                  type="number"
                  value={varianHarga} 
                  onChange={(e) => setVarianHarga(e.target.value)}
                  style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                  SKU (opsional)
                </label>
                <input 
                  placeholder="Kode unik produk"
                  value={varianSku} 
                  onChange={(e) => setVarianSku(e.target.value)}
                  style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                />
              </div>
            </div>
            <button onClick={handleCreateVarian} disabled={!canManage || !selectedProdukId} style={{ padding: '12px 24px', backgroundColor: canManage && selectedProdukId ? '#27ae60' : '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: canManage && selectedProdukId ? 'pointer' : 'not-allowed' }}>Tambah Varian</button>
          </div>

          {/* Products List */}
          <div>
            <h3 style={{ color: '#2c3e50', marginBottom: 15, fontSize: '20px' }}>Daftar Produk ({produks.length} item)</h3>
            {produks.length === 0 && <p style={{ color: '#7f8c8d', fontSize: '16px', textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>Tidak ada data produk</p>}
            
            <div style={{ display: "grid", gap: 20 }}>
              {produks.map((produk) => (
                <div key={produk.id} style={{ 
                  border: "2px solid #e1e8ed", 
                  padding: 20, 
                  borderRadius: 12,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}>
                  {editId === produk.id ? (
                    <div style={{ display: "grid", gap: 15 }}>
                      <h4 style={{ color: '#2c3e50', fontSize: '18px', marginBottom: 10 }}>Edit Produk</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                            Kategori
                          </label>
                          <select
                            value={editKategoriId}
                            onChange={(e) => setEditKategoriId(e.target.value)}
                            style={{
                              padding: '12px 15px',
                              border: '2px solid #e1e8ed',
                              borderRadius: '8px',
                              fontSize: '14px',
                              width: '100%',
                              backgroundColor: 'white'
                            }}
                          >
                            <option value="">Pilih Kategori</option>
                            {kategoriList.map((kategori) => (
                              <option key={kategori.id} value={kategori.id}>
                                {kategori.nama}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                            Subkategori
                          </label>
                          <select
                            value={editSubkategoriId}
                            onChange={(e) => setEditSubkategoriId(e.target.value)}
                            style={{
                              padding: '12px 15px',
                              border: '2px solid #e1e8ed',
                              borderRadius: '8px',
                              fontSize: '14px',
                              width: '100%',
                              backgroundColor: 'white'
                            }}
                          >
                            <option value="">Pilih Subkategori</option>
                            {subkategoriList.map((subkategori) => (
                              <option key={subkategori.id} value={subkategori.id}>
                                {subkategori.nama}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                            Brand
                          </label>
                          <select
                            value={editBrandId}
                            onChange={(e) => setEditBrandId(e.target.value)}
                            style={{ 
                              padding: '12px 15px', 
                              border: '2px solid #e1e8ed', 
                              borderRadius: '8px', 
                              fontSize: '14px',
                              width: '100%',
                              backgroundColor: 'white'
                            }}
                          >
                            <option value="">Pilih Brand</option>
                            {brandList.map((brand) => (
                              <option key={brand.id} value={brand.id}>
                                {brand.nama}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                            Nama Produk
                          </label>
                          <input
                            placeholder="Masukkan nama produk"
                            value={editNama}
                            onChange={(e) => setEditNama(e.target.value)}
                            style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                            Deskripsi
                          </label>
                          <textarea
                            placeholder="Masukkan deskripsi produk"
                            value={editDeskripsi}
                            onChange={(e) => setEditDeskripsi(e.target.value)}
                            style={{ minHeight: 60, padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', resize: 'vertical', width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                            Harga (Rp)
                          </label>
                          <input
                            placeholder="Masukkan harga"
                            type="number"
                            value={editHarga}
                            onChange={(e) => setEditHarga(e.target.value)}
                            style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                            Status
                          </label>
                          <select 
                            value={editStatus} 
                            onChange={(e) => setEditStatus(e.target.value as StatusProduk)}
                            style={{ 
                              padding: '12px 15px', 
                              border: '2px solid #e1e8ed', 
                              borderRadius: '8px', 
                              fontSize: '14px',
                              width: '100%',
                              backgroundColor: 'white'
                            }}
                          >
                            <option value={StatusProduk.AKTIF}>Aktif</option>
                            <option value={StatusProduk.NONAKTIF}>Nonaktif</option>
                            <option value={StatusProduk.STOK_HABIS}>Stok Habis</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold', fontSize: '14px' }}>
                            Gambar
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setEditGambarFile(e.target.files[0]);
                                setEditGambarPreview(URL.createObjectURL(e.target.files[0]));
                              }
                            }}
                            style={{ padding: '12px 15px', border: '2px solid #e1e8ed', borderRadius: '8px', fontSize: '14px', width: '100%' }}
                          />
                          {editGambarPreview && (
                            <div style={{ marginTop: '10px' }}>
                              <img src={editGambarPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                            </div>
                          )}
                          {(editGambar || editGambarPreview) && (
                            <button
                              onClick={() => {
                                setEditGambar("");
                                setEditGambarFile(null);
                                setEditGambarPreview(null);
                              }}
                              style={{ marginTop: '10px', padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Hapus Gambar
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 15 }}>
                        <button onClick={() => handleUpdateProduk(produk.id)} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan</button>
                        <button onClick={() => { 
                          setEditId(null); 
                          setEditSubkategoriId(""); 
                          setEditBrandId(""); 
                          setEditNama(""); 
                          setEditDeskripsi(""); 
                          setEditHarga(""); 
                          setEditGambar(""); 
                          setEditStatus(StatusProduk.AKTIF);
                        }} style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Batal</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
                        <div>
                          <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '20px', fontWeight: 'bold' }}>{produk.nama}</h4>
                          <p style={{ margin: '8px 0', color: '#7f8c8d', fontSize: '14px', fontFamily: 'monospace' }}>
                            ID: {produk.id}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                            {formatCurrency(produk.harga)}
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            padding: '2px 8px', 
                            backgroundColor: produk.status === 'aktif' ? '#d4edda' : produk.status === 'nonaktif' ? '#f8d7da' : '#fff3cd',
                            borderRadius: '4px'
                          }}>
                            {produk.status}
                          </div>
                        </div>
                      </div>
                      
                      <p style={{ margin: '15px 0', color: '#34495e', lineHeight: '1.6', fontSize: '15px' }}>{produk.deskripsi}</p>
                      
                      <div style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: 12, padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <div style={{ marginBottom: '4px' }}><strong>Subkategori ID:</strong> {produk.subkategori_id}</div>
                        <div style={{ marginBottom: '4px' }}><strong>Brand ID:</strong> {produk.brand_id}</div>
                        {produk.gambar && (
                          <div style={{ marginTop: 8 }}>
                            <strong>Gambar:</strong>
                            <div style={{ marginTop: 6 }}>
                              <img src={produk.gambar} alt={produk.nama} style={{ maxHeight: 80, objectFit: 'contain' }} />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {produk.subkategori && (
                        <div style={{ fontSize: '14px', color: '#3498db', marginBottom: 6, fontWeight: 'bold' }}>
                          🏷️ Subkategori: {produk.subkategori.nama}
                        </div>
                      )}
                      
                      {produk.brand && (
                        <div style={{ fontSize: '14px', color: '#9b59b6', marginBottom: 15, fontWeight: 'bold' }}>
                          🏷️ Brand: {produk.brand.nama}
                        </div>
                      )}
                      
                      <div style={{ display: "flex", gap: 12, marginTop: 15 }}>
                        <button 
                          onClick={() => router.push(`/produk/${produk.id}`)}
                          style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          👁️ Detail
                        </button>
                        <button 
                          onClick={() => { 
                            setEditId(produk.id); 
                            setEditSubkategoriId(produk.subkategori_id); 
                            setEditBrandId(produk.brand_id); 
                            setEditNama(produk.nama); 
                            setEditDeskripsi(produk.deskripsi); 
                            setEditHarga(produk.harga.toString()); 
                            setEditGambar(produk.gambar || ""); 
                            setEditStatus(produk.status);
                          }} 
                          style={{ padding: '10px 20px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduk(produk.id)} 
                          style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Varian Section */}
                  {produk.id === selectedProdukId && (
                    <div style={{ marginTop: 20, padding: '15px', border: '1px solid #e1e8ed', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Varian Produk</h5>
                      {produk.varian && produk.varian.length > 0 ? (
                        <div style={{ display: "grid", gap: 10 }}>
                          {produk.varian.map((varian: ProdukVarianRecord) => (
                            <div key={varian.id} style={{ 
                              padding: '10px', 
                              border: '1px solid #ddd', 
                              borderRadius: '6px', 
                              backgroundColor: '#fff' 
                            }}>
                              {editVarianId === varian.id ? (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                                  <input 
                                    placeholder="Ukuran"
                                    value={editVarianUkuran}
                                    onChange={(e) => setEditVarianUkuran(e.target.value)}
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                  />
                                  <input 
                                    placeholder="Warna"
                                    value={editVarianWarna}
                                    onChange={(e) => setEditVarianWarna(e.target.value)}
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                  />
                                  <input 
                                    placeholder="Stok"
                                    type="number"
                                    value={editVarianStok}
                                    onChange={(e) => setEditVarianStok(e.target.value)}
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                  />
                                  <input 
                                    placeholder="Harga"
                                    type="number"
                                    value={editVarianHarga}
                                    onChange={(e) => setEditVarianHarga(e.target.value)}
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                  />
                                  <input 
                                    placeholder="SKU"
                                    value={editVarianSku}
                                    onChange={(e) => setEditVarianSku(e.target.value)}
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                  />
                                  <div style={{ display: "flex", gap: 5 }}>
                                    <button 
                                      onClick={() => handleUpdateVarian(varian.id)} 
                                      style={{ padding: '6px 10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                      Simpan
                                    </button>
                                    <button 
                                      onClick={() => setEditVarianId(null)} 
                                      style={{ padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div>
                                    {varian.ukuran && <span><strong>Ukuran:</strong> {varian.ukuran} </span>}
                                    {varian.warna && <span><strong>Warna:</strong> {varian.warna} </span>}
                                    <span><strong>Stok:</strong> {varian.stok} </span>
                                    {varian.harga && <span><strong>Harga:</strong> {formatCurrency(varian.harga)} </span>}
                                    {varian.sku && <span><strong>SKU:</strong> {varian.sku} </span>
                                    }
                                  </div>
                                  <div style={{ display: "flex", gap: 5 }}>
                                    <button 
                                      onClick={() => {
                                        setEditVarianId(varian.id);
                                        setEditVarianUkuran(varian.ukuran || "");
                                        setEditVarianWarna(varian.warna || "");
                                        setEditVarianStok(varian.stok.toString());
                                        setEditVarianHarga(varian.harga?.toString() || "");
                                        setEditVarianSku(varian.sku || "");
                                      }} 
                                      style={{ padding: '4px 8px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteVarian(varian.id)} 
                                      style={{ padding: '4px 8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Tidak ada varian untuk produk ini</p>
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