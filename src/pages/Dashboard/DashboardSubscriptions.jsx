import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../../services/api';

const DashboardSubscriptions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionsData, setSubscriptionsData] = useState(null);

  // ألوان للرسوم البيانية
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // جلب بيانات الاشتراكات
  useEffect(() => {
    const fetchSubscriptionsData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/dashboard/subscriptions');
        setSubscriptionsData(response.data.data);
        setError('');
      } catch (err) {
        console.error('Error fetching subscriptions data:', err);
        setError('حدث خطأ أثناء جلب بيانات الاشتراكات');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionsData();
  }, []);

  // تحويل بيانات حالة الاشتراكات إلى تنسيق مناسب للرسم البياني
  const getSubscriptionsStatusChartData = () => {
    if (!subscriptionsData) return [];
    
    return [
      { name: 'نشطة', value: subscriptionsData.active },
      { name: 'منتهية', value: subscriptionsData.expired },
      { name: 'ملغاة', value: subscriptionsData.cancelled }
    ];
  };

  // تنسيق القيمة النقدية
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">إحصائيات الاشتراكات</h1>
      
      {error && (
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* إجمالي الاشتراكات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">إجمالي الاشتراكات</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{subscriptionsData?.total || 0}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* الاشتراكات النشطة */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">الاشتراكات النشطة</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{subscriptionsData?.active || 0}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  نسبة النشطة: <span className="font-semibold text-gray-700">
                    {subscriptionsData?.total ? Math.round((subscriptionsData.active / subscriptionsData.total) * 100) : 0}%
                  </span>
                </p>
              </div>
            </div>
            
            {/* الاشتراكات المنتهية */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">الاشتراكات المنتهية</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{subscriptionsData?.expired || 0}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  نسبة المنتهية: <span className="font-semibold text-gray-700">
                    {subscriptionsData?.total ? Math.round((subscriptionsData.expired / subscriptionsData.total) * 100) : 0}%
                  </span>
                </p>
              </div>
            </div>
            
            {/* الاشتراكات الملغاة */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">الاشتراكات الملغاة</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{subscriptionsData?.cancelled || 0}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  نسبة الملغاة: <span className="font-semibold text-gray-700">
                    {subscriptionsData?.total ? Math.round((subscriptionsData.cancelled / subscriptionsData.total) * 100) : 0}%
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {/* بطاقات الإيرادات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* إجمالي الإيرادات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">إجمالي الإيرادات</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(subscriptionsData?.revenue?.total || 0)}
              </p>
            </div>
            
            {/* إيرادات الشهر الحالي */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">إيرادات الشهر الحالي</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(subscriptionsData?.revenue?.current_month || 0)}
              </p>
            </div>
            
            {/* إيرادات السنة الحالية */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">إيرادات السنة الحالية</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(subscriptionsData?.revenue?.current_year || 0)}
              </p>
            </div>
          </div>
          
          {/* الرسوم البيانية */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* حالة الاشتراكات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">حالة الاشتراكات</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getSubscriptionsStatusChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getSubscriptionsStatusChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'العدد']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* اتجاهات الاشتراكات الشهرية */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">اتجاهات الاشتراكات الشهرية</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={subscriptionsData?.monthly_stats || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'revenue') return [`$${value}`, 'الإيرادات'];
                      return [value, 'عدد الاشتراكات'];
                    }} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="count"
                      name="عدد الاشتراكات"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      name="الإيرادات"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* الاشتراكات التي ستنتهي قريباً */}
          {subscriptionsData?.soon_to_expire?.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">الاشتراكات التي ستنتهي قريباً</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المستخدم
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الخدمة
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ البدء
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ الانتهاء
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الأيام المتبقية
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptionsData.soon_to_expire.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{subscription.user_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{subscription.service_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(subscription.start_date).toLocaleDateString('en-US')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(subscription.end_date).toLocaleDateString('en-US')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-red-600">{subscription.days_remaining}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* إحصائيات الاشتراكات الشهرية */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">إحصائيات الاشتراكات الشهرية</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الشهر
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عدد الاشتراكات
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإيرادات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptionsData?.monthly_stats?.map((month, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{month.month}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{month.count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(month.revenue)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSubscriptions; 