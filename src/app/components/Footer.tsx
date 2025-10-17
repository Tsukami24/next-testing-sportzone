export default function Footer() {
  return (
    <footer className="bg-[#5b0675ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Info */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-lg font-semibold text-white mb-4">
                E-Commerce
              </h2>
              <p className="text-white text-sm max-w-md">
                Your one-stop shop for all products. We provide high-quality
                items at competitive prices with fast delivery and excellent
                customer service.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                Navigation
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/home"
                    className="text-white hover:opacity-80 text-sm transition-opacity"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/produk"
                    className="text-white hover:opacity-80 text-sm transition-opacity"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="/kategori"
                    className="text-white hover:opacity-80 text-sm transition-opacity"
                  >
                    Categories
                  </a>
                </li>
                <li>
                  <a
                    href="/brand"
                    className="text-white hover:opacity-80 text-sm transition-opacity"
                  >
                    Brands
                  </a>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Account</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/login"
                    className="text-white hover:opacity-80 text-sm transition-opacity"
                  >
                    Login
                  </a>
                </li>
                <li>
                  <a
                    href="/pesanan/history"
                    className="text-white hover:opacity-80 text-sm transition-opacity"
                  >
                    My Orders
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 border-t border-white/30 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white text-sm">
              © 2025 E-Commerce. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <a
                    href="#"
                    className="text-white hover:opacity-80 text-sm transition-opacity"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:opacity-80 text-sm transition-opacity"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:opacity-80 text-sm transition-opacity"
                  >
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
