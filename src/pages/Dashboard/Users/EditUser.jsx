import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [initialData, setInitialData] = useState(null);

  // جلب بيانات المستخدم
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/${id}`);
        const userData = response.data;
        
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          password: '',
          password_confirmation: '',
          role: userData.role
        });
        
        setInitialData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          role: userData.role
        });
        
        setError('');
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('حدث خطأ أثناء جلب بيانات المستخدم');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  // التعامل مع تغيير قيم النموذج
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // مسح الخطأ عند تغيير القيمة
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المستخدم مطلوب';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    
    // التحقق من كلمة المرور فقط إذا تم إدخالها
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      }
      
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'كلمات المرور غير متطابقة';
      }
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
      // إرسال البيانات المطلوبة فقط
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone
      };
      
      // إضافة كلمة المرور فقط إذا تم إدخالها
      if (formData.password) {
        dataToSend.password = formData.password;
      }
      
      await api.post(`/users/${id}`, dataToSend);
      toast.success('تم تحديث بيانات المستخدم بنجاح');
      
      // تحديث البيانات الأولية
      setInitialData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      });
      
      // مسح كلمة المرور بعد الحفظ
      setFormData(prev => ({
        ...prev,
        password: '',
        password_confirmation: ''
      }));
    } catch (err) {
      console.error('Error updating user:', err);
      
      // التعامل مع أخطاء التحقق من البيانات من الخادم
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error('حدث خطأ أثناء تحديث بيانات المستخدم');
      }
    } finally {
      setSaving(false);
    }
  };

  // التحقق من وجود تغييرات في البيانات الأساسية
  const hasBasicChanges = () => {
    if (!initialData) return false;
    
    return (
      formData.name !== initialData.name ||
      formData.email !== initialData.email ||
      formData.phone !== initialData.phone ||
      formData.role !== initialData.role
    );
  };

  // التحقق من وجود تغييرات في كلمة المرور
  const hasPasswordChanges = () => {
    return formData.password !== '' || formData.password_confirmation !== '';
  };

  // التحقق من وجود أي تغييرات
  const hasChanges = () => {
    return hasBasicChanges() || hasPasswordChanges();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تعديل بيانات المستخدم</h1>
        <Link
          to="/dashboard/users"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          العودة إلى قائمة المستخدمين
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
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* اسم المستخدم */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المستخدم <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="أدخل اسم المستخدم"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              {/* البريد الإلكتروني */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="أدخل البريد الإلكتروني"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              
              {/* رقم الهاتف */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="أدخل رقم الهاتف"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
              
              {/* نوع المستخدم */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  نوع المستخدم <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="user">مستخدم</option>
                  <option value="admin">مشرف</option>
                </select>
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">تغيير كلمة المرور</h2>
              <p className="text-sm text-gray-600 mb-4">اترك الحقول فارغة إذا كنت لا ترغب في تغيير كلمة المرور</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* كلمة المرور */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                
                {/* تأكيد كلمة المرور */}
                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className={`w-full border ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>
                  )}
                </div>
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

export default EditUser; 