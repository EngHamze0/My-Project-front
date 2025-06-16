import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import * as components from '../../components';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // إذا تم تمرير state مع scrollToContact، قم بالتمرير إلى قسم التواصل
    if (location.state?.scrollToContact) {
      const contactSection = document.querySelector('#contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
      // مسح state بعد التمرير
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <components.Hero />
      <components.FeaturedProducts />
      <components.AboutUs />
      <components.FAQ />
      <div id="contact-section">
        <components.ContactUs />
      </div>
    </motion.div>
  );
};

export default Home; 