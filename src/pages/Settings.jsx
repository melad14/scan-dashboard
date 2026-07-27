import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Loader, Save, Sliders } from 'lucide-react';
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
  const { showToast } = useToast();

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
      showToast('System settings and policies updated successfully!');
      fetchSettings();
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="card">
        <div className="section-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
          <h2 className="section-title" style={{ fontSize: '18px' }}>
            <Sliders size={18} className="icon" />
            <span>System Settings & Policies</span>
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="loading-center">
          <Loader size={36} className="animate-spin" />
        </div>
      ) : error ? (
        <ErrorBlock 
          title="Failed to load settings" 
          message={error} 
          onRetry={fetchSettings} 
        />
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

          {/* Left Column: Fees & Rates */}
          <div className="card flex flex-col gap-4">
            <div className="section-header">
              <h3 className="section-title">Fees & Rates</h3>
            </div>
            
            <div className="form-group">
              <label className="form-label">Default Visit Transfer Fee (EGP)</label>
              <input
                type="number"
                required
                value={settings.defaultTransferFee}
                onChange={(e) => setSettings({ ...settings, defaultTransferFee: parseFloat(e.target.value) })}
                className="form-input"
                placeholder="150"
              />
              <span className="form-hint">Applied automatically to new bookings and acts as cancellation fee if team is en route.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Extra Surcharge (EGP)</label>
              <input
                type="number"
                required
                value={settings.emergencyExtraFee}
                onChange={(e) => setSettings({ ...settings, emergencyExtraFee: parseFloat(e.target.value) })}
                className="form-input"
                placeholder="150"
              />
              <span className="form-hint">Additional fee applied when patients request immediate emergency home visits.</span>
            </div>
          </div>

          {/* Right Column: Policies & Rules */}
          <div className="card flex flex-col gap-4">
            <div className="section-header">
              <h3 className="section-title">Terms & Policies</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Cancellation Policy (Arabic)</label>
              <textarea
                value={settings.cancellationPolicyAr}
                onChange={(e) => setSettings({ ...settings, cancellationPolicyAr: e.target.value })}
                className="form-input"
                style={{ minHeight: '90px' }}
                placeholder="سيتم فرض رسوم الانتقال في حال إلغاء الطلب بعد تحرك فريق المركز..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cancellation Policy (English)</label>
              <textarea
                value={settings.cancellationPolicyEn}
                onChange={(e) => setSettings({ ...settings, cancellationPolicyEn: e.target.value })}
                className="form-input"
                style={{ minHeight: '90px' }}
                placeholder="A transfer fee is charged if the booking is cancelled after the medical team starts their trip..."
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saveLoading}
              className="btn-primary"
              style={{ padding: '10px 24px' }}
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
