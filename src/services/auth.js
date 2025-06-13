import api from './api';

// خدمات المصادقة
const AuthService = {
  // تسجيل الدخول
  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  },

  // تسجيل مستخدم جديد
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'حدث خطأ أثناء التسجيل' };
    }
  },

  // طلب استعادة كلمة المرور
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'حدث خطأ أثناء إرسال طلب استعادة كلمة المرور' };
    }
  },

  // إعادة تعيين كلمة المرور
  resetPassword: async (email, otp, password) => {
    try {
      const response = await api.post('/reset-password', { email, otp, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' };
    }
  },

  // تغيير كلمة المرور
  changePassword: async (current_password, password) => {
    try {
      const response = await api.post('/change-password', { current_password, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'حدث خطأ أثناء تغيير كلمة المرور' };
    }
  },

  // تسجيل الخروج
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // التحقق من حالة تسجيل الدخول
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  }
};

export default AuthService;