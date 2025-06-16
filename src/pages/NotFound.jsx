import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaArrowRight } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {/* رقم الخطأ */}
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-9xl font-bold text-primary-500 mb-4"
          >
            404
          </motion.div>

          {/* رسالة الخطأ */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl font-bold text-gray-800 mb-4"
          >
            عذراً، الصفحة غير موجودة
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600 mb-8"
          >
            يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها
          </motion.p>

          {/* أزرار التنقل */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors duration-300"
            >
              <FaHome className="text-lg" />
              <span>العودة للرئيسية</span>
            </Link>

            <Link
              to="/products"
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300"
            >
              <FaSearch className="text-lg" />
              <span>تصفح المنتجات</span>
            </Link>
          </motion.div>

          {/* اقتراحات مفيدة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 bg-gray-50 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">اقتراحات مفيدة</h2>
            <ul className="space-y-3 text-right">
              <li className="flex items-center gap-2 text-gray-600">
                <FaArrowRight className="text-primary-500" />
                <span>تأكد من صحة الرابط المدخل</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <FaArrowRight className="text-primary-500" />
                <span>استخدم شريط البحث للعثور على ما تريد</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <FaArrowRight className="text-primary-500" />
                <span>تصفح المنتجات والخدمات المتاحة</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 