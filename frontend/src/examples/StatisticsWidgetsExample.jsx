import React from 'react';
import StatisticsWidget from '../components/Admin/StatisticsWidget';
import StatisticsGrid from '../components/Admin/StatisticsGrid';
import { Users, Briefcase, FileText, BookOpen, Star, TrendingUp } from 'lucide-react';

/**
 * Example Usage of Statistics Widgets
 * 
 * This file demonstrates how to use:
 * - StatisticsWidget (individual widget)
 * - StatisticsGrid (grid with auto-refresh and Pusher)
 */

const StatisticsWidgetsExample = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Statistics Widgets Examples
        </h1>
        <p className="text-gray-600">
          Demonstrating StatisticsWidget and StatisticsGrid components
        </p>
      </div>

      {/* Example 1: Individual StatisticsWidget */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          1. Individual StatisticsWidget
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Positive growth */}
          <StatisticsWidget
            title="المستخدمون النشطون"
            value={1250}
            previousValue={1000}
            icon={Users}
            color="#304B60"
          />

          {/* Negative growth */}
          <StatisticsWidget
            title="الوظائف المفتوحة"
            value={85}
            previousValue={120}
            icon={Briefcase}
            color="#D48161"
          />

          {/* No change */}
          <StatisticsWidget
            title="الطلبات المعلقة"
            value={45}
            previousValue={45}
            icon={FileText}
            color="#304B60"
          />

          {/* Zero previous value */}
          <StatisticsWidget
            title="دورات جديدة"
            value={12}
            previousValue={0}
            icon={BookOpen}
            color="#D48161"
          />

          {/* Large growth */}
          <StatisticsWidget
            title="التقييمات"
            value={500}
            previousValue={200}
            icon={Star}
            color="#304B60"
          />

          {/* Percentage format */}
          <StatisticsWidget
            title="معدل النجاح"
            value={87.5}
            previousValue={82.3}
            icon={TrendingUp}
            color="#D48161"
            format="percentage"
          />
        </div>
      </section>

      {/* Example 2: Loading State */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          2. Loading State
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatisticsWidget
            title="جاري التحميل..."
            value={100}
            previousValue={90}
            icon={Users}
            loading={true}
          />
          <StatisticsWidget
            title="جاري التحميل..."
            value={100}
            previousValue={90}
            icon={Briefcase}
            loading={true}
          />
          <StatisticsWidget
            title="جاري التحميل..."
            value={100}
            previousValue={90}
            icon={FileText}
            loading={true}
          />
        </div>
      </section>

      {/* Example 3: Error State */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          3. Error State
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatisticsWidget
            title="المستخدمون"
            value={100}
            previousValue={90}
            icon={Users}
            error="فشل الاتصال بالخادم"
          />
          <StatisticsWidget
            title="الوظائف"
            value={100}
            previousValue={90}
            icon={Briefcase}
            error="انتهت مهلة الطلب"
          />
          <StatisticsWidget
            title="الطلبات"
            value={100}
            previousValue={90}
            icon={FileText}
            error="خطأ غير متوقع"
          />
        </div>
      </section>

      {/* Example 4: Different Formats */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          4. Different Value Formats
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Number format (default) */}
          <StatisticsWidget
            title="إجمالي المستخدمين"
            value={1234567}
            previousValue={1200000}
            icon={Users}
            color="#304B60"
            format="number"
          />

          {/* Percentage format */}
          <StatisticsWidget
            title="معدل التحويل"
            value={23.45}
            previousValue={20.12}
            icon={TrendingUp}
            color="#D48161"
            format="percentage"
          />

          {/* Currency format */}
          <StatisticsWidget
            title="الإيرادات"
            value={45678.90}
            previousValue={42000}
            icon={Briefcase}
            color="#304B60"
            format="currency"
          />
        </div>
      </section>

      {/* Example 5: StatisticsGrid with Auto-Refresh */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          5. StatisticsGrid (Auto-Refresh + Pusher)
        </h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <StatisticsGrid apiUrl="/api/admin/statistics/overview" />
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Auto-refresh every 30 seconds</li>
              <li>✅ Real-time updates via Pusher</li>
              <li>✅ Displays 5 key statistics</li>
              <li>✅ Loading and error states</li>
              <li>✅ Last update timestamp</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Example 6: Edge Cases */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          6. Edge Cases
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Zero values */}
          <StatisticsWidget
            title="قيم صفرية"
            value={0}
            previousValue={0}
            icon={Users}
            color="#304B60"
          />

          {/* Null value */}
          <StatisticsWidget
            title="قيمة null"
            value={null}
            previousValue={100}
            icon={Briefcase}
            color="#D48161"
          />

          {/* Very large growth */}
          <StatisticsWidget
            title="نمو كبير جداً"
            value={1000}
            previousValue={10}
            icon={TrendingUp}
            color="#304B60"
          />
        </div>
      </section>

      {/* Usage Instructions */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Usage Instructions
        </h2>
        
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">StatisticsWidget Props:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><code>title</code>: Widget title (string)</li>
              <li><code>value</code>: Current value (number)</li>
              <li><code>previousValue</code>: Previous value for comparison (number)</li>
              <li><code>icon</code>: Lucide icon component</li>
              <li><code>color</code>: Icon color (hex string, default: #304B60)</li>
              <li><code>loading</code>: Loading state (boolean, default: false)</li>
              <li><code>error</code>: Error message (string | null)</li>
              <li><code>format</code>: Value format ('number' | 'percentage' | 'currency', default: 'number')</li>
              <li><code>className</code>: Additional CSS classes (string)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">StatisticsGrid Props:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><code>apiUrl</code>: API endpoint for statistics (string, default: '/api/admin/statistics/overview')</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>✅ Color-coded trend indicators (green up, red down, gray stable)</li>
              <li>✅ Automatic growth rate calculation</li>
              <li>✅ Loading skeleton animations</li>
              <li>✅ Error state handling</li>
              <li>✅ Multiple value formats</li>
              <li>✅ Auto-refresh every 30 seconds</li>
              <li>✅ Real-time updates via Pusher</li>
              <li>✅ Responsive grid layout</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StatisticsWidgetsExample;
