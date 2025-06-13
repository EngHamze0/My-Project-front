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

        {/* أزرار التسجيل والدخول */}
        <div className="hidden  md:flex items-center  space-x-6 rtl:space-x-reverse">
          <Link
            to="/login"
            className="bg-transparent  mx-1 border  border-primary-500 text-primary-500 px-4 py-2 rounded-2xl hover:bg-primary-500 hover:text-dark-light transition-colors duration-300"
          >
            دخول
          </Link>
          <Link
            to="/register"
            className="bg-primary-500 mx-1  text-dark-light hover:text-white px-4 py-2 rounded-2xl hover:bg-primary-600 transition-colors duration-300"
          >
            تسجيل
          </Link>
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
            <div className="flex flex-col space-y-3 pt-3 border-t border-gray-700">
              <Link
                to="/login"
                className="bg-transparent border border-primary-500 text-primary-500 px-4 py-2 rounded-md hover:bg-primary-500 hover:text-white transition-colors duration-300 text-center mt-2"
                onClick={toggleMenu}
              >
                دخول
              </Link>
              <Link
                to="/register"
                className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors duration-300 text-center"
                onClick={toggleMenu}
              >
                تسجيل
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar; 