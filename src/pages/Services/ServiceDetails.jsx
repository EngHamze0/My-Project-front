import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useEffect, useState } from 'react';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSubscriptionConfirm, setShowSubscriptionConfirm] = useState(false);

  // جلب بيانات الخدمة
  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/services/${id}`);
        setService(response.data.data);
        setError('');
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('حدث خطأ أثناء جلب بيانات الخدمة');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // التحقق من تسجيل دخول المستخدم
  const checkUserLoggedIn = () => {
    const user = localStorage.getItem('user');
    return !!user;
  };

  // الحصول على معرف المستخدم
  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.id;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  // فتح مربع حوار تأكيد الاشتراك
  const openSubscriptionConfirm = () => {
    // التحقق من تسجيل دخول المستخدم
    if (!checkUserLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }
    
    // عرض مربع حوار التأكيد
    setShowSubscriptionConfirm(true);
  };

  // إغلاق مربع حوار تأكيد الاشتراك
  const closeSubscriptionConfirm = () => {
    setShowSubscriptionConfirm(false);
  };

  // الاشتراك في الخدمة
  const handleSubscribe = async () => {
    const userId = getUserId();
    if (!userId) {
      showNotification('لم يتم العثور على معلومات المستخدم', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const subscriptionData = {
        user_id: userId,
        service_id: parseInt(id),
        amount_paid: service.price
      };
      
      // إرسال طلب الاشتراك
      await api.post('/subscriptions', subscriptionData);
      
      // إغلاق مربع حوار التأكيد
      setShowSubscriptionConfirm(false);
      
      // عرض رسالة نجاح
      showNotification('تم الاشتراك في الخدمة بنجاح', 'success');
      
      // الانتقال إلى صفحة الاشتراكات بعد ثانيتين
      setTimeout(() => {
        navigate('/subscriptions');
      }, 2000);
      
    } catch (err) {
      console.error('Error subscribing to service:', err);
      
      // عرض رسالة الخطأ
      if (err.response && err.response.data && err.response.data.message) {
        showNotification(err.response.data.message, 'error');
      } else {
        showNotification('حدث خطأ أثناء الاشتراك في الخدمة', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // توجيه المستخدم إلى صفحة تسجيل الدخول
  const handleRedirectToLogin = () => {
    navigate('/login', { state: { returnUrl: `/services/${id}` } });
  };

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
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

  // عرض إشعار
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
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

        {/* مربع حوار تسجيل الدخول */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4">تسجيل الدخول مطلوب</h3>
              <p className="mb-6">يجب عليك تسجيل الدخول أولاً للاشتراك في هذه الخدمة.</p>
              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <button 
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleRedirectToLogin}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                >
                  تسجيل الدخول
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* مربع حوار تأكيد الاشتراك */}
        {showSubscriptionConfirm && service && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4">تأكيد الاشتراك</h3>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">اسم الخدمة:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">المدة:</span>
                  <span className="font-medium">{service.duration_days} يوم</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="font-medium text-primary-600">{formatPrice(service.price)}</span>
                </div>
              </div>
              <p className="mb-6">
                هل أنت متأكد من رغبتك في الاشتراك في خدمة "{service.name}" بمبلغ {formatPrice(service.price)}؟
              </p>
              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <button 
                  onClick={closeSubscriptionConfirm}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleSubscribe}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري التنفيذ...
                    </>
                  ) : 'تأكيد الاشتراك'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* رابط العودة */}
        <Link 
          to="/services" 
          className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          العودة إلى الخدمات
        </Link>

        {/* عرض الخدمة */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-bold">خطأ</p>
            <p>{error}</p>
          </div>
        ) : service ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row">
                {/* القسم الأيمن - التفاصيل الرئيسية */}
                <div className="lg:w-2/3 lg:pl-8">
                  <div className="flex justify-between items-start mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">{service.name}</h1>
                    {service.is_active ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                        متاح
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                        غير متاح
                      </span>
                    )}
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">الوصف</h2>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">المدة</h3>
                      <p className="text-lg font-medium text-gray-800">{service.duration_days} يوم</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">تاريخ الإضافة</h3>
                      <p className="text-lg font-medium text-gray-800">{formatDate(service.created_at)}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">مميزات الخدمة</h2>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        جودة عالية في التنفيذ
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        دعم فني على مدار الساعة
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        ضمان الرضا أو استرداد المبلغ
                      </li>
                    </ul>
                  </div>
                </div>

                {/* القسم الأيسر - الاشتراك والسعر */}
                <div className="lg:w-1/3 mt-8 lg:mt-0">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">السعر</h3>
                      <p className="text-3xl font-bold text-primary-600">{formatPrice(service.price)}</p>
                      <p className="text-sm text-gray-500 mt-1">لمدة {service.duration_days} يوم</p>
                    </div>

                    {service.is_active ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-md">
                          <h4 className="text-blue-800 font-medium mb-2">ماذا ستحصل عليه؟</h4>
                          <ul className="text-blue-700 text-sm space-y-1">
                            <li>• الوصول الكامل للخدمة</li>
                            <li>• دعم فني متواصل</li>
                            <li>• تحديثات مجانية</li>
                          </ul>
                        </div>

                        <button
                          onClick={openSubscriptionConfirm}
                          className="w-full px-4 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center justify-center"
                        >
                          اشترك الآن
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                          بالضغط على "اشترك الآن"، فإنك توافق على شروط الخدمة وسياسة الخصوصية.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-50 p-4 rounded-md">
                        <p className="text-red-800 text-center">
                          هذه الخدمة غير متاحة حالياً
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-r-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
            <p className="font-bold">لم يتم العثور على الخدمة</p>
            <p>الخدمة المطلوبة غير موجودة أو تم حذفها.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetails; 