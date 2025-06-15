import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [servicesData, setServicesData] = useState(null);
  const [subscriptionsData, setSubscriptionsData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);

  // ألوان للرسوم البيانية
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // جلب بيانات لوحة التحكم
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // جلب البيانات العامة
        const dashboardResponse = await api.get('/dashboard');
        setDashboardData(dashboardResponse.data.data);
        
        // جلب بيانات المستخدمين
        const usersResponse = await api.get('/dashboard/users');
        setUsersData(usersResponse.data.data);
        
        // جلب بيانات الخدمات
        const servicesResponse = await api.get('/dashboard/services');
        setServicesData(servicesResponse.data.data);
        
        // جلب بيانات الاشتراكات
        const subscriptionsResponse = await api.get('/dashboard/subscriptions');
        setSubscriptionsData(subscriptionsResponse.data.data);
        
        // جلب بيانات الطلبات
        const ordersResponse = await api.get('/dashboard/orders');
        setOrdersData(ordersResponse.data.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('حدث خطأ أثناء جلب بيانات لوحة التحكم');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // تحويل بيانات المستخدمين إلى تنسيق مناسب للرسم البياني
  const getUsersChartData = () => {
    if (!usersData) return [];
    
    return [
      { name: 'نشط', value: usersData.active },
      { name: 'غير نشط', value: usersData.inactive }
    ];
  };

  // تحويل بيانات الخدمات إلى تنسيق مناسب للرسم البياني
  const getServicesChartData = () => {
    if (!servicesData) return [];
    
    return [
      { name: 'نشط', value: servicesData.active },
      { name: 'غير نشط', value: servicesData.inactive }
    ];
  };

  // تحويل بيانات الاشتراكات إلى تنسيق مناسب للرسم البياني
  const getSubscriptionsChartData = () => {
    if (!subscriptionsData) return [];
    
    return [
      { name: 'نشط', value: subscriptionsData.active },
      { name: 'منتهي', value: subscriptionsData.expired },
      { name: 'ملغي', value: subscriptionsData.cancelled }
    ];
  };

  // تحويل بيانات الطلبات إلى تنسيق مناسب للرسم البياني
  const getOrdersStatusChartData = () => {
    if (!ordersData) return [];
    
    return [
      { name: 'قيد الانتظار', value: ordersData.by_status.pending },
      { name: 'قيد المعالجة', value: ordersData.by_status.processing },
      { name: 'مكتمل', value: ordersData.by_status.completed },
      { name: 'ملغي', value: ordersData.by_status.cancelled },
      { name: 'مسترد', value: ordersData.by_status.refunded }
    ];
  };

  // تنسيق القيمة النقدية
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  // تنسيق نسبة مئوية
  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">لوحة التحكم</h1>
      
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
            {/* إحصائيات المستخدمين */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">المستخدمين</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{usersData?.total || 0}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  جديد هذا الشهر: <span className="font-semibold text-gray-700">{usersData?.new_this_month || 0}</span>
                </p>
              </div>
            </div>
            
            {/* إحصائيات الخدمات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">الخدمات</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{servicesData?.total || 0}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  نشطة: <span className="font-semibold text-gray-700">{servicesData?.active || 0}</span>
                </p>
              </div>
            </div>
            
            {/* إحصائيات الاشتراكات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">الاشتراكات</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{subscriptionsData?.total || 0}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  نشطة: <span className="font-semibold text-gray-700">{subscriptionsData?.active || 0}</span>
                </p>
              </div>
            </div>
            
            {/* إحصائيات الطلبات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">الطلبات</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{ordersData?.total || 0}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  جديدة اليوم: <span className="font-semibold text-gray-700">{ordersData?.new_orders?.today || 0}</span>
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
                {formatCurrency(dashboardData?.revenue?.total || 0)}
              </p>
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">الاشتراكات</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatCurrency(dashboardData?.revenue?.subscriptions || 0)}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">الطلبات</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatCurrency(dashboardData?.revenue?.orders || 0)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* إيرادات الشهر الحالي */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">إيرادات الشهر الحالي</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(dashboardData?.revenue?.current_month || 0)}
              </p>
            </div>
            
            {/* متوسط قيمة الطلب */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">متوسط قيمة الطلب</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(ordersData?.revenue?.average_order_value || 0)}
              </p>
            </div>
          </div>
          
          {/* الرسوم البيانية */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* رسم بياني لاتجاهات الاشتراكات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">اتجاهات الاشتراكات</h3>
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
                    <Tooltip />
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
            
            {/* رسم بياني لإحصائيات الطلبات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">إحصائيات الطلبات</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ordersData?.monthly_stats || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="عدد الطلبات" fill="#8884d8" />
                    <Bar dataKey="revenue" name="الإيرادات" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* الرسوم البيانية الدائرية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* حالة المستخدمين */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">حالة المستخدمين</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getUsersChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getUsersChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* حالة الخدمات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">حالة الخدمات</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getServicesChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getServicesChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* حالة الاشتراكات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">حالة الاشتراكات</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getSubscriptionsChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getSubscriptionsChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* حالة الطلبات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">حالة الطلبات</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getOrdersStatusChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getOrdersStatusChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* الخدمات الأكثر اشتراكاً */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">الخدمات الأكثر اشتراكاً</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الخدمة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السعر
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المدة (أيام)
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عدد الاشتراكات
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      إجمالي الإيرادات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {servicesData?.top_subscribed?.map((service) => (
                    <tr key={service.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(service.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{service.duration_days}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{service.subscriptions_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(service.total_revenue)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* أفضل العملاء */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">أفضل العملاء</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      البريد الإلكتروني
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عدد الطلبات
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عدد الاشتراكات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordersData?.top_customers?.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">{customer.name.charAt(0)}</span>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.orders_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {usersData?.top_subscribers?.find(user => user.id === customer.id)?.subscriptions_count || 0}
                        </div>
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

export default Dashboard;
