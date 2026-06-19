import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Search, Loader, AlertCircle, User, Phone, Calendar, ArrowRight } from 'lucide-react';
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
      const res = await apiClient.get(`/admin/patients?search=${search}`);
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل سجل المرضى.');
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
      // In our backend design, order history can be queried by admin/orders with a search for patient name/phone
      const res = await apiClient.get(`/admin/orders?limit=50&search=${patient.phone}`);
      setPatientOrders(res.data);
    } catch (err) {
      console.error(err);
      alert('فشل استرجاع تاريخ طلبات المريض');
    } finally {
      setOrdersLoading(false);
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'pending': return 'بانتظار المراجعة';
      case 'assigned': return 'تم تعيين فني';
      case 'on_way': return 'في الطريق';
      case 'arrived': return 'وصل الفني';
      case 'in_progress': return 'جاري الفحص';
      case 'completed': return 'تم الفحص';
      case 'report_ready': return 'التقرير جاهز';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <div className="rtl grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Columns: Patients List */}
      <div className={`lg:col-span-2 flex flex-col gap-6 ${selectedPatient ? 'hidden lg:flex' : 'flex'}`}>
        <div className="glass-panel p-6 flex items-center justify-between gap-4 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="w-full flex items-center relative">
            <input
              type="text"
              className="w-full pr-12 pl-4 py-2.5 bg-[#0d1324] border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm"
              placeholder="البحث باسم المريض أو رقم الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="absolute right-4 text-[#64748b] hover:text-white cursor-pointer">
              <Search size={16} />
            </button>
          </form>
        </div>

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
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-[#64748b]">
              لا يوجد مرضى مسجلين حالياً
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="custom-table text-right">
                <thead>
                  <tr className="text-right">
                    <th>اسم المريض</th>
                    <th>رقم الهاتف</th>
                    <th>العمر</th>
                    <th>الجنس</th>
                    <th>تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr
                      key={patient._id}
                      onClick={() => handleSelectPatient(patient)}
                      className={`cursor-pointer ${
                        selectedPatient?._id === patient._id ? 'bg-white/5 border-r-4 border-indigo-500' : ''
                      }`}
                    >
                      <td className="font-semibold text-white">{patient.name}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.age ? `${patient.age} سنة` : 'مجهول'}</td>
                      <td>{patient.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                      <td className="text-xs text-[#94a3b8]">
                        {new Date(patient.createdAt).toLocaleDateString('ar-EG')}
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
        <div className="lg:col-span-1 glass-panel p-6 shadow-xl flex flex-col gap-6 relative">
          
          {/* Back btn for mobile */}
          <button
            onClick={() => setSelectedPatient(null)}
            className="lg:hidden flex items-center gap-1 text-xs text-[#94a3b8] mb-2 cursor-pointer"
          >
            <ArrowRight size={14} />
            <span>العودة لقائمة المرضى</span>
          </button>

          <h3 className="text-lg font-bold border-b border-white/5 pb-4 flex items-center gap-2 text-indigo-400">
            <User size={18} />
            <span>ملف المريض التاريخي</span>
          </h3>

          <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center font-bold text-lg">
                {selectedPatient.name[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-base">{selectedPatient.name}</span>
                <span className="text-xs text-[#94a3b8] flex items-center gap-1 mt-0.5">
                  <Phone size={12} />
                  <span>{selectedPatient.phone}</span>
                </span>
              </div>
            </div>
            <div className="text-xs text-[#94a3b8] grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
              <span>العمر: {selectedPatient.age ? `${selectedPatient.age} سنة` : 'مجهول'}</span>
              <span>الجنس: {selectedPatient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
            </div>
          </div>

          <h4 className="text-sm font-bold mt-2 text-[#94a3b8] flex items-center gap-2">
            <Calendar size={14} />
            <span>تاريخ زيارات وطلبات المريض</span>
          </h4>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <Loader size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : patientOrders.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#64748b] bg-white/5 border border-dashed border-white/5 rounded-xl">
              لم يقم هذا المريض بأي طلبات طبية حتى الآن
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {patientOrders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="glass-card p-4 flex flex-col gap-2 cursor-pointer hover:border-indigo-500/30"
                >
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-indigo-400">{order.orderNumber}</span>
                    <span className="text-[#64748b]">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white">
                      {order.services.map(s => s.nameAr).join(' + ')}
                    </span>
                    <span className="font-bold text-white">{order.pricing?.total} ج.م</span>
                  </div>

                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5 text-[10px] text-[#94a3b8]">
                    <span>الحالة: {translateStatus(order.status)}</span>
                    {order.technician && <span>الفني: {order.technician.name}</span>}
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
