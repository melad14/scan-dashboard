import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Settings, ShieldAlert, DollarSign, Loader, CheckCircle } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pricing config form states
  const [transferFeeBase, setTransferFeeBase] = useState(100);
  const [emergencySurcharge, setEmergencySurcharge] = useState(150);
  const [homeServiceFee, setHomeServiceFee] = useState(50);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const servicesRes = await apiClient.get('/services');
      setServices(servicesRes.data);

      const pricingRes = await apiClient.get('/services/pricing');
      if (pricingRes.data) {
        setTransferFeeBase(pricingRes.data.transferFeeBase);
        setEmergencySurcharge(pricingRes.data.emergencySurcharge);
        setHomeServiceFee(pricingRes.data.homeServiceFee);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تحميل الخدمات والتسعير');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePricing = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiClient.put('/admin/pricing', {
        transferFeeBase: Number(transferFeeBase),
        emergencySurcharge: Number(emergencySurcharge),
        homeServiceFee: Number(homeServiceFee)
      });
      alert('تم تحديث تسعيرة رسوم المنصة بنجاح!');
      fetchData();
    } catch (err) {
      alert(err.message || 'فشل التحديث');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="rtl grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left side: Services List */}
      <div className="lg:col-span-2 glass-panel p-6 shadow-xl flex flex-col gap-6">
        <h3 className="text-lg font-bold border-b border-white/5 pb-4 flex items-center gap-2 text-indigo-400">
          <Settings size={18} />
          <span>كتالوج الفحوصات والخدمات الطبية</span>
        </h3>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size={36} className="animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="custom-table text-right">
              <thead>
                <tr className="text-right">
                  <th>الخدمة الطبية (عربي)</th>
                  <th>الاسم بالإنجليزية</th>
                  <th>التصنيف</th>
                  <th>السعر الأساسي</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id}>
                    <td className="font-semibold text-white">{service.nameAr}</td>
                    <td>{service.nameEn}</td>
                    <td>
                      <span className={`badge ${service.category === 'xray' ? 'badge-assigned' : 'badge-completed'}`}>
                        {service.category === 'xray' ? 'أشعة منزلية' : 'تحاليل مخبرية'}
                      </span>
                    </td>
                    <td className="font-bold text-white">{service.price} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right side: Pricing Config Form */}
      <div className="lg:col-span-1 glass-panel p-6 shadow-xl flex flex-col gap-6">
        <h3 className="text-lg font-bold border-b border-white/5 pb-4 flex items-center gap-2 text-amber-500">
          <DollarSign size={18} />
          <span>إعداد تسعير الانتقال والرسوم</span>
        </h3>

        <form onSubmit={handleUpdatePricing} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#94a3b8] mr-1">رسوم انتقال الفني الأساسية (ج.م)</label>
            <input
              type="number"
              required
              className="form-input text-sm"
              value={transferFeeBase}
              onChange={(e) => setTransferFeeBase(e.target.value)}
            />
            <span className="text-[10px] text-[#64748b] mr-1">
              الرسوم الثابتة التي تضاف لتغطية تكلفة انتقال الفني للطلب العادي.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#94a3b8] mr-1">مضاعف/رسوم الطوارئ الإضافية (ج.م)</label>
            <input
              type="number"
              required
              className="form-input text-sm"
              value={emergencySurcharge}
              onChange={(e) => setEmergencySurcharge(e.target.value)}
            />
            <span className="text-[10px] text-[#64748b] mr-1">
              رسوم إضافية تضاف للفاتورة إذا اختار المريض فحص طوارئ فوري.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#94a3b8] mr-1">رسوم الخدمة المنزلية الثابتة (ج.م)</label>
            <input
              type="number"
              required
              className="form-input text-sm"
              value={homeServiceFee}
              onChange={(e) => setHomeServiceFee(e.target.value)}
            />
            <span className="text-[10px] text-[#64748b] mr-1">
              رسوم الخدمة الطبية بالمنزل الإضافية.
            </span>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="btn-primary w-full py-2.5 rounded-xl text-sm justify-center mt-2"
          >
            {actionLoading ? 'جاري الحفظ...' : 'تحديث إعدادات الفاتورة'}
          </button>
        </form>
      </div>

    </div>
  );
}
