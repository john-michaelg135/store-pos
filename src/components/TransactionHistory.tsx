import { useState, useMemo, useEffect } from 'react';
import { Clock, Receipt, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Transaction } from '../types';
import { getTransactions } from '../store';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const handleSync = () => setTransactions(getTransactions());
    window.addEventListener('storage', handleSync);
    window.addEventListener('tindahan:data-imported', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('tindahan:data-imported', handleSync);
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    return transactions.filter(t => {
      if (dateFilter === 'all') return true;
      if (dateFilter === 'today') return now - t.timestamp < day;
      if (dateFilter === 'week') return now - t.timestamp < 7 * day;
      if (dateFilter === 'month') return now - t.timestamp < 30 * day;
      return true;
    });
  }, [transactions, dateFilter]);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const todayTx = transactions.filter(t => now - t.timestamp < day);
    const todayTotal = todayTx.reduce((sum, t) => sum + t.total, 0);
    const allTotal = transactions.reduce((sum, t) => sum + t.total, 0);

    return {
      todayCount: todayTx.length,
      todayTotal,
      allCount: transactions.length,
      allTotal,
    };
  }, [transactions]);

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id);
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto w-full h-full lg:h-[calc(100dvh-64px)] flex flex-col min-h-0 lg:overflow-hidden">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <h1 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Transaction History</h1>
        <p className="text-sm text-[#808080] dark:text-[#666]">{transactions.length} total transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 shrink-0">
        <div className="p-4 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <p className="text-xs text-[#808080] dark:text-[#666] uppercase tracking-wider">Today Sales</p>
          <p className="text-xl font-bold mt-1 text-[#1a1a1a] dark:text-white">₱{stats.todayTotal.toFixed(2)}</p>
        </div>
        <div className="p-4 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <p className="text-xs text-[#808080] dark:text-[#666] uppercase tracking-wider">Today Txns</p>
          <p className="text-xl font-bold mt-1 text-[#1a1a1a] dark:text-white">{stats.todayCount}</p>
        </div>
        <div className="p-4 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <p className="text-xs text-[#808080] dark:text-[#666] uppercase tracking-wider">All Time Sales</p>
          <p className="text-xl font-bold mt-1 text-[#1a1a1a] dark:text-white">₱{stats.allTotal.toFixed(2)}</p>
        </div>
        <div className="p-4 border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a]">
          <p className="text-xs text-[#808080] dark:text-[#666] uppercase tracking-wider">All Txns</p>
          <p className="text-xl font-bold mt-1 text-[#1a1a1a] dark:text-white">{stats.allCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Filter className="w-4 h-4 text-[#808080] dark:text-[#666]" />
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-[#808080]/30 dark:border-[#444] rounded-[2px] bg-white dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-white text-sm focus:outline-none focus:border-[#000] dark:focus:border-white"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="space-y-2 lg:flex-1 lg:min-h-0 lg:overflow-y-auto pr-1 pb-4">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#808080] dark:text-[#666]">
            <Receipt className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs mt-1">Sales will appear here</p>
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <div
              key={transaction.id}
              className="border border-[#808080]/20 dark:border-[#333] rounded-[2px] bg-white dark:bg-[#1a1a1a] overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleExpand(transaction.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#F5F1E8]/30 dark:hover:bg-[#2a2a2a]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#F5F1E8] dark:bg-[#2a2a2a] rounded-[2px]">
                    <Receipt className="w-4 h-4 text-[#B38B6D]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                      {transaction.items.length} item{transaction.items.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-[#808080] dark:text-[#666] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(transaction.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#1a1a1a] dark:text-white">₱{transaction.total.toFixed(2)}</span>
                  {expandedId === transaction.id ? (
                    <ChevronUp className="w-4 h-4 text-[#808080] dark:text-[#666]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#808080] dark:text-[#666]" />
                  )}
                </div>
              </button>

              {expandedId === transaction.id && (
                <div className="px-4 pb-4 border-t border-[#808080]/10 dark:border-[#333] pt-3">
                  <div className="space-y-1">
                    {transaction.items.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm text-[#1a1a1a] dark:text-white">
                        <span className="text-[#808080] dark:text-[#999]">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="font-mono">₱{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-dashed border-[#808080]/20 dark:border-[#444] grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[#808080] dark:text-[#666]">Total</span>
                      <p className="font-bold text-[#1a1a1a] dark:text-white">₱{transaction.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[#808080] dark:text-[#666]">Cash</span>
                      <p className="font-bold text-[#1a1a1a] dark:text-white">₱{transaction.cash.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[#808080] dark:text-[#666]">Change</span>
                      <p className="font-bold text-[#1a1a1a] dark:text-white">₱{transaction.change.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
