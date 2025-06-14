import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as pages from "./pages";
import * as components from "./components";
import {
  RequireAuth,
  RequireAuthAdmin,
} from "./components/RequireAuth/RequireAuth";

function App() {
  return (
    <Router>
      <Routes>
        {/* public  */}
        <Route path="/" element={<components.Layout />}>
          <Route index element={<pages.Home />} />

          <Route path="login" element={<pages.Login />} />
          <Route path="register" element={<pages.Register />} />
          <Route path="forgot-password" element={<pages.ForgotPassword />} />
          <Route path="reset-password" element={<pages.ResetPassword />} />
          <Route path="products" element={<pages.ProductsPage />} />
          <Route path="products/:id" element={<pages.Product />} />
          <Route path="services" element={<pages.ServicesPage />} />
          <Route path="services/:id" element={<pages.ServiceDetails />} />



          {/* مسارات المصادقة */}
          <Route element={<RequireAuth />}>
            <Route path="change-password" element={<pages.ChangePassword />} />
            <Route path="profile" element={<pages.Profile />} />
            <Route path="favorite" element={<pages.Favorite />} />
            <Route path="subscriptions" element={<pages.MySubscriptions />} />
  
          </Route>
        </Route>


        {/* dashboard */}
        <Route element={<RequireAuthAdmin />}>
          <Route path="/dashboard" element={<components.MainSidebar />}>
            <Route index element={<pages.Dashboard />} />
            <Route path="/dashboard/products" element={<pages.PoductsList />} />
            <Route path="/dashboard/product/:id" element={<pages.SingleProduct />} />
            <Route path="/dashboard/products/add" element={<pages.AddProduct />} />
            <Route path="/dashboard/products/edit/:id" element={<pages.EditProduct />} />


            <Route path="/dashboard/services" element={<pages.Services />} />
            <Route path="/dashboard/services/:id" element={<pages.Service />} />
            <Route path="/dashboard/services/add" element={<pages.AddServices />} />
            <Route path="/dashboard/services/edit/:id" element={<pages.EditServices />} />

            <Route path="/dashboard/subscriptions" element={<pages.AllSubscriptions />} />

          
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}




export default App;
