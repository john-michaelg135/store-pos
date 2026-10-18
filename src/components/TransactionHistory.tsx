import { useState, useMemo, useEffect } from 'react';
import { Clock, Receipt, ChevronDown, ChevronUp, Filter, Trash2, X, AlertTriangle } from 'lucide-react';
import { Transaction } from '../types';
import { getTransactions, clearTransactions } from '../store';

interface ThemedModalState {
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [modal, setModal] = useState<ThemedModalState | null>(null);

  useEffect(() => {
    const handleSync = () => setTransactions(getTransactions());
    window.addEventListener('storage', handleSync);
    window.addEventListener('tindahan:data-imported', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('tindahan:data-imported', handleSync);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && modal) {
        setModal(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal]);

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

  function handleClearHistory() {
    setModal({
      type: 'danger',
      title: 'Clear Transaction History',
      message: 'Are you sure you want to clear all transaction records? This will delete all sales history and reset revenue metrics.',
      details: [
        `${transactions.length} transactions will be permanently deleted`,
        `Total sales recorded: ₱${stats.allTotal.toFixed(2)}`,
        'This action cannot be undone unless you have a saved backup file',
      ],
      confirmLabel: 'Clear History',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        clearTransactions();
        setTransactions([]);
      },
    });
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto w-full h-full lg:h-[calc(100dvh-64px)] flex flex-col min-h-0 lg:overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Transaction History</h1>
          <p className="text-sm text-[#808080] dark:text-[#666]">{transactions.length} total transactions</p>
        </div>
        {transactions.length > 0 && (
          <button
            onClick={handleClearHistory}
            title="Clear all transaction history"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-red-50 dark:hover:bg-red-950/20 text-[#808080] dark:text-[#999] hover:text-red-500 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
        )}
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

      {/* Themed Confirmation Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => {
            if (!modal.cancelLabel && modal.onConfirm) {
              modal.onConfirm();
            }
            setModal(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-[4px] w-full max-w-md p-6 border border-[#808080]/20 dark:border-[#333] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-[2px] flex items-center justify-center shrink-0 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1a1a1a] dark:text-white">
                  {modal.title}
                </h3>
                <p className="text-sm text-[#666] dark:text-[#aaa] mt-1 leading-relaxed">
                  {modal.message}
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="text-[#808080] dark:text-[#666] hover:text-[#000] dark:hover:text-white transition-colors p-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modal.details && modal.details.length > 0 && (
              <div className="bg-[#F5F1E8]/70 dark:bg-[#252525] p-3 rounded-[2px] border border-[#808080]/15 dark:border-[#3a3a3a] space-y-1.5 text-xs">
                {modal.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[#444] dark:text-[#ccc]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#808080] dark:bg-[#777] shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              {modal.cancelLabel && (
                <button
                  onClick={() => setModal(null)}
                  className="px-4 py-2 border border-[#808080]/30 dark:border-[#444] text-xs font-semibold rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white transition-colors"
                >
                  {modal.cancelLabel}
                </button>
              )}
              <button
                onClick={() => {
                  const action = modal.onConfirm;
                  setModal(null);
                  if (action) action();
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-[2px] transition-colors"
              >
                {modal.confirmLabel || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
