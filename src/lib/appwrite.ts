import { Client, Databases, ID, Query } from 'appwrite';
import { Product, Order, AppwriteConfig } from '../types';
import { DEFAULT_SHOES } from '../data/defaultProducts';

// Local storage keys
const APPWRITE_CONFIG_KEY = 'shoe_store_appwrite_config';
const PRODUCTS_LOCAL_KEY = 'shoe_store_products_local';
const ORDERS_LOCAL_KEY = 'shoe_store_orders_local';

class AppwriteService {
  private client: Client | null = null;
  private databases: Databases | null = null;
  private config: AppwriteConfig | null = null;

  constructor() {
    this.loadSavedConfig();
  }

  // Load configuration from local storage or environment variables
  private loadSavedConfig() {
    try {
      const saved = localStorage.getItem(APPWRITE_CONFIG_KEY);
      if (saved) {
        this.config = JSON.parse(saved);
      } else {
        // Try environment variables as template fallback
        const _meta = import.meta as any;
        const endpoint = _meta.env?.VITE_APPWRITE_ENDPOINT || '';
        const projectId = _meta.env?.VITE_APPWRITE_PROJECT_ID || '';
        const databaseId = _meta.env?.VITE_APPWRITE_DATABASE_ID || '';
        const productsCol = _meta.env?.VITE_APPWRITE_COLLECTION_PRODUCTS_ID || '';
        const ordersCol = _meta.env?.VITE_APPWRITE_COLLECTION_ORDERS_ID || '';

        if (endpoint && projectId && databaseId && productsCol && ordersCol) {
          this.config = {
            endpoint,
            projectId,
            databaseId,
            productsCollectionId: productsCol,
            ordersCollectionId: ordersCol,
          };
        }
      }

      if (this.config && this.config.endpoint && this.config.projectId) {
        this.client = new Client()
          .setEndpoint(this.config.endpoint)
          .setProject(this.config.projectId);
        this.databases = new Databases(this.client);
        console.log('Appwrite client initialized successfully');
      }
    } catch (e) {
      console.error('Failed to load Appwrite configuration:', e);
    }
  }

  // Save/Update configuration at runtime
  public setConfig(config: AppwriteConfig | null) {
    if (!config) {
      localStorage.removeItem(APPWRITE_CONFIG_KEY);
      this.config = null;
      this.client = null;
      this.databases = null;
      return;
    }

    localStorage.setItem(APPWRITE_CONFIG_KEY, JSON.stringify(config));
    this.config = config;
    this.client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId);
    this.databases = new Databases(this.client);
    console.log('Appwrite client re-initialized with new configuration');
  }

  public getConfig(): AppwriteConfig | null {
    return this.config;
  }

  public isConnected(): boolean {
    return this.client !== null && this.databases !== null && this.config !== null;
  }

  // --- PRODUCTS OPERATIONS ---

  public async getProducts(): Promise<Product[]> {
    if (this.isConnected() && this.databases && this.config) {
      try {
        const response = await this.databases.listDocuments(
          this.config.databaseId,
          this.config.productsCollectionId,
          [Query.orderDesc('createdAt')]
        );
        
        const products: Product[] = response.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          description: doc.description,
          price: doc.price,
          originalPrice: doc.originalPrice || undefined,
          images: typeof doc.images === 'string' ? JSON.parse(doc.images) : doc.images || [],
          category: doc.category,
          sizes: typeof doc.sizes === 'string' ? JSON.parse(doc.sizes) : doc.sizes || [],
          colors: typeof doc.colors === 'string' ? JSON.parse(doc.colors) : doc.colors || [],
          inStock: doc.inStock,
          featured: doc.featured || false,
          brand: doc.brand,
          createdAt: doc.createdAt || new Date().toISOString()
        }));

        // Back up to LocalStorage
        localStorage.setItem(PRODUCTS_LOCAL_KEY, JSON.stringify(products));
        return products;
      } catch (error) {
        console.error('Appwrite failed fetching products, falling back to local cache', error);
        return this.getLocalProducts();
      }
    } else {
      return this.getLocalProducts();
    }
  }

  private getLocalProducts(): Product[] {
    const cached = localStorage.getItem(PRODUCTS_LOCAL_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return DEFAULT_SHOES;
      }
    }
    // Set default initial shoes
    localStorage.setItem(PRODUCTS_LOCAL_KEY, JSON.stringify(DEFAULT_SHOES));
    return DEFAULT_SHOES;
  }

  private saveLocalProducts(products: Product[]) {
    localStorage.setItem(PRODUCTS_LOCAL_KEY, JSON.stringify(products));
  }

  public async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const id = 'prod_' + Math.random().toString(36).substr(2, 9);
    const newProduct: Product = { ...productData, id };

    if (this.isConnected() && this.databases && this.config) {
      try {
        const docData = {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          originalPrice: productData.originalPrice || null,
          images: JSON.stringify(productData.images),
          category: productData.category,
          sizes: JSON.stringify(productData.sizes),
          colors: JSON.stringify(productData.colors),
          inStock: productData.inStock,
          featured: productData.featured,
          brand: productData.brand,
          createdAt: productData.createdAt
        };

        const response = await this.databases.createDocument(
          this.config.databaseId,
          this.config.productsCollectionId,
          ID.unique(),
          docData
        );

        newProduct.id = response.$id;
      } catch (e) {
        console.error('Appwrite: Error creating product. Saved locally.', e);
      }
    }

    // Always update local cache
    const local = this.getLocalProducts();
    const updatedList = [newProduct, ...local];
    this.saveLocalProducts(updatedList);
    return newProduct;
  }

  public async updateProduct(id: string, updatedFields: Partial<Product>): Promise<Product> {
    let local = this.getLocalProducts();
    const index = local.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const updatedProduct = { ...local[index], ...updatedFields };

    if (this.isConnected() && this.databases && this.config && !id.startsWith('def-prod-') && !id.startsWith('prod_')) {
      try {
        const docData: any = {};
        if (updatedFields.name !== undefined) docData.name = updatedFields.name;
        if (updatedFields.description !== undefined) docData.description = updatedFields.description;
        if (updatedFields.price !== undefined) docData.price = updatedFields.price;
        if (updatedFields.originalPrice !== undefined) docData.originalPrice = updatedFields.originalPrice;
        if (updatedFields.images !== undefined) docData.images = JSON.stringify(updatedFields.images);
        if (updatedFields.category !== undefined) docData.category = updatedFields.category;
        if (updatedFields.sizes !== undefined) docData.sizes = JSON.stringify(updatedFields.sizes);
        if (updatedFields.colors !== undefined) docData.colors = JSON.stringify(updatedFields.colors);
        if (updatedFields.inStock !== undefined) docData.inStock = updatedFields.inStock;
        if (updatedFields.featured !== undefined) docData.featured = updatedFields.featured;
        if (updatedFields.brand !== undefined) docData.brand = updatedFields.brand;

        await this.databases.updateDocument(
          this.config.databaseId,
          this.config.productsCollectionId,
          id,
          docData
        );
      } catch (e) {
        console.error('Appwrite: Error updating product. Saved locally.', e);
      }
    }

    local[index] = updatedProduct;
    this.saveLocalProducts(local);
    return updatedProduct;
  }

  public async deleteProduct(id: string): Promise<void> {
    if (this.isConnected() && this.databases && this.config && !id.startsWith('def-prod-') && !id.startsWith('prod_')) {
      try {
        await this.databases.deleteDocument(
          this.config.databaseId,
          this.config.productsCollectionId,
          id
        );
      } catch (e) {
        console.error('Appwrite: Error deleting product.', e);
      }
    }

    const local = this.getLocalProducts();
    const filtered = local.filter(p => p.id !== id);
    this.saveLocalProducts(filtered);
  }


  // --- ORDERS OPERATIONS ---

  public async getOrders(): Promise<Order[]> {
    if (this.isConnected() && this.databases && this.config) {
      try {
        const response = await this.databases.listDocuments(
          this.config.databaseId,
          this.config.ordersCollectionId,
          [Query.orderDesc('createdAt')]
        );

        const orders: Order[] = response.documents.map((doc: any) => ({
          id: doc.$id,
          customerName: doc.customerName,
          customerPhone: doc.customerPhone,
          customerAddress: doc.customerAddress,
          items: doc.items,
          totalPrice: doc.totalPrice,
          status: doc.status || 'pending',
          notes: doc.notes || undefined,
          createdAt: doc.createdAt || new Date().toISOString()
        }));

        localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
        return orders;
      } catch (error) {
        console.error('Appwrite failed fetching orders, using local storage', error);
        return this.getLocalOrders();
      }
    } else {
      return this.getLocalOrders();
    }
  }

  private getLocalOrders(): Order[] {
    const cached = localStorage.getItem(ORDERS_LOCAL_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  private saveLocalOrders(orders: Order[]) {
    localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(orders));
  }

  public async createOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
    const id = 'order_' + Math.random().toString(36).substr(2, 9);
    const newOrder: Order = { ...orderData, id };

    if (this.isConnected() && this.databases && this.config) {
      try {
        const response = await this.databases.createDocument(
          this.config.databaseId,
          this.config.ordersCollectionId,
          ID.unique(),
          {
            customerName: orderData.customerName,
            customerPhone: orderData.customerPhone,
            customerAddress: orderData.customerAddress,
            items: orderData.items,
            totalPrice: orderData.totalPrice,
            status: orderData.status,
            notes: orderData.notes || '',
            createdAt: orderData.createdAt
          }
        );
        newOrder.id = response.$id;
      } catch (e) {
        console.error('Appwrite: Error storing order. Stored locally.', e);
      }
    }

    const local = this.getLocalOrders();
    const updated = [newOrder, ...local];
    this.saveLocalOrders(updated);
    return newOrder;
  }

  public async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const local = this.getLocalOrders();
    const index = local.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const updatedOrder = { ...local[index], status };

    if (this.isConnected() && this.databases && this.config && !id.startsWith('order_')) {
      try {
        await this.databases.updateDocument(
          this.config.databaseId,
          this.config.ordersCollectionId,
          id,
          { status }
        );
      } catch (e) {
        console.error('Appwrite: Error updating order status. Updated locally.', e);
      }
    }

    local[index] = updatedOrder;
    this.saveLocalOrders(local);
    return updatedOrder;
  }

  public async deleteOrder(id: string): Promise<void> {
    if (this.isConnected() && this.databases && this.config && !id.startsWith('order_')) {
      try {
        await this.databases.deleteDocument(
          this.config.databaseId,
          this.config.ordersCollectionId,
          id
        );
      } catch (e) {
        console.error('Appwrite: Error deleting order.', e);
      }
    }

    const local = this.getLocalOrders();
    const filtered = local.filter(o => o.id !== id);
    this.saveLocalOrders(filtered);
  }
}

export const appwriteService = new AppwriteService();
