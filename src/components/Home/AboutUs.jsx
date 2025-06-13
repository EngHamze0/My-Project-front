import { motion } from 'framer-motion';

const AboutUs = () => {
  const stats = [
    { value: '10+', label: 'سنوات من الخبرة' },
    { value: '500+', label: 'مشروع منجز' },
    { value: '1000+', label: 'عميل راضٍ' },
    { value: '25+', label: 'خبير متخصص' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">من نحن</h2>
            <div className="w-20 h-1 bg-green-600 mb-6"></div>
            <p className="text-gray-600 mb-6">
              شركة <span className="font-bold text-green-600">شمس تك</span> هي شركة رائدة في مجال حلول الطاقة الشمسية والمتجددة في المملكة العربية السعودية. تأسست الشركة في عام 2013 بهدف تقديم حلول طاقة مستدامة وفعالة من حيث التكلفة للعملاء في القطاعين السكني والتجاري.
            </p>
            <p className="text-gray-600 mb-6">
              نحن نؤمن بأن الطاقة المتجددة هي مستقبل العالم، ونسعى جاهدين لتمكين عملائنا من الاستفادة من الطاقة الشمسية النظيفة والمستدامة. مع فريق من الخبراء المتخصصين، نقدم خدمات شاملة بدءًا من التصميم والتخطيط وحتى التركيب والصيانة.
            </p>
            <p className="text-gray-600 mb-8">
              تتميز منتجاتنا بأعلى معايير الجودة والموثوقية، ونحن فخورون بتقديم حلول مخصصة تلبي الاحتياجات المحددة لكل عميل. هدفنا هو المساهمة في تحقيق رؤية المملكة 2030 نحو مستقبل أكثر استدامة واعتمادًا على الطاقة المتجددة.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors duration-300"
              >
                اقرأ المزيد
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-md transition-colors duration-300"
              >
                تواصل معنا
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 md:h-64 bg-green-100 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80"
                    alt="تركيب ألواح شمسية"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 md:h-80 bg-green-100 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                    alt="فريق العمل"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="h-64 md:h-80 bg-green-100 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1592833167665-45638961c1c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
                    alt="ألواح شمسية"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-48 md:h-64 bg-green-100 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1583401515094-104926b3c7a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                    alt="منزل بالطاقة الشمسية"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-lg shadow-xl">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-green-600">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs; 