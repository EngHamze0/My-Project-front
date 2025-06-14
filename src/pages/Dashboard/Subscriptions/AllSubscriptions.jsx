import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const AllSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    per_page: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
  }, []);

  // فلترة الاشتراكات عند تغيير مصطلح البحث أو حالة الفلتر
  useEffect(() => {
    if (subscriptions.length > 0) {
      filterSubscriptions();
    }
  }, [searchTerm, statusFilter, subscriptions]);

  // وظيفة فلترة الاشتراكات
  const filterSubscriptions = () => {
    let results = [...subscriptions];
    
    // فلترة حسب مصطلح البحث (اسم الخدمة أو اسم المستخدم)
    if (searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase().trim();
      results = results.filter(subscription => 
        subscription.service.name.toLowerCase().includes(searchTermLower) || 
        subscription.user.name.toLowerCase().includes(searchTermLower) ||
        subscription.user.email.toLowerCase().includes(searchTermLower)
      );
    }
    
    // فلترة حسب الحالة
    if (statusFilter !== '') {
      results = results.filter(subscription => subscription.status === statusFilter);
    }
    
    setFilteredSubscriptions(results);
  };

  // جلب الاشتراكات
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/subscriptions`);
      const data = response.data.data;
      setSubscriptions(data);
      setFilteredSubscriptions(data);
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
      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: 'cancelled' } 
          : sub
      );
      
      setSubscriptions(updatedSubscriptions);
      
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم المستخدم أو الخدمة..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              id="status"
              name="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors mr-2"
            >
              إعادة تعيين
            </button>
            <button
              onClick={() => fetchSubscriptions()}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              تحديث
            </button>
          </div>
        </div>
      </div>

      {/* معلومات الفلتر */}
      {(searchTerm || statusFilter) && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {`عرض ${filteredSubscriptions.length} من أصل ${subscriptions.length} اشتراك`}
              {searchTerm && ` (البحث: ${searchTerm})`}
              {statusFilter && ` (الحالة: ${translateStatus(statusFilter)})`}
            </span>
          </div>
        </div>
      )}

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
      ) : filteredSubscriptions.length === 0 ? (
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
                {filteredSubscriptions.map((subscription) => (
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
        </>
      )}
    </div>
  );
};

export default AllSubscriptions;
