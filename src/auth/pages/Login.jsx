import ReciclajeIcon from "@/assets/Icons/ReciclajeIcon";
import { Link, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/auth/api/AuthContext";

const allowedDomains = ["duocuc.cl", "duoc.cl", "duocuc.com", "alumnos.duoc.cl", "alumnos.duocuc.cl"];


// Validación con Zod
const loginSchema = z.object({
    email: z.string().min(1, "El correo es obligatorio").email("Correo inválido")
        .refine((email) => {
            const domain = email.split("@")[1];
            return allowedDomains.includes(domain);
        }, {
            message: "El correo debe pertenecer a un dominio de Duoc UC",
        })
    ,
    password: z.string().min(1, "La contraseña es obligatoria"),
});

export default function LoginScreen() {
    const darkTeal = "#0a615c";
    const accent = "#00bfb3";

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [showPwd, setShowPwd] = useState(false);
    const [apiError, setApiError] = useState("");

    const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema),
        mode: "onChange"
    });

    const onSubmit = async (data) => {
        setApiError("");
        try {
            await login(data.email, data.password);
            // tras login exitoso
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
        } catch (err) {
            const status = err?.response?.status;
            if (status === 400 || status === 401) {
                setApiError("Correo o contraseña incorrectos.");
            } else {
                setApiError("No se pudo iniciar sesión. Inténtalo más tarde.");
            }
        }
    };

    return (
        <div className="w-full min-h-screen grid place-items-center bg-neutral-100">
            {/* Phone frame */}
            <div className="w-[380px] max-w-full bg-white rounded-[28px] shadow-2xl border-neutral-200 overflow-hidden">
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
                                className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.email ? "border-red-500" : ""}`}
                                style={{ borderColor: accent }}
                                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}22`)}
                                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                                {...register("email")}
                                aria-label="Correo electrónico"
                                inputMode="email"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>
                        <div className="mt-4">
                            <input
                                type={showPwd ? "text" : "password"}
                                placeholder="Contraseña"
                                className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.password ? "border-red-500" : ""}`}
                                style={{ borderColor: accent }}
                                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}22`)}
                                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                                {...register("password")}
                                aria-label="Contraseña"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                            {/* Boton mostrar/ocultar */}

                        </div>

                        {apiError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mt-4">
                                {apiError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="mt-6 w-full rounded-2xl py-4 text-white text-2xl font-extrabold shadow-md active:scale-[.99] transition disabled:opacity-60"
                            style={{ backgroundColor: darkTeal }}
                            disabled={!isValid || isSubmitting}

                        >
                            {isSubmitting ? "Validando..." : "Iniciar sesión"}
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
