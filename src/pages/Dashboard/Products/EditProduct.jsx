import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    type: '',
    status: 'active',
    primary_image_index: 0,
    specifications: {}
  });

  const [images, setImages] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Create array of references
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

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const product = response.data.data;
        
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          type: product.type,
          status: product.status,
          primary_image_index: 0,
          specifications: product.specifications || {}
        });
        
        // Setup existing images
        const existingImages = product.images || [];
        const imagePreviews = existingImages.map(img => img.image_url);
        
        setImages(existingImages);
        setImagesPreviews(imagePreviews);
        
        // Find primary image index
        const primaryIndex = existingImages.findIndex(img => img.is_primary);
        if (primaryIndex !== -1) {
          setFormData(prev => ({ ...prev, primary_image_index: primaryIndex }));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('حدث خطأ أثناء جلب بيانات المنتج');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      setError('يرجى اختيار صورة صالحة');
      return;
    }

    // Check file size (less than 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }

    // Update images
    const newImages = [...images];
    
    // If we're replacing an existing image, mark it for deletion
    if (newImages[index] && newImages[index].id) {
      setImagesToDelete(prev => [...prev, newImages[index].id]);
    }
    
    // Replace with new file
    newImages[index] = file;
    setImages(newImages);

    // Show image preview
    const reader = new FileReader();
    reader.onload = () => {
      const newPreviews = [...imagesPreviews];
      newPreviews[index] = reader.result;
      setImagesPreviews(newPreviews);
    };
    reader.readAsDataURL(file);

    setError('');
  };

  const addImageField = () => {
    setImages(prev => [...prev, null]);
    setImagesPreviews(prev => [...prev, null]);
  };

  const removeImageField = (index) => {
    // If there's only one image, don't allow deletion
    if (images.length === 1) {
      return;
    }

    // If removing an existing image, mark it for deletion
    if (images[index] && images[index].id) {
      setImagesToDelete(prev => [...prev, images[index].id]);
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

    // If the removed image is the primary image, set the first image as primary
    if (formData.primary_image_index === index) {
      setFormData(prev => ({ ...prev, primary_image_index: 0 }));
    } else if (formData.primary_image_index > index) {
      // If the primary image index is greater than the deleted index, decrement it
      setFormData(prev => ({ ...prev, primary_image_index: prev.primary_image_index - 1 }));
    }
  };

  const handlePrimaryImageChange = (index) => {
    setFormData(prev => ({ ...prev, primary_image_index: index }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Check if there's at least one image
    const hasImage = images.some(img => img !== null);
    if (!hasImage) {
      setError('يرجى إضافة صورة واحدة على الأقل');
      setSubmitting(false);
      return;
    }

    try {
      // Create FormData to send images and data
      const productFormData = new FormData();
      
      // Add basic data
      Object.keys(formData).forEach(key => {
        if (key === 'specifications') {
          // إضافة كل حقل من specifications بشكل منفصل
          Object.entries(formData.specifications).forEach(([specKey, specValue]) => {
            productFormData.append(`specifications[${specKey}]`, specValue);
          });
        } else if (key !== 'primary_image_index' || images[formData.primary_image_index] !== null) {
          productFormData.append(key, formData[key]);
        }
      });
      
      // Add images
      images.forEach((image, index) => {
        if (image && !(image.id)) {
          // Only append new images (not existing ones)
          productFormData.append(`images[${index}]`, image);
        }
      });
      
      // Add primary image index
      productFormData.append('primary_image_index', formData.primary_image_index);
      
      // Add images to delete
      imagesToDelete.forEach((imageId, index) => {
        productFormData.append(`images_to_delete[${index}]`, imageId);
      });

      // Send data to API (PUT request for update)
      await api.post(`/products/${id}`, productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('تم تحديث المنتج بنجاح');
      
      // Redirect after successful update
      setTimeout(() => {
        navigate('/dashboard/products');
      }, 2000);
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحديث المنتج');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          تعديل المنتج
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mr-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-r-4 border-green-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mr-3">
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
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
                <option value="" disabled>اختر نوع المنتج</option>
                {productTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                السعر <span className="text-red-500">*</span>
              </label>
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
                placeholder="أدخل سعر المنتج"
              />
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
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="أدخل الكمية المتوفرة"
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
        
        {/* مواصفات المنتج */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            مواصفات المنتج
          </h2>
          
          {formData.type === 'battery' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="specifications.type" className="block text-sm font-medium text-gray-700 mb-1">
                  نوع البطارية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.type"
                  name="specifications.type"
                  value={formData.specifications.type || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: ليثيوم"
                />
              </div>
              
              <div>
                <label htmlFor="specifications.capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  السعة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.capacity"
                  name="specifications.capacity"
                  value={formData.specifications.capacity || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: 100Ah"
                />
              </div>
              
              <div>
                <label htmlFor="specifications.battary_life" className="block text-sm font-medium text-gray-700 mb-1">
                  العمر الافتراضي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.battary_life"
                  name="specifications.battary_life"
                  value={formData.specifications.battary_life || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: 5 سنوات"
                />
              </div>
              
              <div>
                <label htmlFor="specifications.voltage" className="block text-sm font-medium text-gray-700 mb-1">
                  الفولتية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.voltage"
                  name="specifications.voltage"
                  value={formData.specifications.voltage || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: 12V"
                />
              </div>
            </div>
          )}
          
          {formData.type === 'inverter' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* <div>
                <label htmlFor="specifications.voltage" className="block text-sm font-medium text-gray-700 mb-1">
                  الفولتية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.voltage"
                  name="specifications.voltage"
                  value={formData.specifications.voltage || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: 220V"
                />
              </div> */}
              
              <div>
                <label htmlFor="specifications.input" className="block text-sm font-medium text-gray-700 mb-1">
                  المدخل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.input"
                  name="specifications.input"
                  value={formData.specifications.input || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: 12V DC"
                />
              </div>
              
              <div>
                <label htmlFor="specifications.charging_current" className="block text-sm font-medium text-gray-700 mb-1">
                  تيار الشحن <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.charging_current"
                  name="specifications.charging_current"
                  value={formData.specifications.charging_current || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: 10A"
                />
              </div>
              
              <div>
                <label htmlFor="specifications.DC_volr" className="block text-sm font-medium text-gray-700 mb-1">
                  فولتية التيار المستمر <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.DC_volr"
                  name="specifications.DC_volr"
                  value={formData.specifications.DC_volr || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: 12V"
                />
              </div>
            </div>
          )}
          
          {formData.type === 'solar_panel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="specifications.output" className="block text-sm font-medium text-gray-700 mb-1">
                  المخرجات <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.output"
                  name="specifications.output"
                  value={formData.specifications.output || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: 100W"
                />
              </div>
              
              <div>
                <label htmlFor="specifications.surface_area" className="block text-sm font-medium text-gray-700 mb-1">
                  مساحة السطح <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.surface_area"
                  name="specifications.surface_area"
                  value={formData.specifications.surface_area || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: 1.7 متر مربع"
                />
              </div>
              
              <div>
                <label htmlFor="specifications.type" className="block text-sm font-medium text-gray-700 mb-1">
                  النوع <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specifications.type"
                  name="specifications.type"
                  value={formData.specifications.type || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="مثال: مونو كريستال"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Product Images */}
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
              // Ensure reference exists for this index
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
                          // If removing an existing image, mark it for deletion
                          if (images[index] && images[index].id) {
                            setImagesToDelete(prev => [...prev, images[index].id]);
                          }
                          
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
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الحفظ...
              </div>
            ) : (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                حفظ التغييرات
              </div>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditProduct;
