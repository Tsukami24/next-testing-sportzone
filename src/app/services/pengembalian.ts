import { API_URL } from "./auth";

export enum StatusPengembalian {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum AlasanPengembalian {
  RUSAK = "rusak",
  SALAH_VARIAN = "salah varian",
  TIDAK_SESUAI = "tidak sesuai",
  LAINNYA = "lainnya",
}

export interface PengembalianRecord {
  id: string;
  pesanan_id: string;
  user_id: string;
  alasan: AlasanPengembalian;
  keterangan: string | null;
  bukti_foto: string;
  status: StatusPengembalian;
  catatan_admin: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  pesanan?: {
    id: string;
    tanggal_pesanan: string;
    total_harga: number;
    status: string;
    pesanan_items?: Array<{
      id: string;
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
    }>;
  };
  user?: {
    id: string;
    username: string;
    email: string;
  };
  admin?: {
    id: string;
    username: string;
  };
}

export interface CreatePengembalianDto {
  pesanan_id: string;
  alasan: AlasanPengembalian;
  keterangan?: string;
}

export interface ProdukRusakRecord {
  id: string;
  pengembalian_id: string;
  produk_id: string;
  produk_varian_id: string | null;
  jumlah: number;
  deskripsi_kerusakan: string | null;
  created_at: string;
  pengembalian?: PengembalianRecord;
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

export async function createPengembalian(
  token: string,
  data: CreatePengembalianDto,
  buktiFotoFile: File
): Promise<PengembalianRecord> {
  const formData = new FormData();
  formData.append("bukti_foto", buktiFotoFile);
  formData.append("pesanan_id", data.pesanan_id);
  formData.append("alasan", data.alasan);
  if (data.keterangan) {
    formData.append("keterangan", data.keterangan);
  }

  const res = await fetch(`${API_URL}/pengembalian`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // NOTE: don't set Content-Type; browser will set multipart boundary
    } as any,
    body: formData,
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function getAllPengembalian(
  token: string
): Promise<PengembalianRecord[]> {
  const res = await fetch(`${API_URL}/pengembalian`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function getPengembalianByUser(
  token: string
): Promise<PengembalianRecord[]> {
  const res = await fetch(`${API_URL}/pengembalian/user`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function getPengembalianById(
  token: string,
  id: string
): Promise<PengembalianRecord> {
  const res = await fetch(`${API_URL}/pengembalian/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function approvePengembalian(
  token: string,
  id: string,
  catatan_admin?: string
): Promise<PengembalianRecord> {
  const res = await fetch(`${API_URL}/pengembalian/${id}/approve`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ catatan_admin }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function rejectPengembalian(
  token: string,
  id: string,
  catatan_admin?: string
): Promise<PengembalianRecord> {
  const res = await fetch(`${API_URL}/pengembalian/${id}/reject`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ catatan_admin }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function deletePengembalian(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(`${API_URL}/pengembalian/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
}

export async function getAllProdukRusak(
  token: string
): Promise<ProdukRusakRecord[]> {
  const res = await fetch(`${API_URL}/pengembalian/produk-rusak/all`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function getProdukRusakByPengembalian(
  token: string,
  pengembalianId: string
): Promise<ProdukRusakRecord[]> {
  const res = await fetch(
    `${API_URL}/pengembalian/produk-rusak/${pengembalianId}`,
    {
      headers: authHeaders(token),
    }
  );
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}
