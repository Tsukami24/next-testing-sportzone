import { API_URL } from "./auth";

export interface KategoriRecord {
	id: string;
	nama?: string;
	deskripsi?: string | null;
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

export async function listKategori(token: string): Promise<KategoriRecord[]> {
	const res = await fetch(`${API_URL}/kategori-olahraga`, { headers: authHeaders(token) });
	if (!res.ok) throw formatError("List kategori gagal", res, await res.json().catch(() => undefined));
	return res.json();
}

export async function createKategori(
	token: string,
	data: { nama: string; deskripsi?: string }
) {
	const res = await fetch(`${API_URL}/kategori-olahraga`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify(data),
	});
	if (!res.ok) throw formatError("Create kategori gagal", res, await res.json().catch(() => undefined));
	return res.json();
}

export async function updateKategori(
	token: string,
	id: string,
	data: Partial<Pick<KategoriRecord, "nama" | "deskripsi">>
) {
	const res = await fetch(`${API_URL}/kategori-olahraga/${id}`, {
		method: "PATCH",
		headers: authHeaders(token),
		body: JSON.stringify(data),
	});
	if (!res.ok) throw formatError("Update kategori gagal", res, await res.json().catch(() => undefined));
	return res.json();
}

export async function deleteKategori(token: string, id: string) {
	const res = await fetch(`${API_URL}/kategori-olahraga/${id}`, {
		method: "DELETE",
		headers: authHeaders(token),
	});
	if (!res.ok) throw formatError("Delete kategori gagal", res, await res.json().catch(() => undefined));
	return res.text().catch(() => ({}));
}

