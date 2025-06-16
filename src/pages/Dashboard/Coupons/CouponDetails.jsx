import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const CouponDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order_amount: '',
    max_uses: '',
    start_date: '',
    end_date: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [initialData, setInitialData] = useState(null);

  // جلب تفاصيل الكوبون
  useEffect(() => {
    const fetchCouponDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/coupons/${id}`);
        const couponData = response.data.data;
        
        // تنسيق التواريخ للنموذج
        const formattedData = {
          ...couponData,
          start_date: couponData.start_date ? new Date(couponData.start_date).toISOString().split('T')[0] : '',
          end_date: couponData.end_date ? new Date(couponData.end_date).toISOString().split('T')[0] : '',
        };
        
        setFormData(formattedData);
        setInitialData(formattedData);
        setError('');
      } catch (err) {
        console.error('Error fetching coupon details:', err);
        setError('حدث خطأ أثناء جلب تفاصيل الكوبون');
      } finally {
        setLoading(false);
      }
    };

    fetchCouponDetails();
  }, [id]);

  // التعامل مع تغيير قيم النموذج
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // مسح الخطأ عند تغيير القيمة
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'كود الكوبون مطلوب';
    }
    
    if (!formData.value || isNaN(formData.value) || parseFloat(formData.value) <= 0) {
      newErrors.value = 'يرجى إدخال قيمة صحيحة';
    } else if (formData.type === 'percentage' && parseFloat(formData.value) > 100) {
      newErrors.value = 'النسبة المئوية يجب أن تكون أقل من أو تساوي 100';
    }
    
    if (formData.min_order_amount && (isNaN(formData.min_order_amount) || parseFloat(formData.min_order_amount) < 0)) {
      newErrors.min_order_amount = 'يرجى إدخال قيمة صحيحة';
    }
    
    if (!formData.max_uses || isNaN(formData.max_uses) || parseInt(formData.max_uses) <= 0) {
      newErrors.max_uses = 'يرجى إدخال عدد صحيح للاستخدامات';
    }
    
    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      // تحويل البيانات إلى الأنواع المناسبة
      const dataToSend = {
        ...formData,
        value: parseFloat(formData.value),
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : 0,
        max_uses: parseInt(formData.max_uses),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };
      
      await api.put(`/coupons/${id}`, dataToSend);
      toast.success('تم تحديث الكوبون بنجاح');
      setInitialData(formData);
    } catch (err) {
      console.error('Error updating coupon:', err);
      
      // التعامل مع أخطاء التحقق من البيانات من الخادم
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error('حدث خطأ أثناء تحديث الكوبون');
      }
    } finally {
      setSaving(false);
    }
  };

  // تنسيق التاريخ للعرض
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // التحقق من وجود تغييرات في النموذج
  const hasChanges = () => {
    if (!initialData) return false;
    
    return (
      formData.code !== initialData.code ||
      formData.type !== initialData.type ||
      formData.value !== initialData.value ||
      formData.min_order_amount !== initialData.min_order_amount ||
      formData.max_uses !== initialData.max_uses ||
      formData.start_date !== initialData.start_date ||
      formData.end_date !== initialData.end_date ||
      formData.is_active !== initialData.is_active
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تفاصيل الكوبون</h1>
        <Link
          to="/dashboard/coupons"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          العودة إلى قائمة الكوبونات
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
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* معلومات استخدام الكوبون */}
          {initialData && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 mb-4">معلومات الاستخدام</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">عدد الاستخدامات</p>
                  <p className="font-semibold text-gray-800">{initialData.used_times} / {initialData.max_uses}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                  <p className="font-semibold text-gray-800">{formatDate(initialData.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">آخر تحديث</p>
                  <p className="font-semibold text-gray-800">{formatDate(initialData.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* كود الكوبون */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  كود الكوبون <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`w-full border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="أدخل كود الكوبون"
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-500">{errors.code}</p>
                )}
              </div>
              
              {/* نوع الكوبون */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  نوع الكوبون <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="percentage">نسبة مئوية</option>
                  <option value="fixed">قيمة ثابتة</option>
                </select>
              </div>
              
              {/* قيمة الكوبون */}
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                  قيمة الكوبون <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="value"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    className={`w-full border ${errors.value ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    placeholder={formData.type === 'percentage' ? 'أدخل النسبة المئوية' : 'أدخل القيمة'}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">{formData.type === 'percentage' ? '%' : '$'}</span>
                  </div>
                </div>
                {errors.value && (
                  <p className="mt-1 text-sm text-red-500">{errors.value}</p>
                )}
              </div>
              
              {/* الحد الأدنى للطلب */}
              <div>
                <label htmlFor="min_order_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  الحد الأدنى للطلب
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="min_order_amount"
                    name="min_order_amount"
                    value={formData.min_order_amount}
                    onChange={handleChange}
                    className={`w-full border ${errors.min_order_amount ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="أدخل الحد الأدنى للطلب"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                </div>
                {errors.min_order_amount && (
                  <p className="mt-1 text-sm text-red-500">{errors.min_order_amount}</p>
                )}
              </div>
              
              {/* الحد الأقصى للاستخدامات */}
              <div>
                <label htmlFor="max_uses" className="block text-sm font-medium text-gray-700 mb-1">
                  الحد الأقصى للاستخدامات <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  id="max_uses"
                  name="max_uses"
                  value={formData.max_uses}
                  onChange={handleChange}
                  className={`w-full border ${errors.max_uses ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="أدخل الحد الأقصى للاستخدامات"
                />
                {errors.max_uses && (
                  <p className="mt-1 text-sm text-red-500">{errors.max_uses}</p>
                )}
              </div>
              
              {/* تاريخ البدء */}
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ البدء
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* تاريخ الانتهاء */}
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`w-full border ${errors.end_date ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
                )}
              </div>
              
              {/* حالة الكوبون */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="mr-2 block text-sm text-gray-700">
                  نشط
                </label>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving || !hasChanges()}
                className={`px-6 py-3 bg-primary-500 text-white rounded-md transition-colors ${
                  saving || !hasChanges() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-600'
                }`}
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CouponDetails; 