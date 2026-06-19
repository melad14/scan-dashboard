import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import {
  TrendingUp,
  Activity,
  UserCheck,
  Clock,
  ChevronLeft,
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
        setError('فشل في تحميل إحصائيات لوحة التحكم.');
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
      case 'on_way':
      case 'arrived':
      case 'in_progress': return 'badge-active';
      case 'completed':
      case 'report_ready': return 'badge-completed';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'pending': return 'بانتظار المراجعة';
      case 'assigned': return 'تم تعيين فني';
      case 'on_way': return 'الفني في الطريق';
      case 'arrived': return 'وصل الفني';
      case 'in_progress': return 'جاري الفحص';
      case 'completed': return 'تم الفحص';
      case 'report_ready': return 'التقرير جاهز';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size={48} className="animate-spin text-indigo-500" />
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
    <div className="flex flex-col gap-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex items-center justify-between border-l-4 border-indigo-500 shadow-lg">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#94a3b8]">إجمالي المبيعات</span>
            <span className="text-3xl font-extrabold text-white">{stats.totalRevenue} ج.م</span>
          </div>
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between border-l-4 border-sky-500 shadow-lg">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#94a3b8]">طلبات اليوم</span>
            <span className="text-3xl font-extrabold text-white">{stats.ordersToday}</span>
          </div>
          <div className="p-4 bg-sky-500/10 rounded-2xl text-sky-400">
            <Activity size={24} />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between border-l-4 border-emerald-500 shadow-lg">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#94a3b8]">الفنيين المتاحين حالياً</span>
            <span className="text-3xl font-extrabold text-white">{stats.activeTechs}</span>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between border-l-4 border-amber-500 shadow-lg">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#94a3b8]">طلبات بانتظار التعيين</span>
            <span className="text-3xl font-extrabold text-white">{stats.pendingAssignments}</span>
          </div>
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="xl:col-span-2 glass-panel p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold">أحدث الطلبات الطبية</h3>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              <span>مشاهدة كل الطلبات</span>
              <ChevronLeft size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr className="text-right">
                  <th>رقم الطلب</th>
                  <th>المريض</th>
                  <th>نوع الخدمة</th>
                  <th>تاريخ الحجز</th>
                  <th>الحالة</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-[#64748b]">
                      لا توجد طلبات مسجلة حالياً
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="cursor-pointer"
                    >
                      <td className="font-semibold text-indigo-400">{order.orderNumber}</td>
                      <td>{order.patientSnapshot?.name || 'مريض مجهول'}</td>
                      <td>{order.serviceCategory === 'xray' ? 'أشعة منزلية' : 'تحاليل مخبرية'}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {translateStatus(order.status)}
                        </span>
                      </td>
                      <td className="font-bold">{order.pricing?.total} ج.م</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Config / Quick links */}
        <div className="glass-panel p-6 flex flex-col gap-6 shadow-xl">
          <h3 className="text-lg font-bold border-b border-white/5 pb-4">تجهيز الخدمات المنزلية</h3>
          
          <div className="flex flex-col gap-4">
            <div
              onClick={() => navigate('/services')}
              className="glass-card p-4 flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold">تعديل تسعيرة المنصة</span>
                <span className="text-xs text-[#94a3b8]">رسوم الانتقال ومضاعف الطوارئ</span>
              </div>
              <ChevronLeft size={18} className="text-[#64748b]" />
            </div>

            <div
              onClick={() => navigate('/technicians')}
              className="glass-card p-4 flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold">إضافة فني جديد</span>
                <span className="text-xs text-[#94a3b8]">تسجيل فني أشعة أو تحاليل جديد</span>
              </div>
              <ChevronLeft size={18} className="text-[#64748b]" />
            </div>

            <div
              onClick={() => navigate('/analytics')}
              className="glass-card p-4 flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold">التقرير المالي العام</span>
                <span className="text-xs text-[#94a3b8]">تفاصيل الأرباح اليومية والشهرية</span>
              </div>
              <ChevronLeft size={18} className="text-[#64748b]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
