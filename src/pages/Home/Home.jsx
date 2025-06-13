import { motion } from 'framer-motion';
import * as components from '../../components';

const Home = () => {
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
      <components.ContactUs />
    </motion.div>
  );
};

export default Home; 