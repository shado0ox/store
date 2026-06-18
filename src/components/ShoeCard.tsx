import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, Star, Info, MessageCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShoeCardProps {
  product: Product;
  onAddToCart: (product: Product, size: number, color: string) => void;
  onQuickOrder: (product: Product, size: number, color: string) => void;
  currency: string;
  key?: any;
}

export default function ShoeCard({ product, onAddToCart, onQuickOrder, currency }: ShoeCardProps) {
  const [selectedSize, setSelectedSize] = useState<number>(product.sizes[0] || 41);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || '#111827');
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    onAddToCart(product, selectedSize, selectedColor);
  };

  return (
    <>
      <motion.div
        layout
        id={`shoe-card-${product.id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        {/* Floating Badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {product.featured && (
            <span className="bg-yellow-400 text-yellow-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
              متميز ✨
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
              خصم {discountPercentage}% 🔥
            </span>
          )}
          {!product.inStock && (
            <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
              نفذت الكمية 🚫
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={() => setShowDetailModal(true)}
          className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-xs hover:scale-110 transition-transform cursor-pointer"
          title="تفاصيل سريعة"
        >
          <Info size={18} />
        </button>

        {/* Product Image Stage */}
        <div 
          onClick={() => setShowDetailModal(true)}
          className="relative h-64 w-full bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-radial from-transparent to-black/5 opacity-40"></div>
          
          <motion.img
            animate={{
              scale: isHovered ? 1.08 : 1,
              rotate: isHovered ? -3 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            src={product.images[activeImageIdx] || product.images[0]}
            alt={product.name}
            className="h-44 object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] select-none pointer-events-none transition-all"
            referrerPolicy="no-referrer"
          />

          {/* Multiple Images Dot Navigation */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    activeImageIdx === idx ? 'bg-gray-800 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Body Details */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-1 h-12">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
              {product.brand}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 mr-auto">
              <Star size={13} fill="currentColor" />
              <span className="text-xs font-semibold">4.8</span>
            </div>
          </div>

          {/* Sizing selection panel */}
          <div className="mb-4">
            <span className="text-xs text-gray-400 block mb-1.5">المقاسات المتوفرة:</span>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-9 h-9 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    selectedSize === size
                      ? 'bg-gray-900 text-white shadow-xs scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color selection bullets */}
          <div className="mb-5 flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-400 block mb-1">اللون المحدد:</span>
              <div className="flex gap-1.5">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border cursor-pointer transition-transform duration-200 shadow-inner ${
                      selectedColor === color
                        ? 'border-gray-900 scale-125 ring-2 ring-gray-100'
                        : 'border-gray-200 hover:scale-110'
                    }`}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-baseline gap-2 mb-3.5">
              <span className="text-2xl font-extrabold text-gray-900">
                {product.price.toLocaleString()} {currency}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()} {currency}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCartClick}
                disabled={!product.inStock}
                className={`py-3 px-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  product.inStock
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={15} />
                أضف للسلة
              </button>

              <button
                onClick={() => onQuickOrder(product, selectedSize, selectedColor)}
                disabled={!product.inStock}
                className={`py-3 px-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  product.inStock
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <MessageCircle size={15} />
                طلب سريع
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto rtl-grid"
            >
              {/* Product Views Left Side */}
              <div className="bg-gray-50 p-6 md:p-8 flex flex-col justify-between items-center relative">
                {/* Back button */}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="absolute top-4 right-4 bg-white hover:bg-gray-100 p-2 rounded-full shadow-md text-gray-800 transition-colors z-20 cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="my-auto py-8">
                  <motion.img
                    src={product.images[activeImageIdx] || product.images[0]}
                    alt={product.name}
                    className="max-h-72 object-contain drop-shadow-2xl mx-auto"
                    layoutId={`img-${product.id}`}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Multiple Images Selector */}
                <div className="flex gap-2.5 overflow-x-auto py-2">
                  {product.images.map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIdx(index)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-white flex items-center justify-center p-1.5 transition-all cursor-pointer ${
                        activeImageIdx === index ? 'border-amber-500 scale-105 shadow-md' : 'border-gray-200'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="object-contain max-h-full" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Right Side */}
              <div className="p-6 md:p-8 flex flex-col justify-between bg-white text-right">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full uppercase">
                      {product.brand}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                    {!product.inStock && (
                      <span className="text-xs bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full">
                        غير متوفر في المخزن
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                    {product.name}
                  </h2>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-black text-gray-900">
                      {product.price.toLocaleString()} {currency}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {product.originalPrice.toLocaleString()} {currency}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-bold text-gray-500">تفاصيل المنتج:</h4>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {product.description}
                    </p>
                  </div>

                  {/* Size Choices */}
                  <div className="mb-6">
                    <span className="text-sm font-bold text-gray-500 block mb-2">اختر المقاس:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-11 h-11 text-sm font-extrabold rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            selectedSize === size
                              ? 'bg-gray-900 text-white shadow-md scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Choices */}
                  <div className="mb-6">
                    <span className="text-sm font-bold text-gray-500 block mb-2">اختر اللون:</span>
                    <div className="flex gap-2.5">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          style={{ backgroundColor: color }}
                          className={`w-8 h-8 rounded-full border cursor-pointer transition-all ${
                            selectedColor === color
                              ? 'border-gray-900 scale-125 ring-4 ring-amber-100'
                              : 'border-gray-200 hover:scale-110'
                          }`}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Confirm Buy Action */}
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCartClick}
                      disabled={!product.inStock}
                      className={`w-full py-4 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        product.inStock
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:translate-y-0.5'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag size={18} />
                      إضافة إلى سلة المشتريات
                    </button>

                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        onQuickOrder(product, selectedSize, selectedColor);
                      }}
                      disabled={!product.inStock}
                      className={`w-full py-4 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        product.inStock
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 active:translate-y-0.5'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle size={18} />
                      شراء سريع الآن
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-400">
                    * سنقوم بتوجيهك فوراً لتأكيد طلبك عبر واتساب أو ماسينجر
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
