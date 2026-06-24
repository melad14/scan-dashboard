import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Settings, DollarSign, Loader, Plus, Edit, Trash2, X } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const servicesRes = await apiClient.get('/services');
      setServices(servicesRes.data);

      const pricingRes = await apiClient.get('/services/pricing');
      if (pricingRes.data) {
        setTransferFeeBase(pricingRes.data.transferFeeBase);
        setEmergencySurcharge(pricingRes.data.emergencySurcharge);
        setHomeServiceFee(pricingRes.data.homeServiceFee);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while loading services and pricing.');
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
      alert('Platform pricing settings updated successfully!');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update pricing settings.');
    } finally {
      setActionLoading(false);
    }
  };

  const resetServiceForm = () => {
    setNameAr('');
    setNameEn('');
    setCategory('xray');
    setPrice('');
    setSortOrder('0');
    setDescription('');
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
        description
      };

      if (isEditing) {
        await apiClient.put(`/admin/services/${editingId}`, payload);
        alert('Service updated successfully!');
      } else {
        await apiClient.post('/admin/services', payload);
        alert('Service created successfully!');
      }
      setModalOpen(false);
      resetServiceForm();
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to save service.');
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
      alert('Service deleted successfully!');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete service.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      
      {/* Left side: Services List */}
      <div className="lg:col-span-2 card shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-lg font-bold flex items-center gap-2 text-brand">
            <Settings size={18} />
            <span>Medical Services Catalog</span>
          </h3>
          <button
            onClick={handleOpenAdd}
            className="btn-primary py-1.5 px-3 text-sm cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add Service</span>
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
                  <th>Service Name (AR)</th>
                  <th>Service Name (EN)</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-muted">
                      No services found in the catalog.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service._id}>
                      <td className="font-semibold text-white">{service.nameAr}</td>
                      <td>{service.nameEn}</td>
                      <td>
                        <span className={`badge ${service.category === 'xray' ? 'badge-assigned' : 'badge-completed'}`}>
                          {service.category === 'xray' ? 'Home X-Ray' : 'Lab Tests'}
                        </span>
                      </td>
                      <td className="font-bold text-white">{service.price} EGP</td>
                      <td className="text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(service)}
                            className="btn-secondary py-1.5 px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteService(service._id, service.nameEn)}
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

      {/* Right side: Pricing Config Form */}
      <div className="lg:col-span-1 card shadow-xl flex flex-col gap-4">
        <h3 className="text-lg font-bold border-b border-white/5 pb-3 flex items-center gap-2 text-brand">
          <DollarSign size={18} />
          <span>Configure Visit Fees & Surcharges</span>
        </h3>

        <form onSubmit={handleUpdatePricing} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary pl-1">Base Travel Fee (EGP)</label>
            <input
              type="number"
              required
              className="form-input text-sm"
              value={transferFeeBase}
              onChange={(e) => setTransferFeeBase(e.target.value)}
            />
            <span className="text-[10px] text-muted pl-1">
              Flat fee added to cover technician travel cost for standard visits.
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary pl-1">Emergency Surcharge (EGP)</label>
            <input
              type="number"
              required
              className="form-input text-sm"
              value={emergencySurcharge}
              onChange={(e) => setEmergencySurcharge(e.target.value)}
            />
            <span className="text-[10px] text-muted pl-1">
              Extra fee added if the patient requests an immediate/emergency check.
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary pl-1">Home Service Fee (EGP)</label>
            <input
              type="number"
              required
              className="form-input text-sm"
              value={homeServiceFee}
              onChange={(e) => setHomeServiceFee(e.target.value)}
            />
            <span className="text-[10px] text-muted pl-1">
              Additional flat surcharge for performing services at the patient's home.
            </span>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="btn-primary w-full py-2.5 text-sm justify-center mt-2 cursor-pointer"
          >
            {actionLoading ? 'Saving...' : 'Update Pricing Settings'}
          </button>
        </form>
      </div>

      {/* Add / Edit Service Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="card max-w-md w-full flex flex-col gap-4 relative shadow-2xl border border-white/10 bg-surface">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-lg font-bold text-brand">
                {isEditing ? 'Edit Service Details' : 'Add New Service'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveService} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Arabic Name (الاسم بالعربية)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أشعة سينية على اليد"
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
                  placeholder="e.g., Hand X-Ray"
                  className="form-input text-sm"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Service Category</label>
                <select
                  required
                  className="form-input text-sm bg-primary"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ appearance: 'auto' }}
                >
                  <option value="xray">Home X-Ray (أشعة منزلية)</option>
                  <option value="lab">Lab Test (تحاليل طبية)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Base Price (EGP)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g., 350"
                  className="form-input text-sm"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Sort Order</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  className="form-input text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Description (الوصف)</label>
                <textarea
                  placeholder="Write a brief description..."
                  className="form-input text-sm min-h-[60px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
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
