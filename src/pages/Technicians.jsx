import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Plus, User, Phone, MapPin, Loader, Ban, X } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Technicians() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [region, setRegion] = useState('');

  const fetchTechs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/technicians');
      setTechs(res.data);
    } catch (err) {
      console.error(err);
      showToast('An error occurred while loading technicians.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechs();
  }, []);

  const handleAddTechSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiClient.post('/admin/technicians', { name, phone, password, nationalId, region });
      showToast('Technician added successfully!');
      setShowAddForm(false);
      setName('');
      setPhone('');
      setPassword('');
      setNationalId('');
      setRegion('');
      fetchTechs();
    } catch (err) {
      showToast(err.message || 'Failed to add technician.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const confirmation = window.confirm(
      currentStatus 
        ? 'Are you sure you want to suspend this technician?' 
        : 'Are you sure you want to activate this technician?'
    );
    if (!confirmation) return;

    try {
      await apiClient.put(`/admin/technicians/${id}/toggle-active`);
      showToast(currentStatus ? 'Technician suspended.' : 'Technician activated.', currentStatus ? 'warning' : 'success');
      fetchTechs();
    } catch (err) {
      showToast(err.message || 'Failed to change technician status.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Header */}
      <div className="page-header">
        <h1 className="page-header-title">Technician Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>Add Technician</span>
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddForm(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="section-header">
              <h3 className="section-title">Register New Technician</h3>
              <button onClick={() => setShowAddForm(false)} className="text-muted cursor-pointer hover:text-primary">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTechSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" required className="form-input" placeholder="e.g. Ahmed Hassan" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" required className="form-input" placeholder="e.g. 01012345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">National ID (14 digits)</label>
                  <input type="text" required className="form-input" placeholder="2950101XXXXXXXX" value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Region</label>
                  <input type="text" required className="form-input" placeholder="e.g. Heliopolis" value={region} onChange={(e) => setRegion(e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Password</label>
                  <input type="password" required className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-3" style={{ paddingTop: 'var(--space-base)', borderTop: '1px solid var(--border-color)', marginTop: 'var(--space-sm)' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn-primary">Save Technician</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Technicians Grid */}
      <div className="card">
        {loading ? (
          <div className="loading-center">
            <Loader size={36} className="animate-spin" />
          </div>
        ) : techs.length === 0 ? (
          <EmptyState
            icon="UserCheck"
            title="No technicians registered"
            description="No technicians have been added to the system yet."
            actionLabel="Add First Technician"
            onAction={() => setShowAddForm(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {techs.map((tech) => (
              <div key={tech._id} className="tech-card">
                {/* Suspended ribbon */}
                {!tech.isActive && (
                  <div className="tech-card-suspended">
                    <Ban size={11} />
                    <span>Suspended</span>
                  </div>
                )}

                {/* Photo & Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={tech.photo || 'https://placehold.co/150x150.png'}
                    alt="Technician"
                    className="tech-card-avatar"
                  />
                  <div className="flex flex-col text-left">
                    <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{tech.name}</h4>
                    <span className="text-xs text-secondary flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{tech.region}</span>
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="tech-card-stats text-xs text-secondary text-left">
                  <div className="flex flex-col gap-1">
                    <span>Rating</span>
                    <span className="font-semibold text-accent flex items-center gap-1">
                      ★ {tech.rating || 0} ({tech.totalRatings || 0})
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Completed</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{tech.completedOrders || 0} orders</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col gap-2 text-xs text-secondary text-left">
                  <div className="flex items-center gap-2">
                    <Phone size={12} />
                    <span>{tech.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={12} />
                    <span>National ID: {tech.nationalId}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="tech-card-footer">
                  <button
                    onClick={() => handleToggleActive(tech._id, tech.isActive)}
                    className={tech.isActive ? 'btn-danger btn-xs' : 'btn-primary btn-xs'}
                  >
                    {tech.isActive ? 'Suspend' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`tech-status-dot ${tech.isAvailable && tech.isActive ? 'available' : 'unavailable'}`} />
                    <span className="text-secondary">
                      {tech.isAvailable && tech.isActive ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
