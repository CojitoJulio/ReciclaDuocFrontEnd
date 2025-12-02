import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || null);
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [api] = useState(() => axios.create({
        baseURL: import.meta.env.BACK_URL || "http://localhost:3000/",
    }));

    useEffect(() => {
        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            localStorage.setItem("token", token);
        } else {
            delete api.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
        }
    }, [token, api.defaults.headers.common]);

    useEffect(() => {
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        } else {
            localStorage.removeItem("refreshToken");
        }
    }, [refreshToken]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post("/api/usuario/loginUsuario", { email, password });
            const { accessToken, refreshToken, usuario } = res.data;
            setUser(usuario);
            if (usuario.id_rol === 1) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
            setToken(accessToken);
            setRefreshToken(refreshToken);
        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const res = await api.post("/api/usuario/registroUsuario", {
                email,
                nombre: name,
                password
            });
            return res.data;
        } catch (err) {
            console.error("Error en el registro:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registerAdmin = async (name, email, password) => {
        setLoading(true);
        try {
            const res = await api.post("/api/admin/createAdmin", {
                email,
                nombre: name,
                password
            });
            return res.data;
        } catch (err) {
            console.error("Error en el registro:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
    };

    useEffect(() => {
        const checkAuthOnLoad = async () => {
            const storedRefreshToken = localStorage.getItem("refreshToken");

            if (storedRefreshToken) {
                try {
                    const { data } = await api.post(`${api.defaults.baseURL}/api/usuario/refreshToken`, {
                        refreshToken: storedRefreshToken,
                    });

                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

                    setToken(newAccessToken);
                    setRefreshToken(newRefreshToken);

                    const payload = JSON.parse(atob(newAccessToken.split(".")[1]));
                    setUser({ id: payload.id, email: payload.email, rol: payload.id_rol });
                    if (payload.id_rol === 1) {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }

                } catch (err) {
                    console.error("No se pudo refrescar la sesión al cargar:", err);
                    logout();
                }
            }

            setAuthLoading(false);
        };

        checkAuthOnLoad();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    if (refreshToken) { // 'refreshToken' aquí es el del estado de React
                        try {
                            const { data } = await axios.post(`${api.defaults.baseURL}/api/usuario/refreshToken`, {
                                refreshToken: refreshToken,
                            });

                            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

                            setToken(newAccessToken);
                            setRefreshToken(newRefreshToken);

                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            return api(originalRequest);
                        } catch (refreshError) {
                            console.error("No se pudo refrescar el token:", refreshError);
                            logout();
                            return Promise.reject(refreshError);
                        }
                    } else {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [api, refreshToken, setToken, setRefreshToken]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading, // Login y Register
                authLoading, // Carga inicial de autenticación
                isAuthenticated: !!token,
                isAdmin,
                login,
                logout,
                register,
                registerAdmin,
                api,
            }}
        >
            {!authLoading && children}
        </AuthContext.Provider>
    );
};

// Hook personalizado
export const useAuth = () => useContext(AuthContext);
