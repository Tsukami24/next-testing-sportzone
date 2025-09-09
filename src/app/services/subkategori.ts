import { API_URL } from "./auth";

export interface SubkategoriRecord {
	id: string;
	nama?: string;
	deskripsi?: string | null;
	kategori_olahraga_id: string;
	created_at?: string | Date;
	updated_at?: string | Date;
}

function authHeaders(token: string) {
	return {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	};
}

function formatError(prefix: string, res: Response, body?: any) {
	let msg = `${prefix}: ${res.status}`;
	const m = (body && (body.message || body.error)) as any;
	if (m) msg += ` - ${Array.isArray(m) ? m.join(", ") : m}`;
	return new Error(msg);
}

export async function listSubkategori(token: string): Promise<SubkategoriRecord[]> {
	const res = await fetch(`${API_URL}/subkategori-peralatan`, { headers: authHeaders(token) });
	if (!res.ok) throw formatError("List subkategori gagal", res, await res.json().catch(() => undefined));
	return res.json();
}

export async function listSubkategoriByKategori(token: string, kategoriId: string): Promise<SubkategoriRecord[]> {
	const res = await fetch(`${API_URL}/subkategori-peralatan/kategori/${kategoriId}`, { headers: authHeaders(token) });
	if (!res.ok) throw formatError("List subkategori by kategori gagal", res, await res.json().catch(() => undefined));
	return res.json();
}

export async function createSubkategori(
	token: string,
	data: { nama: string; deskripsi?: string; kategori_olahraga_id: string }
) {
	const res = await fetch(`${API_URL}/subkategori-peralatan`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify(data),
	});
	if (!res.ok) throw formatError("Create subkategori gagal", res, await res.json().catch(() => undefined));
	return res.json();
}

export async function updateSubkategori(
	token: string,
	id: string,
	data: Partial<Pick<SubkategoriRecord, "nama" | "deskripsi" | "kategori_olahraga_id">>
) {
	const res = await fetch(`${API_URL}/subkategori-peralatan/${id}`, {
		method: "PATCH",
		headers: authHeaders(token),
		body: JSON.stringify(data),
	});
	if (!res.ok) throw formatError("Update subkategori gagal", res, await res.json().catch(() => undefined));
	return res.json();
}

export async function deleteSubkategori(token: string, id: string) {
	const res = await fetch(`${API_URL}/subkategori-peralatan/${id}`, {
		method: "DELETE",
		headers: authHeaders(token),
	});
	if (!res.ok) throw formatError("Delete subkategori gagal", res, await res.json().catch(() => undefined));
	return res.text().catch(() => ({}));
}
























