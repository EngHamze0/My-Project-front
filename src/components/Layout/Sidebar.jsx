import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const nav = useNavigate()
  
  // قائمة العناصر الرئيسية
  const menuItems = [
    {
      title: 'الإحصائيات',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/dashboard',
      subItems: []
    },
    {
      title: 'المنتجات',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      path: '/products',
      subItems: [
        { title: 'كل المنتجات', path: '/dashboard/products' },
        { title: 'إضافة منتج', path: '/dashboard/products/add' },
        { title: 'الفئات', path: '/dashboard/products/categories' }
      ]
    },
    {
      title: 'الخدمات',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      path: '/services',
      subItems: [
        { title: 'كل الخدمات', path: '/dashboard/services' },
        { title: 'إضافة خدمة', path: '/dashboard/services/add' }
      ]
    },
    {
      title: 'الاشتراكات',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      path: '/dashboard/subscriptions',
      subItems: []
    },
    {
      title: 'المستخدمين',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: '/dashboard/users',
      subItems: [
        { title: 'كل المستخدمين', path: '/dashboard/users' },
        { title: 'إضافة مستخدم', path: '/dashboard/users/add' },
        // { title: 'الأدوار والصلاحيات', path: '/dashboard/users/roles' }
      ]
    },
    {
      title: 'الطلبات',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      path: '/dashboard/orders',
      subItems: []
    },
    {
      title: 'الكوبونات',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      path: '/dashboard/coupons',
      subItems: [
        { title: 'كل الكوبونات', path: '/dashboard/coupons' },
        { title: 'إضافة كوبون', path: '/dashboard/coupons/add' }
      ]
    },
    // {
    //   title: 'الإعدادات',
    //   icon: (
    //     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   ),
    //   path: '/settings',
    //   subItems: [
    //     { title: 'الإعدادات العامة', path: '/dashboard/settings/general' },
    //     { title: 'إعدادات الموقع', path: '/dashboard/settings/website' },
    //     { title: 'إعدادات البريد', path: '/dashboard/settings/email' }
    //   ]
    // }
  ];

  // حالة القوائم الفرعية المفتوحة
  const [openSubMenus, setOpenSubMenus] = useState({});

  // تبديل حالة القائمة الفرعية
  const toggleSubMenu = (index) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // تأثيرات الحركة
  const sidebarVariants = {
    open: {
      width: '280px',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      width: '80px',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  // تنسيقات للعناصر النشطة
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial="open"
      animate={isOpen ? 'open' : 'closed'}
    //   className="h-screen bg-dark text-white shadow-lg overflow-hidden relative"
      className="relative  h-screen bg-dark text-white shadow-lg overflow-hidden "
    //   className="fixed top-0 right-0 h-screen bg-dark text-white shadow-lg overflow-hidden z-40"
    >
      {/* رأس القائمة الجانبية */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-bold text-xl hover:cursor-pointer text-primary-500"
            onClick={() => nav('/')}
          >
            العودة الى الموقع
          </motion.div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* عناصر القائمة */}
      {/* <div className="py-4 overflow-y-auto h-[calc(100vh-64px)]"></div> */}
      <div className="py-4 overflow-y-auto h-[calc(100vh-64px-64px)]">
        <ul className="space-y-2 px-2">
          {menuItems.map((item, index) => (
            <li key={index} className="relative">
              {/* العنصر الرئيسي */}
              {item.subItems.length > 0 ? (
                <button
                  onClick={() => toggleSubMenu(index)}
                  className={`flex items-center w-full p-3 rounded-md transition-colors ${
                    isActive(item.path) ? 'bg-primary-500 text-white' : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {isOpen && (
                    <div className="flex justify-between items-center w-full">
                      <span>{item.title}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${openSubMenus[index] ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-md transition-colors ${
                    isActive(item.path) ? 'bg-primary-500 text-white' : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {isOpen && <span>{item.title}</span>}
                </Link>
              )}

              {/* القائمة الفرعية */}
              {isOpen && item.subItems.length > 0 && (
                <AnimatePresence>
                  {openSubMenus[index] && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 mr-4 space-y-1 border-r border-gray-700"
                    >
                      {item.subItems.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={subItem.path}
                            className={`flex items-center p-2 pr-4 rounded-md transition-colors ${
                              isActive(subItem.path) ? 'bg-primary-500/30 text-primary-300' : 'hover:bg-gray-700'
                            }`}
                          >
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            <span>{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* تذييل القائمة الجانبية */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-dark-light">
        <Link to="/profile" className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
            <span className="font-bold">A</span>
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="font-medium">اسم المستخدم</div>
              <div className="text-xs text-gray-400">admin@example.com</div>
            </motion.div>
          )}
        </Link>
      </div>
    </motion.div>
  );
};

export default SideBar;
