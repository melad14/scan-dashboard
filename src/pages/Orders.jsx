import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Search, Filter, Loader, AlertCircle } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = `/admin/orders?page=${page}&limit=15&status=${status}&search=${encodeURIComponent(search)}`;
      const res = await apiClient.get(endpoint);
      setOrders(res.data);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
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

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'xray': return 'Home X-Ray';
      case 'lab': return 'Lab Tests';
      case 'sonar': return 'Ultrasound (Sonar)';
      case 'ecg': return 'ECG';
      case 'holter': return 'Holter Monitor';
      case 'prescription_only': return 'Prescription Upload';
      default: return cat?.toUpperCase() || '';
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Controls panel */}
      <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="input-icon-wrapper">
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search by Order No., Patient Name or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter size={14} className="text-muted" />
          <span className="form-label" style={{ margin: 0 }}>Status:</span>
          <select
            className="form-input"
            style={{ width: 'auto', minWidth: '160px' }}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="pending_review">Needs Pricing</option>
            <option value="accepted">Accepted</option>
            <option value="assigned">Assigned</option>
            <option value="on_way">On the Way</option>
            <option value="arrived">Arrived</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="report_ready">Report Ready</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
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
        ) : orders.length === 0 ? (
          <EmptyState
            icon="Inbox"
            title="No orders found"
            description="No orders match the current search filters."
            actionLabel="Clear Filters"
            onAction={() => { setStatus('all'); setSearch(''); setPage(1); }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Service Type</th>
                  <th>Technician</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className={`cursor-pointer tr-${order.status}`}
                  >
                    <td className="font-semibold text-brand">{order.orderNumber}</td>
                    <td>{order.patientSnapshot?.name}</td>
                    <td>{order.patientSnapshot?.phone}</td>
                    <td>{getCategoryLabel(order.serviceCategory)}</td>
                    <td>{order.technician?.name || <span className="text-muted">Unassigned</span>}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-US')}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="font-bold">
                      {order.status === 'pending_review' ? (
                        <span className="text-accent text-sm font-semibold">Pricing Required</span>
                      ) : (
                        `${order.pricing?.total} EGP`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="btn-secondary btn-sm"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {pagination.pages}
            </span>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
