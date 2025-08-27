import { API_URL } from "./auth";
import { SubkategoriRecord } from "./subkategori";
import { BrandRecord } from "./brand";

// Status produk enum
export enum StatusProduk {
  AKTIF = "aktif",
  NONAKTIF = "nonaktif",
  STOK_HABIS = "stok habis"
}

// Interface for Produk entity
export interface ProdukRecord {
  id: string;
  kategori_id?: string;
  subkategori_id: string;
  brand_id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  gambar?: string;
  status: StatusProduk;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  subkategori?: SubkategoriRecord;
  brand?: BrandRecord;
  varian?: ProdukVarianRecord[];
}

// Interface for ProdukVarian entity
export interface ProdukVarianRecord {
  id: string;
  produk_id: string;
  ukuran?: string;
  warna?: string;
  stok: number;
  harga?: number;
  sku?: string;
  created_at: string;
  updated_at: string;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// Produk functions
export async function listProduk(token: string): Promise<ProdukRecord[]> {
  const res = await fetch(`${API_URL}/produk`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`List produk gagal: ${res.status}`);
  return res.json();
}

export async function getProdukById(token: string, id: string): Promise<ProdukRecord> {
  const res = await fetch(`${API_URL}/produk/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Get produk gagal: ${res.status}`);
  return res.json();
}

export async function getProdukBySubkategori(token: string, subkategoriId: string): Promise<ProdukRecord[]> {
  const res = await fetch(`${API_URL}/produk/subkategori/${subkategoriId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Get produk by subkategori gagal: ${res.status}`);
  return res.json();
}

export async function getProdukByBrand(token: string, brandId: string): Promise<ProdukRecord[]> {
  const res = await fetch(`${API_URL}/produk/brand/${brandId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Get produk by brand gagal: ${res.status}`);
  return res.json();
}

export async function createProduk(
  token: string,
  data: {
    kategori_id?: string;
    subkategori_id: string;
    brand_id: string;
    nama: string;
    deskripsi: string;
    harga: number;
    gambar?: string;
    status?: StatusProduk;
  }
): Promise<ProdukRecord> {
  const res = await fetch(`${API_URL}/produk`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create produk gagal: ${res.status}`);
  return res.json();
}

export async function updateProduk(
  token: string,
  id: string,
  data: Partial<{
    kategori_id: string;
    subkategori_id: string;
    brand_id: string;
    nama: string;
    deskripsi: string;
    harga: number;
    gambar: string;
    status: StatusProduk;
  }>
): Promise<ProdukRecord> {
  const res = await fetch(`${API_URL}/produk/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Update produk gagal: ${res.status}`);
  return res.json();
}

export async function deleteProduk(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/produk/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Delete produk gagal: ${res.status}`);
}

// Produk Varian functions
export async function listProdukVarian(token: string, produkId: string): Promise<ProdukVarianRecord[]> {
  const res = await fetch(`${API_URL}/produk/${produkId}/varian`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`List produk varian gagal: ${res.status}`);
  return res.json();
}

export async function getProdukVarianById(token: string, varianId: string): Promise<ProdukVarianRecord> {
  const res = await fetch(`${API_URL}/produk/varian/${varianId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Get produk varian gagal: ${res.status}`);
  return res.json();
}

export async function createProdukVarian(
  token: string,
  data: {
    produk_id: string;
    ukuran?: string;
    warna?: string;
    stok: number;
    harga?: number;
    sku?: string;
  }
): Promise<ProdukVarianRecord> {
  const res = await fetch(`${API_URL}/produk/${data.produk_id}/varian`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create produk varian gagal: ${res.status}`);
  return res.json();
}

export async function updateProdukVarian(
  token: string,
  varianId: string,
  data: Partial<{
    ukuran: string;
    warna: string;
    stok: number;
    harga: number;
    sku: string;
  }>
): Promise<ProdukVarianRecord> {
  const res = await fetch(`${API_URL}/produk/varian/${varianId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Update produk varian gagal: ${res.status}`);
  return res.json();
}

export async function deleteProdukVarian(token: string, varianId: string): Promise<void> {
  const res = await fetch(`${API_URL}/produk/varian/${varianId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Delete produk varian gagal: ${res.status}`);
}