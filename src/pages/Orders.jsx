import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Search, Filter, Loader, AlertCircle } from 'lucide-react';

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
      const endpoint = `/admin/orders?page=${page}&limit=15&status=${status}&search=${search}`;
      const res = await apiClient.get(endpoint);
      setOrders(res.data);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل الطلبات.');
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

  return (
    <div className="rtl flex flex-col gap-6">
      {/* Controls panel */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center relative">
          <input
            type="text"
            className="w-full pr-12 pl-4 py-2.5 bg-[#0d1324] border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm"
            placeholder="البحث برقم الطلب أو اسم المريض أو رقم الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="absolute right-4 text-[#64748b] hover:text-white cursor-pointer">
            <Search size={16} />
          </button>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#64748b]" />
            <span className="text-sm font-semibold text-[#94a3b8]">تصفية حسب الحالة:</span>
          </div>
          <select
            className="form-input py-2 text-sm bg-[#0d1324] border-white/5 rounded-xl outline-none"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">كل الحالات</option>
            <option value="pending">بانتظار المراجعة</option>
            <option value="assigned">تم تعيين فني</option>
            <option value="on_way">الفني في الطريق</option>
            <option value="arrived">وصل الفني</option>
            <option value="in_progress">جاري الفحص</option>
            <option value="completed">تم الفحص</option>
            <option value="report_ready">التقرير جاهز</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel p-6 shadow-xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size={36} className="animate-spin text-indigo-500" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="custom-table">
              <thead>
                <tr className="text-right">
                  <th>رقم الطلب</th>
                  <th>المريض</th>
                  <th>الهاتف</th>
                  <th>نوع الخدمة</th>
                  <th>الفني المعين</th>
                  <th>تاريخ الحجز</th>
                  <th>الحالة</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-[#64748b]">
                      لا توجد طلبات تطابق معايير البحث الحالية
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="cursor-pointer"
                    >
                      <td className="font-semibold text-indigo-400">{order.orderNumber}</td>
                      <td>{order.patientSnapshot?.name}</td>
                      <td>{order.patientSnapshot?.phone}</td>
                      <td>{order.serviceCategory === 'xray' ? 'أشعة منزلية' : 'تحاليل مخبرية'}</td>
                      <td>{order.technician?.name || <span className="text-[#64748b]">غير معين</span>}</td>
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
        )}

        {/* Pagination buttons */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm disabled:opacity-30 cursor-pointer"
            >
              السابق
            </button>
            <span className="text-sm text-[#94a3b8] px-4">
              صفحة {page} من {pagination.pages}
            </span>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm disabled:opacity-30 cursor-pointer"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
