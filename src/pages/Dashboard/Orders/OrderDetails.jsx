import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { OrderStatusBadge, OrderStatusSelector } from '../../../components';

const OrderDetails = () => {
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
      const response = await api.get(`/admin/orders/${id}`);
      setOrder(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('حدث خطأ أثناء جلب تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  // تحديث حالة الطلب محليًا
  const handleStatusChange = (newStatus) => {
    setOrder({ ...order, status: newStatus });
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تفاصيل الطلب</h1>
        <Link
          to="/dashboard/orders"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          العودة إلى قائمة الطلبات
        </Link>
      </div>

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
      ) : !order ? (
        <div className="bg-yellow-100 border-r-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
          <p className="font-bold">تنبيه</p>
          <p>لم يتم العثور على الطلب</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* معلومات الطلب الأساسية */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">رقم الطلب</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{order.order_number}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">تاريخ الطلب</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">المجموع</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatPrice(order.total)}</p>
                {order.discount > 0 && (
                  <p className="text-sm text-green-600">
                    خصم: {formatPrice(order.discount)} (كود: {order.coupon_code})
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">حالة الطلب</h3>
                <div className="mt-1 flex items-center space-x-2 space-x-reverse">
                  <OrderStatusBadge status={order.status} />
                  <OrderStatusSelector 
                    orderId={order.id} 
                    currentStatus={order.status} 
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* معلومات العميل */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">معلومات العميل</h2>
            {order.user ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">الاسم</h3>
                  <p className="mt-1 text-md font-semibold text-gray-900">{order.user.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">البريد الإلكتروني</h3>
                  <p className="mt-1 text-md font-semibold text-gray-900">{order.user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">رقم الهاتف</h3>
                  <p className="mt-1 text-md font-semibold text-gray-900">{order.user.phone || 'غير متوفر'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">معلومات العميل غير متوفرة</p>
            )}
          </div>

          {/* تفاصيل المنتجات */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">تفاصيل المنتجات</h2>
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
                  {order.items && order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.product_details?.image && (
                            <div className="flex-shrink-0 h-10 w-10 ml-4">
                              <img className="h-10 w-10 rounded-md object-cover" src={item.product_details.image} alt={item.product_details.name} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.product_details?.name || 'منتج غير متوفر'}</div>
                            <div className="text-sm text-gray-500">رقم المنتج: {item.product_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatPrice(item.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatPrice(item.total_price)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      المجموع الفرعي
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(order.subtotal)}
                    </td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-left text-sm font-medium text-green-600">
                        الخصم {order.coupon_code && `(${order.coupon_code})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        - {formatPrice(order.discount)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-100">
                    <td colSpan="3" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                      الإجمالي
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">طريقة الدفع</h3>
                <p className="mt-1 text-md font-semibold text-gray-900">
                  {order.payment_method === 'cash' ? 'الدفع عند الاستلام' : order.payment_method}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">حالة الدفع</h3>
                <p className="mt-1 text-md font-semibold text-gray-900">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status === 'paid' ? 'تم الدفع' : 'في انتظار الدفع'}
                  </span>
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">ملاحظات</h3>
                <p className="mt-1 text-md text-gray-900">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails; 