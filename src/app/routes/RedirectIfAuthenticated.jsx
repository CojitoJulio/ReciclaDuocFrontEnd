// src/auth/RedirectIfAuthenticated.jsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/auth/api/AuthContext";

export default function RedirectIfAuthenticated({ to = "/" }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    return isAuthenticated
        ? <Navigate to={location.state?.from?.pathname || to} replace />
        : <Outlet />;
}
