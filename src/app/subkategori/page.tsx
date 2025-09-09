"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listKategori, KategoriRecord } from "../services/kategori";
import {
	listSubkategori,
	listSubkategoriByKategori,
	createSubkategori,
	updateSubkategori,
	deleteSubkategori,
	SubkategoriRecord,
} from "../services/subkategori";

export default function SubkategoriPage() {
	const router = useRouter();
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [kategoris, setKategoris] = useState<KategoriRecord[]>([]);
	const [selectedKategoriId, setSelectedKategoriId] = useState<string>("");

	const [items, setItems] = useState<SubkategoriRecord[]>([]);

	// create form
	const [nama, setNama] = useState("");
	const [deskripsi, setDeskripsi] = useState("");

	// edit form
	const [editId, setEditId] = useState<string | null>(null);
	const [editNama, setEditNama] = useState("");
	const [editDeskripsi, setEditDeskripsi] = useState("");
	const [editKategoriId, setEditKategoriId] = useState("");

	useEffect(() => {
		const stored = localStorage.getItem("token");
		if (!stored) {
			setError("Token tidak ditemukan. Login sebagai admin/petugas dulu.");
			setLoading(false);
			return;
		}
		setToken(stored);
		Promise.all([listKategori(stored)])
			.then(([ks]) => {
				setKategoris(Array.isArray(ks) ? ks : []);
				setSelectedKategoriId((ks[0] as any)?.id || "");
			})
			.catch((e) => setError(e?.message || "Gagal memuat kategori"))
			.finally(() => setLoading(false));
	}, []);

	const currentKategori = useMemo(() => kategoris.find((k) => (k as any).id === selectedKategoriId), [kategoris, selectedKategoriId]);

	useEffect(() => {
		if (!token) return;
		if (!selectedKategoriId) return;
		listSubkategoriByKategori(token, selectedKategoriId)
			.then(setItems)
			.catch((e) => setError(e?.message || "Gagal memuat subkategori"));
	}, [token, selectedKategoriId]);

	async function refreshAll() {
		if (!token) return;
		await listSubkategoriByKategori(token, selectedKategoriId).then(setItems);
	}

	async function handleCreate() {
		if (!token) return alert("Belum login");
		if (!selectedKategoriId) return alert("Pilih kategori terlebih dahulu");
		try {
			await createSubkategori(token, { nama, deskripsi, kategori_olahraga_id: selectedKategoriId });
			setNama("");
			setDeskripsi("");
			await refreshAll();
		} catch (e: any) {
			alert(e?.message || "Gagal membuat subkategori (butuh role admin)");
		}
	}

	async function handleSave(id: string) {
		if (!token) return alert("Belum login");
		try {
			await updateSubkategori(token, id, {
				nama: editNama,
				deskripsi: editDeskripsi,
				kategori_olahraga_id: editKategoriId || selectedKategoriId,
			});
			setEditId(null);
			setEditNama("");
			setEditDeskripsi("");
			setEditKategoriId("");
			await refreshAll();
		} catch (e: any) {
			alert(e?.message || "Gagal update subkategori (butuh role admin/petugas)");
		}
	}

	async function handleDelete(id: string) {
		if (!token) return alert("Belum login");
		if (!confirm("Hapus subkategori ini?")) return;
		try {
			await deleteSubkategori(token, id);
			await refreshAll();
		} catch (e: any) {
			alert(e?.message || "Gagal delete subkategori (butuh role admin)");
		}
	}

	return (
		<div style={{ padding: 20 }}>
			<h1>CRUD Subkategori Peralatan</h1>
			<p>
				<a href="/home">Kembali ke Home</a>
			</p>
			{loading && <p>Memuat...</p>}
			{!loading && error && <p style={{ color: "red" }}>{error}</p>}
			{!loading && !error && (
				<div>
					<div style={{ marginBottom: 16 }}>
						<label>Pilih Kategori:&nbsp;</label>
						<select value={selectedKategoriId} onChange={(e) => setSelectedKategoriId(e.target.value)}>
							{(kategoris || []).map((k) => (
								<option key={(k as any).id} value={(k as any).id}>
									{(k as any).nama || (k as any).id}
								</option>
							))}
						</select>
					</div>

					<h2>Tambah Subkategori</h2>
					<div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
						<input placeholder="Nama" value={nama} onChange={(e) => setNama(e.target.value)} />
						<input placeholder="Deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
						<button onClick={handleCreate}>Create</button>
					</div>

					<h2>Daftar Subkategori</h2>
					{items.length === 0 && <p>Tidak ada data</p>}
					<ul style={{ paddingLeft: 16 }}>
						{items.map((s) => (
							<li key={(s as any).id} style={{ marginBottom: 12, borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
								<div>
									<strong>{(s as any).nama}</strong>
									<div style={{ color: "#666" }}>{(s as any).deskripsi}</div>
									<small>Kategori: {(s as any).kategori_olahraga_id}</small>
								</div>
								{editId === (s as any).id ? (
									<div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
										<input placeholder="Nama" value={editNama} onChange={(e) => setEditNama(e.target.value)} />
										<input placeholder="Deskripsi" value={editDeskripsi} onChange={(e) => setEditDeskripsi(e.target.value)} />
										<select value={editKategoriId || selectedKategoriId} onChange={(e) => setEditKategoriId(e.target.value)}>
											{(kategoris || []).map((k) => (
												<option key={(k as any).id} value={(k as any).id}>
													{(k as any).nama || (k as any).id}
												</option>
											))}
										</select>
										<button onClick={() => handleSave((s as any).id)}>Simpan</button>
										<button onClick={() => { setEditId(null); setEditNama(""); setEditDeskripsi(""); setEditKategoriId(""); }}>Batal</button>
									</div>
								) : (
									<div style={{ display: "flex", gap: 8, marginTop: 4 }}>
										<button onClick={() => { setEditId((s as any).id); setEditNama((s as any).nama || ""); setEditDeskripsi((s as any).deskripsi || ""); setEditKategoriId((s as any).kategori_olahraga_id || ""); }}>Edit</button>
										<button onClick={() => handleDelete((s as any).id)}>Delete</button>
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
























