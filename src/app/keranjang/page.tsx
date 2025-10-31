"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getKeranjang,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [produkMap, setProdukMap] = useState<Record<string, ProdukRecord>>({});

  useEffect(() => {
    async function init() {
      try {
        const stored = localStorage.getItem("token");
        if (!stored) {
          setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
          setLoading(false);
          return;
        }
        setToken(stored);
        const data = await getKeranjang(stored);
        setCart(data);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat keranjang.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

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
        results.forEach((p) => (nextMap[p.id] = p));
        setProdukMap(nextMap);
      } catch {}
    }
    hydrateProduk();
  }, [token, cart]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);

  const getItemPrice = (it: KeranjangRecord["items"][number]) => {
    if (it.produk?.harga) return it.produk.harga;
    const pid = it.produk?.id || it.produk_id;
    if (pid && produkMap[pid]) return produkMap[pid].harga;
    return 0;
  };

  const handleQtyChange = async (itemId: string, qty: number) => {
    if (!token || !cart) return;
    if (qty <= 0) return handleRemove(itemId);
    try {
      const updated = await updateKeranjangItem(token, itemId, {
        kuantitas: qty,
      });
      setCart(updated);
    } catch (e: any) {
      alert(e?.message || "Gagal memperbarui jumlah item.");
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!token || !cart) return;
    try {
      const updated = await removeKeranjangItem(token, itemId);
      setCart(updated);
    } catch (e: any) {
      alert(e?.message || "Gagal menghapus item.");
    }
  };

  const handleClear = async () => {
    if (!token || !cart) return;
    if (!confirm("Yakin ingin mengosongkan keranjang?")) return;
    try {
      const updated = await clearKeranjang(token);
      setCart(updated);
    } catch (e: any) {
      alert(e?.message || "Gagal mengosongkan keranjang.");
    }
  };

  const subtotal = (cart?.items || []).reduce((sum, it) => {
    const harga = getItemPrice(it);
    return sum + harga * it.kuantitas;
  }, 0);

  const toggleSelect = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
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
        nama:
          it.produk?.nama || produkMap[it.produk_id || ""]?.nama || "Produk",
        harga: getItemPrice(it),
        gambar: it.produk?.gambar || produkMap[it.produk_id || ""]?.gambar,
      },
      quantity: it.kuantitas,
    }));
    const total = items.reduce(
      (sum, i) => sum + i.produk.harga * i.quantity,
      0
    );
    localStorage.setItem("checkoutDraft", JSON.stringify({ items, total }));
    router.push("/checkout");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600 text-lg font-medium">
        Memuat keranjang...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-600 font-semibold">{error}</div>
    );
  if (!cart)
    return (
      <div className="p-6 text-center text-gray-700">
        Keranjang tidak ditemukan.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a
          href="/produk"
          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          ← Lanjut Belanja
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Keranjang Belanja
      </h1>

      {cart.items.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-4">Keranjang kamu masih kosong 😢</p>
          <a
            href="/produk"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Cari Produk
          </a>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div className="font-semibold text-gray-700">
              {cart.items.length} Item
            </div>
            <div className="space-x-3">
              <button
                onClick={() =>
                  setSelectedIds(new Set(cart.items.map((i) => i.id)))
                }
                className="text-sm text-blue-600 hover:underline"
              >
                Pilih Semua
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-gray-500 hover:underline"
              >
                Kosongkan Pilihan
              </button>
            </div>
          </div>

          <div className="divide-y">
            {cart.items.map((it) => (
              <div
                key={it.id}
                className="flex flex-col sm:flex-row items-center gap-4 py-4"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(it.id)}
                  onChange={() => toggleSelect(it.id)}
                  className="h-5 w-5 accent-blue-600"
                />
                <img
                  src={
                    Array.isArray(it.produk?.gambar)
                      ? it.produk.gambar[0]
                      : it.produk?.gambar ||
                        (Array.isArray(produkMap[it.produk_id || ""]?.gambar)
                          ? produkMap[it.produk_id || ""]?.gambar?.[0]
                          : produkMap[it.produk_id || ""]?.gambar) ||
                        "/no-image.png"
                  }
                  alt="produk"
                  className="w-20 h-20 object-cover rounded-lg shadow-sm"
                />
                <div className="flex-1 w-full">
                  <div className="font-semibold text-gray-800 text-lg">
                    {it.produk?.nama ||
                      produkMap[it.produk?.id || it.produk_id || ""]?.nama ||
                      "Produk"}
                  </div>
                  <div className="text-gray-600">
                    {formatCurrency(getItemPrice(it))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQtyChange(it.id, it.kuantitas - 1)}
                    className="bg-gray-200 hover:bg-gray-300 w-8 h-8 flex items-center justify-center rounded-md font-bold text-gray-700"
                  >
                    -
                  </button>
                  <span className="font-medium text-black">{it.kuantitas}</span>
                  <button
                    onClick={() => handleQtyChange(it.id, it.kuantitas + 1)}
                    className="bg-gray-200 hover:bg-gray-300 w-8 h-8 flex items-center justify-center rounded-md font-bold text-gray-700"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemove(it.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <button
              onClick={handleClear}
              className="text-gray-500 hover:text-red-500 font-medium text-sm"
            >
              Kosongkan Keranjang
            </button>
            <div className="text-xl font-bold text-gray-800">
              Subtotal: {formatCurrency(subtotal)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => toCheckoutWithItems(cart.items.map((i) => i.id))}
              className="flex-1 bg-purple-800 hover:bg-purple-900 text-white py-3 rounded-lg font-semibold transition"
            >
              Checkout Semua
            </button>
            <button
              onClick={() => toCheckoutWithItems(Array.from(selectedIds))}
              disabled={selectedIds.size === 0}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                selectedIds.size
                  ? "bg-pink-500 hover:bg-pink-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Checkout Terpilih
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
