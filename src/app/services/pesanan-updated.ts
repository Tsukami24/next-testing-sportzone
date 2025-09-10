import { API_URL } from "./auth";

// Status pesanan enum
export enum StatusPesanan {
  PENDING = "pending",
  DIPROSES = "diproses",
  DIKIRIM = "dikirim",
  SELESAI = "selesai",
  DIBATALKAN = "dibatalkan"
}

// Interface for Pesanan entity
export interface PesananRecord {
  id: string;
  user_id: string;
  tanggal_pesanan: string;
  total_harga: number;
  status: StatusPesanan;
  alamat_pengiriman: string;
  created_at: string;
  updated_at: string;
  pesanan_items?: PesananItemRecord[];
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// Interface for PesananItem entity
export interface PesananItemRecord {
  id: string;
  pesanan_id: string;
  id_produk: string;
  produk_varian_id?: string;
  kuantitas: number;
  harga_satuan: number;
  produk?: {
    id: string;
    nama: string;
    gambar?: string;
  };
  produk_varian?: {
    id: string;
    ukuran?: string;
    warna?: string;
  };
}

// DTOs for creating and updating
export interface CreatePesananDto {
  tanggal_pesanan: string;
  total_harga: number;
  alamat_pengiriman: string;
  metode_pembayaran: string;
  items: CreatePesananItemDto[];
}

export interface CreatePesananItemDto {
  id_produk: string;
  produk_varian_id?: string;
  kuantitas: number;
  harga_satuan: number;
}

export interface UpdatePesananDto {
  status?: StatusPesanan;
  alamat_pengiriman?: string;
}

export interface UpdatePesananItemDto {
  kuantitas?: number;
  harga_satuan?: number;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  } as Record<string, string>;
}

async function getErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message || data?.error || `HTTP ${res.status}`;
  } catch {
    try {
      const text = await res.text();
      return text || `HTTP ${res.status}`;
    } catch {
      return `HTTP ${res.status}`;
    }
  }
}

// Pesanan functions
export async function createPesanan(token: string, data: CreatePesananDto): Promise<PesananRecord> {
  const res = await fetch(`${API_URL}/pesanan`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function getAllPesanan(token: string): Promise<PesananRecord[]> {
  const res = await fetch(`${API_URL}/pesanan`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function getPesananHistory(token: string): Promise<PesananRecord[]> {
  const res = await fetch(`${API_URL}/pesanan/history`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function getPesananById(token: string, id: string): Promise<PesananRecord> {
  const res = await fetch(`${API_URL}/pesanan/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function updatePesanan(token: string, id: string, data: UpdatePesananDto): Promise<PesananRecord> {
  const res = await fetch(`${API_URL}/pesanan/${id}/status`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ status: data.status }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function cancelPesanan(token: string, id: string): Promise<PesananRecord> {
  const res = await fetch(`${API_URL}/pesanan/${id}/cancel`, {
    method: "PUT",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function deletePesanan(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/pesanan/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
}

// Pesanan Item functions
export async function createPesananItem(token: string, data: CreatePesananItemDto): Promise<PesananItemRecord> {
  const res = await fetch(`${API_URL}/pesanan/item`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function getAllPesananItems(token: string): Promise<PesananItemRecord[]> {
  const res = await fetch(`${API_URL}/pesanan/item`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function getPesananItemById(token: string, id: string): Promise<PesananItemRecord> {
  const res = await fetch(`${API_URL}/pesanan/item/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function updatePesananItem(token: string, id: string, data: UpdatePesananItemDto): Promise<PesananItemRecord> {
  const res = await fetch(`${API_URL}/pesanan/item/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function deletePesananItem(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/pesanan/item/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
}
