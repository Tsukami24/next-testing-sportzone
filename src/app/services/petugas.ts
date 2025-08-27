import { API_URL } from "./auth";

export interface PetugasRecord {
	id: string;
	username?: string;
	email?: string;
	// Tambahkan field lain sesuai backend jika perlu
}

function authHeaders(token: string) {
	return {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	};
}

export async function listPetugas(token: string): Promise<PetugasRecord[]> {
	const res = await fetch(`${API_URL}/petugas`, {
		headers: authHeaders(token),
	});
	if (!res.ok) throw new Error(`List petugas gagal: ${res.status}`);
	return res.json();
}

export async function createPetugas(
	token: string,
	data: Partial<PetugasRecord> & { username?: string; email?: string; password?: string }
) {
	const res = await fetch(`${API_URL}/petugas`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error(`Create petugas gagal: ${res.status}`);
	return res.json();
}

export async function updatePetugas(
	token: string,
	id: string,
	data: Partial<PetugasRecord> & { email?: string; password?: string }
) {
	const res = await fetch(`${API_URL}/petugas/${id}`, {
		method: "PATCH",
		headers: authHeaders(token),
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error(`Update petugas gagal: ${res.status}`);
	return res.json();
}

export async function deletePetugas(token: string, id: string) {
	const res = await fetch(`${API_URL}/petugas/${id}`, {
		method: "DELETE",
		headers: authHeaders(token),
	});
	if (!res.ok) throw new Error(`Delete petugas gagal: ${res.status}`);
	return res.json();
}


