import ReciclajeIcon from "@/assets/Icons/ReciclajeIcon";
import { Link } from "react-router";
import { useState } from "react";
import { z } from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/auth/api/AuthContext";

const schema = z.object({
    email: z
        .string({ required_error: "El correo es obligatorio" })
        .min(1, "El correo es obligatorio")
        .email("Formato de correo inválido"),
    password: z
        .string({ required_error: "La contraseña es obligatoria" })
        .max(72, "Máximo 72 caracteres")
});

export default function LoginScreen() {
    const darkTeal = "#0a615c";
    const accent = "#00bfb3";

    const { login, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPwd, setShowPwd] = useState(false);
    const [apiError, setApiError] = useState("");
    const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } =
        useForm({
            resolver: zodResolver(schema),
            mode: "onChange"
        });

    /*
        
        const onSubmit = async (data) => {
            setApiError("");
            console.log(data);
            try {
                // ⚙️ Configura tu endpoint
                const resp = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/api/usuario/loginUsuario`,
                    {
                        email: data.email,
                        password: data.password
                    }
                );
    
                const token = resp.data?.token ?? resp.data?.jwt;
    
                if (token) {
                    localStorage.setItem("access_token", token);
                }
    
                // Redirige al dashboard o ruta protegida
                window.location.replace("/");
            } catch (err) {
                // Manejo de errores legible
                const status = err?.response?.status;
                if (status === 400 || status === 401) {
                    setApiError("Correo o contraseña incorrectos.");
                } else if (status === 429) {
                    setApiError("Demasiados intentos. Intenta nuevamente en unos minutos.");
                } else {
                    setApiError("No pudimos iniciar sesión. Revisa tu conexión o inténtalo más tarde.");
                }
            }
        };
    
    */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch {
            setError("Credenciales inválidas");
        }
    };

    return (
        <div className="w-full min-h-screen grid place-items-center bg-neutral-100">
            {/* Phone frame */}
            <div className="w-[380px] max-w-full bg-white rounded-[28px] shadow-2xl border border-neutral-200 overflow-hidden">
                <div className="px-6 pt-10 pb-10">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <ReciclajeIcon />
                    </div>

                    {/* Title */}
                    <h1 className="mt-4 text-center text-[44px] leading-none font-extrabold" style={{ color: darkTeal }}>
                        ReciclaDUOC
                    </h1>

                    {/* Form */}
                    <form className="mt-6" onSubmit={handleSubmit(onSubmit)} noValidate>

                        <div>
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.email ? "border-red-500" : "border-gray-300"
                                    }`}
                                style={{ borderColor: accent }}
                                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}22`)}
                                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                                {...register("email")}
                                aria-label="Correo electrónico"
                                inputMode="email"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="mt-4">
                            <input
                                type={showPwd ? "text" : "password"}
                                placeholder="Contraseña"
                                className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.password ? "border-red-500" : "border-gray-300"
                                    }`}
                                style={{ borderColor: accent }}
                                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}22`)}
                                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                                {...register("password")}
                                aria-label="Contraseña"
                            />

                            {/* Boton mostrar/ocultar */}

                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password.message}</p>
                            )}


                        </div>

                        {apiError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 mt-4">
                                {apiError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="mt-6 w-full rounded-2xl py-4 text-white text-2xl font-extrabold shadow-md active:scale-[.99] transition"
                            style={{ backgroundColor: darkTeal }}
                            disabled={!isValid || isSubmitting}

                        >
                            {isSubmitting ? "Validando..." : "Ingresar"}
                        </button>

                        <Link to={'/register'}>
                            <p className="mt-4 text-center text-lg text-neutral-800">o Registrarse</p>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}
