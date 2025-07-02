import { motion } from 'framer-motion';

const AboutUs = () => {
  const stats = [
    { value: '+10', label: 'سنوات خبرة' },
    { value: '+500', label: 'مشروع منجز' },
    { value: '+1000', label: 'عميل راضٍ' },
    { value: '+50', label: 'خبير متخصص' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-secondary-600">من نحن</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              نحن شركة رائدة في مجال حلول الطاقة الشمسية، نسعى لتقديم أفضل المنتجات والخدمات لعملائنا في جميع أنحاء سوريا.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              نتميز بفريق من الخبراء والمهندسين المتخصصين في مجال الطاقة الشمسية.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/about"
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md transition-colors duration-300"
              >
                اقرأ المزيد
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1497440001374-f26997328c1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
              alt="Solar panels installation"
              className="rounded-lg shadow-md w-full object-cover"
            />
          </motion.div>
        </div>

        {/* إحصائيات */}
        <div className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-6 rounded-lg shadow-md text-white"
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs; 