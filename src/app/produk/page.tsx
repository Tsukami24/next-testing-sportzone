"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "../services/auth";
import {
  listProduk,
  createProduk,
  updateProduk,
  deleteProduk,
  deleteProdukGambar,
  getProdukBySubkategori,
  getProdukByBrand,
  ProdukRecord,
  StatusProduk,
  listProdukVarian,
  createProdukVarian,
  updateProdukVarian,
  deleteProdukVarian,
  ProdukVarianRecord,
  createProdukWithFile,
  updateProdukWithFile,
} from "../services/produk";
import {
  listSubkategori,
  listSubkategoriByKategori,
  SubkategoriRecord,
} from "../services/subkategori";
import { listKategori, KategoriRecord } from "../services/kategori";
import { listBrand, BrandRecord } from "../services/brand";
import { API_URL } from "../services/auth";
import Cart from "../components/Cart";

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
  const [stok, setStok] = useState("");
  const [gambar, setGambar] = useState<File[]>([]);
  const [gambarPreview, setGambarPreview] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusProduk>(StatusProduk.AKTIF);

  // Edit state per produk
  const [editId, setEditId] = useState<string | null>(null);
  const [editKategoriId, setEditKategoriId] = useState("");
  const [editSubkategoriId, setEditSubkategoriId] = useState("");
  const [editBrandId, setEditBrandId] = useState("");
  const [editNama, setEditNama] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");
  const [editHarga, setEditHarga] = useState("");
  const [editStok, setEditStok] = useState("");
  const [editGambar, setEditGambar] = useState<string[]>([]);
  const [editOriginalGambar, setEditOriginalGambar] = useState<string[]>([]);
  const [editGambarFile, setEditGambarFile] = useState<File[]>([]);
  const [editGambarPreview, setEditGambarPreview] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<StatusProduk>(
    StatusProduk.AKTIF
  );

  // Filter state
  const [filterSubkategori, setFilterSubkategori] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  // Dropdown data state
  const [subkategoriList, setSubkategoriList] = useState<SubkategoriRecord[]>(
    []
  );
  const [brandList, setBrandList] = useState<BrandRecord[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriRecord[]>([]);
  const [filteredSubkategoriList, setFilteredSubkategoriList] = useState<
    SubkategoriRecord[]
  >([]);

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
  const [showAddVarian, setShowAddVarian] = useState<string | null>(null);

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
      const [subkategoriData, brandData, produkData, kategoriData] =
        await Promise.all([
          listSubkategori(currentToken),
          listBrand(currentToken),
          listProduk(currentToken),
          listKategori(currentToken),
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

  function resolveImageUrl(src?: string): string | undefined {
    if (!src) return undefined;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/")) return `${API_URL}${src}`;
    // encode spaces minimally
    const cleaned = src.replace(/\s/g, "%20");
    return `${API_URL}/${cleaned}`;
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

      // Load varian data for each produk (fallback ke data yang sudah ada jika fetch gagal)
      const produksWithVarian = await Promise.all(
        data.map(async (produk) => {
          try {
            const varian = await listProdukVarian(currentToken, produk.id);
            return { ...produk, varian };
          } catch (e) {
            return { ...produk, varian: produk.varian || [] };
          }
        })
      );

      setProduks(produksWithVarian);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data produk");
    }
  }

  async function handleCreateProduk() {
    if (!token) return alert("Belum login");
    if (!canManage) return alert("Fitur ini hanya untuk petugas/admin");
    if (
      !kategori_id ||
      !subkategori_id ||
      !brand_id ||
      !nama ||
      !deskripsi ||
      !harga ||
      !stok
    ) {
      return alert("Semua field wajib diisi kecuali gambar");
    }
    try {
      // Prepare data, only include stok if provided
      let createData: any = {
        subkategori_id,
        brand_id,
        nama,
        deskripsi,
        harga: parseFloat(harga),
        status,
      };
      if (stok) createData.stok = parseInt(stok);
      if (kategori_id) createData.kategori_id = kategori_id;

      // Gunakan multipart bila ada file, hindari blob URL
      if (gambar.length > 0) {
        await createProdukWithFile(
          token,
          createData,
          gambar // ini array of File[], cocok dengan FilesInterceptor
        );
      } else {
        await createProduk(token, createData);
      }

      // Reset form
      setKategoriId("");
      setSubkategoriId("");
      setBrandId("");
      setNama("");
      setDeskripsi("");
      setHarga("");
      setGambar([]);
      setGambarPreview([]);
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
      // 1. Hapus gambar yang sudah dihapus user dari UI
      const deletedImages = editOriginalGambar.filter(
        (img) => !editGambar.includes(img)
      );
      for (const img of deletedImages) {
        try {
          // Defensive: check if img is a valid string and not empty
          if (typeof img === "string" && img.trim() !== "") {
            await deleteProdukGambar(token, id, img);
          } else {
            console.warn("Skipping invalid image URL for deletion:", img);
          }
        } catch (deleteError) {
          console.error("Error deleting image:", deleteError);
          // Continue with other deletions even if one fails
        }
      }

      // 2. Update produk dengan data baru
      const updateData: any = {};
      if (editKategoriId) updateData.kategori_id = editKategoriId;
      if (editSubkategoriId) updateData.subkategori_id = editSubkategoriId;
      if (editBrandId) updateData.brand_id = editBrandId;
      if (editNama) updateData.nama = editNama;
      if (editDeskripsi) updateData.deskripsi = editDeskripsi;
      if (editHarga) updateData.harga = parseFloat(editHarga);
      if (editStok !== "") updateData.stok = parseInt(editStok);
      if (editStatus) updateData.status = editStatus;

      // Handle gambar updates
      if (editGambarFile.length > 0) {
        // Use multipart upload for new files, backend will replace images with existing + new
        // So we need to send existing images explicitly as array
        updateData.existingGambar = editGambar;
        const updatedProduct = await updateProdukWithFile(
          token,
          id,
          updateData,
          editGambarFile
        );
      } else {
        // No new files, update with remaining existing images
        updateData.gambar = editGambar;
        const updatedProduct = await updateProduk(token, id, updateData);
      }

      // Reset edit form
      setEditId(null);
      setEditKategoriId("");
      setEditSubkategoriId("");
      setEditBrandId("");
      setEditNama("");
      setEditDeskripsi("");
      setEditHarga("");
      setEditGambar([]);
      setEditOriginalGambar([]);
      setEditGambarFile([]);
      setEditGambarPreview([]);
      setEditStatus(StatusProduk.AKTIF);

      // Always refresh to ensure UI shows the latest images from server
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
        sku: varianSku || undefined,
      });
      // Reset form
      setVarianUkuran("");
      setVarianWarna("");
      setVarianStok("");
      setVarianHarga("");
      setVarianSku("");
      setShowAddVarian(null);
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
      if (editVarianUkuran !== undefined)
        updateData.ukuran = editVarianUkuran || null;
      if (editVarianWarna !== undefined)
        updateData.warna = editVarianWarna || null;
      if (editVarianStok) updateData.stok = parseInt(editVarianStok);
      if (editVarianHarga !== undefined)
        updateData.harga = editVarianHarga ? parseFloat(editVarianHarga) : null;
      if (editVarianSku !== undefined) updateData.sku = editVarianSku || null;

      await updateProdukVarian(token, varianId, updateData);
      // Reset edit form
      setEditVarianId(null);
      setEditVarianUkuran("");
      setEditVarianWarna("");
      setEditVarianStok("");
      setEditVarianHarga("");
      setEditVarianSku("");
      setShowAddVarian(null);
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
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                CRUD Produk
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Khusus Petugas - Kelola produk dan varian
              </p>
              <a
                href="/home"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 transition-colors"
              >
                ← Kembali ke Home
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a href="/pesanan">
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  📋 Pesanan
                </button>
              </a>
              <Cart />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat data...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Filter Produk
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subkategori
                  </label>
                  <select
                    value={filterSubkategori}
                    onChange={(e) => setFilterSubkategori(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  >
                    <option value="">Semua Subkategori</option>
                    {subkategoriList.map((subkategori) => (
                      <option key={subkategori.id} value={subkategori.id}>
                        {subkategori.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  >
                    <option value="">Semua Brand</option>
                    {brandList.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleFilter}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Filter
                  </button>
                  <button
                    onClick={handleClearFilter}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Create Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tambah Produk Baru
              </h3>
              {!canManage && (
                <p className="text-sm text-gray-500 mb-4">
                  Anda bukan petugas/admin. Form dinonaktifkan.
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={kategori_id}
                    onChange={(e) => setKategoriId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    disabled={!canManage}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Subkategori *
                  </label>
                  <select
                    value={subkategori_id}
                    onChange={(e) => setSubkategoriId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    disabled={!canManage}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Brand *
                  </label>
                  <select
                    value={brand_id}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    disabled={!canManage}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nama Produk *
                  </label>
                  <input
                    placeholder="Masukkan nama produk"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canManage}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Deskripsi *
                  </label>
                  <textarea
                    placeholder="Masukkan deskripsi produk"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                    rows={3}
                    disabled={!canManage}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    placeholder="Masukkan harga"
                    type="number"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canManage}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Stok *
                  </label>
                  <input
                    placeholder="Masukkan stok"
                    type="number"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canManage}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusProduk)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    disabled={!canManage}
                  >
                    <option value={StatusProduk.AKTIF}>Aktif</option>
                    <option value={StatusProduk.NONAKTIF}>Nonaktif</option>
                    <option value={StatusProduk.STOK_HABIS}>Stok Habis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Gambar (opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newFilesArray = Array.from(e.target.files);
                        // Append new files to existing gambar array
                        setGambar((prev) => [...prev, ...newFilesArray]);
                        // Append new previews to existing previews
                        setGambarPreview((prev) => [
                          ...prev,
                          ...newFilesArray.map((file) =>
                            URL.createObjectURL(file)
                          ),
                        ]);
                      }
                    }}
                    className="w-full"
                    disabled={!canManage}
                  />
                  {gambarPreview.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {gambarPreview.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={src}
                            alt={`Preview ${idx + 1}`}
                            className="max-h-40 rounded-md object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setGambar((prev) =>
                                prev.filter((_, i) => i !== idx)
                              );
                              setGambarPreview((prev) =>
                                prev.filter((_, i) => i !== idx)
                              );
                            }}
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleCreateProduk}
                disabled={!canManage}
                className="mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambah Produk
              </button>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Daftar Produk ({produks.length} item)
              </h3>
              {produks.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Tidak ada data produk
                </p>
              )}

              <div className="space-y-6">
                {produks.map((produk) => (
                  <div
                    key={produk.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    {editId === produk.id ? (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">
                          Edit Produk
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Kategori
                            </label>
                            <select
                              value={editKategoriId}
                              onChange={(e) =>
                                setEditKategoriId(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subkategori
                            </label>
                            <select
                              value={editSubkategoriId}
                              onChange={(e) =>
                                setEditSubkategoriId(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            >
                              <option value="">Pilih Subkategori</option>
                              {subkategoriList.map((subkategori) => (
                                <option
                                  key={subkategori.id}
                                  value={subkategori.id}
                                >
                                  {subkategori.nama}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Brand
                            </label>
                            <select
                              value={editBrandId}
                              onChange={(e) => setEditBrandId(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nama Produk
                            </label>
                            <input
                              placeholder="Masukkan nama produk"
                              value={editNama}
                              onChange={(e) => setEditNama(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Deskripsi
                            </label>
                            <textarea
                              placeholder="Masukkan deskripsi produk"
                              value={editDeskripsi}
                              onChange={(e) => setEditDeskripsi(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Harga (Rp)
                            </label>
                            <input
                              placeholder="Masukkan harga"
                              type="number"
                              value={editHarga}
                              onChange={(e) => setEditHarga(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stok
                            </label>
                            <input
                              placeholder="Masukkan stok"
                              type="number"
                              value={editStok}
                              onChange={(e) => setEditStok(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={editStatus}
                              onChange={(e) =>
                                setEditStatus(e.target.value as StatusProduk)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            >
                              <option value={StatusProduk.AKTIF}>Aktif</option>
                              <option value={StatusProduk.NONAKTIF}>
                                Nonaktif
                              </option>
                              <option value={StatusProduk.STOK_HABIS}>
                                Stok Habis
                              </option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gambar
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                if (
                                  e.target.files &&
                                  e.target.files.length > 0
                                ) {
                                  const newFilesArray = Array.from(
                                    e.target.files
                                  );
                                  // Append new files to existing editGambarFile array
                                  setEditGambarFile((prev) => [
                                    ...prev,
                                    ...newFilesArray,
                                  ]);
                                  // Append new previews to existing previews
                                  setEditGambarPreview((prev) => [
                                    ...prev,
                                    ...newFilesArray.map((file) =>
                                      URL.createObjectURL(file)
                                    ),
                                  ]);
                                }
                              }}
                              className="w-full"
                            />
                            {editGambarPreview.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Gambar Baru:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {editGambarPreview.map((src, idx) => (
                                    <div key={idx} className="relative">
                                      <img
                                        src={src}
                                        alt={`Preview ${idx + 1}`}
                                        className="max-h-40 rounded-md object-contain"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditGambarFile((prev) =>
                                            prev.filter((_, i) => i !== idx)
                                          );
                                          setEditGambarPreview((prev) =>
                                            prev.filter((_, i) => i !== idx)
                                          );
                                        }}
                                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {editGambar.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Gambar Existing:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {editGambar.map((src, idx) => (
                                    <div key={idx} className="relative">
                                      <img
                                        src={resolveImageUrl(src)}
                                        alt={`Existing ${idx + 1}`}
                                        className="max-h-40 rounded-md object-contain"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditGambar((prev) =>
                                            prev.filter((_, i) => i !== idx)
                                          );
                                        }}
                                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {(editGambar.length > 0 ||
                              editGambarPreview.length > 0) && (
                              <button
                                onClick={() => {
                                  setEditGambar([]);
                                  setEditGambarFile([]);
                                  setEditGambarPreview([]);
                                }}
                                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                              >
                                Hapus Semua Gambar
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={() => handleUpdateProduk(produk.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => {
                              setEditId(null);
                              setEditKategoriId("");
                              setEditSubkategoriId("");
                              setEditBrandId("");
                              setEditNama("");
                              setEditDeskripsi("");
                              setEditHarga("");
                              setEditGambar([]);
                              setEditOriginalGambar([]);
                              setEditGambarFile([]);
                              setEditGambarPreview([]);
                              setEditStatus(StatusProduk.AKTIF);
                            }}
                            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900">
                              {produk.nama}
                            </h4>
                            <p className="text-sm text-gray-600">
                              ID: {produk.id}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-lg font-semibold text-green-600">
                              {formatCurrency(produk.harga)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Stok:{" "}
                              {produk.stok ||
                                (produk.varian
                                  ? produk.varian.reduce(
                                      (sum, v) => sum + v.stok,
                                      0
                                    )
                                  : 0)}
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                produk.status === StatusProduk.AKTIF
                                  ? "bg-green-100 text-green-800"
                                  : produk.status === StatusProduk.NONAKTIF
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {produk.status}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700">{produk.deskripsi}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Kategori:
                            </span>{" "}
                            {produk.subkategori?.kategoriOlahraga?.nama ||
                              "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Subkategori:
                            </span>{" "}
                            {produk.subkategori?.nama || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Brand:
                            </span>{" "}
                            {produk.brand?.nama || "N/A"}
                          </div>
                        </div>

                        {produk.gambar &&
                          produk.gambar.length > 0 &&
                          editGambarPreview.length === 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {produk.gambar.map((src, idx) => (
                                <img
                                  key={idx}
                                  src={resolveImageUrl(src)}
                                  alt={`Existing ${idx + 1}`}
                                  className="max-h-40 rounded-md object-contain"
                                />
                              ))}
                            </div>
                          )}

                        {/* Varian Section */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-md font-medium text-gray-900">
                              Varian Produk ({produk.varian?.length || 0} item)
                            </h5>
                            {canManage && (
                              <button
                                onClick={() => {
                                  setSelectedProdukId(produk.id);
                                  setShowAddVarian(produk.id);
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                              >
                                ➕ Tambah Varian
                              </button>
                            )}
                          </div>

                          {produk.varian && produk.varian.length > 0 ? (
                            <div className="space-y-2">
                              {produk.varian.map((varian) => (
                                <div
                                  key={varian.id}
                                  className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                                >
                                  {editVarianId === varian.id ? (
                                    <div className="space-y-3">
                                      <h6 className="text-sm font-medium text-gray-900">
                                        Edit Varian
                                      </h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Ukuran
                                          </label>
                                          <input
                                            placeholder="Masukkan ukuran"
                                            value={editVarianUkuran}
                                            onChange={(e) =>
                                              setEditVarianUkuran(
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Warna
                                          </label>
                                          <input
                                            placeholder="Masukkan warna"
                                            value={editVarianWarna}
                                            onChange={(e) =>
                                              setEditVarianWarna(e.target.value)
                                            }
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Stok *
                                          </label>
                                          <input
                                            placeholder="Masukkan stok"
                                            type="number"
                                            value={editVarianStok}
                                            onChange={(e) =>
                                              setEditVarianStok(e.target.value)
                                            }
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Harga (Rp)
                                          </label>
                                          <input
                                            placeholder="Masukkan harga"
                                            type="number"
                                            value={editVarianHarga}
                                            onChange={(e) =>
                                              setEditVarianHarga(e.target.value)
                                            }
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            SKU
                                          </label>
                                          <input
                                            placeholder="Masukkan SKU"
                                            value={editVarianSku}
                                            onChange={(e) =>
                                              setEditVarianSku(e.target.value)
                                            }
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            handleUpdateVarian(varian.id)
                                          }
                                          className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                                        >
                                          Simpan
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditVarianId(null);
                                            setEditVarianUkuran("");
                                            setEditVarianWarna("");
                                            setEditVarianStok("");
                                            setEditVarianHarga("");
                                            setEditVarianSku("");
                                          }}
                                          className="px-3 py-1 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700"
                                        >
                                          Batal
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <div className="text-sm">
                                        <span className="font-medium">
                                          {varian.ukuran &&
                                            `Ukuran: ${varian.ukuran}`}
                                          {varian.ukuran &&
                                            varian.warna &&
                                            " | "}
                                          {varian.warna &&
                                            `Warna: ${varian.warna}`}
                                          {!varian.ukuran &&
                                            !varian.warna &&
                                            "Varian Default"}
                                        </span>
                                        <div className="text-gray-600 mt-1">
                                          Stok: {varian.stok} | Harga:{" "}
                                          {varian.harga
                                            ? formatCurrency(varian.harga)
                                            : formatCurrency(produk.harga)}{" "}
                                          | SKU: {varian.sku || "N/A"}
                                        </div>
                                      </div>
                                      {canManage && (
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => {
                                              setEditVarianId(varian.id);
                                              setEditVarianUkuran(
                                                varian.ukuran || ""
                                              );
                                              setEditVarianWarna(
                                                varian.warna || ""
                                              );
                                              setEditVarianStok(
                                                varian.stok.toString()
                                              );
                                              setEditVarianHarga(
                                                varian.harga?.toString() || ""
                                              );
                                              setEditVarianSku(
                                                varian.sku || ""
                                              );
                                            }}
                                            className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                                          >
                                            ✏️ Edit
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteVarian(varian.id)
                                            }
                                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                          >
                                            🗑️ Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              Belum ada varian untuk produk ini
                            </p>
                          )}

                          {/* Add Varian Form */}
                          {showAddVarian === produk.id && (
                            <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <h6 className="text-sm font-medium text-gray-900 mb-3">
                                Tambah Varian Baru
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Ukuran
                                  </label>
                                  <input
                                    placeholder="Masukkan ukuran"
                                    value={varianUkuran}
                                    onChange={(e) =>
                                      setVarianUkuran(e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Warna
                                  </label>
                                  <input
                                    placeholder="Masukkan warna"
                                    value={varianWarna}
                                    onChange={(e) =>
                                      setVarianWarna(e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Stok *
                                  </label>
                                  <input
                                    placeholder="Masukkan stok"
                                    type="number"
                                    value={varianStok}
                                    onChange={(e) =>
                                      setVarianStok(e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Harga (Rp)
                                  </label>
                                  <input
                                    placeholder="Masukkan harga"
                                    type="number"
                                    value={varianHarga}
                                    onChange={(e) =>
                                      setVarianHarga(e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    SKU
                                  </label>
                                  <input
                                    placeholder="Masukkan SKU"
                                    value={varianSku}
                                    onChange={(e) =>
                                      setVarianSku(e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={handleCreateVarian}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                                >
                                  Tambah
                                </button>
                                <button
                                  onClick={() => {
                                    setShowAddVarian(null);
                                    setVarianUkuran("");
                                    setVarianWarna("");
                                    setVarianStok("");
                                    setVarianHarga("");
                                    setVarianSku("");
                                  }}
                                  className="px-3 py-1 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4">
                          <button
                            onClick={() => router.push(`/produk/${produk.id}`)}
                            className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            👁️ Detail
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={() => {
                                  setEditId(produk.id);
                                  setEditKategoriId(produk.kategori_id || "");
                                  setEditSubkategoriId(produk.subkategori_id);
                                  setEditBrandId(produk.brand_id);
                                  setEditNama(produk.nama);
                                  setEditDeskripsi(produk.deskripsi);
                                  setEditHarga(produk.harga.toString());
                                  setEditStok(
                                    produk.stok ? produk.stok.toString() : ""
                                  );
                                  setEditGambar(produk.gambar || []);
                                  setEditOriginalGambar(produk.gambar || []);
                                  setEditStatus(produk.status);
                                }}
                                className="px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduk(produk.id)}
                                className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
