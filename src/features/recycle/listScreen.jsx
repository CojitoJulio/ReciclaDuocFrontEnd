import { useMemo } from "react";
import { useRecycleStore } from "@/app/context/RecycleStore";
import { Link } from "react-router";
import { useTheme } from "@/app/context/ThemeContext";

const fmtPct = (v) => (typeof v === "number" ? `${(v * 100).toFixed(0)}%` : v);

function ResultItem({ item, onRemove }) {
    const { colors } = useTheme();

    const imgSrc = useMemo(() => {
        if (!item?.photo) return "";
        if (typeof item.photo === "string") return item.photo;
        try {
            return URL.createObjectURL(item.photo);
        } catch {
            return "";
        }
    }, [item?.photo]);

    return (
        <li className="flex items-center gap-4 p-4 rounded-2xl border bg-white shadow-md transition-shadow hover:shadow-lg"
            style={{ borderColor: colors.accent }}>
            {/* Miniatura */}
            <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border-2"
                style={{ borderColor: colors.accent }}>
                <img
                    src={imgSrc}
                    loading="lazy"
                    alt={item.ia.data_completa[0].clase || "foto"}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg truncate" style={{ color: colors.darkTeal }}>
                        {(item.ia.data_completa[0].clase).charAt(0).toUpperCase() + (item.ia.data_completa[0].clase).slice(1) || "Material desconocido"}
                    </h3>
                    {/* Puntaje pill */}
                    <span className="shrink-0 inline-flex items-center px-2.5 py-1 text-sm font-semibold rounded-full"
                        style={{ backgroundColor: colors.lightTeal, color: colors.darkTeal, border: `1px solid ${colors.accent}` }}>
                        Pts: {item.puntaje ?? "-"}
                    </span>
                </div>

                <div className="mt-1 text-sm text-gray-700">
                    <span className="font-semibold text-gray-800">Confianza: </span>
                    {typeof item.ia.data_completa[0].confianza === "number" && item.ia.data_completa[0].confianza <= 1
                        ? fmtPct(item.ia.data_completa[0].confianza)
                        : ((item.ia.data_completa[0].confianza * 100).toFixed(0) ?? "-")}
                </div>

            </div>

            {/* Quitar */}
            {onRemove && (
                <button
                    onClick={() => onRemove(item.id)}
                    className="ml-0.5 mr-1 p-1 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Eliminar"
                    title="Eliminar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1-0 11-2 0V8zm5-1a1 1-0 00-1 1v6a1 1-0 102 0V8a1 1-0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            )}
        </li>
    );
}

export default function ResultsList() {

    const { colors } = useTheme();

    const { items, removeItem } = useRecycleStore();

    if (!items.length) {
        return (
            <>
                <div className="p-4 rounded-xl border bg-gray-50 text-sm text-gray-600">
                    Aún no hay fotos clasificadas. Toma una y presiona “Enviar”.

                </div>
                <Link to="/recycle">
                    <button className="rounded-xl px-4 py-3 flex-1 w-full mt-4"
                        style={{ backgroundColor: colors.lightTeal, color: colors.darkTeal }}>
                        Agregar
                    </button>
                </Link>
            </>
        );
    }

    return (
        <ul className="space-y-3">
            {items.map((it) => (
                <ResultItem key={it.id} item={it} onRemove={removeItem} />
            ))}

            {/* Botones de acción */}
            <div className="flex gap-3 mt-6">
                <Link to="/recycle" className="flex-1">
                    <button className="rounded-xl px-4 py-3 w-full border"
                        style={{ borderColor: colors.darkTeal, color: colors.darkTeal }}>
                        Agregar más
                    </button>
                </Link>
                <Link to="/summary" className="flex-1">
                    <button className="rounded-xl px-4 py-3 w-full text-white font-bold"
                        style={{ backgroundColor: colors.darkTeal }}>
                        Revisar y Finalizar
                    </button>
                </Link>
            </div>
        </ul>
    );
}
