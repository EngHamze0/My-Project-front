import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [totalPrice, setTotalPrice] = useState(0);

  // جلب عناصر السلة عند تحميل الصفحة
  useEffect(() => {
    loadCartItems();
    
    // الاستماع لأحداث تحديث السلة من صفحات أخرى
    window.addEventListener('cartUpdated', loadCartItems);
    
    return () => {
      window.removeEventListener('cartUpdated', loadCartItems);
    };
  }, []);

  // حساب السعر الإجمالي عند تغيير عناصر السلة
  useEffect(() => {
    calculateTotalPrice();
  }, [cartItems]);

  // جلب عناصر السلة من localStorage
  const loadCartItems = () => {
    setLoading(true);
    try {
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart items:', error);
      showNotification('حدث خطأ أثناء تحميل عناصر السلة', 'error');
    } finally {
      setLoading(false);
    }
  };

  // حساب السعر الإجمالي
  const calculateTotalPrice = () => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total);
  };

  // تغيير كمية المنتج
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const item = cartItems[index];
    if (newQuantity > item.max_quantity) {
      showNotification(`الكمية المطلوبة تتجاوز المخزون المتاح (${item.max_quantity})`, 'info');
      newQuantity = item.max_quantity;
    }
    
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = newQuantity;
    
    setCartItems(updatedItems);
    saveCartToLocalStorage(updatedItems);
  };

  // حذف منتج من السلة
  const removeItem = (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
    saveCartToLocalStorage(updatedItems);
    showNotification('تم حذف المنتج من السلة', 'success');
  };

  // حفظ السلة في localStorage
  const saveCartToLocalStorage = (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
    
    // تحديث عدد العناصر في السلة
    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    localStorage.setItem('cartCount', cartCount.toString());
    
    // إطلاق حدث لإعلام المكونات الأخرى بتغيير السلة
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { count: cartCount }
    }));
  };

  // تفريغ السلة
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    localStorage.removeItem('cartCount');
    
    // إطلاق حدث لإعلام المكونات الأخرى بتغيير السلة
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { count: 0 }
    }));
    
    showNotification('تم تفريغ السلة', 'success');
  };

  // الانتقال إلى صفحة الدفع
  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      showNotification('السلة فارغة', 'info');
      return;
    }
    
    // التحقق من تسجيل دخول المستخدم
    const token = localStorage.getItem('token');
    if (!token) {
      // إذا لم يكن المستخدم مسجل دخول، انتقل إلى صفحة تسجيل الدخول
      navigate('/login', { state: { returnUrl: '/checkout' } });
      showNotification('يرجى تسجيل الدخول للمتابعة', 'info');
    } else {
      // إذا كان المستخدم مسجل دخول، انتقل إلى صفحة الدفع
      navigate('/checkout');
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

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
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

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">سلة المشتريات</h1>
        <p className="text-gray-600">مراجعة المنتجات المضافة إلى السلة</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">السلة فارغة</h3>
          <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات إلى سلة المشتريات بعد</p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة المنتجات */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">المنتجات ({cartItems.length})</h2>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item, index) => (
                  <li key={index} className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      {/* صورة المنتج */}
                      <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 mb-4 sm:mb-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* تفاصيل المنتج */}
                      <div className="flex-grow sm:mr-4 rtl:sm:ml-4 rtl:sm:mr-0">
                        <Link to={`/products/${item.id}`} className="text-lg font-semibold text-gray-800 hover:text-primary-600">
                          {item.name}
                        </Link>
                        <div className="text-primary-600 font-semibold mt-1">
                          {formatPrice(item.price)}
                        </div>
                        
                        <div className="flex items-center mt-2">
                          <span className="text-gray-600 ml-2">الكمية:</span>
                          <div className="flex items-center">
                            <button 
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-l-md hover:bg-gray-300 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                              min="1"
                              max={item.max_quantity}
                              className="w-12 h-6 text-center text-sm border-t border-b border-gray-300 focus:outline-none"
                            />
                            <button 
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-r-md hover:bg-gray-300 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* الإجراءات */}
                      <div className="mt-4 sm:mt-0">
                        <div className="text-primary-600 font-semibold mb-2 text-left">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <button 
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 flex items-center text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          حذف
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="p-4 border-t border-gray-200">
                <button 
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  تفريغ السلة
                </button>
              </div>
            </div>
          </div>
          
          {/* ملخص الطلب */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">ملخص الطلب</h2>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد المنتجات:</span>
                    <span className="font-semibold">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي الكمية:</span>
                    <span className="font-semibold">{cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي:</span>
                    <span className="font-semibold">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الشحن:</span>
                    <span className="font-semibold">مجاني</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">الإجمالي:</span>
                      <span className="text-lg font-bold text-primary-600">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={proceedToCheckout}
                  className="w-full py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors mt-6"
                >
                  متابعة الشراء
                </button>
                
                <Link
                  to="/products"
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors mt-3 block text-center"
                >
                  مواصلة التسوق
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 