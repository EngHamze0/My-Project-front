import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    type: '',
    status: 'active',
    primary_image_index: 0
  });

  const [images, setImages] = useState([null]);
  const [imagesPreviews, setImagesPreviews] = useState([null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Crear un array de referencias inicial
  const fileInputRefsArray = useRef([]);
  
  const productTypes = [
    { value: 'battery', label: 'بطارية' },
    { value: 'solar_panel', label: 'لوح شمسي' },
    { value: 'inverter', label: 'محول كهربائي' }
  ];

  const statusOptions = [
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.match('image.*')) {
      setError('يرجى اختيار صورة صالحة');
      return;
    }

    // التحقق من حجم الملف (أقل من 2 ميجابايت)
    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }

    // تحديث الصور
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);

    // عرض معاينة الصورة
    const reader = new FileReader();
    reader.onload = () => {
      const newPreviews = [...imagesPreviews];
      newPreviews[index] = reader.result;
      setImagesPreviews(newPreviews);
    };
    reader.readAsDataURL(file);

    setError('');
  };

  const addImageField = useCallback(() => {
    setImages(prev => [...prev, null]);
    setImagesPreviews(prev => [...prev, null]);
  }, []);

  const removeImageField = useCallback((index) => {
    // إذا كان هناك صورة واحدة فقط، لا تسمح بالحذف
    if (images.length === 1) {
      return;
    }

    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
    
    setImagesPreviews(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    // إذا كانت الصورة المحذوفة هي الصورة الرئيسية، قم بتعيين الصورة الأولى كرئيسية
    if (formData.primary_image_index === index) {
      setFormData(prev => ({ ...prev, primary_image_index: 0 }));
    } else if (formData.primary_image_index > index) {
      // إذا كان مؤشر الصورة الرئيسية أكبر من المؤشر المحذوف، قم بتقليله بمقدار 1
      setFormData(prev => ({ ...prev, primary_image_index: prev.primary_image_index - 1 }));
    }
  }, [images.length, formData.primary_image_index]);

  const handlePrimaryImageChange = (index) => {
    setFormData(prev => ({ ...prev, primary_image_index: index }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // التحقق من وجود صورة واحدة على الأقل
    const hasImage = images.some(img => img !== null);
    if (!hasImage) {
      setError('يرجى إضافة صورة واحدة على الأقل');
      setLoading(false);
      return;
    }

    try {
      // إنشاء FormData لإرسال الصور والبيانات
      const productFormData = new FormData();
      
      // إضافة البيانات الأساسية
      Object.keys(formData).forEach(key => {
        if (key !== 'primary_image_index' || images[formData.primary_image_index] !== null) {
          productFormData.append(key, formData[key]);
        }
      });
      
      // إضافة الصور
      images.forEach((image, index) => {
        if (image) {
          productFormData.append(`images[${index}]`, image);
        }
      });

      // إرسال البيانات إلى API
      const response = await api.post('/products', productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('تم إضافة المنتج بنجاح');
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        type: '',
        status: 'active',
        primary_image_index: 0
      });
      setImages([null]);
      setImagesPreviews([null]);
      
      // إخفاء رسالة النجاح بعد 5 ثوان
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء إضافة المنتج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 md:p-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        إضافة منتج جديد
      </h1>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border-r-4 border-red-500 text-red-700 px-6 py-4 rounded-md mb-6 shadow-sm" 
          role="alert"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </motion.div>
      )}
      
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border-r-4 border-green-500 text-green-700 px-6 py-4 rounded-md mb-6 shadow-sm" 
          role="alert"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* معلومات المنتج الأساسية */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            المعلومات الأساسية
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                اسم المنتج <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="أدخل اسم المنتج"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                نوع المنتج <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none bg-white"
              >
                <option value="">اختر نوع المنتج</option>
                {productTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                السعر <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="0.00"
                />
                <span className="absolute left-3 top-3 text-gray-500">$</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                الكمية <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="0"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                الحالة <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none bg-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              وصف المنتج <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="أدخل وصفاً تفصيلياً للمنتج"
            ></textarea>
          </div>
        </div>
        
        {/* صور المنتج */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              صور المنتج <span className="text-red-500">*</span>
            </h2>
            <button
              type="button"
              onClick={addImageField}
              className="flex items-center px-3 py-2 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              إضافة صورة
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => {
              // Asegurarse de que la referencia existe para este índice
              if (!fileInputRefsArray.current[index]) {
                fileInputRefsArray.current[index] = React.createRef();
              }
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 relative"
                >
                  <div className="absolute top-2 left-2 z-10 flex space-x-1 rtl:space-x-reverse">
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className={`bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors ${images.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={images.length === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-center mb-2">
                    <p className="text-sm text-gray-500">
                      صورة {index + 1}
                    </p>
                  </div>
                  
                  {imagesPreviews[index] ? (
                    <div className="relative">
                      <img
                        src={imagesPreviews[index]}
                        alt={`صورة المنتج ${index + 1}`}
                        className="w-full h-48 object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...images];
                          const newPreviews = [...imagesPreviews];
                          newImages[index] = null;
                          newPreviews[index] = null;
                          setImages(newImages);
                          setImagesPreviews(newPreviews);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      
                      <div className="absolute bottom-2 left-2">
                        <label className="flex items-center space-x-2 rtl:space-x-reverse">
                          <input
                            type="radio"
                            name="primary_image"
                            checked={formData.primary_image_index === index}
                            onChange={() => handlePrimaryImageChange(index)}
                            className="h-4 w-4 text-primary-500 focus:ring-primary-500"
                          />
                          <span className="text-sm bg-white bg-opacity-70 px-2 py-1 rounded text-gray-700">
                            صورة رئيسية
                          </span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRefsArray.current[index].current.click()}
                      className="cursor-pointer flex flex-col items-center justify-center h-48 bg-white hover:bg-gray-100 transition-colors rounded-md border border-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="mt-2 text-sm text-gray-500">اضغط لإضافة صورة</span>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRefsArray.current[index]}
                    onChange={(e) => handleImageChange(e, index)}
                    accept="image/*"
                    className="hidden"
                  />
                </motion.div>
              );
            })}
          </div>
          
          <p className="text-xs text-gray-500 mt-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            يجب أن يكون حجم كل صورة أقل من 2 ميجابايت.
          </p>
        </div>
        
        {/* زر الإرسال */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center shadow-md ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الإضافة...
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة المنتج
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddProduct;
