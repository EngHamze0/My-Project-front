import { Navigate, Outlet, useNavigate } from "react-router-dom";

export const RequireAuth = () => {
    const isAuth = localStorage.getItem('user') !== undefined;
    if (isAuth) return <Outlet />
    else return <Navigate to="/login" />;
}

export const RequireAuthAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin' || false;
    if (isAdmin) return <Outlet />
    else return <Navigate to="/" />;
}

