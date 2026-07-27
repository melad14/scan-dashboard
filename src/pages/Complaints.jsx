import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Loader, Send, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ErrorBlock from '../components/ErrorBlock';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/complaints/${id}/status`, { status });
      showToast(`Complaint status updated to ${status === 'resolved' ? 'Resolved' : 'Forwarded'}`);
      fetchComplaints();
    } catch (err) {
      showToast(err.message || 'Failed to update complaint status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'forwarded': return 'badge-forwarded';
      case 'resolved': return 'badge-completed';
      default: return 'badge-info';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'forwarded': return 'Forwarded to Center';
      case 'resolved': return 'Resolved';
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="card flex items-center justify-between gap-4">
        <div className="section-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
          <h2 className="section-title" style={{ fontSize: '18px' }}>
            <AlertTriangle size={18} className="icon" />
            <span>Complaints & Disputes</span>
          </h2>
        </div>
        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="btn-secondary btn-sm"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Reload</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="card">
        {loading ? (
          <div className="loading-center">
            <Loader size={36} className="animate-spin" />
          </div>
        ) : error ? (
          <ErrorBlock 
            title="Failed to load complaints" 
            message={error} 
            onRetry={fetchComplaints} 
          />
        ) : complaints.length === 0 ? (
          <EmptyState 
            icon="AlertTriangle" 
            title="No complaints submitted" 
            description="No patients or medical centers have submitted complaints or disputes yet." 
            actionLabel="Refresh List"
            onAction={fetchComplaints}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Submitted By</th>
                  <th>Sender Role</th>
                  <th>Description</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((comp) => (
                  <tr key={comp._id}>
                    <td className="font-semibold text-brand">
                      {comp.orderId?.orderNumber || 'Unknown'}
                    </td>
                    <td className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {comp.sender?.name || 'User'}
                    </td>
                    <td>
                      <span className="text-secondary text-xs">
                        {comp.senderModel === 'Technician' ? 'Center / Tech' : 'Patient'}
                      </span>
                    </td>
                    <td className="max-w-xs truncate text-muted text-xs" title={comp.text}>
                      {comp.text}
                    </td>
                    <td className="text-xs text-secondary">
                      {new Date(comp.createdAt).toLocaleString('en-US')}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(comp.status)}`}>
                        {getStatusLabel(comp.status)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex justify-end gap-2">
                        {comp.status === 'pending' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateStatus(comp._id, 'forwarded')}
                            className="btn-primary btn-xs"
                          >
                            <Send size={11} />
                            <span>Forward</span>
                          </button>
                        )}
                        
                        {comp.status !== 'resolved' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateStatus(comp._id, 'resolved')}
                            className="btn-primary btn-xs"
                            style={{ background: 'var(--success)' }}
                          >
                            <CheckCircle size={11} />
                            <span>Resolve</span>
                          </button>
                        )}

                        {comp.status === 'resolved' && (
                          <span className="text-success text-xs font-semibold">Settled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
