import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول عند تحميل المكون
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    
    // جلب عدد العناصر في السلة
    loadCartCount();
    
    // الاستماع لأحداث تحديث السلة
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // تحديث عدد العناصر في السلة عند تغييرها
  const handleCartUpdate = (event) => {
    if (event.detail && event.detail.count !== undefined) {
      setCartCount(event.detail.count);
    } else {
      loadCartCount();
    }
  };

  // جلب عدد العناصر في السلة من localStorage
  const loadCartCount = () => {
    try {
      const count = localStorage.getItem('cartCount');
      setCartCount(count ? parseInt(count) : 0);
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartCount(0);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

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

  const navLinks = [
    { title: 'الرئيسية', path: '/' },
    { title: '', path: '' },
    { title: 'منتجاتنا', path: '/products' },
    { title: 'خدماتنا', path: '/services' },
    { title: 'حساب المنظومة', path: '/solar-system-calculator' },
    { title: 'من نحن', path: '/about' },
    { title: 'تواصل معنا', path: '#', onClick: handleContactClick },
  ];

  return (
    <nav className="bg-dark text-white py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
            Solar Solutions
          </span>
        </Link>

        {/* القائمة للشاشات الكبيرة */}
        <div className="hidden md:flex space-x-10 rtl:space-x-reverse">
          {navLinks.map((link) => (
            link.title && (
              link.onClick ? (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={link.onClick}
                  className="text-white hover:text-primary-400 transition-colors duration-300 px-2 py-2"
                >
                  {link.title}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white hover:text-primary-400 transition-colors duration-300 px-2 py-2"
                >
                  {link.title}
                </Link>
              )
            )
          ))}
        </div>

        {/* أزرار التسجيل والدخول أو معلومات المستخدم */}
        <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
          {/* زر سلة المشتريات */}

          {
          // localStorage.getItem('token') &&
           <Link to="/cart" className="relative text-white hover:text-primary-400 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-500 text-dark-light text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>}
          
          {currentUser ? (
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 rtl:space-x-reverse bg-dark-light px-3 py-2 rounded-full hover:bg-primary-500/20 transition-colors duration-300"
              >
                <span className="text-white">{currentUser.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-dark-light rounded-md shadow-lg py-1 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-400">{currentUser.email}</p>
                    <p className="text-xs text-primary-400 mt-1">{currentUser.role === 'admin' ? 'مدير' : 'مستخدم'}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-white hover:bg-primary-500/20 transition-colors duration-300">
                    الملف الشخصي
                  </Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-white hover:bg-primary-500/20 transition-colors duration-300">
                    طلباتي
                  </Link>
                  <Link to="/subscriptions" className="block px-4 py-2 text-sm text-white hover:bg-primary-500/20 transition-colors duration-300">
                    الاشتراكات الخاصة بي
                  </Link>
                  <Link to="/favorite" className="block px-4 py-2 text-sm text-white hover:bg-primary-500/20 transition-colors duration-300">
                   المفضلة
                  </Link>
                  <Link to="/cart" className="block px-4 py-2 text-sm text-white hover:bg-primary-500/20 transition-colors duration-300">
                   سلة المشتريات
                  </Link>
                  <Link to="/change-password" className="block px-4 py-2 text-sm text-white hover:bg-primary-500/20 transition-colors duration-300">
                    تغيير كلمة المرور
                  </Link>
                  {currentUser.role === 'admin' && <Link to="/dashboard" className="block px-4 py-2 text-sm text-white hover:bg-primary-500/20 transition-colors duration-300">
                    لوحة التحكم
                  </Link>}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors duration-300"
                  >
                    تسجيل الخروج
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <>
          <Link
            to="/login"
                className="bg-transparent mx-1 border border-primary-500 text-primary-500 px-4 py-2 rounded-2xl hover:bg-primary-500 hover:text-dark-light transition-colors duration-300"
          >
            دخول
          </Link>
          <Link
            to="/register"
                className="bg-primary-500 mx-1 text-dark-light hover:text-white px-4 py-2 rounded-2xl hover:bg-primary-600 transition-colors duration-300"
          >
            تسجيل
          </Link>
            </>
          )}
        </div>

        {/* زر القائمة للشاشات الصغيرة */}
        <div className="md:hidden flex items-center">
          {/* زر سلة المشتريات للشاشات الصغيرة */}
          {
           // localStorage.getItem('token') && 
           <Link to="/cart" className="relative text-white hover:text-primary-400 transition-colors duration-300 ml-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-500 text-dark-light text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>}
          
          <button
            onClick={toggleMenu}
            className="text-white hover:text-primary-400 focus:outline-none"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* القائمة المنسدلة للشاشات الصغيرة */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-dark-light absolute left-0 right-0 shadow-lg py-4 px-6"
        >
          <div className="flex flex-col space-y-4">
            {/* روابط التنقل الرئيسية */}
            <div className="grid grid-cols-2 gap-4">
              {navLinks.map((link) => (
                link.title && (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white hover:text-primary-400 transition-colors duration-300 py-3 px-4 bg-dark rounded-lg hover:bg-primary-500/20 text-center"
                  onClick={toggleMenu}
                >
                  {link.title}
                </Link>)
              ))}
            </div>
            
            {currentUser ? (
              <>
                {/* معلومات المستخدم */}
                <div className="py-4 px-4 bg-dark rounded-lg mt-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{currentUser.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-semibold">{currentUser.name}</p>
                      <p className="text-xs text-gray-400">{currentUser.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-primary-400 bg-primary-500/20 px-3 py-1 rounded-full inline-block">
                    {currentUser.role === 'admin' ? 'مدير' : 'مستخدم'}
                  </p>
                </div>

                {/* روابط المستخدم */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Link 
                    to="/profile" 
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-2 px-4 bg-dark rounded-lg text-sm text-white hover:bg-primary-500/20 transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>الملف الشخصي</span>
                  </Link>
                  <Link 
                    to="/orders" 
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-2 px-4 bg-dark rounded-lg text-sm text-white hover:bg-primary-500/20 transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>طلباتي</span>
                  </Link>
                  <Link 
                    to="/subscriptions" 
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-2 px-4 bg-dark rounded-lg text-sm text-white hover:bg-primary-500/20 transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>الاشتراكات</span>
                  </Link>
                  <Link 
                    to="/favorite" 
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-2 px-4 bg-dark rounded-lg text-sm text-white hover:bg-primary-500/20 transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>المفضلة</span>
                  </Link>
                </div>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-2 px-4 bg-dark rounded-lg text-sm text-white hover:bg-primary-500/20 transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>لوحة التحكم</span>
                  </Link>

                {/* زر تسجيل الخروج */}
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse py-3 px-4 bg-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-colors duration-300 mt-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-3">
                <Link
                  to="/login"
                  className="w-full bg-transparent border border-primary-500 text-primary-500 px-4 py-3 rounded-lg hover:bg-primary-500 hover:text-dark-light transition-colors duration-300 text-center flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  onClick={toggleMenu}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>دخول</span>
                </Link>
                <Link
                  to="/register"
                  className="w-full bg-primary-500 text-dark-light px-4 py-3 rounded-lg hover:bg-primary-600 hover:text-white transition-colors duration-300 text-center flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  onClick={toggleMenu}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>تسجيل</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar; 