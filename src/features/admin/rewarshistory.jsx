import { useTheme } from "@/app/context/ThemeContext";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/auth/api/AuthContext";

export default function RewardsHistory() {

    const { colors } = useTheme();
    const { api } = useAuth();
    const [premios, setPremios] = useState([]);
    const [loadingState, setLoadingState] = useState(true);
    const [err, setErr] = useState(null);

    const shownPremios = premios ?? [];

    const getPremios = async () => {
        const { data } = await api.get("/api/admin/historial");
        return data;
    };

    useEffect(() => {
        (async () => {
            try {
                const data = await getPremios();
                setPremios(data.premios);
            } catch (e) {
                console.error("Error al obtener el perfil:", e);
                setErr(e);
            } finally {
                setLoadingState(false);
            }
        })();
    }, [api]);


    return (
        <div className="pb-6 px-4 ">

            <h1 className="mt-2 text-[40px] leading-none font-extrabold" style={{ color: colors.darkTeal }}>Historial de Premios</h1>

            <section className="mt-6">

                {shownPremios.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-3">
                        {shownPremios.map((item) => (
                            <HistoryItem key={item.id_canje} item={item} accent={colors.primary} dark={colors.darkTeal} />
                        ))}
                    </div>
                )}

            </section>

        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border bg-white px-4 py-6 text-center text-neutral-600">
            Aún no hay registros de reciclajes premios entregados.
        </div>
    );
}

function HistoryItem({ item, dark = "#0a615c" }) {

    return (
        <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="ml-3">
                    <div className="font-extrabold" style={{ color: dark }}>
                        {item.premio}
                    </div>
                    <div className="text-sm text-neutral-600">
                        {formatDate(item.fecha)} · {item.nombre}
                    </div>
                </div>
                {item.estado === "Entregado" && <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Entregado</span>}
                {item.estado === "Canjeado" && <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pendiente</span>}
                {item.estado === "Cancelado" && <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Rechazado</span>}
            </div>
        </div>
    );
}

function formatDate(isoDate) {
    try {
        const d = new Date(isoDate);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return isoDate;
    }
}