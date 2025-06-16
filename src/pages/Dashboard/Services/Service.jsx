import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const Service = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  // تغيير حالة الخدمة (تفعيل/تعطيل)
  const handleToggleStatus = async () => {
    try {
      await api.get(`/services/toggle-status/${id}`);
      
      // تحديث حالة الخدمة في الواجهة
      setService(prev => ({
        ...prev,
        is_active: prev.is_active ? 0 : 1
      }));
      
      showNotification(`تم ${service.is_active ? 'تعطيل' : 'تفعيل'} الخدمة بنجاح`, 'success');
    } catch (err) {
      console.error('Error toggling service status:', err);
      showNotification('حدث خطأ أثناء تغيير حالة الخدمة', 'error');
    }
  };

  // حذف الخدمة
  const handleDelete = async () => {
    try {
      await api.delete(`/services/${id}`);
      
      showNotification('تم حذف الخدمة بنجاح', 'success');
      
      // الانتقال إلى صفحة الخدمات بعد ثانيتين
      setTimeout(() => {
        navigate('/dashboard/services');
      }, 2000);
    } catch (err) {
      console.error('Error deleting service:', err);
      showNotification('حدث خطأ أثناء حذف الخدمة', 'error');
    } finally {
      setConfirmDelete(false);
    }
  };

  // عرض إشعار
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // تنسيق السعر
   const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
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
      
      {/* مربع حوار تأكيد الحذف */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">تأكيد الحذف</h3>
            <p className="mb-6">هل أنت متأكد من رغبتك في حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
              <button 
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                إلغاء
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                حذف
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* رأس الصفحة مع أزرار الإجراءات */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <Link 
            to="/dashboard/services" 
            className="flex items-center text-primary-600 hover:text-primary-800 mb-4 md:mb-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            العودة إلى الخدمات
          </Link>
          <h1 className="text-2xl font-bold">تفاصيل الخدمة</h1>
        </div>
        
        {!loading && !error && service && (
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Link 
              to={`/dashboard/services/edit/${id}`}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              تعديل
            </Link>
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 ${
                service.is_active 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white rounded-md transition-colors flex items-center`}
            >
              {service.is_active ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  تعطيل
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  تفعيل
                </>
              )}
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              حذف
            </button>
          </div>
        )}
      </div>
      
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* رأس البطاقة مع الحالة */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{service.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {service.is_active ? 'مفعلة' : 'معطلة'}
              </span>
            </div>
          </div>
          
          {/* تفاصيل الخدمة */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* القسم الأيمن - التفاصيل الأساسية */}
            <div>
              <h3 className="text-lg font-semibold mb-4">تفاصيل الخدمة</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">الوصف</h4>
                  <p className="mt-1 text-gray-800">{service.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">السعر</h4>
                    <p className="mt-1 text-gray-800 font-semibold">{formatPrice(service.price)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">المدة</h4>
                    <p className="mt-1 text-gray-800">{service.duration_days} يوم</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* القسم الأيسر - معلومات إضافية */}
            <div>
              <h3 className="text-lg font-semibold mb-4">معلومات إضافية</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">تاريخ الإنشاء</h4>
                  <p className="mt-1 text-gray-800">{formatDate(service.created_at)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">آخر تحديث</h4>
                  <p className="mt-1 text-gray-800">{formatDate(service.updated_at)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">المعرف</h4>
                  <p className="mt-1 text-gray-800">{service.id}</p>
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
    </motion.div>
  );
};

export default Service;
