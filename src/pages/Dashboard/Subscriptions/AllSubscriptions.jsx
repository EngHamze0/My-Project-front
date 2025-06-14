import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const AllSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    per_page: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, type: null, subscriptionId: null, serviceName: '', userName: '' });

  useEffect(() => {
    fetchSubscriptions();
  }, [filters]);

  // جلب الاشتراكات
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('page', filters.page);
      queryParams.append('per_page', filters.per_page);
      
      const response = await api.get(`/subscriptions?${queryParams.toString()}`);
      
      setSubscriptions(response.data.data);
      
      // تعيين بيانات الترقيم إذا كانت متوفرة في الاستجابة
      if (response.data.meta) {
        setPagination({
          total: response.data.meta.total || 0,
          currentPage: response.data.meta.current_page || 1,
          lastPage: response.data.meta.last_page || 1
        });
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('حدث خطأ أثناء جلب بيانات الاشتراكات');
    } finally {
      setLoading(false);
    }
  };

  // إلغاء الاشتراك
  const cancelSubscription = async (subscriptionId) => {
    setActionLoading(subscriptionId);
    try {
      await api.get(`/subscriptions/${subscriptionId}/cancel`);
      
      // تحديث حالة الاشتراك في القائمة المحلية
      setSubscriptions(prevSubscriptions => 
        prevSubscriptions.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: 'cancelled' } 
            : sub
        )
      );
      
      // إغلاق مربع التأكيد وعرض إشعار نجاح
      setConfirmDialog({ show: false, type: null, subscriptionId: null, serviceName: '', userName: '' });
      showNotification('تم إلغاء الاشتراك بنجاح', 'success');
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      showNotification('حدث خطأ أثناء إلغاء الاشتراك', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // تجديد الاشتراك
  const renewSubscription = async (subscriptionId, servicePrice) => {
    setActionLoading(subscriptionId);
    try {
      await api.post(`/subscriptions/${subscriptionId}/renew`, {
        amount_paid: servicePrice
      });
      
      // إعادة تحميل الاشتراكات لعرض البيانات المحدثة
      await fetchSubscriptions();
      
      // إغلاق مربع التأكيد وعرض إشعار نجاح
      setConfirmDialog({ show: false, type: null, subscriptionId: null, serviceName: '', userName: '' });
      showNotification('تم تجديد الاشتراك بنجاح', 'success');
    } catch (err) {
      console.error('Error renewing subscription:', err);
      showNotification('حدث خطأ أثناء تجديد الاشتراك', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // عرض مربع تأكيد للإلغاء أو التجديد
  const showConfirmDialog = (type, subscription) => {
    setConfirmDialog({
      show: true,
      type,
      subscriptionId: subscription.id,
      serviceName: subscription.service.name,
      userName: subscription.user.name,
      servicePrice: subscription.service.price
    });
  };

  // إغلاق مربع التأكيد
  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, type: null, subscriptionId: null, serviceName: '', userName: '' });
  };

  // عرض إشعار
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // التعامل مع تغيير الفلاتر
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // إعادة تعيين الصفحة عند تغيير الفلاتر
    }));
  };

  // التعامل مع تغيير الصفحة
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.lastPage) return;
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  };

  // ترجمة حالة الاشتراك
  const translateStatus = (status) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'expired':
        return 'منتهي';
      case 'pending':
        return 'قيد المعالجة';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  // تحديد لون حالة الاشتراك
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // تحضير أزرار الترقيم
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // عدد الأزرار التي ستظهر
    
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(pagination.lastPage, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // زر الصفحة السابقة
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
        className={`px-3 py-1 mx-1 rounded ${
          pagination.currentPage === 1
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        } border`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
    
    // أزرار الصفحات
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            pagination.currentPage === i
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } border`}
        >
          {i}
        </button>
      );
    }
    
    // زر الصفحة التالية
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === pagination.lastPage}
        className={`px-3 py-1 mx-1 rounded ${
          pagination.currentPage === pagination.lastPage
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        } border`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
    
    return buttons;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* الإشعارات */}
      {notification.show && (
        <div className={`mb-4 p-4 rounded-md ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* مربع حوار التأكيد */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {confirmDialog.type === 'cancel' ? 'تأكيد إلغاء الاشتراك' : 'تأكيد تجديد الاشتراك'}
            </h3>
            <p className="mb-6">
              {confirmDialog.type === 'cancel' 
                ? `هل أنت متأكد من رغبتك في إلغاء اشتراك "${confirmDialog.userName}" في "${confirmDialog.serviceName}"؟`
                : `هل ترغب في تجديد اشتراك "${confirmDialog.userName}" في "${confirmDialog.serviceName}" بمبلغ ${formatPrice(confirmDialog.servicePrice)}؟`
              }
            </p>
            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
              <button 
                onClick={closeConfirmDialog}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={actionLoading === confirmDialog.subscriptionId}
              >
                إلغاء
              </button>
              <button 
                onClick={() => confirmDialog.type === 'cancel' 
                  ? cancelSubscription(confirmDialog.subscriptionId)
                  : renewSubscription(confirmDialog.subscriptionId, confirmDialog.servicePrice)
                }
                disabled={actionLoading === confirmDialog.subscriptionId}
                className={`px-4 py-2 rounded-md text-white flex items-center ${
                  confirmDialog.type === 'cancel' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                {actionLoading === confirmDialog.subscriptionId ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري التنفيذ...
                  </>
                ) : confirmDialog.type === 'cancel' ? 'تأكيد الإلغاء' : 'تأكيد التجديد'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة اشتراكات المستخدمين</h1>
      </div>

      {/* فلاتر البحث */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">بحث</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="بحث باسم المستخدم أو الخدمة..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="expired">منتهي</option>
              <option value="pending">قيد المعالجة</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchSubscriptions()}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* جدول الاشتراكات */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md text-center">
          <p className="text-yellow-700">لا توجد اشتراكات مطابقة للفلاتر المحددة</p>
        </div>
      ) : (
        <>
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
                    المبلغ
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{subscription.user.name}</div>
                          <div className="text-sm text-gray-500">{subscription.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{subscription.service.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{subscription.service.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(subscription.amount_paid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                        {translateStatus(subscription.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        {subscription.status === 'active' && (
                          <button
                            onClick={() => showConfirmDialog('cancel', subscription)}
                            className="text-red-600 hover:text-red-900"
                            disabled={actionLoading === subscription.id}
                          >
                            إلغاء
                          </button>
                        )}
                        {subscription.status !== 'active' && subscription.status !== 'pending' && (
                          <button
                            onClick={() => showConfirmDialog('renew', subscription)}
                            className="text-primary-600 hover:text-primary-900"
                            disabled={actionLoading === subscription.id}
                          >
                            تجديد
                          </button>
                        )}
                        <Link
                          to={`/dashboard/services/${subscription.service_id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          عرض الخدمة
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ترقيم الصفحات */}
          {pagination.lastPage > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex">{renderPaginationButtons()}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllSubscriptions;
