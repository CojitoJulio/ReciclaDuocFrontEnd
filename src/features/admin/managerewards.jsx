import { useEffect, useState } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/auth/api/AuthContext";
import { Link } from "react-router";

export default function ManageRewards() {

    const { api } = useAuth();
    const { colors } = useTheme();

    const [premios, setPremios] = useState([]);
    const [loadingState, setLoadingState] = useState(true);
    const [err, setErr] = useState(null);


    const getPremios = async () => {
        const { data } = await api.get("/api/admin/premios");
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
            <h1 className="mt-2 text-[34px] leading-none font-extrabold" style={{ color: colors.darkTeal }}>Gestionar Premios</h1>

            <Link to="/admin/managerewards/addreward">
                <button
                    className="mt-6 w-full rounded-2xl py-4 text-white text-2xl font-bold shadow-md active:scale-[.99] transition"
                    style={{ backgroundColor: colors.darkTeal }}
                >
                    Agregar Premio
                </button>
            </Link>

            <section className="mt-6">

                {premios.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-3">
                        {premios.map((item) => (
                            <HistoryItem key={item.id_premio} item={item} accent={colors.primary} dark={colors.darkTeal} />
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
        <div className="flex rounded-2xl border bg-white px-4 py-3">
            <div className="flex items-center justify-between w-full">
                <div className="ml-3">
                    {item.disponible === 1 && (
                        <div div className="font-extrabold" style={{ color: dark }}>
                            {item.nombre}
                        </div>

                    )}

                    {item.disponible === 0 && (
                        <div div className="font-extrabold text-red-700" >
                            {item.nombre}
                        </div>

                    )}

                    <div className="text-sm text-neutral-600">
                        Stock: {item.stock} · Valor: {item.puntos_requeridos}
                    </div>
                </div>
                <Link
                    to={`/admin/managerewards/modreward/${item.id_premio}`}
                    className="ml-auto rounded-full px-3 py-1 text-white text-sm font-medium"
                    style={{ backgroundColor: dark }}
                >
                    Modificar
                </Link>
            </div>
        </div >
    );
}
