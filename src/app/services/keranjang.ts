import { API_URL } from "./auth";

export interface KeranjangItemRecord {
  id: string;
  keranjang_id: string;
  produk_id: string | null;
  produk_varian_id: string | null;
  kuantitas: number;
  created_at: string;
  updated_at: string;
  produk?: {
    id: string;
    nama: string;
    harga: number;
    gambar?: string;
  } | null;
}

export interface KeranjangRecord {
  id: string;
  user_id: string;
  items: KeranjangItemRecord[];
  created_at: string;
  updated_at: string;
}

export interface AddItemDto {
  produk_id: string;
  produk_varian_id?: string;
  kuantitas: number;
}

export interface UpdateItemDto {
  kuantitas: number;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
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

export async function getKeranjang(token: string): Promise<KeranjangRecord> {
  const res = await fetch(`${API_URL}/keranjang`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function addKeranjangItem(token: string, dto: AddItemDto): Promise<KeranjangRecord> {
  const res = await fetch(`${API_URL}/keranjang/items`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function updateKeranjangItem(token: string, itemId: string, dto: UpdateItemDto): Promise<KeranjangRecord> {
  const res = await fetch(`${API_URL}/keranjang/items/${itemId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function removeKeranjangItem(token: string, itemId: string): Promise<KeranjangRecord> {
  const res = await fetch(`${API_URL}/keranjang/items/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function clearKeranjang(token: string): Promise<KeranjangRecord> {
  const res = await fetch(`${API_URL}/keranjang/clear`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}








