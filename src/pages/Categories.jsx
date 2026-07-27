import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Loader, Plus, Edit, Trash2, X, LayoutGrid, ArrowUp, ArrowDown } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  
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
      showToast('An error occurred while loading categories.', 'error');
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
      showToast('Category order saved!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save new category order.', 'error');
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
        showToast('Category updated successfully!');
      } else {
        await apiClient.post('/admin/categories', payload);
        showToast('Category created successfully!');
      }
      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to save category.', 'error');
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
      showToast('Category deleted successfully!');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to delete category.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Categories Card List */}
      <div className="card flex flex-col gap-4">
        <div className="section-header" style={{ marginBottom: 0 }}>
          <h3 className="section-title">
            <LayoutGrid size={18} className="icon" />
            <span>Service Categories Manager</span>
          </h3>
          <button onClick={handleOpenAdd} className="btn-primary btn-sm">
            <Plus size={15} />
            <span>Add Category</span>
          </button>
        </div>

        {loading ? (
          <div className="loading-center">
            <Loader size={36} className="animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon="LayoutGrid"
            title="No categories found"
            description="No medical service categories have been created yet."
            actionLabel="Add First Category"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Sort</th>
                  <th>Category Code / Key</th>
                  <th>Name (AR)</th>
                  <th>Name (EN)</th>
                  <th>Icon Styling Preview</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr key={cat._id}>
                    <td style={{ textAlign: 'center' }}>
                      <div className="inline-flex gap-1 items-center justify-center">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="btn-secondary btn-xs"
                          style={{ padding: '2px 4px' }}
                          title="Move Up"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === categories.length - 1}
                          className="btn-secondary btn-xs"
                          style={{ padding: '2px 4px' }}
                          title="Move Down"
                        >
                          <ArrowDown size={11} />
                        </button>
                      </div>
                    </td>
                    <td className="font-semibold text-brand">{cat.key}</td>
                    <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{cat.nameAr}</td>
                    <td>{cat.nameEn}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            backgroundColor: cat.iconBg,
                            color: cat.iconColor,
                            width: '30px',
                            height: '30px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '11px'
                          }}
                        >
                          {cat.icon.substring(0, 3)}
                        </span>
                        <span className="text-xs text-muted">
                          {cat.icon}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${cat.isActive ? 'badge-completed' : 'badge-danger'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="btn-secondary btn-xs"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.nameEn)}
                          className="btn-danger btn-xs"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            
            <div className="section-header">
              <h3 className="section-title">
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted cursor-pointer hover:text-primary">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Arabic Name (الاسم بالعربية)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: رسم قلب منزلي"
                    className="form-input"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">English Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ECG Services"
                    className="form-input"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category Code / Key Slug</label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  placeholder="e.g. ecg"
                  className="form-input"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
                <span className="form-hint">Unique key identifier used by backend API and mobile apps.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Icon Identifier (Mobile Mapping)</label>
                <select
                  required
                  className="form-input"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
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
                <div className="form-group">
                  <label className="form-label">Icon Background</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', background: 'none' }}
                      value={iconBg}
                      onChange={(e) => setIconBg(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      value={iconBg}
                      onChange={(e) => setIconBg(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Icon Text Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', background: 'none' }}
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ accentColor: 'var(--brand-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  Active on Mobile App
                </label>
              </div>

              <div className="flex gap-3 justify-end" style={{ paddingTop: 'var(--space-base)', borderTop: '1px solid var(--border-color)', marginTop: 'var(--space-xs)' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn-primary">
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
