import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import featuredProducts from '../../data/featuredProducts';

const FeaturedProducts = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'panels', name: 'ألواح شمسية' },
    { id: 'batteries', name: 'بطاريات' },
    { id: 'inverters', name: 'محولات' },
    { id: 'systems', name: 'أنظمة متكاملة' },
  ];

  const filteredProducts = activeCategory === 'all' 
    ? featuredProducts 
    : featuredProducts.filter(product => product.category === activeCategory);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4 text-secondary-600"
          >
            منتجاتنا المميزة
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            اكتشف مجموعة متنوعة من منتجات الطاقة الشمسية عالية الجودة التي تلبي احتياجاتك المختلفة
          </motion.p>
        </div>

        {/* تصنيفات المنتجات */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-10"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full transition-colors duration-300 ${
                activeCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* قائمة المنتجات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {product.isNew && (
                  <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    جديد
                  </span>
                )}
                {product.discount && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    خصم {product.discount}%
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-secondary-600 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {product.oldPrice ? (
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-primary-600">{product.price} ريال</span>
                        <span className="text-sm text-gray-500 line-through">{product.oldPrice} ريال</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-primary-600">{product.price} ريال</span>
                    )}
                  </div>
                  <Link
                    to={`/products/${product.id}`}
                    className="bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300"
                  >
                    التفاصيل
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* زر عرض المزيد */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-md transition-colors duration-300"
          >
            عرض جميع المنتجات
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 