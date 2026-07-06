import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Settings, Loader, Plus, Edit, Trash2, X, LayoutGrid, ArrowUp, ArrowDown } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form fields
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [key, setKey] = useState('');
  const [icon, setIcon] = useState('category');
  const [iconBg, setIconBg] = useState('#E6F0FA');
  const [iconColor, setIconColor] = useState('#2B7EC2');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      alert('An error occurred while loading categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMove = async (index, direction) => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;
    
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;
    
    setCategories(newCategories);
    
    try {
      const orderedIds = newCategories.map(c => c._id);
      await apiClient.put('/admin/categories/reorder', { orderedIds });
    } catch (err) {
      console.error(err);
      alert('Failed to save new category order.');
      fetchData();
    }
  };

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setKey('');
    setIcon('category');
    setIconBg('#E6F0FA');
    setIconColor('#2B7EC2');
    setSortOrder('0');
    setIsActive(true);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setNameAr(cat.nameAr);
    setNameEn(cat.nameEn);
    setKey(cat.key);
    setIcon(cat.icon || 'category');
    setIconBg(cat.iconBg || '#E6F0FA');
    setIconColor(cat.iconColor || '#2B7EC2');
    setSortOrder((cat.sortOrder || 0).toString());
    setIsActive(cat.isActive);
    setIsEditing(true);
    setEditingId(cat._id);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        nameAr,
        nameEn,
        key: key.toLowerCase().trim(),
        icon,
        iconBg,
        iconColor,
        sortOrder: Number(sortOrder),
        isActive
      };

      if (isEditing) {
        await apiClient.put(`/admin/categories/${editingId}`, payload);
        alert('Category updated successfully!');
      } else {
        await apiClient.post('/admin/categories', payload);
        alert('Category created successfully!');
      }
      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? This will fail if there are services in it.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.delete(`/admin/categories/${id}`);
      alert('Category deleted successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete category.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 relative">
      
      {/* Categories Card List */}
      <div className="card shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-lg font-bold flex items-center gap-2 text-brand">
            <LayoutGrid size={18} />
            <span>Service Categories Manager</span>
          </h3>
          <button
            onClick={handleOpenAdd}
            className="btn-primary py-1.5 px-3 text-sm cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size={36} className="animate-spin text-brand" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Order</th>
                  <th>Category Code / Key</th>
                  <th>Name (AR)</th>
                  <th>Name (EN)</th>
                  <th>Icon Styling Preview</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-muted">
                      No categories found in the database.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr key={cat._id}>
                      <td>
                        <div className="flex gap-1 items-center">
                          <button
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0}
                            className="btn-secondary p-1 inline-flex items-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ padding: '4px' }}
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === categories.length - 1}
                            className="btn-secondary p-1 inline-flex items-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ padding: '4px' }}
                            title="Move Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="font-semibold text-white">{cat.key}</td>
                      <td className="text-white font-medium">{cat.nameAr}</td>
                      <td>{cat.nameEn}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs"
                            style={{ backgroundColor: cat.iconBg, color: cat.iconColor }}
                          >
                            {cat.icon.substring(0, 3)}
                          </span>
                          <span className="text-xs text-muted">
                            {cat.icon} ({cat.iconColor} on {cat.iconBg})
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${cat.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="btn-secondary py-1.5 px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id, cat.nameEn)}
                            className="btn-danger py-1.5 px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                            style={{ padding: '6px 10px' }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="card max-w-md w-full flex flex-col gap-4 relative shadow-2xl border border-white/10 bg-surface">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-lg font-bold text-brand">
                {isEditing ? 'Edit Category Details' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Arabic Name (الاسم بالعربية)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: رسم قلب منزلي"
                  className="form-input text-sm"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">English Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., ECG Services"
                  className="form-input text-sm"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Category Code / Key Slug (Unique, e.g., ecg, xray)</label>
                <input
                  type="text"
                  required
                  disabled={isEditing} // Block changing code when editing to prevent orphan references
                  placeholder="e.g., ecg"
                  className="form-input text-sm"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Icon Key (mobile mapping)</label>
                <select
                  required
                  className="form-input text-sm bg-primary"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  style={{ appearance: 'auto' }}
                >
                  <option value="monitor_heart">monitor_heart (X-Ray / Heart Monitor)</option>
                  <option value="favorite">favorite (Echo / Heart shape)</option>
                  <option value="show_chart">show_chart (ECG / Chart line)</option>
                  <option value="science">science (Lab tests / Flask)</option>
                  <option value="healing">healing (Physiotherapy / Bandage)</option>
                  <option value="local_hospital">local_hospital (Clinic / Hospital)</option>
                  <option value="category">category (Generic grid)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary pl-1">Icon Background Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                      value={iconBg}
                      onChange={(e) => setIconBg(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input text-xs flex-1"
                      value={iconBg}
                      onChange={(e) => setIconBg(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary pl-1">Icon Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input text-xs flex-1"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-brand rounded"
                />
                <label htmlFor="isActive" className="text-sm text-secondary font-medium cursor-pointer">
                  Active on Mobile App
                </label>
              </div>

              <div className="flex gap-3 justify-end border-t border-white/5 pt-3 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary py-2 px-4 text-sm cursor-pointer justify-center min-w-[100px]"
                >
                  {actionLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
