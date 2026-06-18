import React, { useState, useEffect } from 'react';
import { Product, Order, MerchantSettings, UserRole } from '../types';
import { appwriteService } from '../lib/appwrite';
import { 
  Plus, Edit, Trash2, Settings, ClipboardList, Check, X, TrendingUp, 
  ShoppingBag, Archive, DollarSign, Loader2, Phone, Save, Zap, 
  ChevronRight, RefreshCw, Layers, ToggleLeft, ToggleRight, User, Key, Users
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
  
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'configs' | 'store'>('stats');
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

  // Active inputs helpers
  const [newSizeInput, setNewSizeInput] = useState<number | ''>('');
  const [newColorInput, setNewColorInput] = useState('#111827');
  const [newImageInput, setNewImageInput] = useState('');

  // Search and Filters
  const [productSearch, setProductSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'shipping' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    setSWhatsapp(settings.whatsappNumber);
    setSMessenger(settings.messengerUsername);
    setSCurrency(settings.currency);
    setSStoreName(settings.storeName);
    setSStoreSlogan(settings.storeSlogan);
  }, [settings]);

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
      whatsappNumber: sWhatsapp,
      messengerUsername: sMessenger,
      currency: sCurrency,
      storeName: sStoreName,
      storeSlogan: sStoreSlogan
    });
    alert('تم حفظ إعدادات الاتصال وبينايات المتجر بنجاح!');
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-right rtl-grid" id="admin-board-view">
      
      {/* Role and Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <User size={13} />
              رتبتك: {role === 'admin' ? 'المدير العام 👑' : 'التاجر / المشرف 💼'}
            </span>
            <span className="text-xs bg-gray-800 text-white font-mono px-3 py-1 rounded-full">
              PWA PANEL
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">لوحة القيادة الإدارية للمتجر</h1>
          <p className="text-sm text-gray-500">مرحباً بك في لوحة الاستعلامات الشاملة وإدارة الكتالوجات والطلب.</p>
        </div>

        {/* Change Role Simulator Switcher */}
        <div className="flex items-center gap-2.5 mr-auto">
          <span className="text-xs font-semibold text-gray-400">محاكاة الصلاحيات:</span>
          <div className="bg-gray-100 rounded-2xl p-1 flex gap-1">
            <button
              onClick={() => onChangeRole('merchant')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'merchant' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              تاجر / مشرف
            </button>
            <button
              onClick={() => onChangeRole('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'admin' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              المدير العام (الكل)
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex xl:flex-row flex-col gap-6" id="dashboard-tab-layout">
        <div className="flex xl:flex-col flex-row gap-2 overflow-x-auto pb-2 xl:pb-0 w-full xl:w-64 shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'stats' 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={18} />
            إحصائيات المبيعات والنشاط
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'products' 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Archive size={18} />
            إدارة الأحذية ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ClipboardList size={18} />
            إدارة الطلبات المستلمة ({orders.length})
            {stats.pendingOrders > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {stats.pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'store' 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings size={18} />
            عناوين الاتصال والعملات
          </button>

          {role === 'admin' && (
            <button
              onClick={() => setActiveTab('configs')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'configs' 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
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

                <div className="flex justify-end pt-3">
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
                      <option value="أحذية رياضية">أحذية رياضية</option>
                      <option value="أحذية كاجوال">أحذية كاجوال</option>
                      <option value="أحذية كلاسيك">أحذية كلاسيك</option>
                      <option value="أحذية نسائية">أحذية نسائية</option>
                      <option value="أطفال ونشء">أطفال ونشء</option>
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
