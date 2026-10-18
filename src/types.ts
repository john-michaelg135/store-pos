export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode?: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  cash: number;
  change: number;
  timestamp: number;
}

export type View = 'pos' | 'products' | 'history' | 'dashboard';

export interface StoreBackup {
  version: string;
  appName: string;
  exportDate: string;
  theme?: string;
  products: Product[];
  transactions: Transaction[];
  stats?: {
    totalProducts: number;
    totalStock: number;
    totalInventoryValue: number;
    totalTransactions: number;
    totalRevenue: number;
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
  productCount: number;
  transactionCount: number;
}
