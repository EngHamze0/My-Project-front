import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { OrderStatusBadge, OrderStatusSelector } from '../../../components';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // فلاتر البحث
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  
  // قائمة حالات الطلب
  const orderStatuses = [
    { value: '', label: 'جميع الحالات' },
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'processing', label: 'قيد المعالجة' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'refunded', label: 'مسترجع' }
  ];

  // جلب قائمة الطلبات
  useEffect(() => {
    fetchOrders();
  }, [currentPage]);
  
  // تطبيق الفلاتر عند تغييرها
  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, customerFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/user?page=${currentPage}`);
      const ordersData = response.data.data.data;
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setTotalPages(response.data.data.pagination.total_pages);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('حدث خطأ أثناء جلب قائمة الطلبات');
    } finally {
      setLoading(false);
    }
  };

  // تحديث حالة الطلب محليًا
  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
  };
  
  // تطبيق الفلاتر على الطلبات
  const applyFilters = () => {
    let result = [...orders];
    
    // فلترة حسب الحالة
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // فلترة حسب اسم العميل
    if (customerFilter) {
      const searchTerm = customerFilter.toLowerCase();
      result = result.filter(order => 
        (order.user?.name && order.user.name.toLowerCase().includes(searchTerm)) ||
        (order.user?.email && order.user.email.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredOrders(result);
  };
  
  // إعادة ضبط الفلاتر
  const resetFilters = () => {
    setStatusFilter('');
    setCustomerFilter('');
  };

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'usd'
    }).format(price);
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h1>
      </div>

      {error && (
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* قسم الفلاتر */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">فلترة الطلبات</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              حالة الطلب
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="customerFilter" className="block text-sm font-medium text-gray-700 mb-1">
              بحث باسم العميل أو البريد الإلكتروني
            </label>
            <input
              type="text"
              id="customerFilter"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              placeholder="اكتب اسم العميل أو البريد الإلكتروني..."
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        </div>
        
        {/* عرض عدد النتائج بعد الفلترة */}
        <div className="mt-4 text-sm text-gray-600">
          تم العثور على {filteredOrders.length} طلب {filteredOrders.length !== orders.length && `(من أصل ${orders.length})`}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 text-lg">
            {orders.length === 0 ? 'لا توجد طلبات حاليًا' : 'لا توجد طلبات تطابق معايير البحث'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الطلب
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المجموع
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الطلب
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    حالة الطلب
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.user?.name || 'غير متوفر'}</div>
                      <div className="text-sm text-gray-500">{order.user?.email || 'غير متوفر'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(order.total)}</div>
                      {order.discount > 0 && (
                        <div className="text-xs text-green-600">خصم: {formatPrice(order.discount)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <OrderStatusSelector 
                          orderId={order.id} 
                          currentStatus={order.status} 
                          onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                        />
                        
                        <Link
                          to={`/dashboard/orders/${order.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          عرض التفاصيل
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* ترقيم الصفحات */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <nav className="flex justify-center">
                <ul className="flex items-center space-x-2 space-x-reverse">
                  <li>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      السابق
                    </button>
                  </li>
                  
                  {[...Array(totalPages).keys()].map(page => (
                    <li key={page + 1}>
                      <button
                        onClick={() => setCurrentPage(page + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === page + 1
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      التالي
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersList; 