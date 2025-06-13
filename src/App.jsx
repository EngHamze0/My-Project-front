import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as components from './components';
import * as pages from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<components.Layout />}>
          <Route index element={<pages.Home />} />
          {/* يمكن إضافة المزيد من الصفحات هنا */}
          <Route path="*" element={<div className="py-40 text-center">الصفحة غير موجودة</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
