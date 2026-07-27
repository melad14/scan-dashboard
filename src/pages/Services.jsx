import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Settings, DollarSign, Loader, Plus, Edit, Trash2, X, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const getCategoryLabel = (category, categories = []) => {
  const found = categories.find(c => c.key === category);
  if (found) return found.nameEn;
  switch (category) {
    case 'xray': return 'Home X-Ray';
    case 'echo': return 'Echo';
    case 'ecg': return 'ECG';
    case 'lab': return 'Lab Tests';
    default: return category;
  }
};

const getCategoryBadgeClass = (category, categories = []) => {
  const found = categories.find(c => c.key === category);
  const icon = found ? found.icon : category;
  switch (icon) {
    case 'xray':
    case 'monitor_heart': 
      return 'badge-assigned';
    case 'echo':
    case 'favorite': 
      return 'badge-accepted';
    case 'ecg':
    case 'show_chart': 
      return 'badge-pending';
    case 'lab':
    case 'science': 
      return 'badge-completed';
    case 'healing': 
      return 'badge-arrived';
    default: 
      return 'badge-info';
  }
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('all');
  const { showToast } = useToast();
  
  // Pricing config form states
  const [transferFeeBase, setTransferFeeBase] = useState(100);
  const [emergencySurcharge, setEmergencySurcharge] = useState(150);
  const [homeServiceFee, setHomeServiceFee] = useState(50);
  
  // Service management form & modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('xray');
  const [price, setPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [description, setDescription] = useState('');
  const [instructionsAr, setInstructionsAr] = useState('');
  const [instructionsEn, setInstructionsEn] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const servicesRes = await apiClient.get('/services');
      setServices(servicesRes.data);

      try {
        const categoriesRes = await apiClient.get('/admin/categories');
        const catList = Array.isArray(categoriesRes.data) ? categoriesRes.data : (Array.isArray(categoriesRes) ? categoriesRes : []);
        setCategories(catList);
        if (catList.length > 0) {
          setCategory(catList[0].key);
        }
      } catch (catErr) {
        console.error('Error fetching categories:', catErr);
      }

      const pricingRes = await apiClient.get('/services/pricing');
      if (pricingRes.data) {
        setTransferFeeBase(pricingRes.data.transferFeeBase);
        setEmergencySurcharge(pricingRes.data.emergencySurcharge);
        setHomeServiceFee(pricingRes.data.homeServiceFee);
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while loading services and pricing.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePricing = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiClient.put('/admin/pricing', {
        transferFeeBase: Number(transferFeeBase),
        emergencySurcharge: Number(emergencySurcharge),
        homeServiceFee: Number(homeServiceFee)
      });
      showToast('Platform pricing settings updated successfully!');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update pricing settings.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMove = async (filteredIndex, direction) => {
    const filteredList = selectedFilterCategory === 'all'
      ? services
      : services.filter(s => s.category === selectedFilterCategory);

    const targetIndex = direction === 'up' ? filteredIndex - 1 : filteredIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredList.length) return;

    const item1 = filteredList[filteredIndex];
    const item2 = filteredList[targetIndex];

    const newServices = [...services];
    const origIdx1 = newServices.findIndex(s => s._id === item1._id);
    const origIdx2 = newServices.findIndex(s => s._id === item2._id);

    const temp = newServices[origIdx1];
    newServices[origIdx1] = newServices[origIdx2];
    newServices[origIdx2] = temp;

    setServices(newServices);

    try {
      const currentCategoryList = newServices.filter(s => s.category === item1.category);
      const orderedIds = currentCategoryList.map(s => s._id);
      await apiClient.put('/admin/services/reorder', { orderedIds });
      showToast('Service order saved!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save new service order.', 'error');
      fetchData();
    }
  };

  const resetServiceForm = () => {
    setNameAr('');
    setNameEn('');
    setCategory(categories[0]?.key || 'xray');
    setPrice('');
    setSortOrder('0');
    setDescription('');
    setInstructionsAr('');
    setInstructionsEn('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetServiceForm();
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setNameAr(service.nameAr);
    setNameEn(service.nameEn);
    setCategory(service.category);
    setPrice(service.price);
    setSortOrder(service.sortOrder || 0);
    setDescription(service.description || '');
    setInstructionsAr(service.instructionsAr || '');
    setInstructionsEn(service.instructionsEn || '');
    setIsEditing(true);
    setEditingId(service._id);
    setModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        nameAr,
        nameEn,
        category,
        price: Number(price),
        sortOrder: Number(sortOrder),
        description,
        instructionsAr,
        instructionsEn
      };

      if (isEditing) {
        await apiClient.put(`/admin/services/${editingId}`, payload);
        showToast('Service updated successfully!');
      } else {
        await apiClient.post('/admin/services', payload);
        showToast('Service created successfully!');
      }
      setModalOpen(false);
      resetServiceForm();
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to save service.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service "${name}"?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.delete(`/admin/services/${id}`);
      showToast('Service deleted successfully!');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete service.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const displayedServices = selectedFilterCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedFilterCategory);

  return (
    <div className="flex flex-col gap-6">
      
      {/* ─── 1. Top Section: Full Width Medical Services Catalog ──────── */}
      <div className="card flex flex-col gap-4">
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: 0 }}>
          <h3 className="section-title">
            <Settings size={18} className="icon" />
            <span>Medical Services Catalog</span>
          </h3>
          <button onClick={handleOpenAdd} className="btn-primary btn-sm">
            <Plus size={15} />
            <span>Add Service</span>
          </button>
        </div>

        {/* Category Filter Bar */}
        <div className="filter-bar flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted" />
            <span className="filter-label">Filter Category:</span>
          </div>
          <select
            value={selectedFilterCategory}
            onChange={(e) => setSelectedFilterCategory(e.target.value)}
            className="form-input text-xs"
            style={{ width: 'auto', minWidth: '200px', padding: '6px 12px' }}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.nameEn} ({cat.nameAr})
              </option>
            ))}
          </select>

          {selectedFilterCategory === 'all' ? (
            <span className="text-xs text-muted">
              Select a specific category above to reorder items
            </span>
          ) : (
            <span className="text-xs text-brand font-semibold">
              Use ↑↓ buttons to reorder services in this category
            </span>
          )}
        </div>

        {/* Services Data Table */}
        {loading ? (
          <div className="loading-center">
            <Loader size={36} className="animate-spin" />
          </div>
        ) : displayedServices.length === 0 ? (
          <EmptyState
            icon="Settings"
            title="No services found"
            description="There are no services in this category yet."
            actionLabel="Add New Service"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>Sort</th>
                  <th>Service Name (AR)</th>
                  <th>Service Name (EN)</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th className="text-right" style={{ paddingRight: 'var(--space-base)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedServices.map((service, index) => (
                  <tr key={service._id}>
                    <td style={{ textAlign: 'center' }}>
                      <div className="inline-flex gap-1 items-center justify-center">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={selectedFilterCategory === 'all' || index === 0}
                          className="btn-secondary btn-xs"
                          style={{ padding: '2px 4px' }}
                          title={selectedFilterCategory === 'all' ? "Select a specific category to sort" : "Move Up"}
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={selectedFilterCategory === 'all' || index === displayedServices.length - 1}
                          className="btn-secondary btn-xs"
                          style={{ padding: '2px 4px' }}
                          title={selectedFilterCategory === 'all' ? "Select a specific category to sort" : "Move Down"}
                        >
                          <ArrowDown size={11} />
                        </button>
                      </div>
                    </td>
                    <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {service.nameAr}
                    </td>
                    <td>{service.nameEn}</td>
                    <td>
                      <span className={`badge ${getCategoryBadgeClass(service.category, categories)}`}>
                        {getCategoryLabel(service.category, categories)}
                      </span>
                    </td>
                    <td className="font-bold text-brand">{service.price} EGP</td>
                    <td className="text-right">
                      <div className="inline-flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(service)}
                          className="btn-secondary btn-xs"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id, service.nameEn)}
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

      {/* ─── 2. Bottom Section: Full Width Visit Fees & Surcharges Panel ─── */}
      <div className="card flex flex-col gap-4">
        <div className="section-header" style={{ marginBottom: 0 }}>
          <h3 className="section-title">
            <DollarSign size={18} className="icon" />
            <span>Configure Visit Fees & Surcharges</span>
          </h3>
        </div>

        <form onSubmit={handleUpdatePricing} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="form-group">
              <label className="form-label">Base Travel Fee (EGP)</label>
              <input
                type="number"
                required
                className="form-input"
                value={transferFeeBase}
                onChange={(e) => setTransferFeeBase(e.target.value)}
              />
              <span className="form-hint">Flat fee added to cover technician travel cost for standard visits.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Surcharge (EGP)</label>
              <input
                type="number"
                required
                className="form-input"
                value={emergencySurcharge}
                onChange={(e) => setEmergencySurcharge(e.target.value)}
              />
              <span className="form-hint">Extra fee added if the patient requests an immediate emergency visit.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Home Service Fee (EGP)</label>
              <input
                type="number"
                required
                className="form-input"
                value={homeServiceFee}
                onChange={(e) => setHomeServiceFee(e.target.value)}
              />
              <span className="form-hint">Flat surcharge for performing medical services at patient's home.</span>
            </div>
          </div>

          <div className="flex justify-end" style={{ paddingTop: 'var(--space-xs)', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary"
              style={{ minWidth: '200px', justifyContent: 'center' }}
            >
              {actionLoading ? 'Saving...' : 'Save Pricing Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Add / Edit Service Modal ─────────────────────────────────── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            
            <div className="section-header">
              <h3 className="section-title">
                {isEditing ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted cursor-pointer hover:text-primary">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Arabic Name (الاسم بالعربية)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أشعة سينية على الصدر"
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
                    placeholder="e.g. Chest X-Ray"
                    className="form-input"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    required
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.nameEn} ({cat.nameAr})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Base Price (EGP)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 400"
                    className="form-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description (الوصف)</label>
                <textarea
                  placeholder="Brief description of the service..."
                  className="form-input"
                  style={{ minHeight: '60px' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Arabic Instructions (التعليمات)</label>
                  <textarea
                    placeholder="مثال: يجب الصيام 8 ساعات..."
                    className="form-input"
                    style={{ minHeight: '60px' }}
                    value={instructionsAr}
                    onChange={(e) => setInstructionsAr(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">English Instructions</label>
                  <textarea
                    placeholder="e.g. Must fast for 8 hours..."
                    className="form-input"
                    style={{ minHeight: '60px' }}
                    value={instructionsEn}
                    onChange={(e) => setInstructionsEn(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end" style={{ paddingTop: 'var(--space-base)', borderTop: '1px solid var(--border-color)', marginTop: 'var(--space-xs)' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn-primary">
                  {actionLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
