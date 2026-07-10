import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import {
  Loader,
  AlertCircle,
  User,
  Activity,
  MapPin,
  Calendar,
  DollarSign,
  ClipboardList,
  FileText,
  UserPlus,
  Send,
  Star
} from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [forceStatus, setForceStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Prescription pricing states
  const [allServices, setAllServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [customTransferFee, setCustomTransferFee] = useState(150);

  // Payment edit states
  const [editPaymentStatus, setEditPaymentStatus] = useState('pending');
  const [editPaymentMethod, setEditPaymentMethod] = useState('cash');

  const fetchServices = async () => {
    try {
      const res = await apiClient.get('/admin/services');
      setAllServices(res.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const fetchOrderDetail = async () => {
    try {
      const orderRes = await apiClient.get(`/orders/${id}`);
      setOrder(orderRes.data);
      setForceStatus(orderRes.data.status);
      setEditPaymentStatus(orderRes.data.payment?.status || 'pending');
      setEditPaymentMethod(orderRes.data.payment?.method || 'cash');

      // Initialize selected services and transfer fee from order
      if (orderRes.data.services) {
        setSelectedServices(orderRes.data.services.map(s => s.serviceId));
      }
      if (orderRes.data.pricing?.transferFee !== undefined) {
        setCustomTransferFee(orderRes.data.pricing.transferFee);
      }

      if (['pending', 'pending_review', 'accepted'].includes(orderRes.data.status)) {
        fetchServices();
      }

      if (['pending', 'pending_review', 'accepted'].includes(orderRes.data.status) || !orderRes.data.technician) {
        const techsRes = await apiClient.get('/admin/technicians');
        // Only show active and available techs
        setTechnicians(techsRes.data.filter(t => t.isActive && t.isAvailable));
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleAssignTech = async () => {
    if (!selectedTech) return;
    setActionLoading(true);
    try {
      await apiClient.put(`/admin/orders/${id}/assign`, { technicianId: selectedTech });
      alert('Technician assigned successfully!');
      fetchOrderDetail();
    } catch (err) {
      alert(err.message || 'Failed to assign technician');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceStatus = async () => {
    setActionLoading(true);
    try {
      await apiClient.put(`/admin/orders/${id}/status`, { status: forceStatus, note: statusNote });
      alert('Order status updated manually!');
      setStatusNote('');
      fetchOrderDetail();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePricePrescription = async () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one medical service to assign.');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/orders/${id}/price-prescription`, {
        serviceIds: selectedServices,
        transferFee: parseFloat(customTransferFee)
      });
      alert('Prescription priced & accepted successfully!');
      fetchOrderDetail();
    } catch (err) {
      alert(err.message || 'Failed to price prescription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveResults = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/orders/${id}/approve-results`);
      alert('Medical results approved and published to patient successfully!');
      fetchOrderDetail();
    } catch (err) {
      alert(err.message || 'Failed to approve results');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/orders/${id}/payment`, {
        status: editPaymentStatus,
        method: editPaymentMethod
      });
      alert('Payment details updated successfully!');
      fetchOrderDetail();
    } catch (err) {
      alert(err.message || 'Failed to update payment details');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'pending_review': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'accepted': return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
      case 'assigned': return 'badge-assigned';
      case 'on_way': return 'badge-on_way';
      case 'arrived': return 'badge-arrived';
      case 'in_progress': return 'badge-in_progress';
      case 'completed': return 'badge-completed';
      case 'report_ready': return 'badge-report_ready';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'pending_review': return 'Needs Pricing 📋';
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size={48} className="animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white">Order {order.orderNumber}</h1>
            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-xs text-muted">
            Created on: {new Date(order.createdAt).toLocaleString('en-US')}
          </p>
        </div>

        <button
          onClick={() => navigate('/orders')}
          className="btn-secondary text-sm py-2 px-4"
        >
          Back to List
        </button>
      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Order & Patient Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Prescription Pricing Form */}
          {['pending', 'pending_review', 'accepted'].includes(order.status) && (
            <div className="card shadow-xl flex flex-col gap-4 bg-amber-500/5 border border-amber-500/20">
              <h3 className="text-lg font-bold border-b border-amber-500/10 pb-3 flex items-center gap-2 text-amber-400">
                <ClipboardList size={18} />
                <span>Order Services & Pricing Setup</span>
              </h3>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-secondary">
                  Select or adjust the specific medical services and transfer fee for this order:
                </p>
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-secondary">Select Scans / Services:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white/5 border border-white/5 rounded-xl">
                    {allServices.map(s => {
                      const isChecked = selectedServices.includes(s._id);
                      return (
                        <label key={s._id} className="flex items-center gap-2 text-sm text-white cursor-pointer hover:bg-white/5 p-1 rounded-lg">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedServices([...selectedServices, s._id]);
                              } else {
                                setSelectedServices(selectedServices.filter(id => id !== s._id));
                              }
                            }}
                            className="rounded border-white/10 text-brand bg-transparent focus:ring-0"
                          />
                          <span>{s.nameAr} ({s.price} EGP)</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1 max-w-[200px]">
                  <span className="text-xs font-semibold text-secondary">Transfer / Travel Fee (EGP)</span>
                  <input
                    type="number"
                    value={customTransferFee}
                    onChange={(e) => setCustomTransferFee(e.target.value)}
                    className="form-input w-full text-sm outline-none"
                    placeholder="150"
                  />
                </div>

                <button
                  disabled={actionLoading}
                  onClick={handlePricePrescription}
                  className="btn-primary w-full py-2.5 text-sm justify-center bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Save Services & Update Price
                </button>
              </div>
            </div>
          )}

          {/* Patient and Case details */}
          <div className="card shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-white/5 pb-3 flex items-center gap-2 text-brand">
              <User size={18} />
              <span>Patient & Case Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Full Name</span>
                <span className="font-semibold text-white">{order.patientSnapshot?.name || 'Not specified'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Phone Number</span>
                <span className="font-semibold text-white">{order.patientSnapshot?.phone || 'Not specified'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Age / Gender</span>
                <span className="font-semibold text-white">
                  {order.patientSnapshot?.age ? `${order.patientSnapshot.age} years` : 'Unknown'} / {order.patientSnapshot?.gender === 'male' ? 'Male' : 'Female'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Mobility Status</span>
                <span className="font-semibold text-white">
                  {order.caseDetails?.isBedridden ? 'Bedridden' : 'Able to move'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Floor Details</span>
                <span className="font-semibold text-white">
                  Floor {order.caseDetails?.floor || 'Ground'} / {order.caseDetails?.hasElevator ? 'Elevator available' : 'No elevator'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Approximate Weight</span>
                <span className="font-semibold text-white">{order.caseDetails?.weight ? `${order.caseDetails.weight} kg` : 'Not specified'}</span>
              </div>
              {order.caseDetails?.notes && (
                <div className="md:col-span-2 flex flex-col gap-1 bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-xs text-muted">Patient Notes</span>
                  <p className="text-sm text-[#f8fafc]">{order.caseDetails.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location details */}
          <div className="card shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-white/5 pb-3 flex items-center gap-2 text-brand">
              <MapPin size={18} />
              <span>Visit Location Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Detailed Address</span>
                <span className="font-semibold text-white">
                  {order.location?.street}, {order.location?.building}, {order.location?.district}, {order.location?.governorate}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Preferred Visit Time</span>
                <span className="font-semibold text-white flex items-center gap-2">
                  <Calendar size={14} className="text-muted" />
                  <span>
                    {new Date(order.schedule?.date).toLocaleDateString('en-US')} - {' '}
                    {order.schedule?.timeSlot === 'morning_9_12' ? 'Morning (9 AM - 12 PM)' : order.schedule?.timeSlot === 'afternoon_12_3' ? 'Afternoon (12 PM - 3 PM)' : 'Evening (3 PM - 6 PM)'}
                  </span>
                  {order.schedule?.isEmergency && (
                    <span className="badge badge-pending text-[10px] py-0.5 px-2">Immediate Emergency</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Services list & Pricing breakdown */}
          <div className="card shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-white/5 pb-3 flex items-center gap-2 text-brand">
              <DollarSign size={18} />
              <span>Medical Services & Invoice Breakdown</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Requested Service</th>
                    <th>Category</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.services.map((service, index) => (
                    <tr key={index}>
                      <td className="font-semibold text-white">{service.nameEn} ({service.nameAr})</td>
                      <td>{order.serviceCategory === 'xray' ? 'Home X-Ray' : 'Lab Tests'}</td>
                      <td className="font-bold">{service.price} EGP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-6 bg-white/5 p-4 rounded-xl border border-white/5 mt-2">
              <div className="flex flex-col gap-2 min-w-[220px]">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Services Subtotal:</span>
                  <span className="font-semibold">{order.pricing?.servicesTotal} EGP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Travel Fee:</span>
                  <span className="font-semibold">{order.pricing?.transferFee} EGP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Emergency Fee:</span>
                  <span className="font-semibold">{order.pricing?.emergencyFee || 0} EGP</span>
                </div>
                <div className="flex justify-between text-base border-t border-white/10 pt-2 font-bold text-brand">
                  <span>Total Invoice:</span>
                  <span>{order.pricing?.total} EGP</span>
                </div>
                <div className="flex justify-between text-xs text-muted">
                  <span>Payment Method:</span>
                  <span>{order.payment?.method === 'cash' ? 'Cash to Technician' : 'Electronic Payment'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded prescription / reports results */}
          <div className="card shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-white/5 pb-3 flex items-center gap-2 text-brand">
              <FileText size={18} />
              <span>Attached Prescriptions & Medical Reports</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prescription */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-secondary">Attached Prescription Image:</span>
                {order.prescription?.images && order.prescription.images.length > 0 ? (
                  <div className="border border-white/5 rounded-xl overflow-hidden bg-primary/40 p-2">
                    <img
                      src={order.prescription.images[0]}
                      alt="Prescription"
                      className="max-h-[300px] w-full object-contain rounded-lg hover:scale-[1.02] transition-all cursor-zoom-in"
                      onClick={() => window.open(order.prescription.images[0], '_blank')}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white/5 border border-dashed border-white/5 text-muted rounded-xl text-sm">
                    No prescription attached to the order.
                  </div>
                )}
              </div>

              {/* Reports */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-secondary">X-Ray Results & Images:</span>
                {order.report?.images && order.report.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 border border-white/5 rounded-xl overflow-hidden bg-primary/40 p-2">
                    {order.report.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Result-${i}`}
                        className="h-28 w-full object-cover rounded-lg hover:opacity-90 cursor-zoom-in"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white/5 border border-dashed border-white/5 text-muted rounded-xl text-sm">
                    Technician has not uploaded result images yet.
                  </div>
                )}

                {order.report?.pdf && (
                  <div className="mt-2">
                    <a
                      href={order.report.pdf}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary py-2.5 px-4 text-xs w-full justify-center"
                    >
                      Download Report PDF
                    </a>
                  </div>
                )}

                {order.report?.images && order.report.images.length > 0 && (
                  <>
                    {!order.isResultsApproved ? (
                      <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex flex-col gap-3">
                        <div className="text-xs font-semibold">⚠️ Results are not visible to the patient yet. Approve them to publish.</div>
                        <button
                          disabled={actionLoading}
                          onClick={handleApproveResults}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-3 rounded-lg text-xs transition cursor-pointer"
                        >
                          Approve & Publish Results
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold text-center">
                        ✅ Results approved & published to patient.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Assignment, Manual Updates, Timeline */}
        <div className="flex flex-col gap-6">
          
          {/* Tech Assignment Card */}
          <div className="card shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-white/5 pb-3 flex items-center gap-2 text-brand">
              <UserPlus size={18} />
              <span>Assign Technician</span>
            </h3>

            {order.technician ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={order.technician.photo || 'https://placehold.co/150x150.png'}
                    alt="Technician"
                    className="w-12 h-12 rounded-full border border-white/5 object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{order.technician.name}</span>
                    <span className="text-xs text-muted">{order.technician.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs w-max">
                  <Star size={14} fill="currentColor" />
                  <span>{order.technician.rating || 0} Rating</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-secondary">This order is not assigned to a technician yet. Please select an available technician:</p>
                
                <select
                  className="form-input w-full text-sm outline-none"
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                >
                  <option value="">Select available technician...</option>
                  {technicians.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.region})
                    </option>
                  ))}
                </select>

                <button
                  disabled={!selectedTech || actionLoading}
                  onClick={handleAssignTech}
                  className="btn-primary w-full py-2.5 text-sm justify-center"
                >
                  Assign Selected Technician
                </button>
              </div>
            )}
          </div>

          {/* Invoice & Payment Details Card */}
          <div className="card shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-white/5 pb-3 flex items-center gap-2 text-brand">
              <DollarSign size={18} />
              <span>Payment & Collections</span>
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Current Status:</span>
                <span className={`font-semibold ${order.payment?.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {order.payment?.status === 'completed' ? 'Paid / Collected' : 'Pending Payment'}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Current Method:</span>
                <span className="font-semibold text-white">
                  {order.payment?.method === 'cash' ? 'Cash' : order.payment?.method === 'wallet' ? 'Electronic Wallet' : 'Card'}
                </span>
              </div>

              <hr className="border-white/5 my-1" />

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-secondary">Update Status:</span>
                <select
                  className="form-input w-full text-sm outline-none"
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed / Collected</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-secondary">Update Method:</span>
                <select
                  className="form-input w-full text-sm outline-none"
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="wallet">Wallet</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <button
                disabled={actionLoading}
                onClick={handleUpdatePayment}
                className="btn-primary w-full py-2 text-xs justify-center cursor-pointer"
              >
                Save Payment Details
              </button>
            </div>
          </div>

          {/* Force Status change (Admin Override) */}
          <div className="card shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-white/5 pb-3 flex items-center gap-2 text-brand">
              <ClipboardList size={18} />
              <span>Manual Status Update</span>
            </h3>

            <div className="flex flex-col gap-3">
              <select
                className="form-input w-full text-sm outline-none"
                value={forceStatus}
                onChange={(e) => setForceStatus(e.target.value)}
              >
                <option value="pending">Pending Review</option>
                <option value="assigned">Assigned</option>
                <option value="on_way">On the Way</option>
                <option value="arrived">Arrived</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="report_ready">Report Ready</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <textarea
                className="form-input w-full text-sm outline-none h-20 resize-none"
                placeholder="Reason for manual status update..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />

              <button
                disabled={actionLoading}
                onClick={handleForceStatus}
                className="btn-secondary w-full py-2.5 text-sm justify-center"
              >
                Update Status Manually
              </button>
            </div>
          </div>

          {/* Timeline status history */}
          <div className="card shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-white/5 pb-3 flex items-center gap-2 text-brand">
              <Activity size={18} />
              <span>Update History & Logs</span>
            </h3>

            <div className="flex flex-col gap-5 relative pl-4 border-l border-white/10">
              {order.statusHistory.map((log, index) => (
                <div key={index} className="flex flex-col gap-1 relative">
                  {/* Circle pointer */}
                  <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-brand rounded-full border-2 border-[#0b0f19]" />
                  
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-semibold text-brand">{getStatusLabel(log.status)}</span>
                    <span>{new Date(log.timestamp).toLocaleString('en-US')}</span>
                  </div>
                  {log.note && <p className="text-xs text-secondary leading-relaxed">{log.note}</p>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

