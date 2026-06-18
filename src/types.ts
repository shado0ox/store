export interface Product {
  id: string; // Document ID
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  sizes: number[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  brand: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  selectedSize: number;
  selectedColor: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: string | CartItemSummary[]; // JSON string or parsed array representing CartItemSummary[]
  totalPrice: number;
  status: 'pending' | 'shipping' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface CartItemSummary {
  productId: string;
  productName: string;
  price: number;
  size: number;
  color: string;
  quantity: number;
}

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  productsCollectionId: string;
  ordersCollectionId: string;
}

export interface MerchantSettings {
  whatsappNumber: string; // e.g. "201012345678"
  messengerUsername: string; // e.g. "shoestore.ar"
  currency: string; // e.g. "ج.م"
  storeName: string;
  storeSlogan: string;
  themeColor?: 'amber' | 'blue' | 'indigo' | 'emerald' | 'rose' | 'slate' | 'violet' | 'red';
  fontFamily?: 'Tajawal' | 'Cairo' | 'Almarai' | 'Inter';
  visibleTabs?: string[]; // stats, products, orders, store, dev
  merchantEmail?: string;
  merchantPassword?: string;
  devEmail?: string;
  devPassword?: string;
  categories?: { id: string; name: string }[];
}

export type UserRole = 'customer' | 'merchant' | 'admin';

export const getThemeClasses = (themeColor?: string) => {
  const color = themeColor || 'amber';
  switch (color) {
    case 'blue':
      return {
        bg: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        text: 'text-blue-600',
        border: 'border-blue-600',
        accentBg: 'bg-blue-50',
        accentText: 'text-blue-700',
        shadow: 'shadow-blue-500/20',
        ring: 'focus:ring-blue-500/20 focus:border-blue-500'
      };
    case 'emerald':
      return {
        bg: 'bg-emerald-600',
        hover: 'hover:bg-emerald-700',
        text: 'text-emerald-600',
        border: 'border-emerald-600',
        accentBg: 'bg-emerald-50',
        accentText: 'text-emerald-700',
        shadow: 'shadow-emerald-500/20',
        ring: 'focus:ring-emerald-500/20 focus:border-emerald-500'
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-600',
        hover: 'hover:bg-indigo-700',
        text: 'text-indigo-600',
        border: 'border-indigo-600',
        accentBg: 'bg-indigo-50',
        accentText: 'text-indigo-700',
        shadow: 'shadow-indigo-500/20',
        ring: 'focus:ring-indigo-500/20 focus:border-indigo-500'
      };
    case 'rose':
      return {
        bg: 'bg-rose-600',
        hover: 'hover:bg-rose-700',
        text: 'text-rose-600',
        border: 'border-rose-600',
        accentBg: 'bg-rose-50',
        accentText: 'text-rose-700',
        shadow: 'shadow-rose-500/20',
        ring: 'focus:ring-rose-500/20 focus:border-rose-500'
      };
    case 'red':
      return {
        bg: 'bg-red-600',
        hover: 'hover:bg-red-700',
        text: 'text-red-600',
        border: 'border-red-600',
        accentBg: 'bg-red-50',
        accentText: 'text-red-700',
        shadow: 'shadow-red-500/20',
        ring: 'focus:ring-red-500/20 focus:border-red-500'
      };
    case 'violet':
      return {
        bg: 'bg-violet-600',
        hover: 'hover:bg-violet-700',
        text: 'text-violet-600',
        border: 'border-violet-600',
        accentBg: 'bg-violet-50',
        accentText: 'text-violet-700',
        shadow: 'shadow-violet-500/20',
        ring: 'focus:ring-violet-500/20 focus:border-violet-500'
      };
    case 'slate':
      return {
        bg: 'bg-slate-700',
        hover: 'hover:bg-slate-800',
        text: 'text-slate-700',
        border: 'border-slate-700',
        accentBg: 'bg-slate-50',
        accentText: 'text-slate-800',
        shadow: 'shadow-slate-500/20',
        ring: 'focus:ring-slate-500/20 focus:border-slate-500'
      };
    case 'amber':
    default:
      return {
        bg: 'bg-amber-500',
        hover: 'hover:bg-amber-600',
        text: 'text-amber-500',
        border: 'border-amber-500',
        accentBg: 'bg-amber-50',
        accentText: 'text-amber-700',
        shadow: 'shadow-amber-500/20',
        ring: 'focus:ring-amber-500/20 focus:border-amber-500'
      };
  }
};
