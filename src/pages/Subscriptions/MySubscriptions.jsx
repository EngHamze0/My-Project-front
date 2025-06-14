import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, type: null, subscriptionId: null, serviceName: '' });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // جلب الاشتراكات
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data.data);
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
      setConfirmDialog({ show: false, type: null, subscriptionId: null, serviceName: '' });
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
      setConfirmDialog({ show: false, type: null, subscriptionId: null, serviceName: '' });
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
      servicePrice: subscription.service.price
    });
  };

  // إغلاق مربع التأكيد
  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, type: null, subscriptionId: null, serviceName: '' });
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

  // التحقق مما إذا كان الاشتراك نشطًا
  const isSubscriptionActive = (status) => {
    return status === 'active';
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* الإشعارات */}
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        {/* مربع حوار التأكيد */}
        {confirmDialog.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4">
                {confirmDialog.type === 'cancel' ? 'تأكيد إلغاء الاشتراك' : 'تأكيد تجديد الاشتراك'}
              </h3>
              <p className="mb-6">
                {confirmDialog.type === 'cancel' 
                  ? `هل أنت متأكد من رغبتك في إلغاء اشتراكك في "${confirmDialog.serviceName}"؟`
                  : `هل ترغب في تجديد اشتراكك في "${confirmDialog.serviceName}" بمبلغ ${formatPrice(confirmDialog.servicePrice)}؟`
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
            </motion.div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">اشتراكاتي</h1>
          <p className="text-gray-600">عرض جميع اشتراكاتك في الخدمات</p>
        </div>

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
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد اشتراكات</h3>
            <p className="text-gray-500 mb-6">لم تقم بالاشتراك في أي خدمة حتى الآن</p>
            <Link
              to="/services"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              تصفح الخدمات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <motion.div
                key={subscription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {subscription.service.name}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                      {translateStatus(subscription.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 line-clamp-2 mb-4">
                    {subscription.service.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">تاريخ البدء:</span>
                      <span className="text-sm font-medium text-gray-800">{formatDate(subscription.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">تاريخ الانتهاء:</span>
                      <span className="text-sm font-medium text-gray-800">{formatDate(subscription.end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">المبلغ المدفوع:</span>
                      <span className="text-sm font-medium text-primary-600">{formatPrice(subscription.amount_paid)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <Link
                        to={`/services/${subscription.service_id}`}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        عرض الخدمة
                      </Link>
                      <span className="text-xs text-gray-500">
                        تم الاشتراك في {formatDate(subscription.created_at)}
                      </span>
                    </div>
                    
                    {/* أزرار الإجراءات */}
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      {isSubscriptionActive(subscription.status) && (
                        <button
                          onClick={() => showConfirmDialog('cancel', subscription)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        >
                          إلغاء الاشتراك
                        </button>
                      )}
                      
                      {subscription.status !== 'active' && subscription.status !== 'pending' && (
                        <button
                          onClick={() => showConfirmDialog('renew', subscription)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
                        >
                          تجديد الاشتراك
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptions;
