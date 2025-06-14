import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';

const ProductCard = ({ product, onFavoriteToggle }) => {
  // التأكد من وجود المنتج
  if (!product) return null;
  
  const [isFavorite, setIsFavorite] = useState(product.is_favorite);
  const [isLoading, setIsLoading] = useState(false);

  // تبديل حالة المفضلة
  const toggleFavorite = async (e) => {
    e.preventDefault(); // منع انتقال الرابط
    e.stopPropagation(); // منع انتشار الحدث
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await api.post(`/favorites/toggle/${product.id}`);
      setIsFavorite(!isFavorite);
      
      // استدعاء الدالة الأب إذا كانت موجودة
      if (onFavoriteToggle) {
        onFavoriteToggle(product.id, !isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
    >
      {/* زر المفضلة */}
      <button
        onClick={toggleFavorite}
        disabled={isLoading}
        className={`absolute top-2 left-2 z-10 p-2 rounded-full ${
          isFavorite ? 'bg-red-50' : 'bg-white bg-opacity-80'
        } hover:bg-opacity-100 transition-colors`}
        aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
      >
        {isLoading ? (
          <div className="animate-spin h-5 w-5 border-2 border-t-transparent rounded-full border-primary-500"></div>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`} 
            fill={isFavorite ? 'currentColor' : 'none'} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        )}
      </button>

      {/* صورة المنتج */}
      <div className="relative h-48 overflow-hidden">
        {product.primary_image ? (
          <img 
            src={product.primary_image.image_url} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* نوع المنتج */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            product.type === 'battery' ? 'bg-blue-100 text-blue-800' :
            product.type === 'solar_panel' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {product.type_label}
          </span>
        </div>
        
        {/* حالة المنتج */}
        {product.status === 'inactive' && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-md">
              غير متوفر
            </span>
          </div>
        )}
      </div>
      
      {/* تفاصيل المنتج */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-primary-600 font-bold text-lg">${product.price}</span>
          
          <Link 
            to={`/products/${product.id}`}
            className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm"
          >
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
