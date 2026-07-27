import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
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
  Star,
  ArrowLeft
} from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
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
      showToast('Technician assigned successfully!');
      fetchOrderDetail();
    } catch (err) {
      showToast(err.message || 'Failed to assign technician', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceStatus = async () => {
    setActionLoading(true);
    try {
      await apiClient.put(`/admin/orders/${id}/status`, { status: forceStatus, note: statusNote });
      showToast('Order status updated!');
      setStatusNote('');
      fetchOrderDetail();
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePricePrescription = async () => {
    if (selectedServices.length === 0) {
      showToast('Please select at least one medical service.', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/orders/${id}/price-prescription`, {
        serviceIds: selectedServices,
        transferFee: parseFloat(customTransferFee)
      });
      showToast('Prescription priced & accepted!');
      fetchOrderDetail();
    } catch (err) {
      showToast(err.message || 'Failed to price prescription', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveResults = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/orders/${id}/approve-results`);
      showToast('Results approved and published to patient!');
      fetchOrderDetail();
    } catch (err) {
      showToast(err.message || 'Failed to approve results', 'error');
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
      showToast('Payment details updated!');
      fetchOrderDetail();
    } catch (err) {
      showToast(err.message || 'Failed to update payment details', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'pending_review': return 'badge-pending_review';
      case 'accepted': return 'badge-accepted';
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
      case 'pending_review': return 'Needs Pricing';
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
      <div className="loading-center">
        <Loader size={40} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Order {order.orderNumber}</h1>
            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-xs text-muted">
            Created on: {new Date(order.createdAt).toLocaleString('en-US')}
          </p>
        </div>

        <button onClick={() => navigate('/orders')} className="btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to List</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* ─── Left Column ─────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          
          {/* Prescription Pricing (conditional) */}
          {['pending', 'pending_review', 'accepted'].includes(order.status) && (
            <div className="card flex flex-col gap-4" style={{ borderColor: 'rgba(217, 123, 10, 0.2)' }}>
              <div className="section-header" style={{ borderBottomColor: 'rgba(217, 123, 10, 0.12)' }}>
                <h3 className="section-title">
                  <ClipboardList size={17} className="text-accent" />
                  <span className="text-accent">Order Services & Pricing Setup</span>
                </h3>
              </div>

              <p className="text-sm text-secondary">
                Select or adjust the specific medical services and transfer fee for this order:
              </p>
              
              <div className="form-group">
                <span className="form-label">Select Scans / Services:</span>
                <div className="inner-section" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {allServices.map(s => {
                      const isChecked = selectedServices.includes(s._id);
                      return (
                        <label key={s._id} className="flex items-center gap-2 text-sm cursor-pointer p-1 rounded-lg" style={{ color: 'var(--text-primary)' }}>
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
                            style={{ accentColor: 'var(--brand-primary)' }}
                          />
                          <span>{s.nameAr} ({s.price} EGP)</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ maxWidth: '200px' }}>
                <span className="form-label">Transfer / Travel Fee (EGP)</span>
                <input
                  type="number"
                  value={customTransferFee}
                  onChange={(e) => setCustomTransferFee(e.target.value)}
                  className="form-input"
                  placeholder="150"
                />
              </div>

              <button
                disabled={actionLoading}
                onClick={handlePricePrescription}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', background: 'var(--accent)' }}
              >
                Save Services & Update Price
              </button>
            </div>
          )}

          {/* Patient & Case Details */}
          <div className="card flex flex-col gap-0">
            <div className="section-header">
              <h3 className="section-title">
                <User size={17} className="icon" />
                <span>Patient & Case Details</span>
              </h3>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{order.patientSnapshot?.name || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{order.patientSnapshot?.phone || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Age / Gender</span>
                <span className="detail-value">
                  {order.patientSnapshot?.age ? `${order.patientSnapshot.age} years` : 'Unknown'} / {order.patientSnapshot?.gender === 'male' ? 'Male' : 'Female'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Mobility Status</span>
                <span className="detail-value">
                  {order.caseDetails?.isBedridden ? 'Bedridden' : 'Able to move'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Floor Details</span>
                <span className="detail-value">
                  Floor {order.caseDetails?.floor || 'Ground'} / {order.caseDetails?.hasElevator ? 'Elevator available' : 'No elevator'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Approx. Weight</span>
                <span className="detail-value">{order.caseDetails?.weight ? `${order.caseDetails.weight} kg` : 'Not specified'}</span>
              </div>
              {order.caseDetails?.notes && (
                <div className="detail-item full-width">
                  <span className="detail-label">Patient Notes</span>
                  <div className="inner-section" style={{ marginTop: '4px' }}>
                    <p className="text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{order.caseDetails.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="card flex flex-col gap-0">
            <div className="section-header">
              <h3 className="section-title">
                <MapPin size={17} className="icon" />
                <span>Visit Location</span>
              </h3>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Address</span>
                <span className="detail-value">
                  {order.location?.street}, {order.location?.building}, {order.location?.district}, {order.location?.governorate}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Preferred Visit Time</span>
                <span className="detail-value flex items-center gap-2">
                  <Calendar size={14} className="text-muted" />
                  <span>
                    {new Date(order.schedule?.date).toLocaleDateString('en-US')} —{' '}
                    {order.schedule?.timeSlot === 'morning_9_12' ? 'Morning (9–12)' : order.schedule?.timeSlot === 'afternoon_12_3' ? 'Afternoon (12–3)' : 'Evening (3–6)'}
                  </span>
                  {order.schedule?.isEmergency && (
                    <span className="badge badge-pending" style={{ fontSize: '10px', padding: '2px 6px' }}>Emergency</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Services & Pricing */}
          <div className="card flex flex-col gap-0">
            <div className="section-header">
              <h3 className="section-title">
                <DollarSign size={17} className="icon" />
                <span>Services & Invoice</span>
              </h3>
            </div>

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
                      <td className="font-semibold">{service.nameEn} ({service.nameAr})</td>
                      <td>{order.serviceCategory === 'xray' ? 'Home X-Ray' : 'Lab Tests'}</td>
                      <td className="font-bold">{service.price} EGP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pricing-breakdown" style={{ marginTop: 'var(--space-base)' }}>
              <div className="pricing-row">
                <span className="pricing-label">Services Subtotal</span>
                <span className="pricing-value">{order.pricing?.servicesTotal} EGP</span>
              </div>
              <div className="pricing-row">
                <span className="pricing-label">Travel Fee</span>
                <span className="pricing-value">{order.pricing?.transferFee} EGP</span>
              </div>
              <div className="pricing-row">
                <span className="pricing-label">Emergency Fee</span>
                <span className="pricing-value">{order.pricing?.emergencyFee || 0} EGP</span>
              </div>
              <div className="pricing-row pricing-total">
                <span className="pricing-label">Total Invoice</span>
                <span className="pricing-value">{order.pricing?.total} EGP</span>
              </div>
              <div className="pricing-row" style={{ paddingTop: '4px' }}>
                <span className="pricing-label" style={{ fontSize: '11px' }}>Payment Method</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {order.payment?.method === 'cash' ? 'Cash to Technician' : 'Electronic Payment'}
                </span>
              </div>
            </div>
          </div>

          {/* Prescriptions & Reports */}
          <div className="card flex flex-col gap-0">
            <div className="section-header">
              <h3 className="section-title">
                <FileText size={17} className="icon" />
                <span>Prescriptions & Reports</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Prescription */}
              <div className="flex flex-col gap-3">
                <span className="form-label" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '13px' }}>Attached Prescription:</span>
                {order.prescription?.images && order.prescription.images.length > 0 ? (
                  <div className="inner-section" style={{ padding: 'var(--space-sm)' }}>
                    <img
                      src={order.prescription.images[0]}
                      alt="Prescription"
                      style={{ maxHeight: '280px', width: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)', cursor: 'zoom-in' }}
                      onClick={() => window.open(order.prescription.images[0], '_blank')}
                    />
                  </div>
                ) : (
                  <div className="inner-section" style={{ textAlign: 'center', padding: '32px var(--space-base)', color: 'var(--text-muted)', fontSize: '13px', borderStyle: 'dashed' }}>
                    No prescription attached.
                  </div>
                )}
              </div>

              {/* Reports */}
              <div className="flex flex-col gap-3">
                <span className="form-label" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '13px' }}>X-Ray Results & Images:</span>
                {order.report?.images && order.report.images.length > 0 ? (
                  <div className="inner-section" style={{ padding: 'var(--space-sm)' }}>
                    <div className="grid grid-cols-2 gap-2">
                      {order.report.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Result-${i}`}
                          style={{ height: '100px', width: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'zoom-in' }}
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="inner-section" style={{ textAlign: 'center', padding: '32px var(--space-base)', color: 'var(--text-muted)', fontSize: '13px', borderStyle: 'dashed' }}>
                    Results not uploaded yet.
                  </div>
                )}

                {order.report?.pdf && (
                  <a
                    href={order.report.pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Download Report PDF
                  </a>
                )}

                {order.report?.images && order.report.images.length > 0 && (
                  <>
                    {!order.isResultsApproved ? (
                      <div className="alert alert-warning flex-col" style={{ gap: 'var(--space-md)' }}>
                        <span className="text-xs font-semibold">⚠️ Results not visible to patient. Approve to publish.</span>
                        <button
                          disabled={actionLoading}
                          onClick={handleApproveResults}
                          className="btn-primary btn-sm"
                          style={{ width: '100%', justifyContent: 'center', background: 'var(--accent)' }}
                        >
                          Approve & Publish Results
                        </button>
                      </div>
                    ) : (
                      <div className="alert alert-success text-xs font-semibold" style={{ justifyContent: 'center' }}>
                        ✅ Results approved & published to patient.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column ────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          
          {/* Technician Assignment */}
          <div className="card flex flex-col gap-0">
            <div className="section-header">
              <h3 className="section-title">
                <UserPlus size={17} className="icon" />
                <span>Assign Technician</span>
              </h3>
            </div>

            {order.technician ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={order.technician.photo || 'https://placehold.co/150x150.png'}
                    alt="Technician"
                    className="tech-card-avatar"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{order.technician.name}</span>
                    <span className="text-xs text-muted">{order.technician.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent)', background: 'var(--accent-light)', padding: '5px 10px', borderRadius: 'var(--radius-sm)', width: 'max-content' }}>
                  <Star size={13} fill="currentColor" />
                  <span>{order.technician.rating || 0} Rating</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-secondary">Select an available technician:</p>
                
                <select
                  className="form-input"
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                >
                  <option value="">Select technician...</option>
                  {technicians.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.region})
                    </option>
                  ))}
                </select>

                <button
                  disabled={!selectedTech || actionLoading}
                  onClick={handleAssignTech}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Assign Technician
                </button>
              </div>
            )}
          </div>

          {/* Payment & Collections */}
          <div className="card flex flex-col gap-0">
            <div className="section-header">
              <h3 className="section-title">
                <DollarSign size={17} className="icon" />
                <span>Payment</span>
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              <div className="detail-item">
                <span className="detail-label">Current Status</span>
                <span className="detail-value" style={{ color: order.payment?.status === 'completed' ? 'var(--success)' : 'var(--accent)' }}>
                  {order.payment?.status === 'completed' ? 'Paid / Collected' : 'Pending Payment'}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Method</span>
                <span className="detail-value">
                  {order.payment?.method === 'cash' ? 'Cash' : order.payment?.method === 'wallet' ? 'Wallet' : 'Card'}
                </span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

              <div className="form-group">
                <span className="form-label">Update Status</span>
                <select className="form-input" value={editPaymentStatus} onChange={(e) => setEditPaymentStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed / Collected</option>
                </select>
              </div>

              <div className="form-group">
                <span className="form-label">Update Method</span>
                <select className="form-input" value={editPaymentMethod} onChange={(e) => setEditPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="wallet">Wallet</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <button
                disabled={actionLoading}
                onClick={handleUpdatePayment}
                className="btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Save Payment Details
              </button>
            </div>
          </div>

          {/* Manual Status Update */}
          <div className="card flex flex-col gap-0">
            <div className="section-header">
              <h3 className="section-title">
                <ClipboardList size={17} className="icon" />
                <span>Manual Status Update</span>
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              <select className="form-input" value={forceStatus} onChange={(e) => setForceStatus(e.target.value)}>
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
                className="form-input"
                placeholder="Reason for manual status update..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                style={{ minHeight: '70px' }}
              />

              <button
                disabled={actionLoading}
                onClick={handleForceStatus}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Update Status Manually
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="card flex flex-col gap-0">
            <div className="section-header">
              <h3 className="section-title">
                <Activity size={17} className="icon" />
                <span>Status History</span>
              </h3>
            </div>

            <div className="flex flex-col gap-4 relative" style={{ paddingLeft: 'var(--space-base)', borderLeft: '1px solid var(--border-color)' }}>
              {order.statusHistory.map((log, index) => (
                <div key={index} className="flex flex-col gap-1 relative">
                  {/* Circle */}
                  <div style={{
                    position: 'absolute',
                    left: '-21px',
                    top: '5px',
                    width: '9px',
                    height: '9px',
                    background: 'var(--brand-primary)',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-surface)'
                  }} />
                  
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-semibold text-brand">{getStatusLabel(log.status)}</span>
                    <span>{new Date(log.timestamp).toLocaleString('en-US')}</span>
                  </div>
                  {log.note && <p className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>{log.note}</p>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
