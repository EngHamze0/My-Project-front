import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingUser, setProcessingUser] = useState(null);

  // جلب قائمة المستخدمين
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('حدث خطأ أثناء جلب قائمة المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  // تبديل حالة المستخدم (نشط/غير نشط)
  const toggleUserStatus = async (userId) => {
    setProcessingUser({ id: userId, action: 'toggle' });
    try {
      await api.get(`/users/toggle-active/${userId}`);
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, is_active: user.is_active ? 0 : 1 };
        }
        return user;
      }));
      toast.success('تم تغيير حالة المستخدم بنجاح');
    } catch (err) {
      console.error('Error toggling user status:', err);
      toast.error('حدث خطأ أثناء تغيير حالة المستخدم');
    } finally {
      setProcessingUser(null);
    }
  };

  // حذف مستخدم
  const deleteUser = async (userId) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم؟')) {
      setProcessingUser({ id: userId, action: 'delete' });
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
        toast.success('تم حذف المستخدم بنجاح');
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error('حدث خطأ أثناء حذف المستخدم');
      } finally {
        setProcessingUser(null);
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

  // ترجمة نوع المستخدم
  const translateRole = (role) => {
    return role === 'admin' ? 'مشرف' : 'مستخدم';
  };

  // تصفية المستخدمين حسب البحث والفلاتر
  const filteredUsers = users.filter(user => {
    // تصفية حسب البحث
    const searchMatch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    // تصفية حسب الدور
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    
    // تصفية حسب الحالة
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active === 1) || 
      (statusFilter === 'inactive' && user.is_active === 0);
    
    return searchMatch && roleMatch && statusMatch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
        <Link
          to="/dashboard/users/add"
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          إضافة مستخدم جديد
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      )}

      {/* أدوات البحث والفلترة */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* البحث */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              بحث
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم، البريد الإلكتروني، أو رقم الهاتف"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* فلتر الدور */}
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
              الدور
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">الكل</option>
              <option value="admin">مشرف</option>
              <option value="user">مستخدم</option>
            </select>
          </div>
          
          {/* فلتر الحالة */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              الحالة
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">الكل</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 text-lg">لا يوجد مستخدمين مطابقين للبحث</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدور
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الهاتف
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ التسجيل
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
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">{user.name.charAt(0)}</span>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {translateRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || 'غير متوفر'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Link
                          to={`/dashboard/users/${user.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          تعديل
                        </Link>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          disabled={processingUser && processingUser.id === user.id}
                          className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                        >
                          {processingUser && processingUser.id === user.id && processingUser.action === 'toggle' 
                            ? 'جاري...' 
                            : user.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={processingUser && processingUser.id === user.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {processingUser && processingUser.id === user.id && processingUser.action === 'delete' 
                            ? 'جاري الحذف...' 
                            : 'حذف'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList; 