import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data);
        setSelectedImage(response.data.data.primary_image?.image_url || null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('حدث خطأ أثناء جلب بيانات المنتج');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.quantity || 1)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.quantity || 1)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // إضافة أو إزالة من المفضلة
  const toggleFavorite = async () => {
    if (!product) return;
    
    setFavoriteLoading(true);
    try {
      await api.post(`/favorites/toggle/${product.id}`);
      
      // تحديث حالة المفضلة في المنتج المحلي
      setProduct(prev => ({
        ...prev,
        is_favorite: !prev.is_favorite
      }));
      
      // عرض إشعار نجاح
      showNotification(
        product.is_favorite 
          ? 'تمت إزالة المنتج من المفضلة بنجاح' 
          : 'تمت إضافة المنتج إلى المفضلة بنجاح',
        'success'
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      showNotification('حدث خطأ أثناء تحديث المفضلة', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // إضافة المنتج إلى سلة المشتريات
  const addToCart = () => {
    if (!product) return;
    
    setAddingToCart(true);
    
    try {
      // جلب السلة الحالية من localStorage
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // التحقق مما إذا كان المنتج موجودًا بالفعل في السلة
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // إذا كان المنتج موجودًا بالفعل، قم بتحديث الكمية
        const newQuantity = cartItems[existingItemIndex].quantity + quantity;
        
        // التأكد من أن الكمية لا تتجاوز المخزون المتاح
        if (newQuantity <= product.quantity) {
          cartItems[existingItemIndex].quantity = newQuantity;
        } else {
          // إذا تجاوزت الكمية المخزون، اضبطها على الحد الأقصى
          cartItems[existingItemIndex].quantity = product.quantity;
          showNotification(`تم تحديث الكمية إلى الحد الأقصى المتاح (${product.quantity})`, 'info');
        }
      } else {
        // إذا لم يكن المنتج موجودًا، أضفه إلى السلة
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.primary_image?.image_url || (product.images && product.images.length > 0 ? product.images[0].image_url : null),
          quantity: quantity,
          max_quantity: product.quantity // تخزين الحد الأقصى للكمية المتاحة
        };
        
        cartItems.push(cartItem);
      }
      
      // حفظ السلة المحدثة في localStorage
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // تحديث عدد العناصر في السلة (إذا كنت تستخدم مؤشر عدد العناصر)
      const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      localStorage.setItem('cartCount', cartCount.toString());
      
      // إطلاق حدث لإعلام المكونات الأخرى بتغيير السلة
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { count: cartCount }
      }));
      
      // عرض إشعار نجاح
      showNotification('تمت إضافة المنتج إلى سلة المشتريات', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('حدث خطأ أثناء إضافة المنتج إلى السلة', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  // عرض الإشعارات
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-yellow-100 border-r-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
          <p className="font-bold">المنتج غير موجود</p>
          <p>لم يتم العثور على المنتج المطلوب</p>
        </div>
      </div>
    );
  }

  const getTypeColor = () => {
    switch (product.type) {
      case 'battery':
        return 'bg-blue-100 text-blue-800';
      case 'solar_panel':
        return 'bg-green-100 text-green-800';
      case 'inverter':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            notification.type === 'success' ? 'bg-green-500 text-white' : 
            notification.type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : notification.type === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {notification.message}
          </div>
        </motion.div>
      )}

      {/* رابط العودة */}
      <div className="mb-6">
        <Link 
          to="/products" 
          className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          العودة إلى المنتجات
        </Link>
      </div>
      
      {/* عرض المنتج */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* معرض الصور */}
          <div className="space-y-4">
            {/* الصورة الرئيسية */}
            <div className="bg-gray-100 rounded-lg overflow-hidden h-80 flex items-center justify-center">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2">لا توجد صورة</p>
                </div>
              )}
            </div>
            
            {/* معرض الصور المصغرة */}
            {product.images && product.images.length > 0 && (
              <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2">
                {product.images.map((image) => (
                  <div 
                    key={image.id}
                    onClick={() => setSelectedImage(image.image_url)}
                    className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedImage === image.image_url ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image.image_url} 
                      alt={`${product.name} - صورة ${image.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* معلومات المنتج */}
          <div className="space-y-6">
            <div>
              {/* حالة المنتج */}
              <div className="flex justify-between items-center mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor()}`}>
                  {product.type_label}
                </span>
                
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.status_label}
                </span>
              </div>
              
              {/* اسم المنتج */}
              <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
              
              {/* السعر */}
              <div className="mt-4 flex items-baseline">
                <span className="text-2xl font-bold text-primary-600">${product.price}</span>
                {product.status === 'inactive' && (
                  <span className="mr-2 text-red-600 text-sm">غير متوفر حالياً</span>
                )}
              </div>
            </div>
            
            {/* الوصف */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">الوصف</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            {/* المخزون */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">المخزون</h2>
              <p className="text-gray-600">
                {product.quantity > 0 ? (
                  <>متوفر: <span className="font-semibold">{product.quantity}</span> قطعة</>
                ) : (
                  <span className="text-red-600">غير متوفر في المخزون</span>
                )}
              </p>
            </div>
            
            {/* اختيار الكمية */}
            {product.status === 'active' && product.quantity > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">الكمية</h2>
                <div className="flex items-center">
                  <button 
                    onClick={decrementQuantity}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l-md hover:bg-gray-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input 
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.quantity}
                    className="w-16 h-8 text-center border-t border-b border-gray-300 focus:outline-none"
                  />
                  <button 
                    onClick={incrementQuantity}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r-md hover:bg-gray-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* أزرار الإجراءات */}
            <div className="pt-4 space-y-3">
              {product.status === 'active' && product.quantity > 0 ? (
                <button 
                  onClick={addToCart}
                  disabled={addingToCart}
                  className="w-full py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center justify-center"
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-t-transparent rounded-full ml-2"></div>
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      إضافة إلى السلة
                    </>
                  )}
                </button>
              ) : (
                <button 
                  className="w-full py-3 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                  disabled
                >
                  غير متوفر للشراء
                </button>
              )}
              
              <button 
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className={`w-full py-3 border rounded-md flex items-center justify-center transition-colors ${
                  product.is_favorite 
                    ? 'bg-red-50 border-red-500 text-red-500 hover:bg-red-100' 
                    : 'border-primary-500 text-primary-500 hover:bg-primary-50'
                }`}
              >
                {favoriteLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-t-transparent rounded-full ml-2"></div>
                    جاري التحديث...
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 ml-2 ${product.is_favorite ? 'fill-red-500' : ''}`} 
                      fill={product.is_favorite ? 'currentColor' : 'none'} 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {product.is_favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                  </>
                )}
              </button>
            </div>
          </div>
    </div>
        
        {/* المواصفات */}
        {product.specifications && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">المواصفات</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-gray-700">{product.specifications}</pre>
            </div>
          </div>
        )}
        
        {/* معلومات إضافية */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">معلومات إضافية</h2>
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
      </div>
    </motion.div>
  );
};

export default Product;
