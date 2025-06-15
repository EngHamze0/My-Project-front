import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const AddCoupon = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    
    setLoading(true);
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
      
      await api.post('/coupons', dataToSend);
      toast.success('تم إضافة الكوبون بنجاح');
      navigate('/dashboard/coupons');
    } catch (err) {
      console.error('Error adding coupon:', err);
      
      // التعامل مع أخطاء التحقق من البيانات من الخادم
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error('حدث خطأ أثناء إضافة الكوبون');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إضافة كوبون جديد</h1>
        <Link
          to="/dashboard/coupons"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          العودة إلى قائمة الكوبونات
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
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
              disabled={loading}
              className="px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الإضافة...' : 'إضافة الكوبون'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoupon; 