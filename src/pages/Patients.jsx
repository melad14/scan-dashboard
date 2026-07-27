import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Search, Loader, AlertCircle, User, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientOrders, setPatientOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/admin/patients?search=${encodeURIComponent(search)}`);
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading patient records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setOrdersLoading(true);
    try {
      const res = await apiClient.get(`/admin/orders?limit=50&search=${encodeURIComponent(patient.phone)}`);
      setPatientOrders(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve patient order history', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'accepted': return 'Accepted';
      case 'assigned': return 'Assigned';
      case 'on_way': return 'On the Way';
      case 'arrived': return 'Arrived';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'report_ready': return 'Report Ready';
      case 'cancelled': return 'Cancelled';
      default: return status?.toUpperCase() || '';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'assigned': return 'badge-assigned';
      case 'on_way': return 'badge-on_way';
      case 'completed': return 'badge-completed';
      case 'report_ready': return 'badge-report_ready';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* Left Columns: Patients List */}
      <div className={`lg:col-span-2 flex flex-col gap-5 ${selectedPatient ? 'hidden lg:flex' : 'flex'}`}>
        <div className="card">
          <form onSubmit={handleSearchSubmit}>
            <div className="input-icon-wrapper">
              <Search size={16} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Search by Patient Name or Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading-center">
              <Loader size={36} className="animate-spin" />
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : patients.length === 0 ? (
            <EmptyState
              icon="Users"
              title="No patients found"
              description="No patients registered yet or none match your search."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Phone</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr
                      key={patient._id}
                      onClick={() => handleSelectPatient(patient)}
                      className="cursor-pointer"
                      style={selectedPatient?._id === patient._id ? { background: 'var(--bg-surface-hover)' } : {}}
                    >
                      <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>{patient.name}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.age ? `${patient.age} yrs` : '—'}</td>
                      <td>{patient.gender === 'male' ? 'Male' : 'Female'}</td>
                      <td className="text-xs text-secondary">
                        {new Date(patient.createdAt).toLocaleDateString('en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Selected Patient Details & Orders */}
      {selectedPatient && (
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Patient Profile Card */}
          <div className="card flex flex-col gap-4">
            {/* Back btn for mobile */}
            <button
              onClick={() => setSelectedPatient(null)}
              className="lg:hidden flex items-center gap-1 text-xs text-muted cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to List</span>
            </button>

            <div className="section-header">
              <h3 className="section-title">
                <User size={17} className="icon" />
                <span>Patient Profile</span>
              </h3>
            </div>

            <div className="inner-section flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'var(--brand-primary-light)',
                  border: '1px solid var(--border-brand)',
                  color: 'var(--brand-primary)',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {selectedPatient.name[0]}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{selectedPatient.name}</span>
                  <span className="text-xs text-secondary flex items-center gap-1">
                    <Phone size={12} />
                    <span>{selectedPatient.phone}</span>
                  </span>
                </div>
              </div>
              
              <div className="detail-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="detail-item">
                  <span className="detail-label">Age</span>
                  <span className="detail-value">{selectedPatient.age ? `${selectedPatient.age} years` : 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Gender</span>
                  <span className="detail-value">{selectedPatient.gender === 'male' ? 'Male' : 'Female'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="card flex flex-col gap-0">
            <div className="section-header">
              <h3 className="section-title">
                <Calendar size={17} className="icon" />
                <span>Order History</span>
              </h3>
            </div>

            {ordersLoading ? (
              <div className="loading-center" style={{ padding: '32px 0' }}>
                <Loader size={24} className="animate-spin" />
              </div>
            ) : patientOrders.length === 0 ? (
              <div className="inner-section" style={{ textAlign: 'center', padding: '24px var(--space-base)', color: 'var(--text-muted)', fontSize: '13px', borderStyle: 'dashed' }}>
                No orders by this patient yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                {patientOrders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="inner-section cursor-pointer card-hover"
                    style={{ padding: 'var(--space-md)' }}
                  >
                    <div className="flex justify-between text-xs" style={{ marginBottom: '6px' }}>
                      <span className="font-semibold text-brand">{order.orderNumber}</span>
                      <span className="text-muted">
                        {new Date(order.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span style={{ color: 'var(--text-primary)' }}>
                        {order.services?.map(s => s.nameEn).join(' + ')}
                      </span>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{order.pricing?.total} EGP</span>
                    </div>

                    <div className="flex justify-between items-center" style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-color)', fontSize: '11px' }}>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`} style={{ fontSize: '10px', padding: '2px 7px' }}>
                        {getStatusLabel(order.status)}
                      </span>
                      {order.technician && <span className="text-muted">Tech: {order.technician.name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
