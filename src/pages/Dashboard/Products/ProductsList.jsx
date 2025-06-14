import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    sort_direction: 'desc',
    page: 1,
    per_page: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    productId: null,
    productName: ''
  });
  const [statusLoading, setStatusLoading] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const productTypes = [
    { value: '', label: 'كل الأنواع' },
    { value: 'battery', label: 'بطارية' },
    { value: 'solar_panel', label: 'لوح شمسي' },
    { value: 'inverter', label: 'محول كهربائي' }
  ];

  const statusOptions = [
    { value: '', label: 'كل الحالات' },
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' }
  ];

  const sortOptions = [
    { value: 'desc', label: 'الأحدث أولاً' },
    { value: 'asc', label: 'الأقدم أولاً' }
  ];

  // جلب المنتجات
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sort_direction) queryParams.append('sort_direction', filters.sort_direction);
      queryParams.append('page', filters.page);
      queryParams.append('per_page', filters.per_page);
      
      const response = await api.get(`/products?${queryParams.toString()}`);
      
      setProducts(response.data.data);
      setPagination({
        total: response.data.meta.total,
        currentPage: response.data.meta.current_page[0],
        lastPage: response.data.meta.last_page[0]
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('حدث خطأ أثناء جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  // تحميل المنتجات عند تغيير الفلاتر
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // التعامل مع تغيير الفلاتر
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // إعادة تعيين الصفحة عند تغيير الفلاتر
    }));
  };

  // التعامل مع تغيير الصفحة
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.lastPage) return;
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  // تغيير حالة المنتج
  const toggleProductStatus = async (productId) => {
    setStatusLoading(productId);
    try {
      await api.get(`/products/toggle-status/${productId}`);
      
      // تحديث حالة المنتج في القائمة المحلية
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { 
                ...product, 
                status: product.status === 'active' ? 'inactive' : 'active',
                status_label: product.status === 'active' ? 'غير نشط' : 'نشط'
              } 
            : product
        )
      );
    } catch (err) {
      console.error('Error toggling product status:', err);
      setError('حدث خطأ أثناء تغيير حالة المنتج');
    } finally {
      setStatusLoading(null);
    }
  };

  // حذف المنتج
  const deleteProduct = async () => {
    if (!deleteConfirmation.productId) return;
    
    setDeleteLoading(deleteConfirmation.productId);
    try {
      await api.delete(`/products/${deleteConfirmation.productId}`);
      
      // إزالة المنتج من القائمة المحلية
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== deleteConfirmation.productId)
      );
      
      // إعادة تعيين حالة التأكيد
      setDeleteConfirmation({
        show: false,
        productId: null,
        productName: ''
      });
      
      // إذا كانت القائمة فارغة وليست الصفحة الأولى، ارجع للصفحة السابقة
      if (products.length === 1 && pagination.currentPage > 1) {
        handlePageChange(pagination.currentPage - 1);
      } else {
        // إعادة تحميل المنتجات للصفحة الحالية
        fetchProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('حدث خطأ أثناء حذف المنتج');
    } finally {
      setDeleteLoading(null);
    }
  };

  // عرض مربع تأكيد الحذف
  const showDeleteConfirmation = (product) => {
    setDeleteConfirmation({
      show: true,
      productId: product.id,
      productName: product.name
    });
  };

  // إغلاق مربع تأكيد الحذف
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      show: false,
      productId: null,
      productName: ''
    });
  };

  // تحضير أزرار الترقيم
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // عدد الأزرار التي ستظهر
    
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(pagination.lastPage, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // زر الصفحة السابقة
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
        className={`px-3 py-1 mx-1 rounded ${
          pagination.currentPage === 1
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        } border`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
    
    // أزرار الصفحات
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            pagination.currentPage === i
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } border`}
        >
          {i}
        </button>
      );
    }
    
    // زر الصفحة التالية
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === pagination.lastPage}
        className={`px-3 py-1 mx-1 rounded ${
          pagination.currentPage === pagination.lastPage
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        } border`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
    
    return buttons;
  };

  // تحضير عرض المنتجات
  const renderProducts = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="bg-yellow-50 border-r-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
          <p className="font-bold">لا توجد منتجات</p>
          <p>لم يتم العثور على أي منتجات تطابق معايير البحث.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الصورة
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاسم
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                النوع
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                السعر
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكمية
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => (
              <motion.tr 
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                      {product.primary_image ? (
                        <img 
                          className="h-16 w-16 object-cover rounded-md border border-gray-200" 
                          src={product.primary_image.image_url} 
                          alt={product.name} 
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {product.type_label}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                  ${product.price}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {product.quantity}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => toggleProductStatus(product.id)}
                    disabled={statusLoading === product.id}
                    className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    } transition-colors duration-200`}
                  >
                    {statusLoading === product.id ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <span className={`inline-block h-2 w-2 mr-2 rounded-full ${
                          product.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        {product.status_label}
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Link
                      to={`/dashboard/products/edit/${product.id}`}
                      className="text-primary-600 hover:text-primary-900 bg-primary-50 p-2 rounded-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => showDeleteConfirmation(product)}
                      className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          قائمة المنتجات
        </h1>
        
        <Link
          to="/dashboard/products/add"
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          إضافة منتج
        </Link>
      </div>
      
      {/* فلاتر البحث */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              نوع المنتج
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {productTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              الحالة
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort_direction" className="block text-sm font-medium text-gray-700 mb-1">
              الترتيب
            </label>
            <select
              id="sort_direction"
              name="sort_direction"
              value={filters.sort_direction}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* عرض المنتجات */}
      {renderProducts()}
      
      {/* الترقيم */}
      {!loading && products.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            عرض {(pagination.currentPage - 1) * filters.per_page + 1} إلى {Math.min(pagination.currentPage * filters.per_page, pagination.total)} من أصل {pagination.total} منتج
          </div>
          
          <div className="flex justify-center">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
      
      {/* مربع تأكيد الحذف */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">تأكيد الحذف</h3>
            <p className="text-gray-700 mb-6">
              هل أنت متأكد من رغبتك في حذف المنتج "{deleteConfirmation.productName}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={deleteProduct}
                disabled={deleteLoading === deleteConfirmation.productId}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white transition-colors flex items-center"
              >
                {deleteLoading === deleteConfirmation.productId ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الحذف...
                  </>
                ) : (
                  'حذف'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductsList;
