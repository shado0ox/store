import React, { useState, useEffect } from 'react';
import { Product, CartItem, MerchantSettings, UserRole } from './types';
import { DEFAULT_SHOES, DEFAULT_SETTINGS } from './data/defaultProducts';
import { appwriteService } from './lib/appwrite';
import Navbar from './components/Navbar';
import ShoeCard from './components/ShoeCard';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';
import { 
  Footprints, Smartphone, Sparkles, Star, ShieldCheck, Heart, ThumbsUp, 
  Search, RefreshCw, MessageCircle, Share2, HelpCircle, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('shoestore_dashboard_role') as UserRole) || 'merchant';
  });

  // PIN security protection state for admin view
  const [adminPinVerified, setAdminPinVerified] = useState(() => {
    return sessionStorage.getItem('admin_pin_verified') === 'true';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = (import.meta as any).env?.VITE_ADMIN_PIN || '1234';
    if (enteredPin === correctPin) {
      setAdminPinVerified(true);
      sessionStorage.setItem('admin_pin_verified', 'true');
      setPinError('');
    } else {
      setPinError('رمز PIN المدخل غير صحيح! يرجى المحاولة مرة أخرى ❌');
    }
  };

  // Products and Orders lists loaded from server
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings
  const [settings, setSettings] = useState<MerchantSettings>(DEFAULT_SETTINGS);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // PWA Install helper
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Load Initial Settings & Products
  useEffect(() => {
    // 1. Load store configuration
    const savedSettings = localStorage.getItem('shoe_store_merchant_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      localStorage.setItem('shoe_store_merchant_settings', JSON.stringify(DEFAULT_SETTINGS));
    }

    // 2. Load shopping cart cache
    const savedCart = localStorage.getItem('shoe_store_cart_cache');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }

    // 3. Hear client PWA install prompt trigger
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });

    // 4. Fetch Products & Orders from Database
    fetchDatabaseData();
  }, []);

  const fetchDatabaseData = async () => {
    setLoading(true);
    try {
      const prodList = await appwriteService.getProducts();
      setProducts(prodList);

      const orderList = await appwriteService.getOrders();
      setOrders(orderList);
    } catch (e) {
      console.error('Error fetching data from database catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (newSettings: MerchantSettings) => {
    setSettings(newSettings);
    localStorage.setItem('shoe_store_merchant_settings', JSON.stringify(newSettings));
  };

  // --- CART MUTATIONS ---
  const handleAddToCart = (product: Product, size: number, color: string) => {
    const updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
    );

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart.push({ product, selectedSize: size, selectedColor: color, quantity: 1 });
    }

    setCart(updatedCart);
    localStorage.setItem('shoe_store_cart_cache', JSON.stringify(updatedCart));
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, size: number, color: string, change: number) => {
    let updatedCart = [...cart];
    const index = updatedCart.findIndex(
      (item) => item.product.id === productId && item.selectedSize === size && item.selectedColor === color
    );

    if (index > -1) {
      updatedCart[index].quantity += change;
      if (updatedCart[index].quantity <= 0) {
        updatedCart = updatedCart.filter((_, i) => i !== index);
      }
      setCart(updatedCart);
      localStorage.setItem('shoe_store_cart_cache', JSON.stringify(updatedCart));
    }
  };

  const handleRemoveItem = (productId: string, size: number, color: string) => {
    const updatedCart = cart.filter(
      (item) => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
    );
    setCart(updatedCart);
    localStorage.setItem('shoe_store_cart_cache', JSON.stringify(updatedCart));
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('shoe_store_cart_cache');
  };

  const handleQuickOrder = (product: Product, size: number, color: string) => {
    // Fill cart with single item and instantly checkout
    const singleItem: CartItem = { product, selectedSize: size, selectedColor: color, quantity: 1 };
    setCart([singleItem]);
    setIsCartOpen(true);
  };

  // PWA triggers
  const handlePWAInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  // Filters catalog
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const featuredPremiumShoes = products.filter(p => p.featured && p.inStock);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-right rtl-grid" id="full-pwa-app" style={{ fontFamily: settings.fontFamily || 'Tajawal' }}>
      {/* Navbar Global */}
      <Navbar
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        activeCategory={activeCategory}
        onSetCategory={setActiveCategory}
        role={role}
        currentView={currentView}
        onChangeView={setCurrentView}
        settings={settings}
      />

      {/* PWA Mobile Installation Hero banner popup */}
      {showInstallBanner && (
        <div className="bg-amber-500 shadow-xl px-5 py-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 font-semibold relative" id="pwa-install-ticker">
          <div className="flex items-center gap-3">
            <Smartphone className="shrink-0 animate-bounce" size={24} />
            <div>
              <p className="text-sm">تثبيت متجر {settings.storeName} على جوالك بنقرة واحدة!</p>
              <p className="text-[10px] text-white/80">احصل على تجربة سريعة وتصفح المنتجات في وضع الأوفلاين كأنك على تطبيق جوال حقيقي.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePWAInstallClick}
              className="bg-white text-amber-600 px-4 py-2 rounded-xl text-xs font-black shadow-xs hover:bg-neutral-100 cursor-pointer"
            >
              تثبيت التطبيق الآن 📱
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-xs hover:underline px-2.5 font-medium cursor-pointer"
            >
              تخطي
            </button>
          </div>
        </div>
      )}

      {/* Page Content View */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          
          {/* STORE FRONT/CUSTOMER VIEW */}
          {currentView === 'store' ? (
            <motion.div
              key="store"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-10"
              id="shopping-storefront"
            >
              {/* Shopper Promo Hero */}
              <div className="relative bg-gray-900 overflow-hidden min-h-[440px] flex items-center" id="hero-advertising-slider">
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200"
                    alt="Sneaker Wallpaper"
                    className="w-full h-full object-cover opacity-25 blur-xs scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-gray-950 via-gray-900/90 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 w-full z-10 text-white relative">
                  <div className="max-w-xl space-y-5">
                    <span className="text-xs font-black bg-amber-500 text-gray-950 px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                      <Sparkles size={13} fill="currentColor" />
                      كتالوج صيف 2026 الحصري
                    </span>
                    
                    <h1 className="text-3xl md:text-5xl font-black leading-tight text-white">
                      خطواتك تستحق <br />
                      <span className="text-amber-400">فخامة الأحذية المبتكرة</span>
                    </h1>

                    <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-lg">
                      برفقة {settings.storeName}، نضم مصفوفات منتقاة بعناية للأحذية الرياضية خفيفة الوزن للأجهزة الحية والمباريات الجري، إضافة لجلود بروغ الرجالية اليدوية الفخمة. تصفح الآن واطلب مباشرة بنقرة سريعة!
                    </p>

                    <div className="pt-2 flex flex-wrap gap-4">
                      <a
                        href="#all-products-grid"
                        className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all outline-hidden cursor-pointer"
                      >
                        تصفح التشكيلة الكاملة
                      </a>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-xs">
                        <ShieldCheck className="text-green-400" size={16} />
                        ضمان جودة الاستبدال والمقاسات 🛡️
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative floating shoe corner */}
                {featuredPremiumShoes.length > 0 && (
                  <div className="hidden lg:block absolute left-12 bottom-12 z-10 max-w-sm pointer-events-none">
                    <motion.img
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                      src={featuredPremiumShoes[0].images[0]}
                      alt="Featured Shoe"
                      className="max-h-72 object-contain drop-shadow-[0_35px_35px_rgba(245,158,11,0.3)]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Featured segment (if available) */}
              {featuredPremiumShoes.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 md:px-6" id="featured-shoes-shelf">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">الأحذية الأكثر تميزاً وشعبية ✨</h2>
                      <p className="text-xs text-gray-400 mt-1">الموديلات الدارجة والمعتمدة طبق مواصفات الجري والاستخدام الشاق.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredPremiumShoes.slice(0, 3).map(product => (
                      <ShoeCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onQuickOrder={handleQuickOrder}
                        currency={settings.currency}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Main Catalog Platform */}
              <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20 scroll-mt-24" id="all-products-grid">
                <div className="mb-8 border-b border-gray-150 pb-5">
                  <h2 className="text-xl font-black text-gray-900">
                    {activeCategory === 'all' ? 'جميع موديلات الأحذية المعروضة' : activeCategory}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">تصفح المقاسات والألوان المتوفرة في المخازن الحية واطلب الشحن الفوري.</p>
                </div>

                {/* Products Grid */}
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3" id="catalog-loading-card">
                    <RefreshCw className="animate-spin text-amber-500" size={32} />
                    <p className="text-sm font-semibold">جاري تحميل الأحذية والمقاسات الحالية من قاعدة البيانات السحابية...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-20 bg-white rounded-3xl text-center border border-gray-100 shadow-inner">
                    <p className="text-sm font-bold text-gray-500">لا تتوفر أي أحذية تحت هذا التصنيف حالياً بالمخزن.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                      <ShoeCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onQuickOrder={handleQuickOrder}
                        currency={settings.currency}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Trust badges footer */}
              <div className="bg-white py-12 border-t border-gray-150 text-gray-700">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto md:ml-0 md:mr-auto">
                      <ThumbsUp size={22} />
                    </div>
                    <h4 className="font-bold text-gray-900">جودة فحص العينات</h4>
                    <p className="text-xs text-gray-500">يقوم مندوبنا بتمكين العميل من فحص وقياس الحذاء قبل الدفع لضمان الرضا التام.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto md:ml-0 md:mr-auto">
                      <Smartphone size={22} />
                    </div>
                    <h4 className="font-bold text-gray-900">متوافق بالكامل كـ PWA</h4>
                    <p className="text-xs text-gray-500">يتيح متجرنا التثبيت المباشر على الشاشة ليعمل كتطبيق جوال محمول سريع جداً.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto md:ml-0 md:mr-auto">
                      <MessageCircle size={22} />
                    </div>
                    <h4 className="font-bold text-gray-900">ترابط اجتماعي وثيق</h4>
                    <p className="text-xs text-gray-500">إرسال وتجهيز مسودات السلة بواتس اب وماسينجر للتوافق واختصار زمن الشحن.</p>
                  </div>
                </div>
              </div>

            </motion.div>
          ) : !adminPinVerified ? (
            /* SECURE PIN CHECK CARD */
            <motion.div
              key="pin-auth"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto my-14 p-8 bg-white rounded-3xl border border-gray-150 shadow-2xl text-right rtl-grid font-sans"
              id="admin-pin-auth-card"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 border border-amber-100/50">
                  <Lock size={28} />
                </div>
                <h2 className="text-xl font-black text-gray-900">حماية لوحة التحكم الإدارية 🔐</h2>
                <p className="text-xs text-gray-450 mt-1.5 leading-relaxed">
                  هذه المنطقة مخصصة لإدارة المتجر والطلبات السحابية. يرجى إدخال الرمز السري (PIN) للمتابعة.
                </p>
              </div>

              {pinError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-xs font-bold rounded-2xl text-center">
                  {pinError}
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-650">رمز PIN السري:</label>
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    placeholder="••••"
                    maxLength={10}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-center font-mono text-sm tracking-widest focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="submit"
                    className="py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    تأكيد الرمز 🔓
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('store')}
                    className="py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-150 rounded-2xl font-black text-xs transition-all cursor-pointer"
                  >
                    العودة للمتجر 👟
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            
            /* MERCHANT & STORE MANAGER DASHBOARD */
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <AdminDashboard
                products={products}
                orders={orders}
                onRefreshData={fetchDatabaseData}
                settings={settings}
                onSaveSettings={handleSaveSettings}
                role={role}
                onChangeRole={setRole}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Global Shoppers Shopping Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        settings={settings}
      />

      {/* Mini Customer Support Floating Bubble (Arabic CTA) */}
      {currentView === 'store' && (
        <a
          href={`https://wa.me/${settings.whatsappNumber.replace(/[+\s-]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 left-6 z-30 p-3.5 bg-green-600 text-white rounded-full shadow-2xl hover:bg-green-700 hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
          title="تواصل مع المبيعات مباشرة"
        >
          <MessageCircle size={24} />
        </a>
      )}

      {/* Simple credit footer */}
      <footer className="bg-gray-150 border-t border-gray-200 py-6 text-center text-xs text-gray-400 font-semibold" id="global-shoestore-footer">
        <p>© 2026 {settings.storeName} - كافة الحقوق محفوظة. تم التطوير طبق بروتوكولات الأمان وبصيغة PWA الذكية للاتصالات.</p>
      </footer>
    </div>
  );
}
