import QRCode from "react-qr-code";
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/api/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";
import RecycleLoader from "../Statics/RecycleLoading";

export default function RewardsScreen() {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [user, setUser] = useState()
    const [idCanjeActivo, setIdCanjeActivo] = useState(null);
    const [loadingState, setLoadingState] = useState(true);
    const [err, setErr] = useState(null);
    const [premios, setPremios] = useState([]);

    const { api } = useAuth();

    const handleQRClick = async (id) => {
        let premioCanjeado = await canjePremio(id);

        if (premioCanjeado.error) {
            alert(premioCanjeado.error);
            return;
        }

        if (premioCanjeado) {
            let id_canje = premioCanjeado;
            setIdCanjeActivo(id_canje);
            setModalAbierto(true);
        }
    }

    const canjePremio = async (idPremio) => {
        const body = {
            "id_premio": idPremio
        };

        try {
            const response = await api.post(`/api/canje/verificarCanje`, body);
            if (response.data.id_canje) {
                return response.data.id_canje;
            }
        } catch (error) {
            console.error("Error al verificar el canje:", error);
        }

        try {
            const response = await api.post(`/api/canje/canjePremio`, body);
            if (response.data.error) {
                return { error: response.data.error };
            }
            return response.data.id_canje;
        } catch (error) {
            console.error("Error al canjear el premio:", error);
        }
    }

    const getPremios = async () => {
        const { data } = await api.get("/api/canje/premios");
        return data;
    };

    const getProfile = async () => {
        const { data } = await api.get("/api/usuario/getPerfil");
        return data;
    };

    useEffect(() => {
        (async () => {
            try {
                const perfil = await getProfile();
                setUser(perfil.perfil);
                const data = await getPremios();
                setPremios(data.premios);
            } catch (e) {
                console.error("Error al obtener los Premios:", e);
                setErr(e);
            } finally {
                setLoadingState(false);
            }
        })();
    }, [api]);

    const shownPremios = premios ?? [];
    const shownUser = user ?? {
        nombre: "",
        email: "",
        avatarUrl: "",
        puntos: 0,
    };

    const { colors } = useTheme();

    return (
        <div className="pb-6 px-4">

            {loadingState ?
                <RecycleLoader />
                : (<>
                    {modalAbierto && <ShowQRModal id_canje={idCanjeActivo} onClose={() => setModalAbierto(false)} />}

                    <h1 className="mt-2 text-[40px] leading-none font-extrabold" style={{ color: colors.darkTeal }}>Recompensas</h1>

                    <p className="mt-2 text-lg font-bold" style={{ color: colors.darkTeal }}>
                        <strong className="text-2xl">{shownUser.puntos}</strong> Puntos disponibles
                    </p>

                    {/* Sección Premios */}
                    <h2 className="mt-6 text-3xl font-extrabold" style={{ color: colors.darkTeal }}>
                        Premios
                    </h2>

                    <div className="mt-4 space-y-4">
                        {shownPremios.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="space-y-3">
                                {shownPremios.map((item) => (
                                    <RewardItem
                                        key={item.id_premio}
                                        title={item.nombre}
                                        points={item.puntos_requeridos}
                                        cardBg={colors.cardBg}
                                        iconBg={colors.iconBg}
                                        dark={colors.darkTeal}
                                        onClick={() => handleQRClick(item.id_premio)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>)}
        </div>
    );
}

function ShowQRModal({ id_canje, onClose }) {

    const { colors } = useTheme();
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center max-w-md w-11/12"
                onClick={(e) => e.stopPropagation()}
            >

                <h3 className="text-2xl font-bold mb-4" style={{ color: colors.darkTeal }} >¡Escanea el código!</h3>

                <div className="w-64 h-64 p-2 bg-white rounded-md flex items-center justify-center border border-gray-200">
                    <QRCode
                        value={id_canje ? `${id_canje.toString()}` : "No ID"}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                </div>

                <p className="text mt-4 text-sm text-gray-600">Puedes presentar este codigo en Punto Estudiantil para poder canjear tu premio</p>

                <button
                    onClick={onClose}
                    className="mt-6 px-5 py-2 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}

function RewardItem({ icon, title, points, cardBg, iconBg, dark, onClick }) {
    return (
        <button className="w-full text-left" onClick={onClick}>
            <div
                className="flex items-center gap-4 rounded-3xl p-5"
                style={{ backgroundColor: cardBg }}
            >
                <div
                    className="w-16 h-16 rounded-2xl grid place-items-center shrink-0"
                    style={{ backgroundColor: iconBg, color: dark }}
                >
                    {/* Ícono */}
                    <div className="w-8 h-8 flex items-center justify-center">
                        <img src={icon} alt="" />
                    </div>
                </div>

                <div>
                    <div className="text-xl font-extrabold" style={{ color: dark }}>
                        {title}
                    </div>
                    <div className="text-xl font-bold text-neutral-700">
                        {points.toLocaleString()} pts
                    </div>
                </div>
            </div>
        </button>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border bg-white px-4 py-6 text-center text-neutral-600">
            No se Encontraron premios disponibles.
        </div>
    );
}