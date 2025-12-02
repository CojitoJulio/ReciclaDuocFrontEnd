import { useEffect, useState } from "react";
import { useAuth } from "@/auth/api/AuthContext";
import { useNavigate } from "react-router";
import { useTheme } from "@/app/context/ThemeContext";


export default function ProfileScreen({
    userFake = {
        nombre: "",
        email: "",
        avatarUrl: "",
        puntos: 0,
    },
    history = []

}) {
    const [user, setUser] = useState()
    const [reciclajes, setReciclajes] = useState([])
    const [loadingState, setLoadingState] = useState(true);
    const [err, setErr] = useState(null);
    const [error, setError] = useState("");
    const { logout, loading, api } = useAuth();
    const navigate = useNavigate();

    const { colors } = useTheme();


    const onChangePassword = () => {
        console.log(reciclajes.length)
        console.log(reciclajes)
    }

    const getProfile = async () => {
        const { data } = await api.get("/api/usuario/getPerfil");
        return data;
    };

    useEffect(() => {
        (async () => {
            try {
                const data = await getProfile();
                setUser(data.perfil);
                setReciclajes(data.reciclajes.sort((a, b) => b.id_reciclaje - a.id_reciclaje));
            } catch (e) {
                console.error("Error al obtener el perfil:", e);
                setErr(e);
            } finally {
                setLoadingState(false);
            }
        })();
    }, [api]);

    const handleLogout = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await logout();
            // navigate("/login");
            // tras logout exitoso
            const from = location.state?.from?.pathname || "/login";
            navigate(from, { replace: true });

        } catch {
            setError("Logout failed. Please try again.");
        }
    };

    const shownUser = user ?? userFake;
    const shownReciclajes = reciclajes ?? history;

    const maxReciclajesToShow = 3;
    const reciclajesToShow = shownReciclajes.slice(0, maxReciclajesToShow);

    return (
        <div className="pb-6">

            {/* Info principal */}
            <section className="flex items-center gap-4">
                <Avatar name={shownUser.nombre} url={shownUser.avatarUrl} />
                <div>
                    <div className="text-2xl font-extrabold" style={{ color: colors.darkTeal }}>
                        {shownUser.nombre}
                    </div>
                    <div className="text-neutral-600">{shownUser.email}</div>
                </div>
            </section>

            {/* Puntaje + mini stats */}
            <section className="mt-5 grid grid-cols-2 gap-3">
                <Card>
                    <div className="text-sm text-neutral-600">Puntaje</div>
                    <div className="text-2xl font-extrabold" style={{ color: colors.darkTeal }}>
                        {shownUser.puntos} pts
                    </div>
                </Card>

                <Card>
                    <div className="text-sm text-neutral-600">Reciclajes</div>
                    <div className="text-2xl font-extrabold" style={{ color: colors.darkTeal }}>
                        {shownReciclajes.length}
                    </div>
                </Card>

            </section>

            {/* Historial */}
            <section className="mt-6">
                <h2 className="text-2xl font-extrabold mb-3" style={{ color: colors.darkTeal }}>
                    Historial de reciclaje
                </h2>

                {reciclajesToShow.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-3">
                        {reciclajesToShow.map((item) => (
                            <HistoryItem key={item.id_reciclaje} item={item} accent={colors.primary} dark={colors.darkTeal} />
                        ))}
                    </div>
                )}
            </section>

            {/* Acciones */}
            <section className="mt-6 grid grid-cols-1 gap-3">
                {/* <button
                    onClick={onChangePassword}
                    className="w-full rounded-2xl py-3 font-bold text-white shadow-md active:scale-[.99] transition"
                    style={{ backgroundColor: colors.primary }}
                >
                    Cambiar contraseña
                </button> */}
                <button
                    onClick={handleLogout}
                    className="w-full rounded-2xl py-3 font-bold text-white shadow-md active:scale-[.99] transition"
                    style={{ backgroundColor: colors.darkTeal }}
                >
                    Cerrar sesión
                </button>
            </section>
        </div>
    );
}

/* ========== Subcomponentes ========== */

function Avatar({ name = "U", url = "" }) {
    const { colors } = useTheme();

    if (url) {
        return (
            <img
                src={url}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border"
                style={{ borderColor: "#dfe7e6" }}
                draggable={false}
            />
        );
    }
    // Placeholder con inicial
    return (
        <div
            className="w-16 h-16 rounded-2xl grid place-items-center text-white font-extrabold"
            style={{ backgroundColor: colors.darkTeal }}
        >
            {String(name).charAt(0).toUpperCase()}
        </div>
    );
}

function Card({ children }) {
    return <div className="rounded-2xl border px-4 py-3 bg-white">{children}</div>;
}

function EmptyState() {
    return (
        <div className="rounded-2xl border bg-white px-4 py-6 text-center text-neutral-600">
            Aún no tienes registros. ¡Empieza a reciclar para ver tu progreso aquí!
        </div>
    );
}

function HistoryItem({ item, accent = "#00bfb3", dark = "#0a615c" }) {

    // Juntar todos los nombres de materiales reciclados
    const materialNames = item.productos.map((m) => m.nombre).join(" | ");
    const puntajetotal = item.productos.reduce((a, m) => a + (m.valor_punto * m.cantidad), 0);

    return (
        <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3">
            <div className="flex items-center gap-3">
                <div
                    className="w-12 h-12 m-1 rounded-xl grid place-items-center"
                    style={{ backgroundColor: `${accent}22`, color: dark }}
                >
                    {item.productos[0].foto ? (
                        <img src={item.productos[0].foto} alt={item.productos[0].nombre} className="rounded-xl"></img>
                    ) : (
                        <LeafIcon />
                    )}
                </div>
                <div>
                    <div className="font-extrabold" style={{ color: dark }}>
                        {materialNames}
                    </div>
                    <div className="text-sm text-neutral-600">
                        {formatDate(item.fecha)}
                    </div>
                </div>
            </div>
            <div className="font-bold m-0.5" style={{ color: dark }}>
                +{puntajetotal} pts
            </div>
        </div>
    );
}

/* ========== Utilidades / Iconos ========== */

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

function LeafIcon() {
    return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
            <path d="M19.5 3C13 3 7.5 6.5 5 12c2.5 1.5 6 .5 7.5-1-1 2-3 3.5-5.5 4 2 2 6 2 8.5 0 3-3 4-7.5 4-12z" />
        </svg>
    );
}
