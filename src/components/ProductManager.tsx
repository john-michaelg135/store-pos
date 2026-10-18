import { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2, X, Package, Search } from 'lucide-react';
import { Product } from '../types';
import { getProducts, saveProducts, generateId } from '../store';

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
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
    setFormData({ name: '', price: '', category: '', stock: '' });
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
    });
    setShowForm(true);
  }

  function handleSave() {
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);
    if (!formData.name || isNaN(price) || !formData.category || isNaN(stock)) return;

    let updated: Product[];
    if (editingProduct) {
      updated = products.map(p =>
        p.id === editingProduct.id
          ? { ...p, name: formData.name, price, category: formData.category, stock }
          : p
      );
    } else {
      const newProduct: Product = {
        id: generateId(),
        name: formData.name,
        price,
        category: formData.category,
        stock,
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
          <h1 className="text-xl font-bold">Products</h1>
          <p className="text-sm text-[#808080]">{products.length} items in inventory</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#000] text-white text-sm font-semibold rounded-[2px] hover:bg-[#1a1a1a] active:translate-y-[1px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#808080]/30 rounded-[2px] bg-white text-sm focus:outline-none focus:border-[#000] focus:ring-1 focus:ring-[#000]"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-[#808080]/30 rounded-[2px] bg-white text-sm focus:outline-none focus:border-[#000]"
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <div className="border border-[#808080]/20 rounded-[2px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F1E8] border-b border-[#808080]/20">
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080]">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080]">Category</th>
                <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080]">Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080]">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#808080]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-[#808080]/10 hover:bg-[#F5F1E8]/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-[#F5F1E8] text-xs rounded-[2px]">{product.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">₱{product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono ${product.stock <= 5 ? 'text-red-500 font-bold' : product.stock <= 15 ? 'text-[#B38B6D] font-medium' : ''}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="w-7 h-7 flex items-center justify-center border border-[#808080]/30 rounded-[2px] hover:bg-[#F5F1E8] transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="w-7 h-7 flex items-center justify-center border border-[#808080]/30 rounded-[2px] hover:bg-red-50 hover:border-red-200 text-[#808080] hover:text-red-500 transition-colors"
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
          <div className="flex flex-col items-center justify-center py-12 text-[#808080]">
            <Package className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No products found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[4px] w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="text-[#808080] hover:text-[#000]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#808080] mb-1 block">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#808080]/30 rounded-[2px] text-sm focus:outline-none focus:border-[#000] focus:ring-1 focus:ring-[#000]"
                  placeholder="e.g. Coke 8oz"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[#808080] mb-1 block">Price (₱)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#808080]/30 rounded-[2px] text-sm focus:outline-none focus:border-[#000] focus:ring-1 focus:ring-[#000]"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[#808080] mb-1 block">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#808080]/30 rounded-[2px] text-sm focus:outline-none focus:border-[#000] focus:ring-1 focus:ring-[#000]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#808080] mb-1 block">Category</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                      className={`px-2 py-1 text-xs rounded-[2px] transition-colors ${
                        formData.category === cat
                          ? 'bg-[#000] text-white'
                          : 'bg-[#F5F1E8] text-[#808080] hover:bg-[#B38B6D]/20'
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
                  className="w-full px-3 py-2 border border-[#808080]/30 rounded-[2px] text-sm focus:outline-none focus:border-[#000] focus:ring-1 focus:ring-[#000]"
                  placeholder="Or type new category..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-[#808080]/30 text-sm font-medium rounded-[2px] hover:bg-[#F5F1E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-[#000] text-white text-sm font-semibold rounded-[2px] hover:bg-[#1a1a1a] active:translate-y-[1px] transition-all"
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
