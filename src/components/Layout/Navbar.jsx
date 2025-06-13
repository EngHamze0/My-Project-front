import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { title: 'الرئيسية', path: '/' },
    { title: 'منتجاتنا', path: '/products' },
    { title: 'خدماتنا', path: '/services' },
    { title: 'من نحن', path: '/about' },
    { title: 'تواصل معنا', path: '/contact' },

  ];

  return (
    <nav className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-green-600">شمس تك</span>
        </Link>

        {/* القائمة للشاشات الكبيرة */}
        <div className="hidden md:flex mx-1 space-x-8 rtl:space-x-reverse">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-gray-700 hover:text-green-600 transition-colors duration-300"
            >
              {link.title}
            </Link>
          ))}
        </div>

        {/* زر تسجيل الدخول */}
        <div className="hidden md:flex items-center">
          <Link
            to="/login"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
          >
            تسجيل الدخول
          </Link>
        </div>

        {/* زر القائمة للشاشات الصغيرة */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:text-green-600 focus:outline-none"
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
          className="md:hidden bg-white absolute left-0 right-0 shadow-md py-4 px-6"
        >
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-green-600 transition-colors duration-300"
                onClick={toggleMenu}
              >
                {link.title}
              </Link>
            ))}
            <Link
              to="/login"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300 text-center"
              onClick={toggleMenu}
            >
              تسجيل الدخول
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar; 