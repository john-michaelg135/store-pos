import { Product, Transaction, StoreBackup, ImportResult } from './types';

const PRODUCTS_KEY = 'tindahan_products';
const TRANSACTIONS_KEY = 'tindahan_transactions';

export const BASE_CATEGORIES = [
  'Drinks',
  'Snacks',
  'Noodles',
  'Canned Goods',
  'Condiments',
  'Staples',
  'Cleaning',
  'Personal',
  'Medicine',
  'Others',
];

export const defaultProducts: Product[] = [
  { id: '1', name: 'Coke 8oz', price: 15, category: 'Drinks', stock: 48 },
  { id: '2', name: 'Royal 8oz', price: 15, category: 'Drinks', stock: 36 },
  { id: '3', name: 'Sprite 8oz', price: 15, category: 'Drinks', stock: 36 },
  { id: '4', name: 'Water 500ml', price: 10, category: 'Drinks', stock: 60 },
  { id: '5', name: 'Red Horse 330ml', price: 25, category: 'Drinks', stock: 24 },
  { id: '6', name: 'SkyFlakes', price: 12, category: 'Snacks', stock: 30 },
  { id: '7', name: 'Rebisco', price: 8, category: 'Snacks', stock: 40 },
  { id: '8', name: 'Chippy', price: 10, category: 'Snacks', stock: 25 },
  { id: '9', name: 'Nova', price: 12, category: 'Snacks', stock: 20 },
  { id: '10', name: 'Piattos', price: 15, category: 'Snacks', stock: 18 },
  { id: '11', name: 'Lucky Me Pancit Canton', price: 14, category: 'Noodles', stock: 50 },
  { id: '12', name: 'Lucky Me La Paz Batchoy', price: 14, category: 'Noodles', stock: 40 },
  { id: '13', name: 'Payless Sinigang', price: 12, category: 'Noodles', stock: 30 },
  { id: '14', name: 'Alaska Milk 150ml', price: 18, category: 'Drinks', stock: 24 },
  { id: '15', name: 'Nescafe 3-in-1', price: 8, category: 'Drinks', stock: 100 },
  { id: '16', name: 'Sardines', price: 22, category: 'Canned Goods', stock: 30 },
  { id: '17', name: 'Corned Beef', price: 35, category: 'Canned Goods', stock: 20 },
  { id: '18', name: 'Tuna Flakes', price: 28, category: 'Canned Goods', stock: 24 },
  { id: '19', name: 'Vinegar 350ml', price: 18, category: 'Condiments', stock: 15 },
  { id: '20', name: 'Soy Sauce 350ml', price: 20, category: 'Condiments', stock: 15 },
  { id: '21', name: 'Cooking Oil 250ml', price: 35, category: 'Condiments', stock: 12 },
  { id: '22', name: 'Rice 1kg', price: 60, category: 'Staples', stock: 50 },
  { id: '23', name: 'Sugar 1/4kg', price: 20, category: 'Staples', stock: 40 },
  { id: '24', name: 'Salt', price: 12, category: 'Condiments', stock: 30 },
  // Cleaning
  { id: '25', name: 'Ariel Powder 50g', price: 14, category: 'Cleaning', stock: 35 },
  { id: '26', name: 'Joy Dishwashing 250ml', price: 25, category: 'Cleaning', stock: 20 },
  { id: '27', name: 'Downy Sachet', price: 10, category: 'Cleaning', stock: 40 },
  // Personal
  { id: '28', name: 'Safeguard Soap 60g', price: 22, category: 'Personal', stock: 30 },
  { id: '29', name: 'Palmolive Shampoo', price: 8, category: 'Personal', stock: 50 },
  { id: '30', name: 'Colgate Sachet', price: 12, category: 'Personal', stock: 30 },
  // Medicine
  { id: '31', name: 'Biogesic 500mg', price: 10, category: 'Medicine', stock: 100 },
  { id: '32', name: 'Neozep Forte', price: 12, category: 'Medicine', stock: 60 },
  { id: '33', name: 'Bioflu 500mg', price: 12, category: 'Medicine', stock: 50 },
  // Others
  { id: '34', name: 'White Candle', price: 8, category: 'Others', stock: 25 },
  { id: '35', name: 'Matches (Posporo)', price: 5, category: 'Others', stock: 40 },
];

export function getProducts(): Product[] {
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (!data) {
    // In production, start with a clean empty inventory so the store is ready for real products.
    // In development mode, load demo products for convenient testing.
    const initial = import.meta.env.PROD ? [] : defaultProducts;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function clearAllProducts(): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
}

export function loadDemoProducts(): Product[] {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
  return defaultProducts;
}

export function getTransactions(): Transaction[] {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveTransaction(transaction: Transaction): void {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getCategories(products: Product[]): string[] {
  const cats = new Set([...BASE_CATEGORIES, ...products.map(p => p.category)]);
  return ['All', ...Array.from(cats)];
}

export function exportBackup(): void {
  const products = getProducts();
  const transactions = getTransactions();
  const theme = localStorage.getItem('tindahan_theme') || 'auto';

  const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);
  const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.total) || 0), 0);

  const backup: StoreBackup = {
    version: '1.1',
    appName: 'Tindahan Store POS',
    exportDate: new Date().toISOString(),
    theme,
    products,
    transactions,
    stats: {
      totalProducts: products.length,
      totalStock,
      totalInventoryValue,
      totalTransactions: transactions.length,
      totalRevenue,
    },
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  a.download = `tindahan-backup-${dateStr}-${timeStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(jsonString: string): ImportResult {
  try {
    const data = JSON.parse(jsonString);

    let productsToImport: Product[] | null = null;
    let transactionsToImport: Transaction[] | null = null;
    let themeToImport: string | null = null;

    if (Array.isArray(data)) {
      // Legacy raw products array
      productsToImport = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.products)) {
        productsToImport = data.products;
      }
      if (Array.isArray(data.transactions)) {
        transactionsToImport = data.transactions;
      }
      if (typeof data.theme === 'string') {
        themeToImport = data.theme;
      }
    }

    if (!productsToImport && !transactionsToImport) {
      return {
        success: false,
        message: 'Invalid backup file format. Expected a Tindahan backup file with products or transactions.',
        productCount: 0,
        transactionCount: 0,
      };
    }

    let productCount = 0;
    if (productsToImport) {
      const validProducts: Product[] = productsToImport
        .filter((p: any) => p && typeof p.name === 'string' && typeof p.price === 'number')
        .map((p: any) => ({
          id: p.id || generateId(),
          name: String(p.name).trim(),
          price: Number(p.price) || 0,
          category: String(p.category || 'Others').trim(),
          stock: Number(p.stock) || 0,
          barcode: p.barcode ? String(p.barcode) : undefined,
          image: p.image ? String(p.image) : undefined,
        }));
      saveProducts(validProducts);
      productCount = validProducts.length;
    }

    let transactionCount = 0;
    if (transactionsToImport) {
      const validTransactions: Transaction[] = transactionsToImport
        .filter((t: any) => t && typeof t.total === 'number')
        .map((t: any) => ({
          id: t.id || generateId(),
          items: Array.isArray(t.items) ? t.items : [],
          total: Number(t.total) || 0,
          cash: Number(t.cash) || 0,
          change: Number(t.change) || 0,
          timestamp: Number(t.timestamp) || Date.now(),
        }));
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(validTransactions));
      transactionCount = validTransactions.length;
    }

    if (themeToImport && ['light', 'dark', 'auto'].includes(themeToImport)) {
      localStorage.setItem('tindahan_theme', themeToImport);
      const root = document.documentElement;
      const isDark =
        themeToImport === 'dark' ||
        (themeToImport === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }

    // Broadcast change so any active listeners update
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tindahan:data-imported'));

    return {
      success: true,
      message: 'Backup restored successfully.',
      productCount,
      transactionCount,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to parse backup JSON file.',
      productCount: 0,
      transactionCount: 0,
    };
  }
}

