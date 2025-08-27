import { API_URL } from "./auth";

export interface BrandRecord {
  id: string;
  nama: string;
  deskripsi?: string | null;
  logo?: string | null;
  created_at?: string;
  updated_at?: string;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function listBrand(token: string): Promise<BrandRecord[]> {
  const res = await fetch(`${API_URL}/brand`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`List brand gagal: ${res.status}`);
  return res.json();
}

export async function getBrandById(token: string, id: string): Promise<BrandRecord> {
  const res = await fetch(`${API_URL}/brand/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Get brand gagal: ${res.status}`);
  return res.json();
}

export async function createBrand(
  token: string,
  data: {
    nama: string;
    deskripsi?: string;
    logo?: string;
  }
): Promise<BrandRecord> {
  const res = await fetch(`${API_URL}/brand`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create brand gagal: ${res.status}`);
  return res.json();
}

export async function updateBrand(
  token: string,
  id: string,
  data: Partial<{
    nama: string;
    deskripsi: string;
    logo: string;
  }>
): Promise<BrandRecord> {
  const res = await fetch(`${API_URL}/brand/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Update brand gagal: ${res.status}`);
  return res.json();
}

export async function deleteBrand(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/brand/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Delete brand gagal: ${res.status}`);
}