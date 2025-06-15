import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // جلب الخدمات
  const fetchServices = async (page = 1, search = '') => {
    setLoading(true);
    try {
      let url = `/services?page=${page}`;
      if (search) url += `&search=${search}`;
      
      const response = await api.get(url);
      setServices(response.data.data);
      
      // إذا كانت هناك بيانات ترقيم صفحات في الاستجابة
      if (response.data.meta) {
        setTotalPages(response.data.meta.last_page);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('حدث خطأ أثناء جلب الخدمات');
    } finally {
      setLoading(false);
    }
  };

  // تحميل الخدمات عند تحميل الصفحة
  useEffect(() => {
    fetchServices(currentPage, searchTerm);
  }, [currentPage]);

  // البحث عن الخدمات
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchServices(1, searchTerm);
  };

  // تغيير حالة الخدمة (تفعيل/تعطيل)
  const handleToggleStatus = async (id) => {
    try {
      await api.get(`/services/toggle-status/${id}`);
      
      // تحديث حالة الخدمة في القائمة
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === id 
            ? { ...service, is_active: service.is_active ? 0 : 1 } 
            : service
        )
      );
      
      showNotification('تم تغيير حالة الخدمة بنجاح', 'success');
    } catch (err) {
      console.error('Error toggling service status:', err);
      showNotification('حدث خطأ أثناء تغيير حالة الخدمة', 'error');
    }
  };

  // حذف خدمة
  const handleDelete = async (id) => {
    try {
      await api.delete(`/services/${id}`);
      
      // إزالة الخدمة من القائمة
      setServices(prevServices => 
        prevServices.filter(service => service.id !== id)
      );
      
      setConfirmDelete({ show: false, id: null });
      showNotification('تم حذف الخدمة بنجاح', 'success');
    } catch (err) {
      console.error('Error deleting service:', err);
      showNotification('حدث خطأ أثناء حذف الخدمة', 'error');
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
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
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
      {confirmDelete.show && (
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
                onClick={() => setConfirmDelete({ show: false, id: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                إلغاء
              </button>
              <button 
                onClick={() => handleDelete(confirmDelete.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                حذف
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">إدارة الخدمات</h1>
        <Link 
          to="/dashboard/services/add" 
          className="flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          إضافة خدمة جديدة
        </Link>
      </div>
      
      {/* نموذج البحث */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن خدمة..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-500 text-white rounded-l-md hover:bg-primary-600"
          >
            بحث
          </button>
        </form>
      </div>

      {/* عرض الخدمات */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-yellow-50 border-r-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
          <p className="font-bold">لا توجد خدمات</p>
          <p>لم يتم العثور على أي خدمات. يمكنك إضافة خدمة جديدة من خلال الزر أعلاه.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المدة (أيام)
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
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(service.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.duration_days} يوم</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.is_active ? 'مفعل' : 'معطل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Link 
                          to={`/dashboard/services/${service.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          عرض
                        </Link>
                        <Link 
                          to={`/dashboard/services/edit/${service.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          تعديل
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(service.id)}
                          className={`${
                            service.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {service.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ show: true, id: service.id })}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </div>
      )}
      
      {/* ترقيم الصفحات */}
      {!loading && services.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-r-md ${
                currentPage === 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              السابق
            </button>
            
            <div className="flex mx-1">
              {[...Array(totalPages).keys()].map(page => (
                <button
                  key={page + 1}
                  onClick={() => setCurrentPage(page + 1)}
                  className={`px-3 py-1 mx-1 rounded-md ${
                    currentPage === page + 1
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-l-md ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              التالي
            </button>
          </nav>
        </div>
      )}
    </motion.div>
  );
};

export default Services;
