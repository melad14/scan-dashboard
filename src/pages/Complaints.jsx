import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Loader, Send, CheckCircle, Info } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ErrorBlock from '../components/ErrorBlock';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', text: '' }

  const showNotification = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };


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
      showNotification(`تم تحديث حالة الشكوى بنجاح إلى ${status === 'resolved' ? 'تم الحل' : 'تم التحويل'}`);
      fetchComplaints();
    } catch (err) {
      showNotification(err.message || 'فشل تحديث حالة الشكوى', 'error');
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
    <div className="flex flex-col gap-6 position-relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
          notification.type === 'error' 
            ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' 
            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
        }`}>
          <Info size={16} />
          <span className="text-xs font-semibold fontFamily-cairo">{notification.text}</span>
        </div>
      )}

      {/* Controls */}
      <div className="card flex items-center justify-between gap-4 shadow-lg">
        <h2 className="text-xl font-bold text-white">Complaints & Disputes</h2>
        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 py-2 px-4 cursor-pointer text-xs"
        >
          <span>Reload</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="card shadow-xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size={36} className="animate-spin text-brand" />
          </div>
        ) : error ? (
          <ErrorBlock 
            title="فشل تحميل الشكاوى والاعتراضات" 
            message={error} 
            onRetry={fetchComplaints} 
          />
        ) : complaints.length === 0 ? (
          <EmptyState 
            icon="AlertTriangle" 
            title="لا توجد شكاوى مسجلة" 
            description="لم يقم أي مريض أو مركز طبي بتقديم شكاوى أو اعتراضات حتى الآن." 
            actionLabel="تحديث القائمة"
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
                    <td className="font-medium text-white">
                      {comp.sender?.name || 'User'}
                    </td>
                    <td>
                      <span className="text-secondary text-sm">
                        {comp.senderModel === 'Technician' ? 'Center / Tech' : 'Patient'}
                      </span>
                    </td>
                    <td className="max-w-xs truncate text-muted text-sm" title={comp.text}>
                      {comp.text}
                    </td>
                    <td>
                      {new Date(comp.createdAt).toLocaleString('en-US')}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(comp.status)}`}>
                        {getStatusLabel(comp.status)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {comp.status === 'pending' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateStatus(comp._id, 'forwarded')}
                            className="btn-primary py-1 px-2.5 text-xs flex items-center gap-1.5 justify-center bg-brand hover:bg-brand-hover text-white cursor-pointer"
                            title="Forward to Center/Technician"
                          >
                            <Send size={12} />
                            <span>Forward</span>
                          </button>
                        )}
                        
                        {comp.status !== 'resolved' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateStatus(comp._id, 'resolved')}
                            className="btn-primary py-1 px-2.5 text-xs flex items-center gap-1.5 justify-center bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            title="Mark as Resolved"
                          >
                            <CheckCircle size={12} />
                            <span>Resolve</span>
                          </button>
                        )}

                        {comp.status === 'resolved' && (
                          <span className="text-emerald-400 text-xs font-semibold">Settled</span>
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

