import { Product, Transaction } from './types';

const PRODUCTS_KEY = 'tindahan_products';
const TRANSACTIONS_KEY = 'tindahan_transactions';

const defaultProducts: Product[] = [
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
];

export function getProducts(): Product[] {
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (!data) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  return JSON.parse(data);
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
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
  const cats = new Set(products.map(p => p.category));
  return ['All', ...Array.from(cats).sort()];
}
