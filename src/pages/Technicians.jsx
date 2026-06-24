import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Plus, User, Phone, MapPin, Loader, Ban } from 'lucide-react';

export default function Technicians() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      alert('An error occurred while loading technicians.');
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
      alert('Technician added successfully!');
      setShowAddForm(false);
      setName('');
      setPhone('');
      setPassword('');
      setNationalId('');
      setRegion('');
      fetchTechs();
    } catch (err) {
      alert(err.message || 'Failed to add technician.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const confirmation = window.confirm(
      currentStatus 
        ? 'Are you sure you want to block this technician and suspend their account?' 
        : 'Are you sure you want to unblock this technician and activate their account?'
    );
    if (!confirmation) return;

    try {
      await apiClient.put(`/admin/technicians/${id}/toggle-active`);
      fetchTechs();
    } catch (err) {
      alert(err.message || 'Failed to change technician status.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Technician Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary py-2 px-4 text-sm"
        >
          <Plus size={16} />
          <span>Add New Technician</span>
        </button>
      </div>

      {/* Add form modal/panel */}
      {showAddForm && (
        <div className="card shadow-xl max-w-xl">
          <h3 className="text-lg font-bold border-b border-white/5 pb-3 mb-6">Register New Technician</h3>
          <form onSubmit={handleAddTechSubmit} className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input text-sm"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Phone Number</label>
                <input
                  type="text"
                  required
                  className="form-input text-sm"
                  placeholder="e.g. 01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">National ID (14 digits)</label>
                <input
                  type="text"
                  required
                  className="form-input text-sm"
                  placeholder="2950101XXXXXXXX"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary pl-1">Service Region / Area</label>
                <input
                  type="text"
                  required
                  className="form-input text-sm"
                  placeholder="e.g. Heliopolis"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs text-secondary pl-1">Password</label>
                <input
                  type="password"
                  required
                  className="form-input text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
              <button
                type="button"
                className="btn-secondary py-2 px-4 text-sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="btn-primary py-2 px-4 text-sm"
              >
                Save Technician
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Technicians List Grid */}
      <div className="card shadow-xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size={36} className="animate-spin text-brand" />
          </div>
        ) : techs.length === 0 ? (
          <div className="text-center py-12 text-muted">
            No technicians registered in the system yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {techs.map((tech) => (
              <div
                key={tech._id}
                className="bg-primary/30 border border-white/5 p-6 rounded-xl flex flex-col justify-between gap-6 relative overflow-hidden"
              >
                {/* Active/Block ribbon */}
                {!tech.isActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 text-rose-400 bg-rose-500/10 px-2.5 py-1 border border-rose-500/20 rounded-lg text-[10px] font-bold">
                    <Ban size={12} />
                    <span>Suspended</span>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {/* Photo & Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={tech.photo || 'https://placehold.co/150x150.png'}
                      alt="Tech Profile"
                      className="w-14 h-14 rounded-full object-cover border border-white/5 bg-primary/20"
                    />
                    <div className="flex flex-col text-left">
                      <h4 className="font-bold text-white text-base">{tech.name}</h4>
                      <span className="text-xs text-secondary flex items-center gap-1 mt-0.5">
                        <MapPin size={12} />
                        <span>Region: {tech.region}</span>
                      </span>
                    </div>
                  </div>

                  {/* Rating / Completed */}
                  <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-3 text-xs text-secondary text-left">
                    <div className="flex flex-col gap-1">
                      <span>Overall Rating</span>
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
                        <span>★</span>
                        <span>{tech.rating || 0} ({tech.totalRatings || 0})</span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span>Completed Orders</span>
                      <span className="font-semibold text-white">{tech.completedOrders || 0} orders</span>
                    </div>
                  </div>

                  {/* Contacts */}
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
                </div>

                {/* Operations */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  <button
                    onClick={() => handleToggleActive(tech._id, tech.isActive)}
                    className={`btn-secondary py-1.5 px-3 rounded-lg text-xs hover:border-brand/40 ${
                      tech.isActive ? 'hover:bg-rose-500/10 hover:text-rose-400' : 'hover:bg-emerald-500/10 hover:text-emerald-400'
                    }`}
                  >
                    {tech.isActive ? 'Suspend Account' : 'Activate Account'}
                  </button>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        tech.isAvailable && tech.isActive ? 'bg-emerald-500' : 'bg-muted'
                      }`}
                    />
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

