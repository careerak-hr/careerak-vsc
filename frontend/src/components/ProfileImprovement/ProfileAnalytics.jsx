import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Users, Building2, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import './ProfileImprovement.css';

/**
 * Profile Analytics Component
 * Requirements: 11.2
 */
const ProfileAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/profile/analytics?period=${period}`);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-50 rounded-2xl"></div>;
  if (!data) return null;

  return (
    <div className="analytics-widget bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-accent" size={24} />
          <h2 className="text-xl font-bold text-primary dark:text-white font-amiri">إحصائيات الملف الشخصي</h2>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-sm border-none bg-secondary/20 rounded-lg p-2 outline-none text-primary font-bold"
        >
          <option value="7">آخر 7 أيام</option>
          <option value="30">آخر 30 يوم</option>
          <option value="90">آخر 3 أشهر</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي المشاهدات</p>
              <h3 className="text-3xl font-black text-primary">{data.summary.totalViews}</h3>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-green-600 font-bold">
            <ArrowUpRight size={14} />
            <span>نمو مستمر في التفاعل</span>
          </div>
        </div>

        <div className="bg-accent/5 p-6 rounded-2xl border border-accent/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">مشاهدات الشركات</p>
              <h3 className="text-3xl font-black text-accent">{data.lastCompanies.length}</h3>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm text-accent">
              <Building2 size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            اهتمام ملحوظ من أصحاب العمل
          </div>
        </div>
      </div>

      {/* Views Chart */}
      <div className="h-64 w-full mb-10">
        <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
          <Calendar size={16} /> توزيع المشاهدات اليومي
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.viewsByDay}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="_id"
              hide={true}
            />
            <YAxis hide={true} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#304B60' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#D48161"
              strokeWidth={4}
              dot={{ r: 4, fill: '#D48161', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, shadow: '0 0 10px rgba(212,129,97,0.5)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Last Companies List */}
      <div>
        <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
          <Building2 size={16} /> آخر الشركات المهتمة
        </h4>
        <div className="space-y-3">
          {data.lastCompanies.length > 0 ? data.lastCompanies.map((company, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 font-black text-primary">
                  {company.viewerCompanyName?.charAt(0)}
                </div>
                <span className="font-bold text-primary dark:text-white">{company.viewerCompanyName}</span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(company.timestamp).toLocaleDateString('ar-EG')}
              </span>
            </div>
          )) : (
            <p className="text-sm text-gray-400 italic text-center py-4">لم تشاهد أي شركة ملفك مؤخراً.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileAnalytics;
