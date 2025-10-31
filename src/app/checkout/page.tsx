"use client";

// Type declaration for Midtrans Snap
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: any) => void;
    };
  }
}

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../contexts/CartContext";
import {
  createPesanan,
  CreatePesananDto,
  CreatePesananItemDto,
} from "../services/pesanan";
import {
  createCodPayment,
  createMidtransPayment,
  MetodePembayaran,
} from "../services/pembayaran";
import { getProfile } from "../services/auth";

export default function CheckoutPage() {
  const router = useRouter();
  const { state, clearCart } = useCart();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<any[] | null>(null);
  const [draftTotal, setDraftTotal] = useState<number | null>(null);

  // Form state
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<MetodePembayaran>(
    MetodePembayaran.DANA
  );
  const snapScriptLoaded = useRef(false);

  useEffect(() => {
    async function init() {
      try {
        const stored = localStorage.getItem("token");
        if (!stored) {
          setError("Token tidak ditemukan. Login dulu.");
          return;
        }
        setToken(stored);

        // Get user profile
        const userData = await getProfile(stored);
        setUser(userData?.user || userData || null);

        // Set default order date to today
        const today = new Date().toISOString().split("T")[0];
        setOrderDate(today);

        // Load checkout draft (Buy Now flow)
        const draft = localStorage.getItem("checkoutDraft");
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            if (
              Array.isArray(parsed.items) &&
              typeof parsed.total === "number"
            ) {
              setDraftItems(parsed.items);
              setDraftTotal(parsed.total);
            }
          } catch {}
        }

        // Load Midtrans Snap script
        if (!snapScriptLoaded.current) {
          const script = document.createElement("script");
          script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute(
            "data-client-key",
            process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
              "SB-Mid-client-YourClientKey"
          );
          script.onload = () => {
            snapScriptLoaded.current = true;
          };
          script.onerror = () => {
            console.error("Failed to load Midtrans Snap script");
            setError(
              "Gagal memuat sistem pembayaran. Silakan refresh halaman."
            );
          };
          document.body.appendChild(script);
        }
      } catch (e: any) {
        setError(e?.message || "Gagal memuat data user");
      }
    }
    init();
  }, []);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      setError("Token atau data user tidak valid");
      return;
    }

    const effectiveItems =
      draftItems && draftItems.length > 0 ? draftItems : state.items;
    const effectiveTotal = draftTotal !== null ? draftTotal : state.total;

    if (!effectiveItems || effectiveItems.length === 0) {
      setError("Tidak ada item untuk dipesan");
      return;
    }

    if (!shippingAddress.trim()) {
      setError("Alamat pengiriman harus diisi");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare order items
      const items: CreatePesananItemDto[] = effectiveItems.map((item: any) => ({
        id_produk: item.produk.id,
        produk_varian_id: item.varian?.id,
        kuantitas: item.quantity,
        harga_satuan: item.varian?.harga || item.produk.harga,
      }));

      // Create order data
      const orderData: any = {
        tanggal_pesanan: new Date(orderDate).toISOString(),
        total_harga: effectiveTotal,
        alamat_pengiriman: shippingAddress,
        items: items,
      };

      if (user?.id) {
        orderData.user_id = user.id;
      }

      // Submit order
      const order = await createPesanan(token, orderData);

      // Clear cart after successful order
      if (!draftItems) {
        clearCart();
      }
      try {
        localStorage.removeItem("checkoutDraft");
      } catch {}

      // Handle different payment methods
      if (paymentMethod === MetodePembayaran.COD) {
        // Create COD payment record
        setPaymentLoading(true);
        setSuccess(`Pesanan berhasil dibuat! Membuat pembayaran COD...`);

        try {
          await createCodPayment(token, order.id);

          setPaymentLoading(false);
          setSuccess(
            "Pesanan berhasil dibuat dengan pembayaran COD! Silakan lakukan pembayaran saat barang sampai."
          );
          setTimeout(() => {
            router.push(`/pesanan/${order.id}`);
          }, 2000);
        } catch (codError: any) {
          console.error("Error creating COD payment:", codError);
          setPaymentLoading(false);
          setError(
            `Pesanan berhasil dibuat, namun gagal membuat pembayaran COD: ${
              codError?.message || "Terjadi kesalahan"
            }`
          );
          // Still redirect to order detail even if COD payment creation fails
          setTimeout(() => {
            router.push(`/pesanan/${order.id}`);
          }, 3000);
        }
      } else {
        // Midtrans payment for other methods
        setPaymentLoading(true);
        setSuccess(`Pesanan berhasil dibuat! Memproses pembayaran...`);

        // Map payment method to Midtrans enabled payments
        // 修改这部分代码
        const paymentMethodMap: Record<string, string[]> = {
          [MetodePembayaran.DANA]: ["dana"],
          [MetodePembayaran.QRIS]: ["qris"],
          [MetodePembayaran.COD]: [],
        };

        const enabledPayments = paymentMethodMap[paymentMethod] || [];


        // Use Midtrans Snap popup
        const midtransData = await createMidtransPayment(
          token,
          order.id,
          paymentMethod
        );
        console.log("Midtrans snap object:", window.snap);
        console.log("Midtrans token:", midtransData.token);
        if (window.snap && midtransData.token) {
          try {
            window.snap.pay(midtransData.token, {
              enabledPayments: enabledPayments,
              onSuccess: function (result: any) {
                setPaymentLoading(false);
                setSuccess(`Pembayaran berhasil! Order ID: ${result.order_id}`);
                setTimeout(() => {
                  router.push(`/pesanan/${order.id}`);
                }, 2000);
              },
              onPending: function (result: any) {
                setPaymentLoading(false);
                setSuccess(
                  `Pembayaran sedang diproses. Order ID: ${result.order_id}`
                );
                setTimeout(() => {
                  router.push(`/pesanan/${order.id}`);
                }, 2000);
              },
              onError: function (result: any) {
                setPaymentLoading(false);
                setError(
                  `Pembayaran gagal: ${
                    result.status_message || "Terjadi kesalahan"
                  }`
                );
              },
              onClose: function () {
                setPaymentLoading(false);
                if (!success) {
                  setError("Pembayaran dibatalkan oleh pengguna.");
                }
              },
            });
          } catch (err) {
            console.error("Error calling snap.pay:", err);
            setPaymentLoading(false);
            setError("Terjadi kesalahan saat memproses pembayaran Midtrans.");
          }
        } else if (midtransData.redirect_url) {
          window.location.href = midtransData.redirect_url;
        } else {
          // Fallback to order detail if no redirect URL
          setPaymentLoading(false);
          router.push(`/pesanan/${order.id}`);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  const itemsForView =
    draftItems && draftItems.length > 0 ? draftItems : state.items;
  const totalForView = draftTotal !== null ? draftTotal : state.total;

  if (!itemsForView || itemsForView.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <div className="empty-cart-icon">🛒</div>
          <h2>Keranjang Belanja Kosong</h2>
          <p>Silakan tambahkan produk ke keranjang terlebih dahulu.</p>
          <button
            onClick={() => router.push("/produk")}
            className="btn-primary"
          >
            Lihat Produk
          </button>
        </div>
        <style jsx>{`
          .empty-cart-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
          }
          .empty-cart-content {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            max-width: 500px;
          }
          .empty-cart-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h2 {
            color: #2c3e50;
            margin-bottom: 15px;
          }
          p {
            color: #7f8c8d;
            margin-bottom: 25px;
          }
          .btn-primary {
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <a href="/produk" className="back-link">
          ← Kembali ke Daftar Produk
        </a>
        <h1 className="checkout-title">🛒 Checkout</h1>
      </div>

      {error && <div className="alert error">❌ {error}</div>}

      {success && <div className="alert success">✅ {success}</div>}

      {paymentLoading && (
        <div className="payment-loading">
          <div className="spinner"></div>
          <div>Memproses Pembayaran...</div>
          <div>Mohon tunggu sebentar, jangan tutup halaman ini</div>
        </div>
      )}

      <div className="checkout-content">
        {/* Order Summary */}
        <div className="order-summary">
          <h2 className="section-title">📋 Ringkasan Pesanan</h2>

          <div className="order-items">
            {itemsForView.map((item: any, index: number) => (
              <div key={index} className="order-item">
                {item.produk.gambar && (
                  <img
                    src={item.produk.gambar}
                    alt={item.produk.nama}
                    className="item-image"
                  />
                )}
                <div className="item-details">
                  <h4 className="item-name">{item.produk.nama}</h4>
                  {item.varian && (
                    <p className="item-variant">
                      {item.varian.ukuran && `Ukuran: ${item.varian.ukuran}`}
                      {item.varian.warna && ` | Warna: ${item.varian.warna}`}
                    </p>
                  )}
                  <p className="item-quantity">
                    Jumlah: {item.quantity} x{" "}
                    {formatCurrency(item.varian?.harga || item.produk.harga)}
                  </p>
                </div>
                <div className="item-price">
                  {formatCurrency(
                    (item.varian?.harga || item.produk.harga) * item.quantity
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="order-total">
            <div className="total-row">
              <span>Total:</span>
              <span className="total-amount">
                {formatCurrency(totalForView)}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="checkout-form">
          <h2 className="section-title">📝 Informasi Pengiriman</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Pelanggan:</label>
              <input
                type="text"
                value={user?.username || ""}
                disabled
                className="form-input disabled"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="form-input disabled"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal Pesanan:</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Pengiriman: *</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                rows={4}
                placeholder="Masukkan alamat pengiriman lengkap..."
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Metode Pembayaran: *</label>
              <div className="payment-methods">
                <div
                  className={`payment-option ${
                    paymentMethod === MetodePembayaran.DANA ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod(MetodePembayaran.DANA)}
                >
                  <div className="payment-icon">💳</div>
                  <div className="payment-name">DANA</div>
                </div>
                <div
                  className={`payment-option ${
                    paymentMethod === MetodePembayaran.QRIS ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod(MetodePembayaran.QRIS)}
                >
                  <div className="payment-icon">📱</div>
                  <div className="payment-name">QRIS</div>
                </div>
                <div
                  className={`payment-option ${
                    paymentMethod === MetodePembayaran.COD ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod(MetodePembayaran.COD)}
                >
                  <div className="payment-icon">🚚</div>
                  <div className="payment-name">COD (Bayar di Tempat)</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || paymentLoading}
              className="submit-btn"
            >
              {loading
                ? "⏳ Memproses Pesanan..."
                : paymentLoading
                ? "🔄 Memproses Pembayaran..."
                : "✅ Buat Pesanan & Bayar"}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .checkout-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
          min-height: 100vh;
        }

        .checkout-header {
          margin-bottom: 30px;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 20px;
          text-decoration: none;
          color: #667eea;
          font-weight: bold;
          font-size: 16px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #764ba2;
        }

        .checkout-title {
          margin: 0;
          color: #2c3e50;
          font-size: 32px;
          font-weight: bold;
          text-align: center;
        }

        .alert {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .payment-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background-color: #fff3cd;
          color: #856404;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #ffeaa7;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #667eea;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 10px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .checkout-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .order-summary,
        .checkout-form {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 24px;
          font-weight: bold;
        }

        .order-items {
          margin-bottom: 20px;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #e1e8ed;
        }

        .item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          margin: 0 0 5px 0;
          font-size: 16px;
          font-weight: bold;
        }

        .item-variant,
        .item-quantity {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #7f8c8d;
        }

        .item-price {
          font-size: 16px;
          font-weight: bold;
          color: #27ae60;
          text-align: right;
        }

        .order-total {
          border-top: 2px solid #e1e8ed;
          padding-top: 20px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: bold;
        }

        .total-amount {
          color: #27ae60;
          font-size: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #2c3e50;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-input.disabled {
          background-color: #f8f9fa;
          color: #6c757d;
        }

        .form-textarea {
          resize: vertical;
        }

        .payment-methods {
          display: flex;
          gap: 10px;
        }

        .payment-option {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .payment-option:hover {
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .payment-option.active {
          border-color: #667eea;
          background-color: rgba(102, 126, 234, 0.1);
        }

        .payment-icon {
          font-size: 24px;
          margin-bottom: 5px;
        }

        .payment-name {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .checkout-content {
            grid-template-columns: 1fr;
          }

          .payment-methods {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
