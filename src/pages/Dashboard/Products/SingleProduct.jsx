import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const SingleProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('حدث خطأ أثناء جلب بيانات المنتج');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mr-3">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mr-3">
            <p className="text-yellow-700">المنتج غير موجود</p>
          </div>
        </div>
      </div>
    );
  }

  const renderSpecifications = () => {
    if (!product.specifications) return null;

    switch (product.type) {
      case 'battery':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">نوع البطارية: <span className="font-semibold">{product.specifications.type}</span></p>
              <p className="text-gray-600">السعة: <span className="font-semibold">{product.specifications.capacity}</span></p>
              <p className="text-gray-600">العمر الافتراضي: <span className="font-semibold">{product.specifications.battary_life}</span></p>
              <p className="text-gray-600">الفولتية: <span className="font-semibold">{product.specifications.voltage}</span></p>
            </div>
          </div>
        );
      
      case 'inverter':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">الفولتية: <span className="font-semibold">{product.specifications.voltage}</span></p>
              <p className="text-gray-600">المدخل: <span className="font-semibold">{product.specifications.input}</span></p>
              <p className="text-gray-600">تيار الشحن: <span className="font-semibold">{product.specifications.charging_current}</span></p>
              <p className="text-gray-600">فولتية التيار المستمر: <span className="font-semibold">{product.specifications.DC_volr}</span></p>
            </div>
          </div>
        );
      
      case 'solar_panel':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">المخرجات: <span className="font-semibold">{product.specifications.output}</span></p>
              <p className="text-gray-600">مساحة السطح: <span className="font-semibold">{product.specifications.surface_area}</span></p>
              <p className="text-gray-600">النوع: <span className="font-semibold">{product.specifications.type}</span></p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          تفاصيل المنتج
        </h1>
        
        <Link
          to="/dashboard/products"
          className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          العودة إلى المنتجات
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* معلومات المنتج الأساسية */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">المعلومات الأساسية</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">الاسم: <span className="font-semibold">{product.name}</span></p>
              <p className="text-gray-600">النوع: <span className="font-semibold">{product.type_label}</span></p>
              <p className="text-gray-600">السعر: <span className="font-semibold">${product.price}</span></p>
              <p className="text-gray-600">الكمية: <span className="font-semibold">{product.quantity}</span></p>
              <p className="text-gray-600">الحالة: <span className="font-semibold">{product.status_label}</span></p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">الوصف</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">{product.description}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">المواصفات</h2>
            {renderSpecifications()}
          </div>
        </div>
        
        {/* صور المنتج */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">الصور</h2>
          <div className="grid grid-cols-2 gap-4">
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.image_url}
                    alt={`صورة المنتج ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {image.is_primary && (
                    <span className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
                      الصورة الرئيسية
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500">لا توجد صور للمنتج</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* معلومات إضافية */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">معلومات إضافية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">تاريخ الإضافة: <span className="font-semibold">{new Date(product.created_at).toLocaleDateString('ar-EG')}</span></p>
            <p className="text-gray-600">آخر تحديث: <span className="font-semibold">{new Date(product.updated_at).toLocaleDateString('ar-EG')}</span></p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">رقم المنتج: <span className="font-semibold">{product.id}</span></p>
            <p className="text-gray-600">عدد الصور: <span className="font-semibold">{product.images?.length || 0}</span></p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SingleProduct;
