// src/auth/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/auth/api/AuthContext";

export default function ProtectedRoute({ redirectTo = "/login" }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
    return <Outlet />;
}
