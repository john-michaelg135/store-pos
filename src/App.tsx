import { useState } from 'react';
import { ShoppingCart, Package, History, LayoutDashboard, Menu, X } from 'lucide-react';
import { View } from './types';
import POSView from './components/POSView';
import ProductManager from './components/ProductManager';
import TransactionHistory from './components/TransactionHistory';
import Dashboard from './components/Dashboard';

const navItems: { id: View; label: string; icon: typeof ShoppingCart }[] = [
  { id: 'pos', label: 'POS', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'history', label: 'History', icon: History },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>('pos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function renderView() {
    switch (currentView) {
      case 'pos':
        return <POSView />;
      case 'products':
        return <ProductManager />;
      case 'history':
        return <TransactionHistory />;
      case 'dashboard':
        return <Dashboard />;
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-white border-b border-[#808080]/20">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#000] rounded-[2px] flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight">TINDAHAN</h1>
                <p className="text-[10px] text-[#808080] uppercase tracking-wider">Sari Sari Store POS</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[2px] transition-all ${
                      currentView === item.id
                        ? 'bg-[#000] text-white'
                        : 'text-[#808080] hover:text-[#000] hover:bg-[#F5F1E8]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#808080]/20 bg-white">
            <div className="p-2 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-[2px] transition-all ${
                      currentView === item.id
                        ? 'bg-[#000] text-white'
                        : 'text-[#808080] hover:text-[#000] hover:bg-[#F5F1E8]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {renderView()}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-[#808080]/20">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[2px] transition-all ${
                  currentView === item.id
                    ? 'text-[#000]'
                    : 'text-[#808080]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
