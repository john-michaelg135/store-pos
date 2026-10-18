import { useMemo } from 'react';
import { TrendingUp, Package, Receipt, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';
import { getProducts, getTransactions } from '../store';

export default function Dashboard() {
  const products = getProducts();
  const transactions = getTransactions();

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const week = 7 * day;

    const todayTx = transactions.filter(t => now - t.timestamp < day);
    const weekTx = transactions.filter(t => now - t.timestamp < week);

    const todayRevenue = todayTx.reduce((sum, t) => sum + t.total, 0);
    const weekRevenue = weekTx.reduce((sum, t) => sum + t.total, 0);
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

    const lowStock = products.filter(p => p.stock <= 10);
    const outOfStock = products.filter(p => p.stock === 0);

    const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

    // Top selling products
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.product.id]) {
          productSales[item.product.id] = { name: item.product.name, qty: 0, revenue: 0 };
        }
        productSales[item.product.id].qty += item.quantity;
        productSales[item.product.id].revenue += item.product.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Daily sales for last 7 days
    const dailySales: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - i * day;
      const dayEnd = dayStart - day;
      const dayTx = transactions.filter(t => t.timestamp <= dayStart && t.timestamp > dayEnd);
      const dayTotal = dayTx.reduce((sum, t) => sum + t.total, 0);
      const date = new Date(dayStart).toLocaleDateString('en-PH', { weekday: 'short' });
      dailySales.unshift({ date, total: dayTotal });
    }

    const maxDailySale = Math.max(...dailySales.map(d => d.total), 1);

    return {
      todayRevenue,
      weekRevenue,
      totalRevenue,
      todayTxCount: todayTx.length,
      weekTxCount: weekTx.length,
      totalTxCount: transactions.length,
      lowStock,
      outOfStock,
      totalItems,
      topProducts,
      dailySales,
      maxDailySale,
    };
  }, [products, transactions]);

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Dashboard</h1>
        <p className="text-sm text-[#808080] dark:text-[#666]">Overview of your store</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-5 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[#B38B6D]" />
            <span className="text-xs text-[#808080] dark:text-[#666] uppercase tracking-wider">Today</span>
          </div>
          <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">₱{stats.todayRevenue.toFixed(2)}</p>
          <p className="text-xs text-[#808080] dark:text-[#666] mt-1">{stats.todayTxCount} transactions</p>
        </div>
        <div className="p-5 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#B38B6D]" />
            <span className="text-xs text-[#808080] dark:text-[#666] uppercase tracking-wider">This Week</span>
          </div>
          <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">₱{stats.weekRevenue.toFixed(2)}</p>
          <p className="text-xs text-[#808080] dark:text-[#666] mt-1">{stats.weekTxCount} transactions</p>
        </div>
        <div className="p-5 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-[#B38B6D]" />
            <span className="text-xs text-[#808080] dark:text-[#666] uppercase tracking-wider">All Time</span>
          </div>
          <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">₱{stats.totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-[#808080] dark:text-[#666] mt-1">{stats.totalTxCount} transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Sales Chart */}
        <div className="p-5 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#1a1a1a] dark:text-white">Last 7 Days</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.dailySales.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-[#808080] dark:text-[#666] font-mono">
                  {day.total > 0 ? `₱${day.total.toFixed(0)}` : '—'}
                </span>
                <div
                  className="w-full bg-[#B38B6D] dark:bg-[#B38B6D]/80 rounded-t-[2px] transition-all min-h-[2px]"
                  style={{ height: `${(day.total / stats.maxDailySale) * 100}%` }}
                />
                <span className="text-[10px] text-[#808080] dark:text-[#666]">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="p-5 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#1a1a1a] dark:text-white">Top Selling</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-[#808080] dark:text-[#666] py-4 text-center">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-[#F5F1E8] dark:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white rounded-[2px]">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-[#1a1a1a] dark:text-white">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#F5F1E8] dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#B38B6D] rounded-full"
                          style={{ width: `${(product.qty / stats.topProducts[0].qty) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#808080] dark:text-[#666] font-mono">{product.qty} sold</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventory Overview */}
        <div className="p-5 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-[#1a1a1a] dark:text-white">
            <Package className="w-4 h-4" />
            Inventory
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">{products.length}</p>
              <p className="text-xs text-[#808080] dark:text-[#666]">Total Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1a1a] dark:text-white">{stats.totalItems}</p>
              <p className="text-xs text-[#808080] dark:text-[#666]">Total Items</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="p-5 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-[#1a1a1a] dark:text-white">
            <AlertTriangle className="w-4 h-4" />
            Low Stock Alert
          </h3>
          {stats.lowStock.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 py-2">
              <ShoppingCart className="w-4 h-4" />
              <span>All items well stocked</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {stats.lowStock.map(product => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-[#1a1a1a] dark:text-white">{product.name}</span>
                  <span className={`font-mono font-bold ${product.stock === 0 ? 'text-red-500' : 'text-[#B38B6D]'}`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
