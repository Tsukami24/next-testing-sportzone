export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">E-Commerce</h2>
              <p className="text-gray-600 text-sm max-w-md">
                Your one-stop shop for all products. We provide high-quality items at competitive prices with fast delivery and excellent customer service.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/home" className="text-gray-600 hover:text-blue-600 text-sm">Home</a>
                </li>
                <li>
                  <a href="/produk" className="text-gray-600 hover:text-blue-600 text-sm">Products</a>
                </li>
                <li>
                  <a href="/kategori" className="text-gray-600 hover:text-blue-600 text-sm">Categories</a>
                </li>
                <li>
                  <a href="/brand" className="text-gray-600 hover:text-blue-600 text-sm">Brands</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Account</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/login" className="text-gray-600 hover:text-blue-600 text-sm">Login</a>
                </li>
                <li>
                  <a href="/pesanan/history" className="text-gray-600 hover:text-blue-600 text-sm">My Orders</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2025 E-Commerce. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}