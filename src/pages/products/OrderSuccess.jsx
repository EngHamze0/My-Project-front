import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // جلب تفاصيل الطلب
  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/user/${id}`);
      setOrder(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('حدث خطأ أثناء جلب تفاصيل الطلب');
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

  // ترجمة حالة الطلب إلى العربية
  const translateOrderStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      case 'refunded':
        return 'مسترجع';
      default:
        return status;
    }
  };

  // الحصول على لون حالة الطلب
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-bold">خطأ</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 bg-green-500 text-white text-center">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">تم إتمام الطلب بنجاح</h1>
              <p className="text-lg">شكراً لك على طلبك! تم استلام طلبك وسيتم معالجته قريباً.</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">تفاصيل الطلب</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">رقم الطلب:</p>
                    <p className="font-semibold">{order?.order_number || ""}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">تاريخ الطلب:</p>
                    <p className="font-semibold">{order?.created_at ? formatDate(order.created_at) : 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">حالة الطلب:</p>
                    <p className="font-semibold">
                      <span className={`px-2 py-1 rounded-full text-sm ${order?.status ? getStatusColor(order.status) : 'bg-yellow-100 text-yellow-800'}`}>
                        {order?.status ? translateOrderStatus(order.status) : 'قيد الانتظار'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">المجموع:</p>
                    <p className="font-semibold">{order?.total ? formatPrice(order.total) : 'غير متوفر'}</p>
                  </div>
                </div>
              </div>
              
              {order?.products && order.products.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">المنتجات</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المنتج
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            السعر
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الكمية
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المجموع
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.products.map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatPrice(product.price)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{product.pivot.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatPrice(product.price * product.pivot.quantity)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex justify-center">
                <Link
                  to="/products"
                  className="px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  مواصلة التسوق
                </Link>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OrderSuccess; 