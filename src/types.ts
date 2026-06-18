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
  items: string; // JSON string representing CartItemSummary[]
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
}

export type UserRole = 'customer' | 'merchant' | 'admin';
