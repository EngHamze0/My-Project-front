import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const location = useLocation();
  const nav = useNavigate()
  // جلب الخدمات
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let url = `/services?page=${currentPage}`;
        if (searchTerm) url += `&search=${searchTerm}`;
        if (selectedCategory !== 'all') url += `&category=${selectedCategory}`;
        
        const response = await api.get(url);
        setServices(response.data.data);
        
        // إذا كانت هناك بيانات ترقيم صفحات في الاستجابة
        if (response.data.meta) {
          setTotalPages(response.data.meta.last_page);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('حدث خطأ أثناء جلب الخدمات');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [currentPage, searchTerm, selectedCategory]);

  // البحث عن الخدمات
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // تنسيق السعر
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // تأثيرات الحركة للعناصر
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const handleNavigate = (service)=>{
    console.log("Ser page" , location.state?.returnUrl)
    if(location.state?.returnUrl){
      nav(`/services/${service.id}`, { state: { returnUrl: '/checkout' } });
    }else{
      nav(`/services/${service.id}`);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* رأس الصفحة */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">خدماتنا</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نقدم مجموعة متنوعة من الخدمات عالية الجودة لتلبية احتياجاتك. استكشف خدماتنا واختر ما يناسبك.
          </p>
        </div>

        {/* قسم البحث والتصفية */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن خدمة..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              بحث
            </button>
          </form>
        </div>

        {/* عرض الخدمات */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-bold">خطأ</p>
            <p>{error}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-yellow-50 border-r-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
            <p className="font-bold">لا توجد خدمات</p>
            <p>لم يتم العثور على أي خدمات متطابقة مع معايير البحث.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{service.name}</h2>
                    {service.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        متاح
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                        غير متاح
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3">{service.description}</p>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-gray-500 text-sm">السعر</span>
                      <p className="text-primary-600 font-bold text-xl">{formatPrice(service.price)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">المدة</span>
                      <p className="text-gray-800 font-medium">{service.duration_days} يوم</p>
                    </div>
                  </div>
                  
                  <button 
                    // to={`/services/${service.id}`}
                    onClick={()=>handleNavigate(service)}
                    className="block w-full text-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ترقيم الصفحات */}
        {!loading && services.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-r-md ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                السابق
              </button>
              
              <div className="flex mx-1">
                {[...Array(totalPages).keys()].map(page => (
                  <button
                    key={page + 1}
                    onClick={() => setCurrentPage(page + 1)}
                    className={`px-3 py-1 mx-1 rounded-md ${
                      currentPage === page + 1
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-l-md ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                التالي
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
