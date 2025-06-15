import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { OrderStatusBadge } from '../../components';
import { useState, useEffect } from 'react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  // جلب قائمة الطلبات الخاصة بالمستخدم
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/user?page=${currentPage}`);
      setOrders(response.data.data.data);
      setTotalPages(response.data.data.pagination.total_pages);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('حدث خطأ أثناء جلب قائمة الطلبات');
    } finally {
      setLoading(false);
    }
  };

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'usd'
    }).format(price);
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">طلباتي</h1>

      {error && (
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-4">لا توجد طلبات حالياً</p>
          <Link
            to="/products"
            className="px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-lg font-semibold text-gray-800">
                      طلب #{order.order_number}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 md:space-x-reverse">
                    <OrderStatusBadge status={order.status} className="text-sm" />
                    <p className="font-semibold text-gray-800">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">المنتجات</h3>
                  <div className="space-y-2">
                    {order.items && order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center">
                       
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.product_details?.name}</p>
                          <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    
                    {order.items && order.items.length > 2 && (
                      <p className="text-sm text-gray-500">
                        و {order.items.length - 2} منتجات أخرى
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Link
                    to={`/orders/${order.id}`}
                    className="px-4 py-2 bg-primary-500 text-white text-sm rounded-md hover:bg-primary-600 transition-colors"
                  >
                    عرض تفاصيل الطلب
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* ترقيم الصفحات */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2 space-x-reverse">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  السابق
                </button>
                
                {[...Array(totalPages).keys()].map(page => (
                  <button
                    key={page + 1}
                    onClick={() => setCurrentPage(page + 1)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page + 1
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  التالي
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;