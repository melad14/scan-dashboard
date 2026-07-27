import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import {
  TrendingUp,
  Activity,
  UserCheck,
  Clock,
  ChevronRight,
  Loader,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const statsRes = await apiClient.get('/admin/dashboard');
        setStats(statsRes.data);

        const ordersRes = await apiClient.get('/admin/orders?limit=5');
        setRecentOrders(ordersRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
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
    <div className="flex flex-col gap-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Revenue</span>
            <div className="stat-icon">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value text-brand">
            {Number(stats?.totalRevenue || 0).toLocaleString()}{' '}
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>EGP</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Orders Today</span>
            <div className="stat-icon">
              <Activity size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.ordersToday || 0}</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Active Technicians</span>
            <div className="stat-icon">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.activeTechs || 0}</div>
        </div>

        <div className="stat-card warning">
          <div className="flex items-center justify-between">
            <span className="stat-label">Pending Assignments</span>
            <div className="stat-icon">
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-value text-accent">{stats?.pendingAssignments || 0}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <div className="xl:col-span-2 card flex flex-col gap-0">
          <div className="section-header">
            <h3 className="section-title">Recent Medical Orders</h3>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-1 text-sm text-brand font-semibold cursor-pointer hover:underline"
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Patient</th>
                  <th>Service Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted">
                      No medical orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className={`cursor-pointer tr-${order.status}`}
                    >
                      <td className="font-semibold text-brand">{order.orderNumber}</td>
                      <td>{order.patientSnapshot?.name || 'Unknown Patient'}</td>
                      <td>{order.serviceCategory === 'xray' ? 'Home X-Ray' : 'Lab Tests'}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('en-US')}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="font-bold">{order.pricing?.total} EGP</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card flex flex-col gap-0">
          <div className="section-header">
            <h3 className="section-title">Quick Actions</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            <div onClick={() => navigate('/services')} className="quick-action-item">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">Edit Pricing & Fees</span>
                <span className="text-xs text-muted">Manage travel fee, emergency, and service surcharge</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </div>

            <div onClick={() => navigate('/technicians')} className="quick-action-item">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">Add Technician</span>
                <span className="text-xs text-muted">Register a new X-ray or laboratory technician</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </div>

            <div onClick={() => navigate('/analytics')} className="quick-action-item">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">Financial Analytics</span>
                <span className="text-xs text-muted">View details of daily and monthly revenue</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
