import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleContactClick = (e) => {
    e.preventDefault();
    // إذا كنا في الصفحة الرئيسية
    if (window.location.pathname === '/') {
      const contactSection = document.querySelector('#contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // إذا كنا في صفحة أخرى، انتقل إلى الصفحة الرئيسية مع تمرير إلى قسم التواصل
      navigate('/', { state: { scrollToContact: true } });
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-secondary-700 to-secondary-500 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
          alt="ألواح شمسية"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 text-center md:text-right mb-10 md:mb-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              حلول الطاقة الشمسية المتكاملة
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/80 mb-8 max-w-lg mx-auto md:mr-0"
            >
              نقدم حلولًا مستدامة للطاقة الشمسية تناسب احتياجاتك، من الألواح الشمسية إلى البطاريات ومحولات الطاقة، مع خدمات التركيب والصيانة.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center md:justify-end gap-4"
            >
              <Link
                to="/products"
                className="bg-primary-500 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-600 transition-colors duration-300"
              >
                تصفح منتجاتنا
              </Link>
              <a
                href="#"
                onClick={handleContactClick}
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors duration-300"
              >
                تواصل معنا
              </a>
            </motion.div>
          </div>
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1158&q=80"
                alt="الطاقة الشمسية"
                className="w-full max-w-md mx-auto"
              />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* شريط المميزات */}
      <div className="bg-dark/30 backdrop-blur-sm py-6">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="flex flex-col items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-white font-medium">طاقة متجددة</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="flex flex-col items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-white font-medium">توفير في التكلفة</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1 }}
              className="flex flex-col items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-white font-medium">ضمان ٢٥ سنة</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="flex flex-col items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-white font-medium">تركيب سريع</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 