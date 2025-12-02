import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/auth/api/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Agregamos 'disponible' al esquema para que react-hook-form lo conozca
const premioSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(50, "El nombre es muy largo"),
    puntos_requeridos: z.coerce.number().positive("Los puntos deben ser un número positivo"),
    stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
    disponible: z.number().optional(), // Hacemos que 'disponible' sea parte del schema
});

export default function ModPremio() {

    const { api } = useAuth();
    const { colors } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();

    const [apiError, setApiError] = useState("");
    const [loadingState, setLoadingState] = useState(true);
    const [isToggleLoading, setIsToggleLoading] = useState(false);

    const { register, handleSubmit, formState: { errors, isValid, isSubmitting }, reset, watch, setValue } = useForm({
        resolver: zodResolver(premioSchema),
        mode: "onChange"
    });

    useEffect(() => {
        (async () => {
            try {
                setLoadingState(true);
                setApiError("");
                const { data } = await api.get(`/api/admin/premiosolo?id_premio=${id}`);
                if (data) {
                    reset(data);
                } else {
                    throw new Error("Premio no encontrado");
                }
            } catch (e) {
                console.error("Error al obtener los datos del premio:", e);
                setApiError(e.response?.data?.message || "No se pudo cargar el premio.");
            } finally {
                setLoadingState(false);
            }
        })();
    }, [id, api, reset]);

    const handleToggleDisponible = useCallback(async (e) => {
        const isChecked = e.target.checked;
        const nuevoEstado = isChecked ? "1" : "0"; // "1" para activo, "0" para desactivado
        const actionText = isChecked ? "habilitar" : "deshabilitar";

        setIsToggleLoading(true);
        setApiError("");

        try {
            await api.put("/api/admin/estadoPremio", { id_premio: id, estado: nuevoEstado });
            // Actualizamos el valor en el formulario para que la UI reaccione
            setValue("disponible", isChecked ? 1 : 0, { shouldValidate: false });
        } catch (err) {
            console.error(`Error al ${actionText} el premio:`, err);
            setApiError(err.response?.data?.message || `No se pudo ${actionText} el premio.`);
            // Revertimos el switch si la API falla
            e.target.checked = !isChecked;
        } finally {
            setIsToggleLoading(false);
        }
    }, [api, id, setValue]);

    const disponible = watch("disponible");

    const onSubmit = async (data) => {
        setApiError("");
        try {
            // Usamos PUT para actualizar el recurso existente
            await api.put(`/api/admin/premio`, { ...data, id_premio: id });
            alert("Premio modificado con éxito");
            navigate("/admin/managerewards");
        } catch (err) {
            console.error("Error al modificar el premio:", err);
            setApiError(err.response?.data?.message || "No se pudo modificar el premio. Inténtalo más tarde.");
        }
    };

    if (loadingState) {
        return <div className="p-6 text-center">Cargando datos del premio...</div>;
    }

    return (
        <div className="pb-6 px-4 ">
            <h1 className="mt-2 text-[34px] leading-none font-extrabold" style={{ color: colors.darkTeal }}>Modificar Premio</h1>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>

                <div>
                    <span className="block text-s font-medium text-gray-700 mb-2"
                        style={{ color: colors.darkTeal }}
                    >Nombre del Premio</span>

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
                    <span className="block text-s font-medium text-gray-700 mb-2"
                        style={{ color: colors.darkTeal }}
                    >Puntaje Requerido</span>
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
                    <span className="block text-s font-medium text-gray-700 mb-2"
                        style={{ color: colors.darkTeal }}
                    >Stock del Premio</span>
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

                {
                    apiError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {apiError}
                        </div>
                    )
                }

                <button
                    type="submit"
                    className="!mt-6 w-full rounded-2xl py-4 text-white text-2xl font-bold shadow-md active:scale-[.99] transition disabled:opacity-60"
                    style={{ backgroundColor: colors.darkTeal }}
                    disabled={!isValid || isSubmitting}
                >
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </button>
            </form >

            <div className="mt-6">
                <span className="block text-s font-medium text-gray-700 mb-2"
                    style={{ color: colors.darkTeal }}
                >Estado del Premio</span>
                <label htmlFor="disponible-switch" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="disponible-switch"
                            className="sr-only"
                            checked={disponible === 1}
                            disabled={isToggleLoading}
                            onChange={handleToggleDisponible}
                        />
                        <div className={`block w-14 h-8 rounded-full ${disponible === 1 ? `bg-green-800` : 'bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${disponible === 1 ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                        {isToggleLoading
                            ? "Actualizando..."
                            : (disponible === 1 ? "Habilitado" : "Deshabilitado")
                        }
                    </div>
                </label>
            </div>

        </div >
    );
}