import React from 'react';
import { ShoppingCart, LayoutDashboard, UserCheck, Zap, Scissors, Footprints, Flame, Layers } from 'lucide-react';
import { UserRole, MerchantSettings } from '../types';

interface NavbarProps {
  onCartToggle: () => void;
  cartCount: number;
  activeCategory: string;
  onSetCategory: (category: string) => void;
  role: UserRole;
  currentView: 'store' | 'admin';
  onChangeView: (view: 'store' | 'admin') => void;
  settings: MerchantSettings;
  isConnected: boolean;
}

export default function Navbar({
  onCartToggle,
  cartCount,
  activeCategory,
  onSetCategory,
  role,
  currentView,
  onChangeView,
  settings,
  isConnected
}: NavbarProps) {
  
  const categories = [
    { id: 'all', name: 'الكل 👟' },
    { id: 'أحذية رياضية', name: 'رياضية ⚡' },
    { id: 'أحذية كاجوال', name: 'كاجوال ✨' },
    { id: 'أحذية كلاسيك', name: 'كلاسيك 👑' },
    { id: 'أحذية نسائية', name: 'نسائية 🌸' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full" id="global-shoestore-navbar">
      {/* Upper info-ticker: Database status */}
      <div className="bg-gray-950 text-white py-1.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <span className="inline-flex w-2 h-2 rounded-full relative bg-green-400">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        </span>
        {isConnected ? (
          <span>سيرفر المتجر السحابي متصل ويعمل حياً (Appwrite Live Mode)</span>
        ) : (
          <span>المتجر يعمل مؤقتاً بوضعية الأوفلاين (LocalStorage Demo)</span>
        )}
      </div>

      {/* Primary header desk */}
      <div className="w-full bg-white/95 backdrop-blur-md border-b border-gray-150">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onChangeView('store'); onSetCategory('all'); }}>
            <div className="w-12 h-12 bg-amber-500 hover:bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-amber-500/20 transition-transform hover:scale-105">
              <Footprints size={26} className="rotate-12" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-gray-950 tracking-tight leading-tight flex items-center gap-1.5">
                {settings.storeName}
              </h1>
              <p className="text-[10px] text-gray-400 font-bold">{settings.storeSlogan}</p>
            </div>
          </div>

          {/* Desktop Categories Panel */}
          {currentView === 'store' && (
            <nav className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSetCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          )}

          {/* Action Area */}
          <div className="flex items-center gap-3">
            {/* Admin Switcher */}
            <button
              onClick={() => onChangeView(currentView === 'store' ? 'admin' : 'store')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-gray-200 transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard size={15} />
              {currentView === 'admin' ? 'تصفح المتجر' : 'إدارة ومبيعات'}
            </button>

            {/* Shopping Cart button */}
            {currentView === 'store' && (
              <button
                onClick={onCartToggle}
                className="relative p-3 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-all"
                title="سلة التسوق"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 border-2 border-white text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Category Tab Rails (Visible ONLY on Mobile Devices instead of dropdowns) */}
      {currentView === 'store' && (
        <div className="md:hidden w-full bg-white/95 border-b border-gray-100 py-2.5 px-4 overflow-x-auto no-scrollbar flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSetCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
