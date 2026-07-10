import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Loader, Save, Sliders, Info } from 'lucide-react';
import ErrorBlock from '../components/ErrorBlock';

export default function Settings() {
  const [settings, setSettings] = useState({
    defaultTransferFee: 150,
    emergencyExtraFee: 150,
    cancellationPolicyAr: '',
    cancellationPolicyEn: ''
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', text: '' }

  const showNotification = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };


  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/settings');
      if (res.data) {
        setSettings({
          defaultTransferFee: res.data.defaultTransferFee ?? 150,
          emergencyExtraFee: res.data.emergencyExtraFee ?? 150,
          cancellationPolicyAr: res.data.cancellationPolicyAr ?? '',
          cancellationPolicyEn: res.data.cancellationPolicyEn ?? ''
        });
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading system settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await apiClient.patch('/admin/settings', settings);
      showNotification('تم تحديث الإعدادات والسياسات بنجاح!');
      fetchSettings();
    } catch (err) {
      showNotification(err.message || 'فشل تحديث الإعدادات', 'error');
    } finally {
      setSaveLoading(false);
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

      <div className="card shadow-lg">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders size={20} className="text-brand" />
          <span>System Settings & Policies</span>
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader size={36} className="animate-spin text-brand" />
        </div>
      ) : error ? (
        <ErrorBlock 
          title="فشل تحميل الإعدادات" 
          message={error} 
          onRetry={fetchSettings} 
        />
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Fees & Rates */}
          <div className="card shadow-xl flex flex-col gap-5">
            <h3 className="text-lg font-bold border-b border-white/5 pb-3 text-brand">Fees & Rate Settings</h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-secondary">Default Visit Transfer Fee (EGP)</label>
              <input
                type="number"
                required
                value={settings.defaultTransferFee}
                onChange={(e) => setSettings({ ...settings, defaultTransferFee: parseFloat(e.target.value) })}
                className="form-input w-full pl-4 py-2"
                placeholder="150"
              />
              <span className="text-xs text-muted">This transfer fee is applied automatically to new bookings and acts as the cancellation fee if visit team is on the way.</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-secondary">Emergency Extra Surcharge (EGP)</label>
              <input
                type="number"
                required
                value={settings.emergencyExtraFee}
                onChange={(e) => setSettings({ ...settings, emergencyExtraFee: parseFloat(e.target.value) })}
                className="form-input w-full pl-4 py-2"
                placeholder="150"
              />
              <span className="text-xs text-muted">Additional fee applied when patients request immediate emergency home visits.</span>
            </div>
          </div>

          {/* Right Column: Policies & Rules */}
          <div className="card shadow-xl flex flex-col gap-5">
            <h3 className="text-lg font-bold border-b border-white/5 pb-3 text-brand">Terms & Policies</h3>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-secondary">Cancellation Policy (Arabic)</label>
              <textarea
                value={settings.cancellationPolicyAr}
                onChange={(e) => setSettings({ ...settings, cancellationPolicyAr: e.target.value })}
                className="form-input w-full pl-4 py-2 h-24 resize-none text-sm"
                placeholder="سيتم فرض رسوم الانتقال في حال إلغاء الطلب بعد تحرك فريق المركز..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-secondary">Cancellation Policy (English)</label>
              <textarea
                value={settings.cancellationPolicyEn}
                onChange={(e) => setSettings({ ...settings, cancellationPolicyEn: e.target.value })}
                className="form-input w-full pl-4 py-2 h-24 resize-none text-sm"
                placeholder="A transfer fee is charged if the booking is cancelled after the medical team starts their trip..."
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saveLoading}
              className="btn-primary flex items-center gap-2 py-3 px-6 cursor-pointer text-sm font-bold bg-brand hover:bg-brand/90 text-white rounded-xl shadow-lg"
            >
              <Save size={16} />
              <span>{saveLoading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
