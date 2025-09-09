"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getKeranjang,
  addKeranjangItem,
  updateKeranjangItem,
  removeKeranjangItem,
  clearKeranjang,
  KeranjangRecord,
} from "../services/keranjang";
import { getProdukById, ProdukRecord } from "../services/produk";

export default function KeranjangPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<KeranjangRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [produkMap, setProdukMap] = useState<Record<string, ProdukRecord>>({});

  useEffect(() => {
    async function init() {
      try {
        const stored = localStorage.getItem("token");
        if (!stored) {
          setError("Token tidak ditemukan. Login dulu.");
          setLoading(false);
          return;
        }
        setToken(stored);
        const data = await getKeranjang(stored);
        setCart(data);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat keranjang");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Hydrate produk info for items that miss product details from backend
  useEffect(() => {
    async function hydrateProduk() {
      if (!token || !cart) return;
      const missingIds = Array.from(
        new Set(
          cart.items
            .map((it) => it.produk?.id || it.produk_id)
            .filter((id): id is string => !!id)
        )
      ).filter((id) => !produkMap[id]);

      if (missingIds.length === 0) return;
      try {
        const results = await Promise.all(
          missingIds.map((id) => getProdukById(token, id))
        );
        const nextMap: Record<string, ProdukRecord> = { ...produkMap };
        results.forEach((p) => {
          nextMap[p.id] = p;
        });
        setProdukMap(nextMap);
      } catch (e) {
        // ignore hydration errors; UI will fallback to 0
      }
    }
    hydrateProduk();
  }, [token, cart]);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }

  function getItemPrice(it: KeranjangRecord["items"][number]): number {
    if (it.produk?.harga) return it.produk.harga;
    const pid = it.produk?.id || it.produk_id;
    if (pid && produkMap[pid]) return produkMap[pid].harga;
    return 0;
  }

  const handleQtyChange = async (itemId: string, qty: number) => {
    if (!token || !cart) return;
    if (qty <= 0) return handleRemove(itemId);
    try {
      const updated = await updateKeranjangItem(token, itemId, { kuantitas: qty });
      setCart(updated);
    } catch (e: any) {
      alert(e?.message || "Gagal update item");
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!token || !cart) return;
    try {
      const updated = await removeKeranjangItem(token, itemId);
      setCart(updated);
    } catch (e: any) {
      alert(e?.message || "Gagal hapus item");
    }
  };

  const handleClear = async () => {
    if (!token || !cart) return;
    try {
      const updated = await clearKeranjang(token);
      setCart(updated);
    } catch (e: any) {
      alert(e?.message || "Gagal kosongkan keranjang");
    }
  };

  const subtotal = (cart?.items || []).reduce((sum, it) => {
    const harga = getItemPrice(it);
    return sum + harga * it.kuantitas;
  }, 0);

  const toggleSelect = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      return next;
    });
  };

  const toCheckoutWithItems = (itemIds: string[]) => {
    if (!cart) return;
    const picked = cart.items.filter((it) => itemIds.includes(it.id));
    if (picked.length === 0) return;
    const items = picked.map((it) => ({
      produk: {
        id: it.produk?.id || it.produk_id || "",
        nama: it.produk?.nama || produkMap[it.produk_id || ""]?.nama || "Produk",
        harga: getItemPrice(it),
        gambar: it.produk?.gambar || produkMap[it.produk_id || ""]?.gambar,
      },
      varian: it.produk_varian_id ? { id: it.produk_varian_id } : undefined,
      quantity: it.kuantitas,
    }));
    const total = items.reduce((sum, i) => sum + i.produk.harga * i.quantity, 0);
    try {
      localStorage.setItem('checkoutDraft', JSON.stringify({ items, total }));
    } catch {}
    router.push('/checkout');
  };

  if (loading) return <div style={{ padding: 20 }}>Memuat keranjang...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;
  if (!cart) return <div style={{ padding: 20 }}>Keranjang tidak ditemukan.</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <a href="/produk" style={{ textDecoration: "none", color: "#3498db", fontWeight: "bold" }}>
          ← Lanjut Belanja
        </a>
      </div>

      <h1 style={{ margin: 0, marginBottom: 20 }}>Keranjang Belanja</h1>

      {cart.items.length === 0 ? (
        <div>
          <p>Keranjang kosong.</p>
          <a href="/produk">Cari produk</a>
        </div>
      ) : (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #eee" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>Item ({cart.items.length})</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setSelectedIds(new Set(cart.items.map(i => i.id)))}>Pilih Semua</button>
              <button onClick={() => setSelectedIds(new Set())}>Kosongkan Pilihan</button>
            </div>
          </div>
          {cart.items.map((it) => (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
              <input type="checkbox" checked={selectedIds.has(it.id)} onChange={() => toggleSelect(it.id)} />
              {it.produk?.gambar && (
                <img src={it.produk.gambar} alt={it.produk.nama} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {it.produk?.nama || produkMap[it.produk?.id || it.produk_id || ""]?.nama || "Produk"}
                </div>
                <div style={{ color: "#666", fontSize: 14 }}>
                  {formatCurrency(getItemPrice(it))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => handleQtyChange(it.id, it.kuantitas - 1)}>-</button>
                <div>{it.kuantitas}</div>
                <button onClick={() => handleQtyChange(it.id, it.kuantitas + 1)}>+</button>
              </div>
              <button onClick={() => handleRemove(it.id)} style={{ color: "#e74c3c" }}>Hapus</button>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button onClick={handleClear}>Kosongkan</button>
            <div style={{ fontWeight: 700 }}>Subtotal: {formatCurrency(subtotal)}</div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={() => toCheckoutWithItems(cart.items.map(i => i.id))}
              style={{ background: "#27ae60", color: "#fff", padding: "10px 16px", borderRadius: 6 }}
            >
              Checkout Semua
            </button>
            <button
              onClick={() => toCheckoutWithItems(Array.from(selectedIds))}
              disabled={selectedIds.size === 0}
              style={{ background: selectedIds.size ? "#f39c12" : "#bdc3c7", color: "#fff", padding: "10px 16px", borderRadius: 6 }}
            >
              Checkout Terpilih
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
