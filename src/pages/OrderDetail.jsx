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

  const fetchOrderDetail = async () => {
    try {
      const orderRes = await apiClient.get(`/orders/${id}`);
      setOrder(orderRes.data);
      setForceStatus(orderRes.data.status);

      if (orderRes.data.status === 'pending' || !orderRes.data.technician) {
        const techsRes = await apiClient.get('/admin/technicians');
        // Only show active and available techs
        setTechnicians(techsRes.data.filter(t => t.isActive && t.isAvailable));
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل تفاصيل الطلب.');
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
      alert('تم تعيين الفني بنجاح!');
      fetchOrderDetail();
    } catch (err) {
      alert(err.message || 'فشل التعيين');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceStatus = async () => {
    setActionLoading(true);
    try {
      await apiClient.put(`/admin/orders/${id}/status`, { status: forceStatus, note: statusNote });
      alert('تم تحديث حالة الطلب يدوياً!');
      setStatusNote('');
      fetchOrderDetail();
    } catch (err) {
      alert(err.message || 'فشل تحديث الحالة');
    } finally {
      setActionLoading(false);
    }
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
    <div className="rtl flex flex-col gap-8">
      {/* Header Info */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border-b border-indigo-500/10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white">الطلب {order.orderNumber}</h1>
            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
              {translateStatus(order.status)}
            </span>
          </div>
          <p className="text-xs text-[#94a3b8]">
            تم الإنشاء في: {new Date(order.createdAt).toLocaleString('ar-EG')}
          </p>
        </div>

        <button
          onClick={() => navigate('/orders')}
          className="btn-secondary text-sm py-2 px-4 rounded-xl"
        >
          رجوع للقائمة
        </button>
      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Order & Patient Details */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Patient and Case details */}
          <div className="glass-panel p-6 shadow-xl flex flex-col gap-6">
            <h3 className="text-lg font-bold border-b border-white/5 pb-4 flex items-center gap-2 text-indigo-400">
              <User size={18} />
              <span>بيانات المريض والحالة</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#64748b]">الاسم بالكامل</span>
                <span className="font-semibold text-white">{order.patientSnapshot?.name || 'غير محدد'}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#64748b]">رقم الهاتف</span>
                <span className="font-semibold text-white">{order.patientSnapshot?.phone || 'غير محدد'}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#64748b]">العمر / الجنس</span>
                <span className="font-semibold text-white">
                  {order.patientSnapshot?.age ? `${order.patientSnapshot.age} سنة` : 'مجهول'} / {order.patientSnapshot?.gender === 'male' ? 'ذكر' : 'أنثى'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#64748b]">طبيعة الحركة</span>
                <span className="font-semibold text-white">
                  {order.caseDetails?.isBedridden ? ' ملازم للفراش (Bedridden)' : 'قادر على الحركة'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#64748b]">تفاصيل الطابق</span>
                <span className="font-semibold text-white">
                  الطابق {order.caseDetails?.floor || 'الأرضي'} / {order.caseDetails?.hasElevator ? 'يوجد مصعد' : 'لا يوجد مصعد'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#64748b]">الوزن التقريبي</span>
                <span className="font-semibold text-white">{order.caseDetails?.weight ? `${order.caseDetails.weight} كجم` : 'غير محدد'}</span>
              </div>
              {order.caseDetails?.notes && (
                <div className="md:col-span-2 flex flex-col gap-1.5 bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-xs text-[#64748b]">ملاحظات المريض للحالة</span>
                  <p className="text-sm text-[#f8fafc]">{order.caseDetails.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location details */}
          <div className="glass-panel p-6 shadow-xl flex flex-col gap-6">
            <h3 className="text-lg font-bold border-b border-white/5 pb-4 flex items-center gap-2 text-sky-400">
              <MapPin size={18} />
              <span>موقع الزيارة الجغرافي</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#64748b]">العنوان بالتفصيل</span>
                <span className="font-semibold text-white">
                  {order.location?.street}، {order.location?.building}، {order.location?.district}، {order.location?.governorate}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#64748b]">توقيت الزيارة المفضل</span>
                <span className="font-semibold text-white flex items-center gap-2">
                  <Calendar size={14} className="text-[#64748b]" />
                  <span>
                    {new Date(order.schedule?.date).toLocaleDateString('ar-EG')} - {' '}
                    {order.schedule?.timeSlot === 'morning_9_12' ? 'صباحاً (9 - 12)' : order.schedule?.timeSlot === 'afternoon_12_3' ? 'ظهراً (12 - 3)' : 'مساءً (3 - 6)'}
                  </span>
                  {order.schedule?.isEmergency && (
                    <span className="badge badge-pending text-[10px] py-0.5 px-2">طوارئ فوري</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Services list & Pricing breakdown */}
          <div className="glass-panel p-6 shadow-xl flex flex-col gap-6">
            <h3 className="text-lg font-bold border-b border-white/5 pb-4 flex items-center gap-2 text-emerald-400">
              <DollarSign size={18} />
              <span>الخدمات الطبية ورسوم الفاتورة</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr className="text-right">
                    <th>الخدمة المطلوبة</th>
                    <th>الفئة</th>
                    <th>السعر</th>
                  </tr>
                </thead>
                <tbody>
                  {order.services.map((service, index) => (
                    <tr key={index}>
                      <td className="font-semibold text-white">{service.nameAr} ({service.nameEn})</td>
                      <td>{order.serviceCategory === 'xray' ? 'أشعة منزلية' : 'تحاليل مخبرية'}</td>
                      <td className="font-bold">{service.price} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-6 bg-white/5 p-6 rounded-xl border border-white/5">
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94a3b8]">مجموع الخدمات:</span>
                  <span className="font-semibold">{order.pricing?.servicesTotal} ج.م</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#94a3b8]">رسوم الانتقال:</span>
                  <span className="font-semibold">{order.pricing?.transferFee}  ج.م</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#94a3b8]">رسوم الطوارئ:</span>
                  <span className="font-semibold">{order.pricing?.emergencyFee || 0} ج.م</span>
                </div>
                <div className="flex justify-between text-base border-t border-white/10 pt-2 font-bold text-emerald-400">
                  <span>إجمالي المبلغ:</span>
                  <span>{order.pricing?.total} ج.م</span>
                </div>
                <div className="flex justify-between text-xs text-[#64748b]">
                  <span>طريقة الدفع:</span>
                  <span>{order.payment?.method === 'cash' ? 'نقدي للفني (Cash)' : 'دفع إلكتروني'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded prescription / reports results */}
          <div className="glass-panel p-6 shadow-xl flex flex-col gap-6">
            <h3 className="text-lg font-bold border-b border-white/5 pb-4 flex items-center gap-2 text-violet-400">
              <FileText size={18} />
              <span>الروشتات المرفقة والتقارير الطبية</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Prescription */}
              <div className="flex flex-col gap-4">
                <span className="text-sm font-semibold text-[#94a3b8]">صورة الروشتة المرفقة:</span>
                {order.prescription?.images && order.prescription.images.length > 0 ? (
                  <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0d1324] p-2">
                    <img
                      src={order.prescription.images[0]}
                      alt="Prescription"
                      className="max-h-[300px] w-full object-contain rounded-lg hover:scale-[1.02] transition-all cursor-zoom-in"
                      onClick={() => window.open(order.prescription.images[0], '_blank')}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white/5 border border-dashed border-white/5 text-[#64748b] rounded-xl text-sm">
                    لا توجد روشتة مرفقة مع الطلب
                  </div>
                )}
              </div>

              {/* Reports */}
              <div className="flex flex-col gap-4">
                <span className="text-sm font-semibold text-[#94a3b8]">صور تقرير الأشعة والنتائج:</span>
                {order.report?.images && order.report.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 border border-white/5 rounded-xl overflow-hidden bg-[#0d1324] p-2">
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
                  <div className="p-8 text-center bg-white/5 border border-dashed border-white/5 text-[#64748b] rounded-xl text-sm">
                    لم يقم الفني برفع صور النتائج حتى الآن
                  </div>
                )}

                {order.report?.pdf && (
                  <div className="mt-2">
                    <a
                      href={order.report.pdf}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary py-2 px-4 rounded-xl text-xs w-full justify-center"
                    >
                      تحميل تقرير الـ PDF المرفق
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Assignment, Manual Updates, Timeline */}
        <div className="flex flex-col gap-8">
          
          {/* Tech Assignment Card */}
          <div className="glass-panel p-6 shadow-xl flex flex-col gap-6">
            <h3 className="text-lg font-bold border-b border-white/5 pb-4 flex items-center gap-2 text-indigo-400">
              <UserPlus size={18} />
              <span>تعيين فني الخدمة</span>
            </h3>

            {order.technician ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={order.technician.photo || 'https://placehold.co/150x150.png'}
                    alt="Technician"
                    className="w-12 h-12 rounded-full border border-white/5 object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{order.technician.name}</span>
                    <span className="text-xs text-[#94a3b8]">{order.technician.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs w-max">
                  <Star size={14} fill="currentColor" />
                  <span>{order.technician.rating} (تقييمات الفني)</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-[#94a3b8]">هذا الطلب غير معين لفني حالياً. يرجى اختيار فني متاح:</p>
                
                <select
                  className="form-input w-full text-sm bg-[#0d1324] border-white/5 rounded-xl outline-none"
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                >
                  <option value="">اختر الفني المتاح...</option>
                  {technicians.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.region})
                    </option>
                  ))}
                </select>

                <button
                  disabled={!selectedTech || actionLoading}
                  onClick={handleAssignTech}
                  className="btn-primary w-full py-2.5 rounded-xl text-sm justify-center"
                >
                  تعيين الفني المختار
                </button>
              </div>
            )}
          </div>

          {/* Force Status change (Admin Override) */}
          <div className="glass-panel p-6 shadow-xl flex flex-col gap-6">
            <h3 className="text-lg font-bold border-b border-white/5 pb-4 flex items-center gap-2 text-amber-500">
              <ClipboardList size={18} />
              <span>تعديل يدوي للحالة</span>
            </h3>

            <div className="flex flex-col gap-4">
              <select
                className="form-input w-full text-sm bg-[#0d1324] border-white/5 rounded-xl outline-none"
                value={forceStatus}
                onChange={(e) => setForceStatus(e.target.value)}
              >
                <option value="pending">بانتظار المراجعة</option>
                <option value="assigned">تم تعيين فني</option>
                <option value="on_way">الفني في الطريق</option>
                <option value="arrived">وصل الفني</option>
                <option value="in_progress">جاري الفحص</option>
                <option value="completed">تم الفحص</option>
                <option value="report_ready">التقرير جاهز</option>
                <option value="cancelled">ملغي</option>
              </select>

              <textarea
                className="form-input w-full text-sm bg-[#0d1324] border-white/5 rounded-xl outline-none h-20 resize-none"
                placeholder="ملاحظات لتحديث الحالة..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />

              <button
                disabled={actionLoading}
                onClick={handleForceStatus}
                className="btn-secondary w-full py-2.5 rounded-xl text-sm justify-center hover:bg-white/10"
              >
                تحديث الحالة يدوياً
              </button>
            </div>
          </div>

          {/* Timeline status history */}
          <div className="glass-panel p-6 shadow-xl flex flex-col gap-6">
            <h3 className="text-lg font-bold border-b border-white/5 pb-4 flex items-center gap-2 text-violet-400">
              <Activity size={18} />
              <span>تاريخ وسجل التحديثات</span>
            </h3>

            <div className="flex flex-col gap-6 relative pr-4 border-r border-white/10">
              {order.statusHistory.map((log, index) => (
                <div key={index} className="flex flex-col gap-1 relative">
                  {/* Circle pointer */}
                  <div className="absolute right-[-21px] top-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#0b0f19]" />
                  
                  <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                    <span className="font-semibold text-indigo-400">{translateStatus(log.status)}</span>
                    <span>{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                  </div>
                  {log.note && <p className="text-xs text-[#64748b] leading-relaxed">{log.note}</p>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
