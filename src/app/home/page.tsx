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
          router.replace("/home"); // bersihkan query
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

  // --- Styles
  const containerStyle: React.CSSProperties = {
    maxWidth: 900,
    margin: "40px auto",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#5b0675ff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
    color: "#FFFFFF" 
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    backgroundColor: "#f82fddff",
    color: "white",
    fontWeight: 500,
    marginBottom: 8,
  };

  const linkButtonStyle: React.CSSProperties = {
    marginLeft: 8,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 20,
  };

  const profileStyle: React.CSSProperties = {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f82fddff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  };

  const tokenStyle: React.CSSProperties = {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f82fddff",
    borderRadius: 8,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>Home Page</h1>

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
        <>
          <p>Berhasil login.</p>

          {profile && (
            <div style={profileStyle}>
              <p>
                <strong>User:</strong> {profile.username || profile.email}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              {profile.phone && (
                <p>
                  <strong>Phone:</strong> {profile.phone}
                </p>
              )}
              {profile?.role?.name && (
                <p>
                  <strong>Role:</strong> {profile.role.name}
                </p>
              )}
            </div>
          )}

          <div style={buttonGroupStyle}>
            <button style={buttonStyle} onClick={handleLogout}>
              Logout
            </button>
            <a href="/petugas" style={linkButtonStyle}>
              <button style={buttonStyle}>Kelola Petugas</button>
            </a>
            <a href="/kategori" style={linkButtonStyle}>
              <button style={buttonStyle}>Kelola Kategori</button>
            </a>
            <a href="/subkategori" style={linkButtonStyle}>
              <button style={buttonStyle}>Kelola Subkategori</button>
            </a>
            <a href="/brand" style={linkButtonStyle}>
              <button style={buttonStyle}>Kelola Brand</button>
            </a>
            <a href="/produk" style={linkButtonStyle}>
              <button style={buttonStyle}>Kelola Produk</button>
            </a>
            <a href="/admin" style={linkButtonStyle}>
              <button style={buttonStyle}>💳 Kelola Pembayaran COD</button>
            </a>
            <a href="/keranjang" style={linkButtonStyle}>
              <button style={buttonStyle}>Keranjang</button>
            </a>
            <a href="/pesanan/history" style={linkButtonStyle}>
              <button style={buttonStyle}>Riwayat Pesanan Saya</button>
            </a>
            <a href="/pesanan" style={linkButtonStyle}>
              <button style={buttonStyle}>Lihat Pesanan</button>
            </a>
          </div>

          {token && <pre style={tokenStyle}>Token: {token}</pre>}
        </>
      )}
    </div>
  );
}
