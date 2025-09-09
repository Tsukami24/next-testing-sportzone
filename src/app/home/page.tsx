"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProfile } from "../services/auth";
import Cart from "../components/Cart";

export default function HomePage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [token, setToken] = useState<string | null>(null);
	const [profile, setProfile] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function init() {
			try {
				const tokenFromQuery = searchParams.get("token");
				if (tokenFromQuery) {
					localStorage.setItem("token", tokenFromQuery);
					setToken(tokenFromQuery);
					// Bersihkan query agar URL rapi
					router.replace("/home");
				}

				const stored = tokenFromQuery || localStorage.getItem("token");
				if (stored) {
					setToken(stored);
					const res = await getProfile(stored);
					if (res?.user) setProfile(res.user);
					else setError("Gagal memuat profil. Pastikan token valid.");
				} else {
					setError("Token tidak ditemukan. Silakan login kembali.");
				}
			} catch (e: any) {
				setError(e?.message || "Terjadi kesalahan tak terduga");
			} finally {
				setLoading(false);
			}
		}
		init();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handleLogout() {
		localStorage.removeItem("token");
		setToken(null);
		setProfile(null);
		router.push("/login");
	}

	return (
    <div style={{ padding: 20 }}>
      <h1>Home</h1>
      {loading && <p>Memuat...</p>}
      {!loading && error && (
        <div>
          <p style={{ color: "red" }}>{error}</p>
          <p>
            <a href="/login">Ke halaman login</a>
          </p>
        </div>
      )}
      {!loading && !error && (
        <div>
          <p>Berhasil login.</p>
          {profile ? (
            <div>
              <p>
                <strong>User:</strong> {profile.username || profile.email}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              {profile?.role?.name && (
                <p>
                  <strong>Role:</strong> {profile.role.name}
                </p>
              )}
            </div>
          ) : (
            <p>Mengambil profil...</p>
          )}
          <div style={{ marginTop: 16 }}>
            <button onClick={handleLogout}>Logout</button>
            <a href="/petugas" style={{ marginLeft: 8 }}>
              <button>Kelola Petugas</button>
            </a>
            <a href="/kategori" style={{ marginLeft: 8 }}>
              <button>Kelola Kategori</button>
            </a>
            <a href="/subkategori" style={{ marginLeft: 8 }}>
              <button>Kelola Subkategori</button>
            </a>
            <a href="/brand" style={{ marginLeft: 8 }}>
              <button>Kelola Brand</button>
            </a>
            <a href="/produk" style={{ marginLeft: 8 }}>
              <button>Kelola Produk</button>
            </a>
            <a href="/keranjang" style={{ marginLeft: 8 }}>
              <button>Keranjang</button>
            </a>
            <a href="/pesanan/history" style={{ marginLeft: 8 }}>
              <button>Riwayat Pesanan Saya</button>
            </a>
            <a href="/pesanan" style={{ marginLeft: 8 }}>
              <button>Lihat Pesanan</button>
            </a>
            <div style={{ marginLeft: 8, display: 'inline-block' }}>
              <Cart />
            </div>
          </div>
          {token && (
            <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
              Token: {token}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
