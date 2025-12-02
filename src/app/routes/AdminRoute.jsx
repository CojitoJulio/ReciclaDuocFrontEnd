// src/auth/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/auth/api/AuthContext";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

export default function AdminRoute({ redirectTo = "/" }) {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const decoded = jwtDecode(token);
    if (!decoded || decoded.id_rol !== 1) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    return <Outlet />;
}
