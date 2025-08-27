"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	listPetugas,
	createPetugas,
	updatePetugas,
	deletePetugas,
	PetugasRecord,
} from "../services/petugas";

export default function PetugasPage() {
	const router = useRouter();
	const [token, setToken] = useState<string | null>(null);
	const [items, setItems] = useState<PetugasRecord[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// form state
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState(""); // jika backend butuh saat create

	// edit state per item
	const [editId, setEditId] = useState<string | null>(null);
	const [editUsername, setEditUsername] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [editPassword, setEditPassword] = useState("");

	useEffect(() => {
		const stored = localStorage.getItem("token");
		if (!stored) {
			setError("Token tidak ditemukan. Login sebagai admin dulu.");
			setLoading(false);
			return;
		}
		setToken(stored);
		refresh(stored).finally(() => setLoading(false));
	}, []);

	async function refresh(currentToken: string) {
		try {
			const data = await listPetugas(currentToken);
			setItems(Array.isArray(data) ? data : []);
			setError(null);
		} catch (e: any) {
			setError(e?.message || "Gagal memuat data petugas");
		}
	}

	async function handleCreate() {
		if (!token) return alert("Belum login");
		try {
			await createPetugas(token, { username, email, password });
			setUsername("");
			setEmail("");
			setPassword("");
			await refresh(token);
		} catch (e: any) {
			alert(e?.message || "Gagal membuat petugas (butuh role admin)");
		}
	}

	async function handleUpdate(id: string) {
		if (!token) return alert("Belum login");
		try {
			await updatePetugas(token, id, {
				username: editUsername || undefined,
				email: editEmail || undefined,
				password: editPassword || undefined,
			});
			setEditId(null);
			setEditUsername("");
			setEditEmail("");
			setEditPassword("");
			await refresh(token);
		} catch (e: any) {
			alert(e?.message || "Gagal update petugas (butuh role admin)");
		}
	}

	async function handleDelete(id: string) {
		if (!token) return alert("Belum login");
		if (!confirm("Hapus petugas ini?")) return;
		try {
			await deletePetugas(token, id);
			await refresh(token);
		} catch (e: any) {
			alert(e?.message || "Gagal delete petugas (butuh role admin)");
		}
	}

	return (
		<div style={{ padding: 20 }}>
			<h1>CRUD Petugas (butuh role: admin)</h1>
			<p>
				<a href="/home">Kembali ke Home</a>
			</p>
			{loading && <p>Memuat...</p>}
			{!loading && error && <p style={{ color: "red" }}>{error}</p>}
			{!loading && !error && (
				<div>
					<h2>Tambah Petugas</h2>
					<div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
						<input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
						<input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
						<input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
						<button onClick={handleCreate}>Create</button>
					</div>

					<h2>Daftar Petugas</h2>
					{items.length === 0 && <p>Tidak ada data</p>}
					<ul style={{ paddingLeft: 16 }}>
						{items.map((p) => (
							<li key={p.id} style={{ marginBottom: 12, borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
								<div>
									<strong>{p.username || p.email || p.id}</strong>
								</div>
								{editId === p.id ? (
									<div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
										<input
											placeholder="Username"
											value={editUsername}
											onChange={(e) => setEditUsername(e.target.value)}
										/>
										<input
											placeholder="Email"
											value={editEmail}
											onChange={(e) => setEditEmail(e.target.value)}
										/>
										<input
											type="password"
											placeholder="Password"
											value={editPassword}
											onChange={(e) => setEditPassword(e.target.value)}
										/>
										<button onClick={() => handleUpdate(p.id)}>Simpan</button>
										<button onClick={() => { setEditId(null); setEditUsername(""); setEditEmail(""); setEditPassword(""); }}>Batal</button>
									</div>
								) : (
									<div style={{ display: "flex", gap: 8, marginTop: 4 }}>
										<button onClick={() => { setEditId(p.id); setEditUsername(p.username || ""); setEditEmail(p.email || ""); setEditPassword(""); }}>Edit</button>
										<button onClick={() => handleDelete(p.id)}>Delete</button>
									</div>
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}


