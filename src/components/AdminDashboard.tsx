import React, { useState, useEffect } from 'react';
import { Product, Order, MerchantSettings, UserRole, getThemeClasses } from '../types';
import { appwriteService } from '../lib/appwrite';
import { 
  Plus, Edit, Trash2, Settings, ClipboardList, Check, X, TrendingUp, 
  ShoppingBag, Archive, DollarSign, Loader2, Phone, Save, Zap, 
  ChevronRight, RefreshCw, Layers, ToggleLeft, ToggleRight, User, Key, Users,
  LogOut, Palette, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AppwriteSetup from './AppwriteSetup';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onRefreshData: () => void;
  settings: MerchantSettings;
  onSaveSettings: (settings: MerchantSettings) => void;
  role: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export default function AdminDashboard({ 
  products, orders, onRefreshData, settings, onSaveSettings, role, onChangeRole 
}: AdminDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'configs' | 'store' | 'developer_design'>('stats');
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form Fields for Product
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pOriginalPrice, setPOriginalPrice] = useState<number | ''>('');
  const [pCategory, setPCategory] = useState('أحذية رياضية');
  const [pSizes, setPSizes] = useState<number[]>([40, 41, 42, 43, 44]);
  const [pColors, setPColors] = useState<string[]>(['#111827', '#ffffff']);
  const [pInStock, setPInStock] = useState(true);
  const [pFeatured, setPFeatured] = useState(false);
  const [pImages, setPImages] = useState<string[]>(['']);

  // Settings State
  const [sWhatsapp, setSWhatsapp] = useState(settings.whatsappNumber);
  const [sMessenger, setSMessenger] = useState(settings.messengerUsername);
  const [sCurrency, setSCurrency] = useState(settings.currency);
  const [sStoreName, setSStoreName] = useState(settings.storeName);
  const [sStoreSlogan, setSStoreSlogan] = useState(settings.storeSlogan);

  // Secure Authentication states
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem('shoestore_dashboard_authed') === 'true');
  const [selectedLoginType, setSelectedLoginType] = useState<'merchant' | 'admin'>('merchant');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Developer custom settings states
  const [mEmailInput, setMEmailInput] = useState(settings.merchantEmail || 'merchant@store.com');
  const [mPassInput, setMPassInput] = useState(settings.merchantPassword || 'merchant123');
  const [dEmailInput, setDEmailInput] = useState(settings.devEmail || 'developer@admin.com');
  const [dPassInput, setDPassInput] = useState(settings.devPassword || 'developer123');
  const [visibleTabs, setVisibleTabs] = useState<string[]>(
    settings.visibleTabs || ['stats', 'products', 'orders', 'store', 'dev']
  );
  const [currentThemeColor, setCurrentThemeColor] = useState(settings.themeColor || 'amber');
  const [currentFontFamily, setCurrentFontFamily] = useState(settings.fontFamily || 'Tajawal');

  // Dynamic Categories in Navbar
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>(
    settings.categories || [
      { id: 'أحذية رياضية', name: 'رياضية ⚡' },
      { id: 'أحذية كاجوال', name: 'كاجوال ✨' },
      { id: 'أحذية كلاسيك', name: 'كلاسيك 👑' },
      { id: 'أحذية نسائية', name: 'نسائية 🌸' }
    ]
  );
  const [newCatName, setNewCatName] = useState('');

  // Active inputs helpers
  const [newSizeInput, setNewSizeInput] = useState<number | ''>('');
  const [newColorInput, setNewColorInput] = useState('#111827');
  const [newImageInput, setNewImageInput] = useState('');

  // Search and Filters
  const [productSearch, setProductSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'shipping' | 'completed' | 'cancelled'>('all');

  const t = getThemeClasses(settings.themeColor);

  useEffect(() => {
    setSWhatsapp(settings.whatsappNumber);
    setSMessenger(settings.messengerUsername);
    setSCurrency(settings.currency);
    setSStoreName(settings.storeName);
    setSStoreSlogan(settings.storeSlogan);

    setMEmailInput(settings.merchantEmail || 'merchant@store.com');
    setMPassInput(settings.merchantPassword || 'merchant123');
    setDEmailInput(settings.devEmail || 'developer@admin.com');
    setDPassInput(settings.devPassword || 'developer123');
    setVisibleTabs(settings.visibleTabs || ['stats', 'products', 'orders', 'store', 'dev']);
    setCurrentThemeColor(settings.themeColor || 'amber');
    setCurrentFontFamily(settings.fontFamily || 'Tajawal');
    setCategoriesList(
      settings.categories || [
        { id: 'أحذية رياضية', name: 'رياضية ⚡' },
        { id: 'أحذية كاجوال', name: 'كاجوال ✨' },
        { id: 'أحذية كلاسيك', name: 'كلاسيك 👑' },
        { id: 'أحذية نسائية', name: 'نسائية 🌸' }
      ]
    );
  }, [settings]);

  // Check tab visibility
  const isTabVisible = (tabKey: string) => {
    if (['stats', 'products', 'orders', 'store'].includes(tabKey)) return true;
    return visibleTabs.includes(tabKey);
  };

  // Statistics Computations
  const stats = {
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalPrice, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    shippingOrders: orders.filter(o => o.status === 'shipping').length,
    totalProducts: products.length,
    outOfStockCount: products.filter(p => !p.inStock).length
  };

  // Open Form for Adding Product
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setPName('');
    setPBrand('Nike');
    setPDescription('');
    setPPrice(1200);
    setPOriginalPrice('');
    setPCategory('أحذية رياضية');
    setPSizes([40, 41, 42, 43, 44]);
    setPColors(['#111827', '#ffffff']);
    setPInStock(true);
    setPFeatured(false);
    setPImages(['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600']);
    setIsFormOpen(true);
  };

  // Open Form for Editing Product
  const handleOpenEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPBrand(prod.brand);
    setPDescription(prod.description);
    setPPrice(prod.price);
    setPOriginalPrice(prod.originalPrice || '');
    setPCategory(prod.category);
    setPSizes([...prod.sizes]);
    setPColors([...prod.colors]);
    setPInStock(prod.inStock);
    setPFeatured(prod.featured || false);
    setPImages([...prod.images]);
    setIsFormOpen(true);
  };

  // Submit Product Form
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || pPrice <= 0 || pImages.length === 0 || pImages[0] === '') return;

    setLoading(true);

    const productPayload = {
      name: pName,
      brand: pBrand,
      description: pDescription,
      price: Number(pPrice),
      originalPrice: pOriginalPrice ? Number(pOriginalPrice) : undefined,
      category: pCategory,
      sizes: pSizes,
      colors: pColors,
      inStock: pInStock,
      featured: pFeatured,
      images: pImages.filter(img => img !== ''),
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    try {
      if (editingProduct) {
        await appwriteService.updateProduct(editingProduct.id, productPayload);
      } else {
        await appwriteService.createProduct(productPayload);
      }
      setIsFormOpen(false);
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الحذاء نهائياً؟')) return;
    setLoading(true);
    try {
      await appwriteService.deleteProduct(id);
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: Order['status']) => {
    setLoading(true);
    try {
      await appwriteService.updateOrderStatus(id, newStatus);
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('هل أنت متأكد من مسح سجل هذا الطلب نهائياً؟')) return;
    setLoading(true);
    try {
      await appwriteService.deleteOrder(id);
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      whatsappNumber: sWhatsapp,
      messengerUsername: sMessenger,
      currency: sCurrency,
      storeName: sStoreName,
      storeSlogan: sStoreSlogan
    });
    alert('تم حفظ إعدادات الاتصال وبيانات المتجر بنجاح!');
  };

  const handleApplyDeveloperSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      themeColor: currentThemeColor as any,
      fontFamily: currentFontFamily as any,
      visibleTabs: visibleTabs,
      merchantEmail: mEmailInput,
      merchantPassword: mPassInput,
      devEmail: dEmailInput,
      devPassword: dPassInput,
      categories: categoriesList
    });
    alert('تم حفظ تنسيقات المطور، الألوان وتراخيص لوحة التحكم بنجاح! سيتم تطبيق المظهر المختار والتبويبات فوراً 🎨');
  };

  // Size Helper Handlers
  const addSize = () => {
    if (newSizeInput && !pSizes.includes(Number(newSizeInput))) {
      setPSizes([...pSizes, Number(newSizeInput)].sort((a,b)=>a-b));
      setNewSizeInput('');
    }
  };
  const removeSize = (sz: number) => {
    setPSizes(pSizes.filter(s => s !== sz));
  };

  // Color Helper Handlers
  const addColor = () => {
    if (newColorInput && !pColors.includes(newColorInput)) {
      setPColors([...pColors, newColorInput]);
    }
  };
  const removeColor = (col: string) => {
    setPColors(pColors.filter(c => c !== col));
  };

  // Image helpers
  const addImageField = () => {
    if (newImageInput && !pImages.includes(newImageInput)) {
      setPImages([...pImages, newImageInput]);
      setNewImageInput('');
    }
  };
  const removeImageIdx = (idx: number) => {
    if (pImages.length > 1) {
      setPImages(pImages.filter((_, i) => i !== idx));
    }
  };

  // Filtered lists
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    const merchantEmail = settings.merchantEmail || 'merchant@store.com';
    const merchantPassword = settings.merchantPassword || 'merchant123';
    const devEmail = settings.devEmail || 'developer@admin.com';
    const devPassword = settings.devPassword || 'developer123';

    if (authEmail.trim().toLowerCase() === merchantEmail.trim().toLowerCase() && authPassword === merchantPassword) {
      onChangeRole('merchant');
      setIsAuthed(true);
      localStorage.setItem('shoestore_dashboard_authed', 'true');
      localStorage.setItem('shoestore_dashboard_role', 'merchant');
    } else if (authEmail.trim().toLowerCase() === devEmail.trim().toLowerCase() && authPassword === devPassword) {
      onChangeRole('admin');
      setIsAuthed(true);
      localStorage.setItem('shoestore_dashboard_authed', 'true');
      localStorage.setItem('shoestore_dashboard_role', 'admin');
    } else {
      setAuthError('عذراً، البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المراجعة والمحاولة مجدداً.');
    }
  };

  const handleQuickLogin = (type: 'merchant' | 'admin') => {
    setAuthError('');
    const email = type === 'merchant' ? (settings.merchantEmail || 'merchant@store.com') : (settings.devEmail || 'developer@admin.com');
    const password = type === 'merchant' ? (settings.merchantPassword || 'merchant123') : (settings.devPassword || 'developer123');
    
    setAuthEmail(email);
    setAuthPassword(password);
    onChangeRole(type === 'merchant' ? 'merchant' : 'admin');
    setIsAuthed(true);
    localStorage.setItem('shoestore_dashboard_authed', 'true');
    localStorage.setItem('shoestore_dashboard_role', type === 'merchant' ? 'merchant' : 'admin');
  };

  const handleLogout = () => {
    setIsAuthed(false);
    localStorage.removeItem('shoestore_dashboard_authed');
    localStorage.removeItem('shoestore_dashboard_role');
    setAuthEmail('');
    setAuthPassword('');
  };

  if (!isAuthed) {
    const brandClasses = getThemeClasses(settings.themeColor);
    return (
      <div className="max-w-xl mx-auto my-14 p-1 bg-white rounded-3xl border border-gray-150 shadow-2xl text-right rtl-grid font-sans overflow-hidden" id="admin-login-layout">
        {/* Decorative Top Accent */}
        <div className={`p-6 text-white text-center relative ${selectedLoginType === 'merchant' ? 'bg-blue-600' : 'bg-amber-500'} transition-all duration-300`}>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md hover:scale-110 transition-transform mb-3">
            <ShieldCheck size={26} />
          </div>
          <h2 className="text-xl font-black">تسجيل الدخول الإداري للمتجر 🛡️</h2>
          <p className="text-xs text-white/80 mt-1">الربط الآمن المباشر بكفاءة PWA وربط الطلبات السحابية</p>
        </div>

        {/* Tab Selection */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setSelectedLoginType('merchant');
                setAuthError('');
              }}
              className={`py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedLoginType === 'merchant'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <User size={14} />
              إدارة التاجر والمشرف 💼
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLoginType('admin');
                setAuthError('');
              }}
              className={`py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedLoginType === 'admin'
                  ? 'bg-white text-amber-500 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Palette size={14} />
              إدارة وتطوير المشرف العام 👑
            </button>
          </div>
        </div>

        {/* Dynamic description of role capabilities */}
        <div className="px-6 pt-4">
          <div className={`p-4 rounded-2xl text-xs font-medium border leading-relaxed ${
            selectedLoginType === 'merchant' 
              ? 'bg-blue-50/50 border-blue-100 text-blue-800' 
              : 'bg-amber-50/50 border-amber-100 text-amber-800'
          }`}>
            {selectedLoginType === 'merchant' ? (
              <div>
                <strong>صلاحيات المشرف التاجر:</strong>
                <ul className="list-disc list-inside mt-1.5 space-y-1 font-sans">
                  <li>إضافة الأحذية للكتالوج وتعديل الأسعار والمقاسات والألوان.</li>
                  <li>تلقي الطلبات الحقيقية وتغيير حالات الشحن والتجهيز.</li>
                  <li>رؤية إحصاءات المبيعات والأرباح وتعديل عملة المتجر وهواتف الاتصال.</li>
                </ul>
              </div>
            ) : (
              <div>
                <strong>صلاحيات المطور والمشرف العام:</strong>
                <ul className="list-disc list-inside mt-1.5 space-y-1 font-sans">
                  <li>تعديل مظهر وتصميم الموقع بالكامل (الألوان والثيم والخطوط).</li>
                  <li>تحديد التبويبات الفاعلة وإمكانية تخصيص ربط سيرفر Appwrite.</li>
                  <li>الوصول الكامل لكافة التبويبات وإعادة برمجة المتجر.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {authError && (
            <div className="p-3.5 bg-red-50 text-red-600 border border-red-100 text-xs font-bold rounded-2xl text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-sm font-semibold">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-650">البريد الإلكتروني المعتمد للرتبة:</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder={selectedLoginType === 'merchant' ? 'merchant@store.com' : 'developer@admin.com'}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-350 outline-hidden font-mono text-left"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-650">كلمة المرور السرية:</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-350 outline-hidden font-mono text-left"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className={`flex-1 py-3.5 text-white rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer ${
                  selectedLoginType === 'merchant'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                تأكيد وبدء الاتصال باللوحة 🔓
              </button>

              {/* Instant One-Tap Auto Login button */}
              <button
                type="button"
                onClick={() => handleQuickLogin(selectedLoginType)}
                className={`py-3.5 px-4 rounded-2xl font-black text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedLoginType === 'merchant'
                    ? 'border-blue-200 bg-blue-50/40 text-blue-700 hover:bg-blue-50'
                    : 'border-amber-200 bg-amber-50/40 text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Zap size={14} className="animate-pulse" />
                دخول تلقائي سريع ⚡
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400 font-medium">
            تأكد من الاحتفاظ ببيانات الدخول الإدارية لتطبيقات PWA في مكان آمن.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-right rtl-grid font-sans" id="admin-board-view">
      
      {/* Role and Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-gray-100 text-gray-750 font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <User size={13} />
              رتبة الحساب: {role === 'admin' ? 'المدير العام والمطور 👑' : 'التاجر والمشرف 💼'}
            </span>
            <span className="text-xs bg-gray-800 text-white font-mono px-3 py-1 rounded-full">
              PWA LIVE MODE
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">لوحة القيادة الإدارية للمتجر</h1>
          <p className="text-sm text-gray-500 font-medium">مرحباً بك في لوحة الاستعلامات الشاملة وإدارة الكتالوجات والطلب.</p>
        </div>

        {/* Real Logout Button */}
        <div className="flex items-center gap-2.5 mr-auto">
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-red-200/50"
          >
            <LogOut size={14} className="rotate-180" />
            تسجيل الخروج الآمن
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex xl:flex-row flex-col gap-6" id="dashboard-tab-layout">
        <div className="flex xl:flex-col flex-row gap-2 overflow-x-auto pb-2 xl:pb-0 w-full xl:w-64 shrink-0 no-scrollbar">
          
          {isTabVisible('stats') && (
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'stats' 
                  ? `${t.bg} text-white shadow-md` 
                  : 'bg-white text-gray-650 hover:bg-gray-100'
              }`}
            >
              <TrendingUp size={18} />
              إحصائيات المبيعات والنشاط
            </button>
          )}

          {isTabVisible('products') && (
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'products' 
                  ? `${t.bg} text-white shadow-md` 
                  : 'bg-white text-gray-650 hover:bg-gray-100'
              }`}
            >
              <Archive size={18} />
              إدارة الأحذية ({products.length})
            </button>
          )}

          {isTabVisible('orders') && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'orders' 
                  ? `${t.bg} text-white shadow-md` 
                  : 'bg-white text-gray-650 hover:bg-gray-100'
              }`}
            >
              <ClipboardList size={18} />
              إدارة الطلبات المستلمة ({orders.length})
              {stats.pendingOrders > 0 && (
                <span className="bg-red-550 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse font-mono">
                  {stats.pendingOrders}
                </span>
              )}
            </button>
          )}

          {isTabVisible('store') && (
            <button
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'store' 
                  ? `${t.bg} text-white shadow-md` 
                  : 'bg-white text-gray-650 hover:bg-gray-100'
              }`}
            >
              <Settings size={18} />
              عناوين الاتصال والعملات
            </button>
          )}

          {role === 'admin' && (
            <button
              onClick={() => setActiveTab('developer_design')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'developer_design' 
                  ? `${t.bg} text-white shadow-md` 
                  : 'bg-white text-gray-650 hover:bg-gray-100'
              }`}
            >
              <Palette size={18} />
              تطوير ومظهر الموقع 🎨
            </button>
          )}

          {role === 'admin' && (
            <button
              onClick={() => setActiveTab('configs')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'configs' 
                  ? `${t.bg} text-white shadow-md` 
                  : 'bg-white text-gray-650 hover:bg-gray-100'
              }`}
            >
              <Key size={18} />
              قاعدة بيانات Appwrite
            </button>
          )}
        </div>

        {/* Tab Panels */}
        <div className="flex-1 min-w-0">
          
          {/* STATS PANEL */}
          {activeTab === 'stats' && (
            <div className="space-y-6" id="dashboard-panel-stats">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400">إجمالي الأرباح المدفوعة</span>
                    <span className="p-2 bg-green-50 text-green-600 rounded-xl"><DollarSign size={18} /></span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">
                    {stats.totalRevenue.toLocaleString()} <span className="text-sm font-medium">{settings.currency}</span>
                  </h3>
                  <p className="text-[10px] text-green-600 mt-2">عن الطلبات مكتملة الشحن والتسليم</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400">الطلبات الكلية قيد الانتظار</span>
                    <span className="p-2 bg-red-50 text-red-600 rounded-xl"><ClipboardList size={18} /></span>
                  </div>
                  <h3 className="text-2xl font-black text-red-600">
                    {stats.pendingOrders} <span className="text-sm font-medium">طلبات</span>
                  </h3>
                  <p className="text-[10px] text-red-500 mt-2">تحتاج مراجعة فورية ومراسلة العملاء</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400">المنتجات الباقية بالمخزن</span>
                    <span className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Archive size={18} /></span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">
                    {stats.totalProducts} <span className="text-sm font-medium">حذاء</span>
                  </h3>
                  <p className="text-[10px] text-amber-600 mt-2">يتضمن {stats.outOfStockCount} حذاء منتهي الكمية</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400">المبيعات الإجمالية</span>
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag size={18} /></span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">
                    {stats.totalOrders} <span className="text-sm font-medium">عملية</span>
                  </h3>
                  <p className="text-[10px] text-blue-600 mt-2">إجمالي طلبات السيرفر والمحل المحلي</p>
                </div>
              </div>

              {/* Helpful Tips Box */}
              <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100/60 leading-relaxed text-sm text-gray-700">
                <span className="text-xs uppercase tracking-wider text-amber-800 font-bold bg-amber-150 px-2.5 py-1 rounded-md mb-2 inline-block">تلميحة إدارة وتتبع الطلبات</span>
                <p>
                  عندما يتقدم العميل بطلب الحذاء عبر سلة المشتريات، سيقوم النظام تلقائياً بكتابة مسودة الطلب ورفعها لقاعدة ببيانات السيرفر وإتاحتها لك بجدول الطلبات. كما يتيح للزبون المراسلة برابط مجهز مسبقاً يحمل تفاصيل المنتج، اللون، العنوان لتأكيده يدوياً معك على واتس اب أو ماسنجر، مما يخلق بيئة بيع مرنة وسريعة للغاية وموثوقة!
                </p>
              </div>
            </div>
          )}

          {/* PRODUCTS PANEL */}
          {activeTab === 'products' && (
            <div className="space-y-6" id="dashboard-panel-products">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100">
                <input
                  type="text"
                  placeholder="ابحث باسم الحذاء أو الماركة..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 outline-hidden text-sm w-full md:w-80 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />

                <button
                  onClick={handleOpenAddForm}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-xs transition-colors shrink-0 mr-auto cursor-pointer"
                >
                  <Plus size={18} />
                  إضافة حذاء جديد للكتالوج
                </button>
              </div>

              {/* Shoes List Table */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-bold">
                      <tr>
                        <th className="p-4">الحذاء</th>
                        <th className="p-4">النوع والماركة</th>
                        <th className="p-4">السعر</th>
                        <th className="p-4">المقاسات</th>
                        <th className="p-4">حالة المخزن</th>
                        <th className="p-4 text-center">العمليات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                            لا توجد أحذية مطابقة للبحث أو المخازن فارغة حالياً.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              <img src={p.images[0]} alt="" className="w-12 h-12 object-contain bg-gray-50 rounded-xl" referrerPolicy="no-referrer" />
                              <div>
                                <h4 className="font-bold text-gray-900">{p.name}</h4>
                                {p.featured && <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-sm">متميز بالرئيسية ✨</span>}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-gray-900 font-medium">{p.category}</div>
                              <div className="text-xs text-gray-400">{p.brand}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-extrabold text-gray-900">{p.price.toLocaleString()} {settings.currency}</div>
                              {p.originalPrice && <div className="text-xs line-through text-gray-400">{p.originalPrice.toLocaleString()} {settings.currency}</div>}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1 max-w-44 text-xs font-semibold">
                                {p.sizes.map(sz => (
                                  <span key={sz} className="bg-gray-100 px-1.5 py-0.5 rounded-sm text-gray-600">{sz}</span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={async () => {
                                  await appwriteService.updateProduct(p.id, { inStock: !p.inStock });
                                  onRefreshData();
                                }}
                                className="cursor-pointer"
                                title="تبديل حالة المخزن"
                              >
                                {p.inStock ? (
                                  <span className="text-xs bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                    <Check size={12} />
                                    متوفر بالمخزن
                                  </span>
                                ) : (
                                  <span className="text-xs bg-red-50 text-red-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                    <X size={12} />
                                    نفذت الكمية
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditForm(p)}
                                  className="p-2 hover:bg-gray-100 text-gray-600 hover:text-amber-600 rounded-xl cursor-pointer"
                                  title="تعديل"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-2 hover:bg-gray-100 text-gray-600 hover:text-red-600 rounded-xl cursor-pointer"
                                  title="حذف"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS PANEL */}
          {activeTab === 'orders' && (
            <div className="space-y-6" id="dashboard-panel-orders">
              {/* Filter Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {(['all', 'pending', 'shipping', 'completed', 'cancelled'] as const).map((filter) => {
                  const labelMap = {
                    all: 'الكل ومراجعتها',
                    pending: 'قيد المراجعة ⏳',
                    shipping: 'جاري الشحن 📦',
                    completed: 'مكتملة ومستلمة ✅',
                    cancelled: 'ملغية 🛑'
                  };
                  return (
                    <button
                      key={filter}
                      onClick={() => setOrderFilter(filter)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                        orderFilter === filter 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                      }`}
                    >
                      {labelMap[filter]}
                    </button>
                  );
                })}
              </div>

              {/* Orders Data Grid / Table */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-bold">
                      <tr>
                        <th className="p-4">هوية المشرف / العميل</th>
                        <th className="p-4">العنوان والهاتف</th>
                        <th className="p-4">تفاصيل سلة الأحذية</th>
                        <th className="p-4">الإجمالي</th>
                        <th className="p-4">حالة الشحن</th>
                        <th className="p-4 text-center">حذف السجل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                            لا توجد أي طلبات مستلمة في قاعدة البيانات حالياً بهذه التصنيفات.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => {
                          const itemsSummary: any[] = JSON.parse(o.items || '[]');
                          return (
                            <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-gray-900">{o.customerName}</div>
                                <div className="text-[10px] text-gray-400 font-mono">تاريخ: {new Date(o.createdAt).toLocaleString('ar-SA')}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-gray-950 font-semibold">{o.customerPhone}</div>
                                <div className="text-xs text-gray-400">{o.customerAddress}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-xs space-y-1 text-gray-700">
                                  {itemsSummary.map((item, id) => (
                                    <div key={id} className="flex gap-1">
                                      <span className="font-bold text-gray-900">({item.quantity}x)</span>
                                      <span>{item.productName}</span>
                                      <span className="bg-gray-100 px-1 font-semibold rounded-sm">مقاس {item.size}</span>
                                    </div>
                                  ))}
                                  {o.notes && <div className="text-[10px] text-red-500 bg-red-50 p-1 rounded-md mt-1">ملاحظة: {o.notes}</div>}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="font-extrabold text-gray-900">{o.totalPrice.toLocaleString()} {settings.currency}</span>
                              </td>
                              <td className="p-4">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-hidden border cursor-pointer border-gray-200 ${
                                    o.status === 'completed' ? 'bg-green-50 text-green-700' :
                                    o.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                    o.status === 'shipping' ? 'bg-blue-50 text-blue-700' :
                                    'bg-red-50 text-red-700'
                                  }`}
                                >
                                  <option value="pending">قيد مراجعة المبيعات</option>
                                  <option value="shipping">تم التسليم لشركة الشحن</option>
                                  <option value="completed">مكتمل ومستلم بالكامل</option>
                                  <option value="cancelled">طلب ملغي ومسترجع</option>
                                </select>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleDeleteOrder(o.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 cursor-pointer"
                                  title="حذف"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STORE SETTINGS PANEL */}
          {activeTab === 'store' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs" id="dashboard-panel-store">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Settings className="text-amber-500" size={24} />
                إعدادات التواصل وعملة المتجر
              </h2>
              <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
                تعديل وتحديد قنوات الاتصال بروابط كحساب واتس اب وماسينجر المباشرة لاستقبال طلبات أحذية الزبائن بنقرة سريعة.
              </p>

              <form onSubmit={handleApplySettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">اسم المتجر (بالعربية):</label>
                    <input
                      type="text"
                      value={sStoreName}
                      onChange={(e) => setSStoreName(e.target.value)}
                      className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">شعار أو جملة فرعية بالهيدر:</label>
                    <input
                      type="text"
                      value={sStoreSlogan}
                      onChange={(e) => setSStoreSlogan(e.target.value)}
                      className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-gray-500">رقم واتس اب المستلم (WhatsApp):</label>
                      <span className="text-[10px] text-amber-600 font-bold">* يشمل رمز الدولة بدون إشارة الجمع</span>
                    </div>
                    <input
                      type="text"
                      value={sWhatsapp}
                      onChange={(e) => setSWhatsapp(e.target.value)}
                      placeholder="مثال: 201016723485"
                      className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">معرف ماسينجر فيسبوك (Messenger Username):</label>
                    <input
                      type="text"
                      value={sMessenger}
                      onChange={(e) => setSMessenger(e.target.value)}
                      placeholder="مثال: custom.shoes.11"
                      className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">عملة المتجر الافتراضية:</label>
                    <select
                      value={sCurrency}
                      onChange={(e) => setSCurrency(e.target.value)}
                      className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden cursor-pointer"
                    >
                      <option value="ج.م">الجنيه المصري (ج.م)</option>
                      <option value="ر.س">الريال السعودي (ر.س)</option>
                      <option value="د.إ">الدرهم الإماراتي (د.إ)</option>
                      <option value="USD">الدولار الأمريكي ($)</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Navbar Categories Customization for Store Panel */}
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                    تعديل تصنيفات وتبويبات النيف بار في المتجر (Dynamic Navbar Tabs):
                  </h3>
                  <p className="text-xs text-gray-400 font-medium font-sans">
                    تعديل وتحديد التصنيفات التي تظهر للزبائن في أعلى الموقع لتصفية الأحذية المعروضة بالمتجر. يمكنك الإضافة أو الحذف فوراً:
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="امثلة: كلاسيك 👑، أحذية جري ⚡، عروض التصفية 🏷️"
                      className="px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-right focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-hidden flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCatName.trim()) {
                          const id = newCatName.trim();
                          if (!categoriesList.some(cat => cat.id === id)) {
                            setCategoriesList([...categoriesList, { id, name: id }]);
                          }
                          setNewCatName('');
                        }
                      }}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus size={14} />
                      إضافة تبويب جديد
                    </button>
                  </div>

                  {/* Display list of current categories */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    <div className="p-3 bg-gray-100 rounded-2xl border border-gray-200/50 flex justify-between items-center text-xs font-bold text-gray-500 select-none">
                      <span>الكل 👟 (افتراضي دائم)</span>
                    </div>

                    {categoriesList.map((cat, index) => (
                      <div key={cat.id} className="p-3 bg-white rounded-2xl border border-gray-150 flex justify-between items-center text-xs font-bold text-gray-800 shadow-2xs hover:border-gray-300 transition-all">
                        <span>{cat.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCategoriesList(categoriesList.filter((_, i) => i !== index));
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="حذف هذا التبويب"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-5">
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <Save size={18} />
                    حفظ تفاصيل المتجر وقنوات الاستقبال
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DEVELOPER DESIGN & BRANDING PANEL */}
          {activeTab === 'developer_design' && role === 'admin' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs space-y-8" id="dashboard-panel-dev-design">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Palette className="text-amber-500" size={24} />
                  لوحة تخصيص وتطوير تصميم وهيكل الموقع 🎨
                </h2>
                <p className="text-sm text-gray-500 pb-4 border-b border-gray-100">
                  لوحة تحكم حصرية للمشرف العام والمطور للتعديل الكامل على مظهر الموقع، الألوان الحية، نوع الخطوط، والتحكم الكامل في تبويبات التاجر.
                </p>
              </div>

              <form onSubmit={handleApplyDeveloperSettings} className="space-y-8">
                
                {/* 1. Theme Color Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                    اختر اللون الرئيسي للمتجر (Theme Color Accent):
                  </h3>
                  <p className="text-xs text-gray-400 font-medium font-sans">سيتم تطبيق هذا اللون على كامل أزرار المتجر، السلة وهواتف الاتصال فوراً بمرونة تامة.</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {[
                      { id: 'amber', name: 'الذهبي / الكهرماني', bg: 'bg-amber-500' },
                      { id: 'blue', name: 'الأزرق الكلاسيكي', bg: 'bg-blue-600' },
                      { id: 'emerald', name: 'الأخضر الزمردي', bg: 'bg-emerald-600' },
                      { id: 'indigo', name: 'النيلي الهادئ', bg: 'bg-indigo-600' },
                      { id: 'rose', name: 'الوردي الحيوي', bg: 'bg-rose-600' },
                      { id: 'red', name: 'الأحمر الناري', bg: 'bg-red-600' },
                      { id: 'violet', name: 'البنفسجي الجذاب', bg: 'bg-violet-600' },
                      { id: 'slate', name: 'الرمادي الفولاذي', bg: 'bg-slate-700' },
                    ].map((colorItem) => (
                      <button
                        key={colorItem.id}
                        type="button"
                        onClick={() => setCurrentThemeColor(colorItem.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-right cursor-pointer ${
                          currentThemeColor === colorItem.id 
                            ? 'border-gray-900 bg-gray-50/50 shadow-xs' 
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${colorItem.bg} shrink-0 shadow-xs`} />
                        <span className="text-xs font-bold text-gray-700">{colorItem.name}</span>
                        {currentThemeColor === colorItem.id && <Check size={12} className="text-gray-950 mr-auto shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Font Family Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                    اختر الخط العربي والافتراضي للموقع (Font Family):
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">خطوط مميزة ومصححة للمتاجر الإلكترونية وتناسب جميع أجهزة الجوال.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                    {[
                      { id: 'Tajawal', name: 'خط تجوال متناسق', style: 'font-sans font-medium' },
                      { id: 'Cairo', name: 'خط القاهرة الرياضي', style: 'font-serif font-black' },
                      { id: 'Almarai', name: 'خط المراعي الناعم', style: 'font-medium' },
                      { id: 'Inter', name: 'خط Inter الغربي', style: 'font-sans font-semibold' }
                    ].map((fontItem) => (
                      <button
                        key={fontItem.id}
                        type="button"
                        onClick={() => setCurrentFontFamily(fontItem.id)}
                        className={`flex flex-col gap-1 p-4 rounded-2xl border transition-all text-right cursor-pointer ${
                          currentFontFamily === fontItem.id 
                            ? 'border-gray-900 bg-gray-50/50 shadow-xs' 
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xs font-bold text-gray-900">{fontItem.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">Font: {fontItem.id}</span>
                        <span className="text-base text-gray-500 mt-2 block" style={{ fontFamily: fontItem.id }}>
                          أحذية مميزة بأسعار رائعة
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Merchant Tab Visibility Control */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                    تخصيص تبويبات لوحة التحكم المتاحة مسبقاً للتاجر:
                  </h3>
                  <p className="text-xs text-gray-400 font-medium font-sans">التبويبات التي سيسمح لشركاء العمل والتاجر باستعراضها والتعامل معها لتقليل التشتيت وزيادة الإنتاجية.</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    {[
                      { id: 'stats', label: 'إحصائيات المبيعات والنشاط' },
                      { id: 'products', label: 'إدارة الكتالوج والأحذية' },
                      { id: 'orders', label: 'إدارة طلبات الشراء والفرز' },
                      { id: 'store', label: 'عناوين التواصل وعملة المتجر' },
                    ].map((tabCtrl) => {
                      const isChecked = visibleTabs.includes(tabCtrl.id);
                      return (
                        <label 
                          key={tabCtrl.id}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all select-none ${
                            isChecked 
                              ? 'border-gray-900 bg-gray-50/50' 
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-amber-550 focus:ring-amber-500"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setVisibleTabs([...visibleTabs, tabCtrl.id]);
                              } else {
                                setVisibleTabs(visibleTabs.filter(id => id !== tabCtrl.id));
                              }
                            }}
                          />
                          <span className="text-xs font-bold text-gray-750">{tabCtrl.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3.5 Dynamic Navbar Categories Customization */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                    تعديل وتبويبات وحقول النيف بار (Dynamic Navbar Tabs Picker):
                  </h3>
                  <p className="text-xs text-gray-400 font-medium font-sans">
                    تعديل وتخصيص التبويبات المتاحة للزبائن لمشاهدة وتصفية الكتالوج في أعلى النيف بار. ميزة حصرية لإعادة هيكلة المتجر بمرونة:
                  </p>

                  {/* Add New Category form controls */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="امثلة: كلاسيك 👑، أحذية جري ⚡، عروض التصفية 🏷️"
                      className="px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-right focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-hidden flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCatName.trim()) {
                          const id = newCatName.trim();
                          if (!categoriesList.some(cat => cat.id === id)) {
                            setCategoriesList([...categoriesList, { id, name: id }]);
                          }
                          setNewCatName('');
                        }
                      }}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus size={14} />
                      تثبيت وإدراج تبويب جديد
                    </button>
                  </div>

                  {/* Display list of current categories */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {/* Hardcoded 'all' category (always first / un-deletable) */}
                    <div className="p-3 bg-gray-100 rounded-2xl border border-gray-200/50 flex justify-between items-center text-xs font-bold text-gray-500 select-none">
                      <span>الكل 👟 (افتراضي دائم)</span>
                    </div>

                    {categoriesList.map((cat, index) => (
                      <div key={cat.id} className="p-3 bg-white rounded-2xl border border-gray-150 flex justify-between items-center text-xs font-bold text-gray-800 shadow-2xs hover:border-gray-300 transition-all">
                        <span>{cat.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCategoriesList(categoriesList.filter((_, i) => i !== index));
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="حذف هذا التبويب"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Credentials Configuration */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                    تخصيص بيانات الدخول وحماية الخصوصية (Credential Protections):
                  </h3>
                  <p className="text-xs text-gray-400 font-medium font-sans">استخدم معلومات مميزة لحسابات الدخول بدل المحددة مسبقاً لحظر المخترقين والزوار المتطفلين عن تغيير البيانات.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 text-right">
                    
                    {/* Merchant Login Data */}
                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-3.5">
                      <h4 className="text-xs font-black text-gray-700 flex items-center gap-1.5 justify-end">
                        <User size={14} className="text-blue-500" />
                        حساب التاجر المشرف لدخول لوحة القيادة:
                      </h4>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500">البريد الإلكتروني للتاجر:</label>
                        <input
                          type="email"
                          value={mEmailInput}
                          onChange={(e) => setMEmailInput(e.target.value)}
                          className="px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-mono text-left focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500">كلمة المرور للتاجر:</label>
                        <input
                          type="password"
                          value={mPassInput}
                          onChange={(e) => setMPassInput(e.target.value)}
                          className="px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-mono text-left focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                          required
                        />
                      </div>
                    </div>

                    {/* Developer/Admin Login Data */}
                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-3.5">
                      <h4 className="text-xs font-black text-gray-700 flex items-center gap-1.5 justify-end">
                        <Key size={14} className="text-purple-500" />
                        حساب المطور والمدير العام (الوصول الكامل):
                      </h4>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500">البريد الإلكتروني للرئيس/المطور:</label>
                        <input
                          type="email"
                          value={dEmailInput}
                          onChange={(e) => setDEmailInput(e.target.value)}
                          className="px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-mono text-left focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400">كلمة المرور للرئيس/المطور:</label>
                        <input
                          type="password"
                          value={dPassInput}
                          onChange={(e) => setDPassInput(e.target.value)}
                          className="px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-mono text-left focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                          required
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-5 border-t border-gray-150">
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <Save size={18} />
                    حفظ وإقرار كامل تفاصيل المظهر والتطبيقات ⚙️
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* CONFIGS PANEL & APPWRITE MODULER */}
          {activeTab === 'configs' && role === 'admin' && (
            <div className="space-y-6">
              <AppwriteSetup onConfigApplied={onRefreshData} />
            </div>
          )}

        </div>
      </div>

      {/* CREATE & EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative z-10 text-right leading-relaxed"
            >
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 cursor-pointer"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-black text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                <Layers className="text-amber-500" size={24} />
                {editingProduct ? 'تعديل حذاء موجود بالكامل' : 'إضافة حذاء جديد للمخازن الحية'}
              </h2>

              <form onSubmit={handleSubmitProduct} className="space-y-5 text-sm font-semibold">
                
                {/* Inputs rows */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500 block">اسم الحذاء التجاري:</label>
                    <input
                      type="text"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="مثال: نايكي رانينغ جلايد سوفت"
                      className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500 block">الماركة / الشركة المنتجة:</label>
                    <input
                      type="text"
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500 block">التصنيف الإطاري:</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden cursor-pointer"
                    >
                      {categoriesList.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs text-gray-500 block">الوصف والمزايا:</label>
                    <textarea
                      value={pDescription}
                      onChange={(e) => setPDescription(e.target.value)}
                      rows={3}
                      placeholder="أذكر مزايا الجلد، خفة النعل، الاستخدام، الخ..."
                      className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden resize-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500 block">السعر المعروض للبيع حالياً ({settings.currency}):</label>
                    <input
                      type="number"
                      value={pPrice || ''}
                      onChange={(e) => setPPrice(Number(e.target.value))}
                      className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500 block">السعر الأصلي قبل الخصم (اختياري، للشطب):</label>
                    <input
                      type="number"
                      value={pOriginalPrice}
                      onChange={(e) => setPOriginalPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                      className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* SIZES INPUT ROW */}
                <div className="border border-gray-100 p-4 rounded-2xl bg-gray-50/50 space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">تحديد مقاسات الحذاء المتوفرة:</span>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {pSizes.map(sz => (
                      <span key={sz} className="bg-amber-100 text-amber-900 font-bold px-2 py-1 rounded-sm text-xs flex items-center gap-1.5">
                        {sz}
                        <button type="button" onClick={() => removeSize(sz)} className="hover:text-red-600 focus:outline-hidden cursor-pointer">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="مقاس جديد (مثال: 41)"
                      value={newSizeInput}
                      onChange={(e) => setNewSizeInput(e.target.value !== '' ? Number(e.target.value) : '')}
                      className="px-3 py-1.5 bg-white text-xs rounded-lg border border-gray-200 w-36 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={addSize}
                      className="bg-gray-850 hover:bg-gray-950 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg border cursor-pointer"
                    >
                      إضافة المقاس
                    </button>
                  </div>
                </div>

                {/* COLORS INPUT ROW */}
                <div className="border border-gray-100 p-4 rounded-2xl bg-gray-50/50 space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">تحديد عينات الألوان المتوفرة:</span>
                  <div className="flex flex-wrap gap-2.5 mb-2">
                    {pColors.map(col => (
                      <span key={col} className="p-1 border border-gray-200 rounded-full flex items-center gap-1">
                        <span className="w-5 h-5 rounded-full block shadow-inner" style={{ backgroundColor: col }} />
                        <button 
                          type="button" 
                          onClick={() => removeColor(col)} 
                          className="text-xs text-gray-500 hover:text-red-500 px-1 font-bold cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorInput}
                      onChange={(e) => setNewColorInput(e.target.value)}
                      className="w-10 h-10 p-0 border border-gray-200 rounded-lg cursor-pointer bg-white"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="bg-gray-850 hover:bg-gray-950 text-white font-extrabold text-xs px-3 py-2 rounded-lg border cursor-pointer"
                    >
                      إدراج هذا اللون
                    </button>
                  </div>
                </div>

                {/* IMAGE URLS FIELDS */}
                <div className="border border-gray-100 p-4 rounded-2xl bg-gray-50/50 space-y-3">
                  <span className="text-xs font-bold text-gray-700 block">روابط صور الحذاء (URLs):</span>
                  <div className="space-y-1.5">
                    {pImages.map((imgUrl, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="url"
                          value={imgUrl}
                          onChange={(e) => {
                            const updated = [...pImages];
                            updated[idx] = e.target.value;
                            setPImages(updated);
                          }}
                          placeholder="رابط الصورة المفتوح (HTTPS)"
                          className="flex-1 px-3 py-2 bg-white text-xs rounded-lg border border-gray-200 outline-hidden font-mono"
                          required
                        />
                        {pImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageIdx(idx)}
                            className="text-red-500 p-2 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2.5">
                    <input
                      type="url"
                      placeholder="رابط صور إضافي لزوايا أخرى..."
                      value={newImageInput}
                      onChange={(e) => setNewImageInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white text-xs rounded-lg border border-gray-200 outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={addImageField}
                      className="bg-gray-850 hover:bg-gray-950 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg border cursor-pointer"
                    >
                      أضف رابط تفاصيلي
                    </button>
                  </div>
                </div>

                {/* Switches */}
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={pInStock}
                      onChange={(e) => setPInStock(e.target.checked)}
                      className="pointer-events-none hidden"
                    />
                    {pInStock ? <ToggleRight className="text-green-600 font-extrabold" size={32} /> : <ToggleLeft className="text-gray-400" size={32} />}
                    <span className="text-xs font-bold">متوفر للبيع ومتاح للإضافة للسلة</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none border-r border-gray-100 pr-6">
                    <input
                      type="checkbox"
                      checked={pFeatured}
                      onChange={(e) => setPFeatured(e.target.checked)}
                      className="pointer-events-none hidden"
                    />
                    {pFeatured ? <ToggleRight className="text-amber-500" size={32} /> : <ToggleLeft className="text-gray-400" size={32} />}
                    <span className="text-xs font-bold">تمييز المنتج بالصفحة الرئيسية (Featured)</span>
                  </label>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex gap-3 justify-end pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2.5 bg-gray-150 hover:bg-gray-250 text-gray-800 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    إلغاء التعديل
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    {loading && <Loader2 className="animate-spin" size={14} />}
                    {editingProduct ? 'حفظ الحذاء والتحديث الفوري' : 'عرضه ونشره حياً بالمتجر'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
