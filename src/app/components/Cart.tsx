"use client";

import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  }

  const handleQuantityChange = (produkId: string, quantity: number, varianId?: string) => {
    if (quantity <= 0) {
      removeItem(produkId, varianId);
    } else {
      updateQuantity(produkId, quantity, varianId);
    }
  };

  const handleCheckout = () => {
    if (state.items.length === 0) {
      alert('Keranjang belanja kosong!');
      return;
    }
    router.push('/checkout');
  };

  const cartItemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
      >
        <span>🛒</span>
        <span>Keranjang</span>
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </button>

      {/* Cart Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Keranjang Belanja</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {state.items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Keranjang belanja kosong</p>
              </div>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto">
                  {state.items.map((item) => (
                    <div key={`${item.produk.id}-${item.varian?.id || 'no-varian'}`} className="border-b border-gray-100 py-4">
                      <div className="flex items-center space-x-3">
                        {item.produk.gambar ? (
                          <img
                            src={item.produk.gambar}
                            alt={item.produk.nama}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{item.produk.nama}</h4>
                          {item.varian && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.varian.ukuran && `Ukuran: ${item.varian.ukuran}`}
                              {item.varian.warna && ` Warna: ${item.varian.warna}`}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-blue-600 mt-1">
                            {formatCurrency(item.varian?.harga || item.produk.harga)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center space-x-2 mb-2">
                            <button
                              onClick={() => handleQuantityChange(item.produk.id, item.quantity - 1, item.varian?.id)}
                              className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.produk.id, item.quantity + 1, item.varian?.id)}
                              className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.produk.id, item.varian?.id)}
                            className="text-red-500 hover:text-red-700 text-sm transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-700">Total:</span>
                    <span className="font-bold text-lg text-blue-600">{formatCurrency(state.total)}</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 py-2.5 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Kosongkan
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}






