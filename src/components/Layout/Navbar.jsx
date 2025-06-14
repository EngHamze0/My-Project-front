import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول عند تحميل المكون
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

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

  const navLinks = [
    { title: 'الرئيسية', path: '/' },
    { title: 'منتجاتنا', path: '/products' },
    { title: 'خدماتنا', path: '/services' },
    { title: 'من نحن', path: '/about' },
    { title: 'تواصل معنا', path: '/contact' },
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
            <Link
              key={link.path}
              to={link.path}
              className="text-white hover:text-primary-400 transition-colors duration-300 px-2"
            >
              {link.title}
            </Link>
          ))}
        </div>

        {/* أزرار التسجيل والدخول أو معلومات المستخدم */}
        <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
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
                  <Link to="/subscriptions" className="block px-4 py-2 text-sm text-white hover:bg-primary-500/20 transition-colors duration-300">
                    الاشتراكات الخاصة بي
                  </Link>
                  <Link to="/favorite" className="block px-4 py-2 text-sm text-white hover:bg-primary-500/20 transition-colors duration-300">
                   المفضلة
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
        <div className="md:hidden">
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
          className="md:hidden bg-dark-light absolute left-0 right-0 shadow-md py-4 px-6"
        >
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white hover:text-primary-400 transition-colors duration-300 py-2"
                onClick={toggleMenu}
              >
                {link.title}
              </Link>
            ))}
            
            {currentUser ? (
              <>
                <div className="py-2 border-t border-gray-700 mt-2">
                  <div className="py-2">
                    <p className="text-sm text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-400">{currentUser.email}</p>
                    <p className="text-xs text-primary-400 mt-1">{currentUser.role === 'admin' ? 'مدير' : 'مستخدم'}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block py-2 text-sm text-white hover:text-primary-400 transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    الملف الشخصي
                  </Link>
                  <Link 
                    to="/change-password" 
                    className="block py-2 text-sm text-white hover:text-primary-400 transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    تغيير كلمة المرور
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="block w-full text-right py-2 text-sm text-red-400 hover:text-red-300 transition-colors duration-300"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-3 border-t border-gray-700">
                <Link
                  to="/login"
                  className="bg-transparent border border-primary-500 text-primary-500 px-4 py-2 rounded-2xl hover:bg-primary-500 hover:text-dark-light transition-colors duration-300 text-center mt-2"
                  onClick={toggleMenu}
                >
                  دخول
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 text-dark-light px-4 py-2 rounded-2xl hover:bg-primary-600 hover:text-white transition-colors duration-300 text-center"
                  onClick={toggleMenu}
                >
                  تسجيل
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