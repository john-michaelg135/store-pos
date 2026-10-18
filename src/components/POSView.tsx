import { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingBag, Banknote, X } from 'lucide-react';
import { Product, CartItem, Transaction } from '../types';
import { getProducts, saveProducts, saveTransaction, generateId } from '../store';
import ProductImage from './ProductImage';

export default function POSView() {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showCheckout, setShowCheckout] = useState(false);
  const [cashInput, setCashInput] = useState('');
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchSearch && matchCategory && p.stock > 0;
    });
  }, [products, search, activeCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }

  function handleCheckout() {
    setShowCheckout(true);
    setCashInput('');
  }

  function completeSale() {
    const cash = parseFloat(cashInput);
    if (isNaN(cash) || cash < cartTotal) return;

    const transaction: Transaction = {
      id: generateId(),
      items: cart,
      total: cartTotal,
      cash,
      change: cash - cartTotal,
      timestamp: Date.now(),
    };

    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });

    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    saveTransaction(transaction);
    setLastTransaction(transaction);
    setCart([]);
    setShowCheckout(false);
    setCashInput('');
  }

  function closeReceipt() {
    setLastTransaction(null);
  }

  const quickCash = [20, 50, 100, 200, 500, 1000];

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-full min-h-[calc(100dvh-64px)]">
      {/* Product Grid */}
      <div className="flex-1 p-4 lg:p-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080] dark:text-[#666]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#808080]/30 dark:border-[#444] rounded-[2px] bg-white dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-white text-sm focus:outline-none focus:border-[#000] dark:focus:border-white focus:ring-1 focus:ring-[#000] dark:focus:ring-white transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[2px] whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-[#000] dark:bg-white text-white dark:text-[#000]'
                  : 'bg-[#F5F1E8] dark:bg-[#2a2a2a] text-[#808080] dark:text-[#999] hover:bg-[#B38B6D]/20 dark:hover:bg-[#3a3a3a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 lg:gap-3">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="relative flex flex-col items-start p-2 lg:p-3 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a] hover:border-[#000] dark:hover:border-white hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)] transition-all text-left group active:scale-[0.98]"
            >
              <ProductImage src={product.image} category={product.category} alt={product.name} size="lg" />
              <span className="text-[10px] text-[#808080] dark:text-[#666] uppercase tracking-wider mt-2">{product.category}</span>
              <span className="text-sm font-medium mt-0.5 leading-tight text-[#1a1a1a] dark:text-white truncate w-full">{product.name}</span>
              <div className="flex items-center justify-between w-full mt-1.5">
                <span className="text-sm font-bold text-[#1a1a1a] dark:text-white">₱{product.price.toFixed(2)}</span>
                <span className="text-[10px] text-[#808080] dark:text-[#666]">{product.stock} left</span>
              </div>
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-[#808080] dark:text-[#666]">
            <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No products found</p>
          </div>
        )}
      </div>

      {/* Cart Panel */}
      <div className="lg:w-[380px] border-t lg:border-t-0 lg:border-l border-[#808080]/20 dark:border-[#333] bg-[#F5F1E8]/30 dark:bg-[#111]/50 flex flex-col transition-colors">
        <div className="p-4 border-b border-[#808080]/20 dark:border-[#333]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1a1a1a] dark:text-white">Cart</h2>
            <span className="text-xs text-[#808080] dark:text-[#666]">{cartCount} items</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#808080] dark:text-[#666]">
              <ShoppingBag className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-3 p-2 bg-white dark:bg-[#1a1a1a] rounded-[2px] border border-[#808080]/10 dark:border-[#333] transition-colors">
                <ProductImage src={item.product.image} category={item.product.category} alt={item.product.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-[#1a1a1a] dark:text-white">{item.product.name}</p>
                  <p className="text-xs text-[#808080] dark:text-[#666]">₱{item.product.price} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-6 h-6 flex items-center justify-center border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-[#1a1a1a] dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-6 h-6 flex items-center justify-center border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-bold w-16 text-right text-[#1a1a1a] dark:text-white">
                  ₱{(item.product.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="w-6 h-6 flex items-center justify-center text-[#808080] dark:text-[#666] hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 border-t border-[#808080]/20 dark:border-[#333] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#808080] dark:text-[#666]">Total</span>
            <span className="text-xl font-bold text-[#1a1a1a] dark:text-white">₱{cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 bg-[#000] dark:bg-white text-white dark:text-[#000] text-sm font-semibold rounded-[2px] hover:bg-[#1a1a1a] dark:hover:bg-[#e5e5e5] active:translate-y-[1px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            CHARGE — ₱{cartTotal.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[4px] w-full max-w-sm p-6 space-y-4 border border-[#808080]/20 dark:border-[#333]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Checkout</h3>
              <button onClick={() => setShowCheckout(false)} className="text-[#808080] dark:text-[#666] hover:text-[#000] dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-3 border border-[#808080]/20 dark:border-[#333] rounded-[2px]">
              <p className="text-xs text-[#808080] dark:text-[#666] uppercase tracking-wider">Total Amount</p>
              <p className="text-3xl font-bold mt-1 text-[#1a1a1a] dark:text-white">₱{cartTotal.toFixed(2)}</p>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666] mb-1 block">Cash Received</label>
              <input
                type="number"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-[#808080]/30 dark:border-[#444] rounded-[2px] text-2xl font-bold text-center bg-white dark:bg-[#0f0f0f] text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#000] dark:focus:border-white focus:ring-1 focus:ring-[#000] dark:focus:ring-white"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {quickCash.map(amount => (
                <button
                  key={amount}
                  onClick={() => setCashInput(amount.toString())}
                  className="py-2 text-sm font-medium border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white transition-colors"
                >
                  ₱{amount}
                </button>
              ))}
            </div>

            {!isNaN(parseFloat(cashInput)) && parseFloat(cashInput) >= cartTotal && (
              <div className="text-center py-2 bg-[#F5F1E8] dark:bg-[#2a2a2a] rounded-[2px]">
                <p className="text-xs text-[#808080] dark:text-[#666]">Change</p>
                <p className="text-xl font-bold text-[#B38B6D]">₱{(parseFloat(cashInput) - cartTotal).toFixed(2)}</p>
              </div>
            )}

            <button
              onClick={completeSale}
              disabled={!cashInput || isNaN(parseFloat(cashInput)) || parseFloat(cashInput) < cartTotal}
              className="w-full py-3 bg-[#000] dark:bg-white text-white dark:text-[#000] text-sm font-semibold rounded-[2px] hover:bg-[#1a1a1a] dark:hover:bg-[#e5e5e5] active:translate-y-[1px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Banknote className="w-4 h-4 inline mr-2" />
              COMPLETE SALE
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {lastTransaction && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[4px] w-full max-w-sm p-6 space-y-4 border border-[#808080]/20 dark:border-[#333]">
            <div className="text-center border-b border-dashed border-[#808080]/30 dark:border-[#444] pb-4">
              <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">TINDAHAN</h3>
              <p className="text-xs text-[#808080] dark:text-[#666]">Sari Sari Store</p>
              <p className="text-xs text-[#808080] dark:text-[#666] mt-1">
                {new Date(lastTransaction.timestamp).toLocaleString('en-PH')}
              </p>
            </div>

            <div className="space-y-1">
              {lastTransaction.items.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm text-[#1a1a1a] dark:text-white">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>₱{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-[#808080]/30 dark:border-[#444] pt-3 space-y-1">
              <div className="flex justify-between text-sm font-bold text-[#1a1a1a] dark:text-white">
                <span>TOTAL</span>
                <span>₱{lastTransaction.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#808080] dark:text-[#999]">
                <span>Cash</span>
                <span>₱{lastTransaction.cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1a1a1a] dark:text-white">
                <span>Change</span>
                <span>₱{lastTransaction.change.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-xs text-[#808080] dark:text-[#666] pt-2">
              <p>Salamat sa pagbili!</p>
            </div>

            <button
              onClick={closeReceipt}
              className="w-full py-3 bg-[#000] dark:bg-white text-white dark:text-[#000] text-sm font-semibold rounded-[2px] hover:bg-[#1a1a1a] dark:hover:bg-[#e5e5e5] transition-all"
            >
              NEW TRANSACTION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
