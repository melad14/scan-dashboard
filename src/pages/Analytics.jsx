import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, Calendar, Award, Loader } from 'lucide-react';

export default function Analytics() {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const statsRes = await apiClient.get('/admin/dashboard');
        setStats(statsRes.data);

        // Fetch completed orders to construct recent daily charts
        const ordersRes = await apiClient.get('/admin/orders?limit=100');
        const completed = ordersRes.data.filter(
          o => o.status === 'completed' || o.status === 'report_ready'
        );

        // Group by last 7 days
        const last7Days = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
          last7Days[dateStr] = 0;
        }

        completed.forEach(order => {
          const dateStr = new Date(order.createdAt).toLocaleDateString('ar-EG', {
            month: 'short',
            day: 'numeric'
          });
          if (last7Days[dateStr] !== undefined) {
            last7Days[dateStr] += order.pricing?.total || 0;
          }
        });

        const formattedChart = Object.keys(last7Days).map(date => ({
          name: date,
          'الإيرادات': last7Days[date]
        }));

        setChartData(formattedChart);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size={48} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="rtl flex flex-col gap-8">
      
      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex items-center justify-between border-l-4 border-indigo-500 shadow-lg">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#94a3b8]">إجمالي المبيعات المحققة</span>
            <span className="text-2xl font-bold text-white">{stats.totalRevenue || 0} ج.م</span>
          </div>
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between border-l-4 border-sky-500 shadow-lg">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#94a3b8]">تغطية الزيارات الطبية</span>
            <span className="text-2xl font-bold text-white">زيارات نشطة</span>
          </div>
          <div className="p-3.5 bg-sky-500/10 rounded-2xl text-sky-400">
            <Calendar size={20} />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between border-l-4 border-emerald-500 shadow-lg">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#94a3b8]">تقييم رضاء العملاء</span>
            <span className="text-2xl font-bold text-white">4.8 / 5.0</span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <Award size={20} />
          </div>
        </div>
      </div>

      {/* Recharts Graphical Panel */}
      <div className="glass-panel p-6 shadow-xl flex flex-col gap-6">
        <h3 className="text-lg font-bold border-b border-white/5 pb-4">مخطط الإيرادات اليومي (آخر 7 أيام)</h3>
        
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#131b2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'Cairo'
                }}
              />
              <Area
                type="monotone"
                dataKey="الإيرادات"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
