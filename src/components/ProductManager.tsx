import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Package, Search, Image as ImageIcon, Upload, Download, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { getProducts, saveProducts, generateId, BASE_CATEGORIES, clearAllProducts, loadDemoProducts, exportBackup, importBackup } from '../store';
import ProductImage from './ProductImage';

interface ThemedModalState {
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [modal, setModal] = useState<ThemedModalState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleSync = () => setProducts(getProducts());
    window.addEventListener('storage', handleSync);
    window.addEventListener('tindahan:data-imported', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('tindahan:data-imported', handleSync);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (modal) setModal(null);
        else if (showForm) setShowForm(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal, showForm]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });

  const categories = useMemo(() => {
    const cats = new Set([...BASE_CATEGORIES, ...products.map(p => p.category)]);
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'All' || p.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [products, search, filterCategory]);

  function openAdd() {
    setEditingProduct(null);
    setFormData({ name: '', price: '', category: '', stock: '', image: '' });
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image || '',
    });
    setShowForm(true);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 500KB for localStorage)
    if (file.size > 500 * 1024) {
      setModal({
        type: 'danger',
        title: 'Image Too Large',
        message: 'The selected image exceeds 500KB. Please choose a smaller image for local storage.',
        confirmLabel: 'Understood',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleSave() {
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);
    if (!formData.name || isNaN(price) || !formData.category || isNaN(stock)) return;

    let updated: Product[];
    if (editingProduct) {
      updated = products.map(p =>
        p.id === editingProduct.id
          ? { ...p, name: formData.name, price, category: formData.category, stock, image: formData.image || undefined }
          : p
      );
    } else {
      const newProduct: Product = {
        id: generateId(),
        name: formData.name,
        price,
        category: formData.category,
        stock,
        image: formData.image || undefined,
      };
      updated = [...products, newProduct];
    }

    saveProducts(updated);
    setProducts(updated);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    const prod = products.find(p => p.id === id);
    setModal({
      type: 'danger',
      title: 'Delete Product',
      message: `Are you sure you want to delete "${prod?.name || 'this product'}"? This product will be permanently removed from your inventory.`,
      confirmLabel: 'Delete Product',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        const updated = products.filter(p => p.id !== id);
        saveProducts(updated);
        setProducts(updated);
      },
    });
  }

  function handleClearAll() {
    setModal({
      type: 'danger',
      title: 'Clear All Products',
      message: 'Are you sure you want to clear all products? This will remove all items from inventory.',
      details: [
        `${products.length} products will be permanently removed`,
        'This action cannot be undone unless you have a saved backup file',
      ],
      confirmLabel: 'Clear All',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        clearAllProducts();
        setProducts([]);
      },
    });
  }

  function handleLoadDemo() {
    if (products.length > 0) {
      setModal({
        type: 'warning',
        title: 'Load Demo Products',
        message: 'Load sample demo products? This will replace your current store inventory with sample demo items.',
        details: [
          'All existing products in inventory will be replaced',
          'Use Backup before proceeding if you want to keep your current inventory',
        ],
        confirmLabel: 'Load Demo Items',
        cancelLabel: 'Cancel',
        onConfirm: () => {
          const demo = loadDemoProducts();
          setProducts(demo);
        },
      });
    } else {
      const demo = loadDemoProducts();
      setProducts(demo);
    }
  }

  function handleExportBackup() {
    exportBackup();
  }

  function triggerImportBackup() {
    backupFileInputRef.current?.click();
  }

  function handleImportBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        let parsed: any;
        try {
          parsed = JSON.parse(text);
        } catch {
          setModal({
            type: 'danger',
            title: 'Invalid Backup File',
            message: 'Failed to read file: The selected file is not a valid JSON document.',
            confirmLabel: 'Close',
          });
          return;
        }

        const pCount = Array.isArray(parsed)
          ? parsed.length
          : Array.isArray(parsed?.products)
          ? parsed.products.length
          : 0;
        const txCount = Array.isArray(parsed?.transactions) ? parsed.transactions.length : 0;

        setModal({
          type: 'info',
          title: 'Restore Store Backup',
          message: `Restore store data from "${file.name}"?`,
          details: [
            `${pCount} Products to be restored`,
            `${txCount} Transactions to be restored`,
            'Current inventory and transaction history will be replaced with this backup.',
          ],
          confirmLabel: 'Restore Store Data',
          cancelLabel: 'Cancel',
          onConfirm: () => {
            const result = importBackup(text);
            if (result.success) {
              setProducts(getProducts());
              setModal({
                type: 'success',
                title: 'Backup Restored Successfully',
                message: 'Your store data has been completely restored from the backup file.',
                details: [
                  `${result.productCount} products loaded into inventory`,
                  `${result.transactionCount} transactions recorded in history`,
                ],
                confirmLabel: 'Done',
              });
            } else {
              setModal({
                type: 'danger',
                title: 'Import Failed',
                message: `Error restoring backup: ${result.message}`,
                confirmLabel: 'Close',
              });
            }
          },
        });
      } finally {
        if (e.target) {
          e.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto w-full h-full lg:h-[calc(100dvh-64px)] flex flex-col min-h-0 lg:overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Products</h1>
          <p className="text-sm text-[#808080] dark:text-[#666]">{products.length} items in inventory</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hidden File Input for Backup Import */}
          <input
            ref={backupFileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportBackup}
            className="hidden"
          />

          <button
            onClick={handleExportBackup}
            title="Export all store data (products, transactions, settings)"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Backup
          </button>
          <button
            onClick={triggerImportBackup}
            title="Import store data from backup JSON file"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>

          {products.length > 0 ? (
            <button
              onClick={handleClearAll}
              title="Clear all products from inventory"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-red-50 dark:hover:bg-red-950/20 text-[#808080] dark:text-[#999] hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          ) : (
            <button
              onClick={handleLoadDemo}
              title="Load sample demo products"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Load Demo Items
            </button>
          )}
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#000] dark:bg-white text-white dark:text-[#000] text-sm font-semibold rounded-[2px] hover:bg-[#1a1a1a] dark:hover:bg-[#e5e5e5] active:translate-y-[1px] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080] dark:text-[#666]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#808080]/30 dark:border-[#444] rounded-[2px] bg-white dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-white text-sm focus:outline-none focus:border-[#000] dark:focus:border-white focus:ring-1 focus:ring-[#000] dark:focus:ring-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-[#808080]/30 dark:border-[#444] rounded-[2px] bg-white dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-white text-sm focus:outline-none focus:border-[#000] dark:focus:border-white"
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <div className="border border-[#808080]/20 dark:border-[#333] rounded-[2px] lg:flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-[#1a1a1a]">
        <div className="overflow-x-auto lg:flex-1 min-h-0 flex flex-col">
          <div className="min-w-[640px] lg:flex-1 min-h-0 flex flex-col">
            {/* Table Header (Fixed outside scrollable area) */}
            <div className="bg-[#F5F1E8] dark:bg-[#1a1a1a] border-b border-[#808080]/20 dark:border-[#333] shrink-0">
              <div className="grid grid-cols-[1fr_150px_110px_90px_100px] px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666] items-center">
                <div className="text-left">Product</div>
                <div className="text-left">Category</div>
                <div className="text-right">Price</div>
                <div className="text-right">Stock</div>
                <div className="text-right">Actions</div>
              </div>
            </div>

            {/* Scrollable Rows */}
            <div className="lg:flex-1 min-h-0 overflow-y-auto divide-y divide-[#808080]/10 dark:divide-[#222]">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="grid grid-cols-[1fr_150px_110px_90px_100px] px-4 py-3 text-sm items-center hover:bg-[#F5F1E8]/50 dark:hover:bg-[#1a1a1a]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <ProductImage src={product.image} category={product.category} alt={product.name} size="sm" />
                    <span className="font-medium text-[#1a1a1a] dark:text-white truncate">{product.name}</span>
                  </div>
                  <div>
                    <span className="px-2 py-0.5 bg-[#F5F1E8] dark:bg-[#2a2a2a] text-xs rounded-[2px] text-[#808080] dark:text-[#999]">
                      {product.category}
                    </span>
                  </div>
                  <div className="text-right font-mono text-[#1a1a1a] dark:text-white">
                    ₱{product.price.toFixed(2)}
                  </div>
                  <div className="text-right">
                    <span className={`font-mono ${product.stock <= 5 ? 'text-red-500 font-bold' : product.stock <= 15 ? 'text-[#B38B6D] font-medium' : 'text-[#1a1a1a] dark:text-white'}`}>
                      {product.stock}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="w-7 h-7 flex items-center justify-center border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#808080] dark:text-[#999] transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-7 h-7 flex items-center justify-center border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 text-[#808080] dark:text-[#999] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-[#808080] dark:text-[#666]">
                  <Package className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white">
                    {products.length === 0 ? 'Your inventory is empty' : 'No products found'}
                  </p>
                  <p className="text-xs mt-1 text-[#808080] dark:text-[#666]">
                    {products.length === 0
                      ? 'Add your store products to begin selling, or load demo items for testing.'
                      : 'Try adjusting your search query or category filter.'}
                  </p>
                  {products.length === 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <button
                        onClick={openAdd}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#000] dark:bg-white text-white dark:text-[#000] text-xs font-semibold rounded-[2px]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add First Product
                      </button>
                      <button
                        onClick={triggerImportBackup}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#808080]/30 dark:border-[#444] text-xs font-medium rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Import Backup
                      </button>
                      <button
                        onClick={handleLoadDemo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#808080]/30 dark:border-[#444] text-xs font-medium rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Load Demo Items
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[4px] w-full max-w-md p-6 space-y-4 border border-[#808080]/20 dark:border-[#333] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="text-[#808080] dark:text-[#666] hover:text-[#000] dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666] mb-2 block">Product Image</label>
              <div className="flex items-center gap-3">
                {formData.image ? (
                  <div className="relative">
                    <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-[2px] border border-[#808080]/20 dark:border-[#444]" />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-[2px] border-2 border-dashed border-[#808080]/30 dark:border-[#444] flex items-center justify-center bg-[#F5F1E8]/50 dark:bg-[#2a2a2a]/50">
                    <ImageIcon className="w-6 h-6 text-[#808080] dark:text-[#666]" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="product-image-input"
                  />
                  <label
                    htmlFor="product-image-input"
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-[#808080]/30 dark:border-[#444] rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#808080] dark:text-[#999] cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Image
                  </label>
                  <p className="text-[10px] text-[#808080] dark:text-[#555] mt-1">Max 500KB. A default icon will show if no image.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666] mb-1 block">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#808080]/30 dark:border-[#444] rounded-[2px] text-sm bg-white dark:bg-[#0f0f0f] text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#000] dark:focus:border-white focus:ring-1 focus:ring-[#000] dark:focus:ring-white"
                  placeholder="e.g. Coke 8oz"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666] mb-1 block">Price (₱)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#808080]/30 dark:border-[#444] rounded-[2px] text-sm bg-white dark:bg-[#0f0f0f] text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#000] dark:focus:border-white focus:ring-1 focus:ring-[#000] dark:focus:ring-white"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666] mb-1 block">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#808080]/30 dark:border-[#444] rounded-[2px] text-sm bg-white dark:bg-[#0f0f0f] text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#000] dark:focus:border-white focus:ring-1 focus:ring-[#000] dark:focus:ring-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666] mb-1 block">Category</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                      className={`px-2 py-1 text-xs rounded-[2px] transition-colors ${
                        formData.category === cat
                          ? 'bg-[#000] dark:bg-white text-white dark:text-[#000]'
                          : 'bg-[#F5F1E8] dark:bg-[#2a2a2a] text-[#808080] dark:text-[#999] hover:bg-[#B38B6D]/20 dark:hover:bg-[#3a3a3a]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#808080]/30 dark:border-[#444] rounded-[2px] text-sm bg-white dark:bg-[#0f0f0f] text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#000] dark:focus:border-white focus:ring-1 focus:ring-[#000] dark:focus:ring-white"
                  placeholder="Or type new category..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-[#808080]/30 dark:border-[#444] text-sm font-medium rounded-[2px] hover:bg-[#F5F1E8] dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-[#000] dark:bg-white text-white dark:text-[#000] text-sm font-semibold rounded-[2px] hover:bg-[#1a1a1a] dark:hover:bg-[#e5e5e5] active:translate-y-[1px] transition-all"
              >
                {editingProduct ? 'Update' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Themed Confirmation & Notification Modal */}
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
              <div className={`w-10 h-10 rounded-[2px] flex items-center justify-center shrink-0 ${
                modal.type === 'danger'
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  : modal.type === 'warning'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : modal.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-[#B38B6D]/15 text-[#B38B6D] border border-[#B38B6D]/20'
              }`}>
                {modal.type === 'danger' ? (
                  <Trash2 className="w-5 h-5" />
                ) : modal.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : modal.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
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
                className={`px-4 py-2 text-xs font-semibold rounded-[2px] transition-colors ${
                  modal.type === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#000] dark:bg-white text-white dark:text-[#000] hover:bg-[#1a1a1a] dark:hover:bg-[#e5e5e5]'
                }`}
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
