import { API_URL } from "./auth";

export async function uploadImage(token: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_URL}/produk/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // NOTE: don't set Content-Type; browser will set multipart boundary
    } as any,
    body: form,
  });

  if (!res.ok) {
    let msg = `Upload gagal: ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  // Expecting { url: 'http(s)://...' or '/uploads/...'}
  if (!data?.url) throw new Error('Upload gagal: respons tidak berisi url');
  const url: string = data.url;
  if (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))) {
    throw new Error('Upload berhasil tapi URL tidak valid');
  }
  return url;
}








