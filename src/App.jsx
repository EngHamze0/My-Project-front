import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import * as pages from './pages';
import * as components from './components';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<components.Layout />}>
          <Route index element={<pages.Home />} />
          
          {/* مسارات المصادقة */}
          <Route path="login" element={<pages.Login />} />
          <Route path="register" element={<pages.Register />} />
          <Route path="forgot-password" element={<pages.ForgotPassword />} />
          <Route path="reset-password" element={<pages.ResetPassword />} />
          <Route path="change-password" element={<pages.ChangePassword />} />
          <Route path="profile" element={<pages.Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
