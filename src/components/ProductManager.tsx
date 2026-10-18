import { useState, useMemo, useRef } from 'react';
import { Plus, Edit3, Trash2, X, Package, Search, Image as ImageIcon, Upload } from 'lucide-react';
import { Product } from '../types';
import { getProducts, saveProducts, generateId } from '../store';
import ProductImage from './ProductImage';

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
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
      alert('Image is too large. Please use an image under 500KB.');
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
    if (!confirm('Delete this product?')) return;
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
    setProducts(updated);
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Products</h1>
          <p className="text-sm text-[#808080] dark:text-[#666]">{products.length} items in inventory</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#000] dark:bg-white text-white dark:text-[#000] text-sm font-semibold rounded-[2px] hover:bg-[#1a1a1a] dark:hover:bg-[#e5e5e5] active:translate-y-[1px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
      <div className="border border-[#808080]/20 dark:border-[#333] rounded-[2px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F1E8] dark:bg-[#1a1a1a] border-b border-[#808080]/20 dark:border-[#333]">
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666]">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666]">Category</th>
                <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666]">Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666]">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080] dark:text-[#666]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-[#808080]/10 dark:border-[#222] hover:bg-[#F5F1E8]/50 dark:hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage src={product.image} category={product.category} alt={product.name} size="sm" />
                      <span className="font-medium text-[#1a1a1a] dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-[#F5F1E8] dark:bg-[#2a2a2a] text-xs rounded-[2px] text-[#808080] dark:text-[#999]">{product.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#1a1a1a] dark:text-white">₱{product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono ${product.stock <= 5 ? 'text-red-500 font-bold' : product.stock <= 15 ? 'text-[#B38B6D] font-medium' : 'text-[#1a1a1a] dark:text-white'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#808080] dark:text-[#666]">
            <Package className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No products found</p>
          </div>
        )}
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
    </div>
  );
}
