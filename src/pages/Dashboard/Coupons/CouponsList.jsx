import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const CouponsList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, [currentPage]);

  // جلب قائمة الكوبونات
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/coupons?page=${currentPage}`);
      setCoupons(response.data.data.data);
      setTotalPages(Math.ceil(response.data.data.total / response.data.data.per_page));
      setError('');
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('حدث خطأ أثناء جلب قائمة الكوبونات');
    } finally {
      setLoading(false);
    }
  };

  // حذف كوبون
  const deleteCoupon = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الكوبون؟')) {
      setDeletingId(id);
      try {
        await api.delete(`/coupons/${id}`);
        setCoupons(coupons.filter(coupon => coupon.id !== id));
        toast.success('تم حذف الكوبون بنجاح');
      } catch (err) {
        console.error('Error deleting coupon:', err);
        toast.error('حدث خطأ أثناء حذف الكوبون');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // تنسيق القيمة حسب النوع
  const formatValue = (value, type) => {
    if (type === 'percentage') {
      return `${value}%`;
    } else {
      return `$${value}`;
    }
  };

  // ترجمة نوع الكوبون
  const translateCouponType = (type) => {
    return type === 'percentage' ? 'نسبة مئوية' : 'قيمة ثابتة';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الكوبونات</h1>
        <Link
          to="/dashboard/coupons/add"
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          إضافة كوبون جديد
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
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 text-lg">لا توجد كوبونات حالياً</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    كود الكوبون
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    القيمة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحد الأدنى للطلب
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاستخدامات
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الصلاحية
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{translateCouponType(coupon.type)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatValue(coupon.value, coupon.type)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${coupon.min_order_amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.used_times} / {coupon.max_uses}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.start_date && (
                          <div>من: {formatDate(coupon.start_date)}</div>
                        )}
                        {coupon.end_date && (
                          <div>إلى: {formatDate(coupon.end_date)}</div>
                        )}
                        {!coupon.start_date && !coupon.end_date && (
                          <div>غير محدد</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        coupon.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Link
                          to={`/dashboard/coupons/${coupon.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          عرض
                        </Link>
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          disabled={deletingId === coupon.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deletingId === coupon.id ? 'جاري الحذف...' : 'حذف'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* ترقيم الصفحات */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <nav className="flex justify-center">
                <ul className="flex items-center space-x-2 space-x-reverse">
                  <li>
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
                  </li>
                  
                  {[...Array(totalPages).keys()].map(page => (
                    <li key={page + 1}>
                      <button
                        onClick={() => setCurrentPage(page + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === page + 1
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li>
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
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponsList; 