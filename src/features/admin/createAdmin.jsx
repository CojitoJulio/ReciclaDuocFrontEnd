import { Link, useNavigate } from 'react-router';
import { z } from 'zod';
import { useAuth } from '@/auth/api/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';

const allowedDomains = ["duocuc.cl", "duoc.cl", "alumnos.duoc.cl", "alumnos.duocuc.cl"];

const registerSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().min(1, "El correo es obligatorio").email("Correo inválido").refine((email) => {
        const domain = email.split("@")[1];
        return allowedDomains.includes(domain);
    }, {
        message: "El correo debe pertenecer a un dominio de Duoc UC",
    }),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "La confirmación de contraseña es obligatoria"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // Asigna el error al campo de confirmación
});

export default function CreateAdmin() {

    const { colors } = useTheme();

    const { registerAdmin: registerAdmin } = useAuth();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState("");

    const { register, handleSubmit, formState: { errors, isValid, isSubmitting }, setError } = useForm({
        resolver: zodResolver(registerSchema),
        mode: "onChange"
    });

    const onSubmit = async (data) => {
        setApiError("");
        try {
            await registerAdmin(data.name, data.email, data.password);
            alert("¡Registro exitoso! Usuario Administrador creado.");
            navigate("/admin");
        } catch (err) {
            const status = err?.response?.status;
            if (status === 409) {
                setApiError("El correo electrónico ya está registrado.");
                setError("email", { type: "manual" });
            } else {
                setApiError("Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.");
                console.error("Error en el registro:", err);
            }
        }
    };

    return (
        <div className="pb-6 px-4 ">
            <h1 className="mt-2 text-[34px] leading-none font-extrabold" style={{ color: colors.darkTeal }}>Crear Admin</h1>
            <form className="mt-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.email ? "border-red-500" : ""}`}
                        style={{ borderColor: colors.accent }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}22`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                        {...register("email")}
                        aria-label="Correo electrónico"
                        inputMode="email"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div className='mt-4'>
                    <input
                        type="text"
                        placeholder="Nombre"
                        className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.name ? "border-red-500" : ""}`}
                        style={{ borderColor: colors.accent }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}22`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                        {...register("name")}
                        aria-label="Nombre"
                        inputMode="text"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <div className="mt-4">
                    <input
                        type="password"
                        placeholder="Contraseña"
                        className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.password ? "border-red-500" : ""}`}
                        style={{ borderColor: colors.accent }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}22`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                        {...register("password")}
                        aria-label="Contraseña"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>
                <div className="mt-4">
                    <input
                        type="password"
                        placeholder="Confirmar Contraseña"
                        className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.confirmPassword ? "border-red-500" : ""}`}
                        style={{ borderColor: colors.accent }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}22`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                        {...register("confirmPassword")}
                        aria-label="Confirmar Contraseña"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                </div>

                {apiError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mt-4">
                        {apiError}
                    </div>
                )}

                <button
                    type="submit"
                    className="mt-6 w-full rounded-2xl py-4 text-white text-2xl font-extrabold shadow-md active:scale-[.99] transition disabled:opacity-60"
                    style={{ backgroundColor: colors.darkTeal }}
                    disabled={!isValid || isSubmitting}
                >
                    {isSubmitting ? "Registrando..." : "Registrar"}
                </button>

            </form>

        </div>
    );
}
