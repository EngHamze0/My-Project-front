import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const AddServices = () => {
  const navigate = useNavigate();
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: '',
    is_active: true
  });
  
  // حالة الإرسال
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // التعامل مع تغيير قيم الحقول
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // إزالة رسالة الخطأ عند تعديل الحقل
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // التحقق من صحة النموذج
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم الخدمة مطلوب';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'وصف الخدمة مطلوب';
    }
    
    if (!formData.price) {
      newErrors.price = 'سعر الخدمة مطلوب';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'يجب أن يكون السعر رقماً موجباً';
    }
    
    if (!formData.duration_days) {
      newErrors.duration_days = 'مدة الخدمة مطلوبة';
    } else if (isNaN(formData.duration_days) || parseInt(formData.duration_days) <= 0) {
      newErrors.duration_days = 'يجب أن تكون المدة رقماً صحيحاً موجباً';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من صحة النموذج
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // تحويل القيم الرقمية
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        is_active: formData.is_active ? 1 : 0
      };
      
      // إرسال البيانات إلى API
      const response = await api.post('/services', serviceData);
      
      // عرض رسالة نجاح
      showNotification('تم إضافة الخدمة بنجاح', 'success');
      
      // الانتقال إلى صفحة الخدمات بعد ثانيتين
      setTimeout(() => {
        navigate('/dashboard/services');
      }, 2000);
      
    } catch (err) {
      console.error('Error adding service:', err);
      
      // التحقق من وجود أخطاء تحقق من الخادم
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        showNotification('حدث خطأ أثناء إضافة الخدمة', 'error');
      }
    } finally {
      setIsSubmitting(false);
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
      
      {/* رأس الصفحة */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">إضافة خدمة جديدة</h1>
        <p className="text-gray-600">أدخل تفاصيل الخدمة الجديدة أدناه</p>
      </div>
      
      {/* نموذج إضافة الخدمة */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* اسم الخدمة */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              اسم الخدمة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل اسم الخدمة"
            />
            {errors.name && (
              <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          
          {/* وصف الخدمة */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              وصف الخدمة <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل وصف الخدمة"
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-red-500 text-sm">{errors.description}</p>
            )}
          </div>
          
          {/* السعر والمدة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* السعر */}
            <div>
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                السعر (ريال) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أدخل سعر الخدمة"
              />
              {errors.price && (
                <p className="mt-1 text-red-500 text-sm">{errors.price}</p>
              )}
            </div>
            
            {/* المدة */}
            <div>
              <label htmlFor="duration_days" className="block text-gray-700 font-medium mb-2">
                المدة (بالأيام) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="duration_days"
                name="duration_days"
                value={formData.duration_days}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.duration_days ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أدخل مدة الخدمة بالأيام"
              />
              {errors.duration_days && (
                <p className="mt-1 text-red-500 text-sm">{errors.duration_days}</p>
              )}
            </div>
          </div>
          
          {/* حالة التفعيل */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="mr-2 block text-gray-700">
                تفعيل الخدمة
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              الخدمات المفعلة ستظهر للمستخدمين في الموقع
            </p>
          </div>
          
          {/* أزرار الإجراءات */}
          <div className="flex justify-end space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => navigate('/dashboard/services')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </>
              ) : (
                'حفظ الخدمة'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddServices;
