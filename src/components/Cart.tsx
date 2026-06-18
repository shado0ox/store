import React, { useState } from 'react';
import { CartItem, MerchantSettings, Order, CartItemSummary } from '../types';
import { appwriteService } from '../lib/appwrite';
import { 
  X, ShoppingBag, Plus, Minus, Trash2, ArrowLeft, MessageSquare, 
  Send, ShieldCheck, ShoppingCart, User, Phone, MapPin, Notebook, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, size: number, color: string, change: number) => void;
  onRemoveItem: (productId: string, size: number, color: string) => void;
  onClearCart: () => void;
  settings: MerchantSettings;
}

export default function Cart({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings
}: CartProps) {
  
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || cart.length === 0) return;

    setSubmitting(true);

    try {
      // 1. Prepare items summary for db payload
      const orderSummary: CartItemSummary[] = cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity
      }));

      const orderPayload = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: JSON.stringify(orderSummary),
        totalPrice: totalAmount,
        status: 'pending' as const,
        notes: notes || undefined,
        createdAt: new Date().toISOString()
      };

      // 2. Submit to database client (appwrite / local storage)
      const newOrder = await appwriteService.createOrder(orderPayload);
      setCreatedOrder(newOrder);
      setStep('success');
    } catch (err) {
      console.error('Error recording order:', err);
      alert('حدث خطأ أثناء حجز طلبك على السيرفر، سنقوم بالتوجيه للطلب المباشر يدوياً للتأكيد!');
      setStep('success');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate Message Text for WhatsApp / Messenger Integration
  const generateMessageBody = () => {
    const formattedDate = new Date().toLocaleDateString('ar-SA');
    const itemsText = cart.map((item, idx) => {
      return `${idx + 1} - 👟 الحذاء: ${item.product.name}
      📐 المقاس: ${item.selectedSize}
      🎨 اللون: ${item.selectedColor}
      🔢 الكمية: ${item.quantity}
      💰 السعر: ${item.product.price.toLocaleString()} ${settings.currency}`;
    }).join('\n\n');

    return `السلام عليكم ورحمة الله، أريد طلب هذه الأحذية من متجركم خطوات الأناقة:
------------------------------------------
🗓️ تاريخ الطلب: ${formattedDate}

🛒 تفاصيل سلة المشتريات:
${itemsText}

------------------------------------------
📦 البيانات الشخصية وعنوان الشحن والتوصيل:
👤 الإسم الكريم : ${name || 'غير محدد'}
📞 رقم الهاتف: ${phone || 'غير محدد'}
📍 العنوان التفصيلي للتوصيل: ${address || 'غير محدد'}
${notes ? `📝 ملاحظات إضافية: ${notes}` : ''}

------------------------------------------
💰 المبلغ الإجمالي المطلوب الدفع: ${totalAmount.toLocaleString()} ${settings.currency}

* لسرعة تأكيد الطلب، تم تسجيل وحجز الطلب رقم (#${createdOrder?.id || 'المحلي'}) على السيرفر وقاعدة البيانات بشكل فوري. يرجى تأكيد توفر المقاسات وأوقات الاستلام وشحن العينات الآن وبسرعة!`;
  };

  const triggerWhatsApp = () => {
    const body = generateMessageBody();
    const formattedNumber = settings.whatsappNumber.replace(/[+\s-]/g, '');
    const url = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const triggerMessenger = () => {
    const url = `https://m.me/${settings.messengerUsername}`;
    window.open(url, '_blank');
  };

  const handleFinish = () => {
    onClearCart();
    setStep('cart');
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setCreatedOrder(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 text-right rtl-grid" id="global-shopping-cart-drawer">
          
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Right Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-amber-500" size={22} />
                <h2 className="text-lg font-black text-gray-900">سلة المشتريات والطلب</h2>
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItemsCount} قطع
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-800 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Body Screens */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* SCREEN 1: CART REVIEWS */}
              {step === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={38} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">سلة مشترياتك فارغة!</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                          تصفح أرقى موديلات الأحذية الرياضية والكلاسيكية وأضف ما يعجبك لتأكيده معنا بنقرة سريعة.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {cart.map((item, idx) => (
                        <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="py-4 flex gap-4">
                          <img src={item.product.images[0]} alt="" className="w-16 h-16 object-contain bg-gray-50 rounded-xl border border-gray-100" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 truncate">{item.product.name}</h4>
                            
                            {/* Selected choices indicators */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-extrabold">
                                مقاس: {item.selectedSize}
                              </span>
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                لون:
                                <span className="w-2.5 h-2.5 rounded-full inline-block border border-gray-200" style={{ backgroundColor: item.selectedColor }} />
                              </span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-3.5">
                              <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-150">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor, -1)}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="px-3.5 text-xs font-black text-gray-900">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor, 1)}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <button
                                onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                                className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* SCREEN 2: SHIPPING DATA CHECKOUT */}
              {step === 'checkout' && (
                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="bg-amber-50/50 p-3.5 rounded-2xl text-xs text-amber-800 leading-relaxed border border-amber-100">
                    * سنقوم بتجهيز عينات الأحذية بالكامل، تفضل بإدخال بيانات الشحن لحجز الطلب وإرسال تفاصيل المراسلة فوراً.
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <User size={14} className="text-amber-500" />
                      الإسم الكريم للعميل:
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اكتب اسم العميل الثلاثي"
                      className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <Phone size={14} className="text-amber-500" />
                      رقم الهاتف للتواصل والمطابقة:
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="مثال: 0102345678"
                      className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <MapPin size={14} className="text-amber-500" />
                      عنوان الشحن والمحافظة بالتفصيل:
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="مثال: القاهرة، مدينة نصر، شارع عباس العقاد"
                      className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <Notebook size={14} className="text-amber-500" />
                      أي ملاحظات أخرى (اختياري):
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أي معلومات إضافية تخص الشحن أو أوقات الاستلام"
                      rows={2.5}
                      className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-4 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  >
                    {submitting ? 'حجز مسودة الطلب بالسيرفر...' : 'تأكيد الحجز والإرسال للمتجر'}
                  </button>
                </form>
              )}

              {/* SCREEN 3: SUCCESS AND QUICK SOCIAL ROUTER */}
              {step === 'success' && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-md shadow-green-100">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">تم حجز طلب الأحذية بنجاح!</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      تم رفع مبيعات الطلب رقم (#{createdOrder?.id}) لجدول Appwrite. يرجى المتابعة وتأكيد إرسال الفاتورة عبر روابط التواصل السريعة للتاجر:
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <button
                      onClick={triggerWhatsApp}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-green-500/10 cursor-pointer"
                    >
                      <MessageCircle size={20} />
                      تأكيد الطلب الفوري عبـر واتساب 🟢
                    </button>

                    <button
                      onClick={triggerMessenger}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      <MessageSquare size={20} />
                      تأكيد الطلب المباشر عبر فيسبوك ماسينجر 🔵
                    </button>
                  </div>

                  <button
                    onClick={handleFinish}
                    className="w-full mt-10 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    إنهاء وإغلاق السلة
                  </button>
                </div>
              )}

            </div>

            {/* Footer summary */}
            {cart.length > 0 && step !== 'success' && (
              <div className="p-5 border-t border-gray-150 bg-gray-50 space-y-4">
                <div className="space-y-1.5 text-xs text-gray-500 font-bold">
                  <div className="flex justify-between">
                    <span>قيمة المشتريات الفرعية:</span>
                    <span className="text-gray-900">{totalAmount.toLocaleString()} {settings.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مصاريف الشحن والتسليم:</span>
                    <span className="text-green-600">توصيل مجاني لجميع المحافظات 🎁</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-t border-gray-150 text-gray-800 font-black">
                    <span>الإجمالي الكلي:</span>
                    <span className="text-gray-950 text-base">{totalAmount.toLocaleString()} {settings.currency}</span>
                  </div>
                </div>

                {step === 'cart' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onClearCart()}
                      className="py-3 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      تفريغ السلة
                    </button>
                    <button
                      onClick={() => setStep('checkout')}
                      className="py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Send size={14} />
                      المتابعة وإدخال الشحن
                    </button>
                  </div>
                )}

                {step === 'checkout' && (
                  <button
                    onClick={() => setStep('cart')}
                    className="w-full py-3 bg-gray-150 hover:bg-gray-250 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    الرجوع لتعديل سلة الأحذية
                  </button>
                )}
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
