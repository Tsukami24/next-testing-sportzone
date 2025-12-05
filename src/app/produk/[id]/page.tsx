"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProdukById,
  ProdukRecord,
  StatusProduk,
  listProdukVarian,
  ProdukVarianRecord,
  getTotalSoldByProduct,
} from "../../services/produk";
import { useCart } from "../../contexts/CartContext";
import { addKeranjangItem } from "../../services/keranjang";
import { API_URL, getProfile } from "../../services/auth";
import StarRating from "../../components/StarRating";
import {
  getAverageRating,
  createRating,
  updateRating,
  getRatingsByProduct,
} from "../../services/rating";

export default function ProdukDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [token, setToken] = useState<string | null>(null);
  const [produk, setProduk] = useState<ProdukRecord | null>(null);
  const [varian, setVarian] = useState<ProdukVarianRecord[]>([]);
  const [selectedVarian, setSelectedVarian] =
    useState<ProdukVarianRecord | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Rating states
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userRatingId, setUserRatingId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [ratingCount, setRatingCount] = useState(0);

  // Total sold state
  const [totalSold, setTotalSold] = useState<number>(0);

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

        const id = params.id as string;
        if (!id) {
          setError("ID produk tidak ditemukan");
          setLoading(false);
          return;
        }

        const data = await getProdukById(stored, id);
        setProduk(data);

        // Load product variants if available
        try {
          const varianData = await listProdukVarian(stored, id);
          setVarian(varianData);
        } catch (e) {
          console.log("No variants available for this product");
        }

        // Load ratings and user rating
        try {
          const avgRes = await getAverageRating(id);
          setAverageRating(avgRes.averageRating || 0);

          const profileRes = await getProfile(stored);
          setProfile(profileRes.user);

          const ratings = await getRatingsByProduct(id);
          setRatingCount(ratings.length);
          const userRatingObj = ratings.find(
            (r: any) => r.user.id === profileRes.user.id
          );
          if (userRatingObj) {
            setUserRating(userRatingObj.rating);
            setUserRatingId(userRatingObj.id);
          }
        } catch (e) {
          console.error("Failed to load ratings", e);
        }

        // Load total sold count
        try {
          const soldData = await getTotalSoldByProduct(stored, id);
          setTotalSold(soldData.totalSold);
        } catch (e) {
          console.error("Failed to load total sold", e);
        }
      } catch (e: any) {
        setError(e?.message || "Gagal memuat detail produk");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [params.id]);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function resolveImageUrl(src?: string): string | undefined {
    if (!src) return undefined;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/")) return `${API_URL}${src}`;
    return `${API_URL}/${src}`;
  }

  const handleAddToCart = async () => {
    if (!produk) return;
    if (varian.length > 0 && !selectedVarian) {
      alert("Silakan pilih varian terlebih dahulu.");
      return;
    }
    if (selectedVarian?.stok !== undefined && quantity > selectedVarian.stok) {
      alert(`Stok varian tidak mencukupi. Maksimal ${selectedVarian.stok}.`);
      return;
    }
    try {
      const stored = localStorage.getItem("token");
      if (stored) {
        await addKeranjangItem(stored, {
          produk_id: produk.id,
          produk_varian_id: selectedVarian?.id,
          kuantitas: quantity,
        });
        alert("Produk ditambahkan ke keranjang (server).");
      } else {
        addItem(produk, quantity, selectedVarian || undefined);
        alert("Produk ditambahkan ke keranjang (lokal).");
      }
    } catch (e: any) {
      // Fallback to local cart on API error
      addItem(produk, quantity, selectedVarian || undefined);
      alert(
        e?.message ||
          "Gagal menambah ke keranjang server. Disimpan di keranjang lokal."
      );
    }
  };

  const handleBuyNow = () => {
    if (!produk) return;
    if (varian.length > 0 && !selectedVarian) {
      alert("Silakan pilih varian terlebih dahulu.");
      return;
    }
    if (selectedVarian?.stok !== undefined && quantity > selectedVarian.stok) {
      alert(`Stok varian tidak mencukupi. Maksimal ${selectedVarian.stok}.`);
      return;
    }
    const item = {
      produk: {
        id: produk.id,
        nama: produk.nama,
        harga: produk.harga,
        gambar: produk.gambar,
      },
      varian: selectedVarian
        ? {
            id: selectedVarian.id,
            ukuran: selectedVarian.ukuran,
            warna: selectedVarian.warna,
            harga: selectedVarian.harga,
          }
        : undefined,
      quantity,
    };

    const draft = {
      items: [item],
      total: (selectedVarian?.harga || produk.harga) * quantity,
    };

    try {
      localStorage.setItem("checkoutDraft", JSON.stringify(draft));
    } catch {}

    router.push("/checkout");
  };

  const getCurrentPrice = () => {
    if (selectedVarian && selectedVarian.harga) {
      return selectedVarian.harga;
    }
    return produk?.harga || 0;
  };

  // Extract unique sizes and colors from variants
  const uniqueSizes = Array.from(
    new Set(varian.map((v) => v.ukuran).filter(Boolean))
  );
  const uniqueColors = Array.from(
    new Set(varian.map((v) => v.warna).filter(Boolean))
  );

  // Find matching variant based on selected size and color
  const findMatchingVariant = (
    size: string,
    color: string
  ): ProdukVarianRecord | null => {
    if (size && color) {
      return varian.find((v) => v.ukuran === size && v.warna === color) || null;
    } else if (size) {
      return (
        varian.find(
          (v) => v.ukuran === size && (!v.warna || v.warna === null)
        ) || null
      );
    } else if (color) {
      return (
        varian.find(
          (v) => v.warna === color && (!v.ukuran || v.ukuran === null)
        ) || null
      );
    }
    return null;
  };

  // Update selected variant when size or color changes
  useEffect(() => {
    const matchingVariant = findMatchingVariant(selectedSize, selectedColor);
    setSelectedVarian(matchingVariant);
  }, [selectedSize, selectedColor, varian]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 mb-4">{error}</p>
          <a
            href="/produk"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Kembali ke Daftar Produk
          </a>
        </div>
      </div>
    );
  }

  if (!produk) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700 mb-4">Produk tidak ditemukan</p>
          <a
            href="/produk"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Kembali ke Daftar Produk
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <a
          href="/produk"
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          ← Kembali ke Daftar Produk
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {produk.nama}
            </h1>
            <p className="text-gray-500 font-mono">ID: {produk.id}</p>
          </div>

          {/* Product Stats Section */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Section */}
            <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ⭐ Rating Produk
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {averageRating.toFixed(1)} ⭐
                </div>
                <div className="text-gray-600">
                  ({ratingCount} orang memberikan rating)
                </div>
              </div>
            {profile && (
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">
                  Berikan rating Anda:
                </label>
                <StarRating
                  rating={userRating || 0}
                  onRatingChange={async (newRating) => {
                    try {
                      if (userRatingId) {
                        // Update existing rating
                        await updateRating(
                          userRatingId,
                          newRating,
                          token || ""
                        );
                      } else {
                        // Create new rating
                        await createRating(
                          profile.id,
                          produk.id,
                          newRating,
                          token || ""
                        );
                      }
                      // Refresh ratings
                      const avgRes = await getAverageRating(produk.id);
                      setAverageRating(avgRes.averageRating || 0);
                      const ratings = await getRatingsByProduct(produk.id);
                      setRatingCount(ratings.length);
                      setUserRating(newRating);
                      if (!userRatingId) {
                        const userRatingObj = ratings.find(
                          (r: any) => r.user.id === profile.id
                        );
                        if (userRatingObj) {
                          setUserRatingId(userRatingObj.id);
                        }
                      }
                      alert("Rating berhasil disimpan!");
                    } catch (e) {
                      console.error("Failed to save rating", e);
                      alert("Gagal menyimpan rating");
                    }
                  }}
                  readonly={false}
                />
              </div>
            )}
              {!profile && (
                <div className="text-gray-600">Login untuk memberikan rating</div>
              )}
            </div>

            {/* Total Sold Section */}
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📊 Statistik Penjualan
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl font-bold text-green-600">
                  {totalSold} Unit
                </div>
                <div className="text-gray-600">
                  Total Produk Terjual
                </div>
              </div>
              <div className="text-sm text-gray-600">
                ✅ Dari pesanan yang sudah selesai
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div>
              {produk.gambar && produk.gambar.length > 0 ? (
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 flex flex-wrap gap-2">
                  {produk.gambar.map((gambar, idx) => (
                    <img
                      key={idx}
                      src={resolveImageUrl(gambar)}
                      alt={`${produk.nama} ${idx + 1}`}
                      className="w-full h-full object-contain max-h-96"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.jpg";
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center rounded-lg bg-gray-100">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Price and Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-3xl font-semibold text-blue-600">
                    {formatCurrency(getCurrentPrice())}
                  </div>
                  <div className="text-gray-600 font-medium">
                    Harga per unit
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Stok:{" "}
                    {produk.stok ||
                      (varian.length > 0
                        ? varian.reduce((sum, v) => sum + v.stok, 0)
                        : 0)}
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    produk.status === StatusProduk.AKTIF
                      ? "bg-green-100 text-green-800"
                      : produk.status === StatusProduk.NONAKTIF
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {produk.status === StatusProduk.AKTIF
                    ? "✅ Aktif"
                    : produk.status === StatusProduk.NONAKTIF
                    ? "❌ Nonaktif"
                    : "⚠️ Stok Habis"}
                </div>
              </div>

              {/* Product Variants */}
              {varian.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    🎨 Varian Produk
                  </h3>

                  {/* Size and Color Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Size Selection */}
                    {uniqueSizes.length > 0 && (
                      <div>
                        <label className="block mb-2 font-medium text-gray-700">
                          📏 Pilih Ukuran:
                        </label>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="">Pilih ukuran</option>
                          {uniqueSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Color Selection */}
                    {uniqueColors.length > 0 && (
                      <div>
                        <label className="block mb-2 font-medium text-gray-700">
                          🎨 Pilih Warna:
                        </label>
                        <select
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="">Pilih warna</option>
                          {uniqueColors.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Selected Variant Info */}
                  {selectedVarian && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-blue-900 mb-2">
                        Varian Terpilih:{" "}
                        {selectedVarian.ukuran &&
                          `Ukuran ${selectedVarian.ukuran}`}
                        {selectedVarian.ukuran && selectedVarian.warna && " | "}
                        {selectedVarian.warna &&
                          `Warna ${selectedVarian.warna}`}
                      </div>
                      <div className="text-blue-700 font-semibold">
                        Harga:{" "}
                        {formatCurrency(selectedVarian.harga || produk.harga)}
                      </div>
                      <div className="text-blue-600 text-sm">
                        Stok tersedia: {selectedVarian.stok}
                      </div>
                    </div>
                  )}

                  {/* No matching variant warning */}
                  {(selectedSize || selectedColor) && !selectedVarian && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-red-700 font-medium">
                        ⚠️ Varian yang dipilih tidak tersedia
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  🛒 Beli Produk
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Jumlah:
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center text-lg font-bold hover:bg-blue-700 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xl font-bold min-w-[50px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(() => {
                            const max =
                              selectedVarian?.stok ?? Number.POSITIVE_INFINITY;
                            const next = quantity + 1;
                            return next > max ? quantity : next;
                          })
                        }
                        className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center text-lg font-bold hover:bg-blue-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    {selectedVarian && selectedVarian.stok !== undefined && (
                      <div className="mt-2 text-gray-500 text-sm">
                        Stok tersedia: {selectedVarian.stok}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Total Harga:
                    </label>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(getCurrentPrice() * quantity)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={produk.status !== StatusProduk.AKTIF}
                    className={`w-full py-3 px-4 rounded-lg text-base font-medium transition-colors ${
                      produk.status === StatusProduk.AKTIF
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {produk.status === StatusProduk.AKTIF
                      ? "🛒 Tambah ke Keranjang"
                      : "❌ Produk Tidak Tersedia"}
                  </button>

                  {produk.status === StatusProduk.AKTIF && (
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg text-base font-medium hover:bg-orange-600 transition-colors"
                    >
                      ⚡ Beli Sekarang
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📝 Deskripsi
            </h3>
            <p className="text-gray-700 bg-gray-50 p-6 rounded-lg border border-gray-200">
              {produk.deskripsi}
            </p>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🏷️ Kategori
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Subkategori ID
                </div>
                <div className="text-base font-bold text-blue-700 font-mono mb-2">
                  {produk.subkategori_id}
                </div>
                {produk.subkategori && (
                  <div className="text-base text-gray-900 font-medium">
                    {produk.subkategori.nama}
                  </div>
                )}
              </div>
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Brand ID
                </div>
                <div className="text-base font-bold text-purple-700 font-mono mb-2">
                  {produk.brand_id}
                </div>
                {produk.brand && (
                  <div className="text-base text-gray-900 font-medium">
                    {produk.brand.nama}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ⚙️ Informasi Sistem
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-500 mb-1 font-medium">
                  📅 Dibuat pada
                </div>
                <div className="text-gray-900 font-medium">
                  {formatDate(produk.created_at)}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-500 mb-1 font-medium">
                  🔄 Terakhir diperbarui
                </div>
                <div className="text-gray-900 font-medium">
                  {formatDate(produk.updated_at)}
                </div>
              </div>
            </div>
            {produk.deleted_at && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-red-600 mb-1 font-medium">
                  🗑️ Dihapus pada
                </div>
                <div className="text-red-700 font-medium">
                  {formatDate(produk.deleted_at)}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push(`/produk`)}
              className="py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ← Kembali ke Daftar
            </button>
            <button
              onClick={() => router.push(`/produk`)}
              className="py-3 px-6 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              ✏️ Edit Produk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
