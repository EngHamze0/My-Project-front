import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // معلومات الطلب
  const [subtotal, setSubtotal] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [totalAfterDiscount, setTotalAfterDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // جلب عناصر السلة عند تحميل الصفحة
  useEffect(() => {
    loadCartItems();
  }, []);

  // حساب السعر الإجمالي عند تغيير عناصر السلة أو الكوبون
  useEffect(() => {
    calculateTotalPrice();
  }, [cartItems, couponData]);

  // جلب عناصر السلة من localStorage
  const loadCartItems = () => {
    setLoading(true);
    try {
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (items.length === 0) {
        // إذا كانت السلة فارغة، انتقل إلى صفحة السلة
        navigate('/cart');
        return;
      }
      
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
    setSubtotal(total);
    
    // حساب السعر بعد الخصم إذا كان هناك كوبون
    if (couponData) {
      setDiscountAmount(couponData.discount_amount);
      setTotalAfterDiscount(couponData.total_after_discount);
    } else {
      setDiscountAmount(0);
      setTotalAfterDiscount(total);
    }
  };

  // التحقق من صلاحية الكوبون
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('يرجى إدخال رمز الكوبون');
      return;
    }
    
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const response = await api.post('/coupons/validateCoupon', {
        coupon_code: couponCode,
        subtotal: subtotal
      });
      
      setCouponData(response.data.data);
      showNotification(response.data.message, 'success');
    } catch (error) {
      console.error('Error validating coupon:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setCouponError(error.response.data.message);
      } else {
        setCouponError('حدث خطأ أثناء التحقق من الكوبون');
      }
      
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // إرسال الطلب
  const submitOrder = async () => {
    setSubmitting(true);
    
    try {
      // تحضير بيانات المنتجات للإرسال
      const productsData = {};
      const formdata = new FormData();
      cartItems.forEach((item, index) => {
        formdata.append(`products[${index}][product_id]`, item.id);
        formdata.append(`products[${index}][quantity]`, item.quantity);
      });
      
      // إضافة الكوبون إذا كان موجوداً
      if (couponData) {
        formdata.append('coupon_code', couponCode);
      }
      console.log(productsData);
      // إرسال الطلب
      const response = await api.post('/orders', formdata);
      
      // عرض رسالة نجاح
      showNotification('تم إنشاء الطلب بنجاح', 'success');
      
      // تفريغ السلة
      localStorage.removeItem('cart');
      localStorage.removeItem('cartCount');
      
      // إطلاق حدث لإعلام المكونات الأخرى بتغيير السلة
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { count: 0 }
      }));
      // console.log(response.data.data.id);
      // console.log(response.data);
      // الانتقال إلى صفحة تأكيد الطلب بعد ثانيتين
      setTimeout(() => {
        navigate(`/order-success/${response.data.data.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        showNotification(error.response.data.message, 'error');
      } else {
        showNotification('حدث خطأ أثناء إنشاء الطلب', 'error');
      }
    } finally {
      setSubmitting(false);
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">إتمام الطلب</h1>
        <p className="text-gray-600">أكمل عملية الشراء لإتمام طلبك</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ملخص المنتجات */}
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
                            src={item.image.startsWith('http') ? item.image : import.meta.env.VITE_API_URL_STORAGE  + item.image} 
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
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                      </div>
                      
                      {/* السعر الإجمالي للمنتج */}
                      <div className="mt-4 sm:mt-0">
                        <div className="text-primary-600 font-semibold text-left">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="p-4 border-t border-gray-200">
                <Link 
                  to="/cart"
                  className="text-primary-600 hover:text-primary-800 flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  العودة إلى السلة
                </Link>
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
                {/* كود الخصم */}
                <div className="mb-6">
                  <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">كود الخصم</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="أدخل كود الخصم"
                      className="flex-grow p-2 border border-gray-300 rounded-r-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      onClick={validateCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-primary-500 text-white rounded-l-md hover:bg-primary-600 transition-colors flex items-center justify-center"
                    >
                      {couponLoading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-t-transparent rounded-full"></div>
                      ) : 'تطبيق'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-1 text-sm text-red-600">{couponError}</p>
                  )}
                  {couponData && (
                    <div className="mt-2 p-2 bg-green-50 text-green-800 text-sm rounded-md">
                      تم تطبيق الخصم بنجاح: {couponData.coupon.type === 'percentage' ? `${couponData.coupon.value}%` : formatPrice(couponData.coupon.value)}
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي:</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  
                  {couponData && (
                    <div className="flex justify-between text-green-600">
                      <span>الخصم:</span>
                      <span className="font-semibold">- {formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">الشحن:</span>
                    <span className="font-semibold">مجاني</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">الإجمالي:</span>
                      <span className="text-lg font-bold text-primary-600">{formatPrice(totalAfterDiscount)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={submitOrder}
                  disabled={submitting}
                  className="w-full py-3 bg-primary-600 text-white rounded-md hover:bg-primary-800 transition-colors mt-6 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-t-transparent rounded-full ml-2"></div>
                      جاري إتمام الطلب...
                    </>
                  ) : 'إتمام الطلب'}
                </button>
                <button
                  onClick={() => navigate('/services')}

                  className="w-full py-3 bg-primary-600 text-white rounded-md hover:bg-primary-800 transition-colors mt-2 flex items-center justify-center"
                >
                 عرض خدمات الشركة
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  بالضغط على "إتمام الطلب"، فإنك توافق على شروط الخدمة وسياسة الخصوصية.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout; 