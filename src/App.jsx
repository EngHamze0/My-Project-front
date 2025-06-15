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
          <Route path="cart" element={<pages.Cart />} />
          <Route path="services" element={<pages.ServicesPage />} />
          <Route path="services/:id" element={<pages.ServiceDetails />} />



          {/* مسارات المصادقة */}
          <Route element={<RequireAuth />}>
            <Route path="change-password" element={<pages.ChangePassword />} />
            <Route path="profile" element={<pages.Profile />} />
            <Route path="favorite" element={<pages.Favorite />} />
            <Route path="subscriptions" element={<pages.MySubscriptions />} />
            <Route path="checkout" element={<pages.Checkout />} />
            <Route path="order-success/:id" element={<pages.OrderSuccess />} />
            <Route path="orders" element={<pages.MyOrders />} />
            <Route path="orders/:id" element={<pages.UserOrderDetails />} />
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

            {/* مسارات إدارة الطلبات */}
            <Route path="/dashboard/orders" element={<pages.OrdersList />} />
            <Route path="/dashboard/orders/:id" element={<pages.OrderDetails />} />
          
            {/* مسارات إدارة الكوبونات */}
            <Route path="/dashboard/coupons" element={<pages.CouponsList />} />
            <Route path="/dashboard/coupons/add" element={<pages.AddCoupon />} />
            <Route path="/dashboard/coupons/:id" element={<pages.CouponDetails />} />

            {/* مسارات إدارة المستخدمين */}
            <Route path="/dashboard/users" element={<pages.UsersList />} />
            <Route path="/dashboard/users/add" element={<pages.AddUser />} />
            <Route path="/dashboard/users/:id" element={<pages.EditUser />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}




export default App;
