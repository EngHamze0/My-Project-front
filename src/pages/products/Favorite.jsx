import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../../components/Products/ProductCard';
import api from '../../services/api';

const Favorite = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // جلب المنتجات المفضلة
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await api.get('/favorites');
        setFavorites(response.data.data);
        setError('');
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('حدث خطأ أثناء جلب المنتجات المفضلة');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // التعامل مع تغيير حالة المفضلة
  const handleFavoriteToggle = (productId, isFavorite) => {
    if (!isFavorite) {
      // إزالة المنتج من القائمة عند إلغاء الإضافة للمفضلة
      setFavorites(prevFavorites => 
        prevFavorites.filter(product => product.id !== productId)
      );
      
      // عرض إشعار
      showNotification('تمت إزالة المنتج من المفضلة بنجاح', 'success');
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
      
      {/* رأس الصفحة */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            المنتجات المفضلة
          </h1>
          
          <Link 
            to="/products" 
            className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            العودة إلى المنتجات
          </Link>
        </div>
        <p className="text-gray-600">المنتجات التي قمت بإضافتها إلى المفضلة</p>
      </div>
      
      {/* عرض المنتجات المفضلة */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-yellow-50 border-r-4 border-yellow-400 text-yellow-700 p-4 rounded-md mb-6">
          <p className="font-bold">لا توجد منتجات مفضلة</p>
          <p>لم تقم بإضافة أي منتجات إلى المفضلة بعد.</p>
          
          <div className="mt-6 text-center">
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              تصفح المنتجات
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Favorite;
