import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Search, Loader, AlertCircle, User, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientOrders, setPatientOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();

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
      alert('Failed to retrieve patient order history');
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
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Columns: Patients List */}
      <div className={`lg:col-span-2 flex flex-col gap-6 ${selectedPatient ? 'hidden lg:flex' : 'flex'}`}>
        <div className="card shadow-lg">
          <form onSubmit={handleSearchSubmit} className="w-full flex items-center relative">
            <input
              type="text"
              className="form-input w-full pl-10 pr-4 py-2"
              placeholder="Search by Patient Name or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="absolute left-3 text-muted hover:text-white cursor-pointer">
              <Search size={16} />
            </button>
          </form>
        </div>

        <div className="card shadow-xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader size={36} className="animate-spin text-brand" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-muted">
              No patients registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Phone</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr
                      key={patient._id}
                      onClick={() => handleSelectPatient(patient)}
                      className={`cursor-pointer ${
                        selectedPatient?._id === patient._id ? 'bg-white/5 border-l-4 border-brand' : ''
                      }`}
                    >
                      <td className="font-semibold text-white">{patient.name}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.age ? `${patient.age} years` : 'Unknown'}</td>
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
        <div className="lg:col-span-1 card shadow-xl flex flex-col gap-6 relative">
          
          {/* Back btn for mobile */}
          <button
            onClick={() => setSelectedPatient(null)}
            className="lg:hidden flex items-center gap-1 text-xs text-muted mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Patients List</span>
          </button>

          <h3 className="text-lg font-bold border-b border-white/5 pb-3 flex items-center gap-2 text-brand">
            <User size={18} />
            <span>Patient Profile</span>
          </h3>

          <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand/10 border border-brand/20 text-brand rounded-full flex items-center justify-center font-bold text-lg">
                {selectedPatient.name[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-base">{selectedPatient.name}</span>
                <span className="text-xs text-secondary flex items-center gap-1 mt-0.5">
                  <Phone size={12} />
                  <span>{selectedPatient.phone}</span>
                </span>
              </div>
            </div>
            <div className="text-xs text-secondary grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
              <span>Age: {selectedPatient.age ? `${selectedPatient.age} years` : 'Unknown'}</span>
              <span>Gender: {selectedPatient.gender === 'male' ? 'Male' : 'Female'}</span>
            </div>
          </div>

          <h4 className="text-sm font-bold mt-2 text-secondary flex items-center gap-2">
            <Calendar size={14} />
            <span>Order History</span>
          </h4>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <Loader size={24} className="animate-spin text-brand" />
            </div>
          ) : patientOrders.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted bg-white/5 border border-dashed border-white/5 rounded-xl">
              No medical orders booked by this patient yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {patientOrders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="bg-primary/50 border border-white/5 p-4 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-brand/30"
                >
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-brand">{order.orderNumber}</span>
                    <span className="text-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white">
                      {order.services.map(s => s.nameEn).join(' + ')}
                    </span>
                    <span className="font-bold text-white">{order.pricing?.total} EGP</span>
                  </div>

                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5 text-[10px] text-secondary">
                    <span>Status: {getStatusLabel(order.status)}</span>
                    {order.technician && <span>Tech: {order.technician.name}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}

