import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../../components/Products/ProductCard';
import api from '../../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 12
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const productTypes = [
    { value: '', label: 'كل المنتجات' },
    { value: 'battery', label: 'بطاريات' },
    { value: 'solar_panel', label: 'ألواح شمسية' },
    { value: 'inverter', label: 'محولات كهربائية' }
  ];

  // جلب المنتجات
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // بناء معلمات الاستعلام
        const params = new URLSearchParams();
        if (selectedType) params.append('type', selectedType);
        params.append('page', pagination.currentPage);
        params.append('per_page', pagination.perPage);
        
        const response = await api.get(`/products?${params.toString()}`);
        
        setProducts(response.data.data);
        setPagination({
          currentPage: response.data.meta.current_page[0],
          lastPage: response.data.meta.last_page[0],
          total: response.data.meta.total,
          perPage: response.data.meta.per_page[0]
        });
        setError('');
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('حدث خطأ أثناء جلب المنتجات');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedType, pagination.currentPage, pagination.perPage]);

  // التعامل مع تغيير نوع المنتج
  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    // إعادة تعيين الصفحة إلى الأولى عند تغيير الفلتر
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // التعامل مع تغيير الصفحة
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.lastPage) return;
    setPagination(prev => ({ ...prev, currentPage: page }));
    // التمرير إلى أعلى الصفحة
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // التعامل مع تغيير حالة المفضلة
  const handleFavoriteToggle = (productId, isFavorite) => {
    // تحديث حالة المفضلة في قائمة المنتجات المحلية
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, is_favorite: isFavorite } 
          : product
      )
    );
    
    // عرض إشعار
    showNotification(
      isFavorite 
        ? 'تمت إضافة المنتج إلى المفضلة بنجاح' 
        : 'تمت إزالة المنتج من المفضلة بنجاح',
      'success'
    );
  };

  // عرض إشعار
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // إنشاء أزرار الترقيم
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
        aria-label="الصفحة السابقة"
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
          aria-label={`الصفحة ${i}`}
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
        aria-label="الصفحة التالية"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
    
    return buttons;
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
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {notification.message}
          </div>
        </motion.div>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">منتجاتنا</h1>
        <p className="text-gray-600">اكتشف مجموعتنا المتنوعة من منتجات الطاقة الشمسية عالية الجودة</p>
      </div>
      
      {/* فلتر النوع */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">تصفية حسب</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              نوع المنتج
            </label>
            <select
              id="type"
              value={selectedType}
              onChange={handleTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {productTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* عرض المنتجات */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-yellow-50 border-r-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
          <p className="font-bold">لا توجد منتجات</p>
          <p>لم يتم العثور على أي منتجات تطابق معايير البحث.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
          
          {/* الترقيم */}
          {pagination.lastPage > 1 && (
            <div className="mt-10 flex flex-col items-center">
              <div className="flex justify-center">
                {renderPaginationButtons()}
              </div>
              <div className="text-sm text-gray-600 mt-3">
                عرض {(pagination.currentPage - 1) * pagination.perPage + 1} إلى {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} من أصل {pagination.total} منتج
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ProductsPage;
