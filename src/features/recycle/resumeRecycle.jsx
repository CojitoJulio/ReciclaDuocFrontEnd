import { useMemo, useState, useEffect } from "react";
import { useRecycleStore } from "@/app/context/RecycleStore";
import { useAuth } from "@/auth/api/AuthContext";
import { useNavigate } from "react-router";
import { useTheme } from "@/app/context/ThemeContext";

function ReceiptRow({ label, value, isTotal = false }) {
    return (
        <div className={`flex justify-between items-center ${isTotal ? "text-lg font-bold border-t border-dashed border-gray-400 pt-2 mt-2" : "text-base"}`}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}

export default function RecycleSummary() {
    const { items, clearItems } = useRecycleStore();
    const { api } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [materiales, setMaterials] = useState([]);
    const [loadingState, setLoadingState] = useState(true);
    const [err, setErr] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    const { colors } = useTheme();

    const getMateriales = async () => {
        const { data } = await api.get("/api/reciclaje/materiales");
        return data;
    };

    useEffect(() => {
        (async () => {
            try {
                const data = await getMateriales();
                setMaterials(data.materiales);
            } catch (e) {
                console.error("Error al obtener los materiales:", e);
                setErr(e);
            } finally {
                setLoadingState(false);
            }
        })();
    }, []);

    const { summary, totalScore } = useMemo(() => {
        const materialCount = items.reduce((acc, item) => {
            const material = item.ia.data_completa[0].clase || "desconocido";
            acc[material] = (acc[material] || 0) + 1;
            return acc;
        }, {});

        const score = items.reduce((acc, item) => acc + (item.puntaje || 0), 0);

        return { summary: materialCount, totalScore: score };
    }, [items]);

    const handleRegisterRecycling = async () => {
        setIsSubmitting(true);
        setError("");
        try {
            const itemsWithMaterialId = items.map(it => {
                const materialInfo = materiales.find(mat => mat.nombre.toLowerCase() === it.ia?.data_completa[0]?.clase.toLowerCase());
                return {
                    ...it,
                    materialId: materialInfo ? materialInfo.id_material : null,
                };
            }).filter(it => it.materialId !== null);

            if (itemsWithMaterialId.length === 0) {
                setError("Ninguno de los materiales escaneados pudo ser reconocido. No se puede registrar el reciclaje.");
                setIsSubmitting(false);
                return;
            }
            console.log("Items a registrar:", itemsWithMaterialId);

            // Agrupar items por materialId
            const groupedMaterials = itemsWithMaterialId.reduce((acc, item) => {
                const materialId = item.materialId;
                if (!acc[materialId]) {
                    acc[materialId] = {
                        id_material: materialId,
                        cantidad: 0,
                        foto: item.photo,
                    };
                }
                acc[materialId].cantidad += 1;
                return acc;
            }, {});

            // Convertir el objeto agrupado en un array
            const finalMateriales = Object.values(groupedMaterials);

            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await api.post("/api/reciclaje/registroReciclaje", {
                id_sede: 2,
                materiales: finalMateriales,
            }, { headers });

            alert("¡Reciclaje registrado con éxito!");
            clearItems();
            navigate("/");

        } catch (err) {
            console.error("Error al registrar el reciclaje:", err);
            setError("No se pudo registrar el reciclaje. Inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="p-6 text-center">
                <p>No hay elementos para resumir. Vuelve y agrega algunos.</p>
            </div>
        );
    }



    return (
        <div className="p-4 sm:p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4" style={{ color: colors.darkTeal }}>
                Resumen de Reciclaje
            </h2>

            {/* Contenedor de la boleta */}
            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-400 font-mono">
                <div className="text-center mb-4">
                    <h3 className="text-xl font-bold" style={{ color: colors.darkTeal }}>RECICLADUOC</h3>
                    <p className="text-sm text-gray-500">Comprobante de Reciclaje</p>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold border-b border-dashed border-gray-400 pb-1">DETALLE:</h4>
                    {Object.entries(summary).map(([material, count]) => (
                        <ReceiptRow
                            key={material}
                            label={`${material.charAt(0).toUpperCase() + material.slice(1)} (x${count})`}
                            value=""
                        />
                    ))}
                </div>

                <div className="mt-4">
                    <ReceiptRow label="Puntos Obtenidos:" value={totalScore.toFixed(0)} isTotal={true} />
                </div>
            </div>

            {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <button
                onClick={handleRegisterRecycling}
                disabled={isSubmitting}
                className="mt-6 w-full rounded-2xl py-4 text-white text-xl font-extrabold shadow-md active:scale-[.99] transition disabled:opacity-60"
                style={{ backgroundColor: colors.darkTeal }}
            >
                {isSubmitting ? "Registrando..." : "Confirmar y Registrar Reciclaje"}
            </button>
        </div>
    );
}
