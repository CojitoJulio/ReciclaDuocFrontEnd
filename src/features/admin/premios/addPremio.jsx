import { useState } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/auth/api/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Esquema de validación con Zod
const premioSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(50, "El nombre es muy largo"),
    puntos_requeridos: z.coerce.number().positive("Los puntos deben ser un número positivo"),
    stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
});

export default function AddPremio() {

    const { api } = useAuth();
    const { colors } = useTheme();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState("");

    const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
        resolver: zodResolver(premioSchema),
        mode: "onChange"
    });

    const onSubmit = async (data) => {
        setApiError("");
        try {
            await api.post("/api/admin/premio", data);
            alert("Premio agregado con éxito");
            navigate("/admin/managerewards");
        } catch (err) {
            console.error("Error al agregar el premio:", err);
            setApiError(err.response?.data?.message || "No se pudo agregar el premio. Inténtalo más tarde.");
        }
    };


    return (
        <div className="pb-6 px-4 ">
            <h1 className="mt-2 text-[34px] leading-none font-extrabold" style={{ color: colors.darkTeal }}>Agregar Premios</h1>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>

                <div>
                    <input
                        type="text"
                        placeholder="Nombre del Premio"
                        className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.nombre ? "border-red-500" : ""}`}
                        style={{ borderColor: colors.accent }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}22`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                        aria-label="Nombre del Premio"
                        {...register("nombre")}
                    />
                    {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
                </div>
                <div>
                    <input
                        type="number"
                        placeholder="Puntos Requeridos"
                        className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.puntos_requeridos ? "border-red-500" : ""}`}
                        style={{ borderColor: colors.accent }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}22`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                        aria-label="Puntos Requeridos"
                        inputMode="numeric"
                        {...register("puntos_requeridos")}
                    />
                    {errors.puntos_requeridos && <p className="mt-1 text-sm text-red-600">{errors.puntos_requeridos.message}</p>}
                </div>
                <div>
                    <input
                        type="number"
                        placeholder="Stock Disponible"
                        className={`w-full rounded-2xl border px-5 py-4 text-lg outline-none bg-white ${errors.stock ? "border-red-500" : ""}`}
                        style={{ borderColor: colors.accent }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}22`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                        aria-label="Stock Disponible"
                        inputMode="numeric"
                        {...register("stock")}
                    />
                    {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
                </div>

                {apiError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {apiError}
                    </div>
                )}

                <button
                    type="submit"
                    className="!mt-6 w-full rounded-2xl py-4 text-white text-2xl font-bold shadow-md active:scale-[.99] transition disabled:opacity-60"
                    style={{ backgroundColor: colors.darkTeal }}
                    disabled={!isValid || isSubmitting}
                >
                    {isSubmitting ? "Guardando..." : "Guardar Premio"}
                </button>
            </form>

        </div>
    );
}