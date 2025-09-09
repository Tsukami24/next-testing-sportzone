import { useRouter } from "next/navigation";
import { ProdukRecord, StatusProduk } from "../services/produk";

interface ProductCardProps {
  product: ProdukRecord;
  onAddToCart?: (product: ProdukRecord, quantity: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const router = useRouter();

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  }

  function resolveImageUrl(src?: string): string | undefined {
    if (!src) return undefined;
    // Assuming API_URL is available in the context
    // In a real implementation, you might need to pass this as a prop or use a context
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('/')) return `${API_URL}${src}`;
    return `${API_URL}/${src}`;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart && product.status === StatusProduk.AKTIF) {
      onAddToCart(product, 1);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
      onClick={() => router.push(`/produk/${product.id}`)}
    >
      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        {product.gambar && product.gambar.length > 0 ? (
          <img 
            src={resolveImageUrl(product.gambar[0]) || "/placeholder.jpg"} 
            alt={product.nama}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.nama}</h3>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-600">
            {formatCurrency(product.harga)}
          </span>
          
          <span className={`text-xs px-2 py-1 rounded-full ${
            product.status === StatusProduk.AKTIF 
              ? 'bg-green-100 text-green-800' 
              : product.status === StatusProduk.NONAKTIF 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {product.status === StatusProduk.AKTIF 
              ? 'In Stock' 
              : product.status === StatusProduk.NONAKTIF 
                ? 'Inactive' 
                : 'Out of Stock'}
          </span>
        </div>
        
        {product.brand && (
          <div className="mt-2 text-sm text-gray-500">
            {product.brand.nama}
          </div>
        )}
        
        {product.subkategori && (
          <div className="mt-1 text-xs text-gray-400">
            {product.subkategori.nama}
          </div>
        )}
      </div>
      
      {/* Add to Cart Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={product.status !== StatusProduk.AKTIF}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            product.status === StatusProduk.AKTIF
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.status === StatusProduk.AKTIF ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}