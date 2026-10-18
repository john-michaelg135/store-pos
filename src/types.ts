export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode?: string;
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
