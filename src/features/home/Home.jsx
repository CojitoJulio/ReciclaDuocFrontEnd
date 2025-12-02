import { Link } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/api/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";
import RecycleLoader from "../Statics/RecycleLoading";

export default function HomePage() {

    const [ranking, setRanking] = useState()
    const [loadingState, setLoadingState] = useState(true);
    const [err, setErr] = useState(null);
    const [user, setUser] = useState()
    const { api, isAdmin } = useAuth();
    const { colors } = useTheme();

    const getProfile = async () => {
        const { data } = await api.get("/api/usuario/getPerfil");
        return data;
    };

    const getRanking = async () => {
        const { data } = await api.get("/api/usuario/rankingUsuarios");
        return data;
    };

    useEffect(() => {
        (async () => {
            try {
                const data = await getRanking();
                setRanking(data.ranking);
                const data2 = await getProfile();
                setUser(data2.perfil);

            } catch (e) {
                console.error("Error al obtener el ranking de usuarios:", e);
                setErr(e);
            } finally {
                setLoadingState(false);
            }
        })();
    }, [api]);

    return (
        <div className="pb-6 px-4 ">

            {loadingState ?
                <RecycleLoader />
                : (<>

                    <h1 className="mt-2 text-[40px] leading-none font-extrabold" style={{ color: colors.darkTeal }}>ReciclaDUOC</h1>

                    {/* Primary button */}
                    <Link to={'/recycle'}>
                        <button
                            className="mt-6 w-full rounded-2xl py-4 text-white text-2xl font-bold shadow-md active:scale-[.99] transition"
                            style={{ backgroundColor: colors.primary }}
                        >
                            Reciclar
                        </button>
                    </Link>

                    {/* Points */}
                    <div className="mt-6 text-center">
                        <div className="text-3xl font-extrabold" style={{ color: colors.darkTeal }}>{user?.puntos || 0} puntos</div>
                    </div>

                    {/* Secondary actions */}
                    {/* <button
                        className="mt-4 w-full rounded-2xl py-4 text-xl font-bold"
                        style={{ backgroundColor: colors.lightTeal, color: colors.darkTeal }}
                    >
                        Ganar Puntos
                    </button> */}

                    <Link to={'/rewards'}>
                        <button
                            className="mt-4 w-full rounded-2xl py-4 text-xl font-extrabold text-white"
                            style={{ backgroundColor: colors.darkTeal }}
                        >
                            Canjear Premios
                        </button>
                    </Link>
                    {isAdmin && (
                        <Link to={'/admin'}>
                            <button
                                className="mt-4 w-full rounded-2xl py-4 text-xl font-extrabold text-white"
                                style={{ backgroundColor: colors.darkTeal }}
                            >
                                Panel de Admin
                            </button>
                        </Link>
                    )}


                    {/* Ranking card */}
                    <div className="mt-6">
                        <div className="text-3xl font-extrabold" style={{ color: colors.darkTeal }}>Ranking</div>

                        <div className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
                            {ranking?.map((user, index) => (
                                <RankRow key={user.nombre} place={index + 1} name={user.nombre} points={user.puntos} />
                            ))}
                        </div>
                    </div>
                </>)}
        </div >
    );
}

function RankRow({ place, name, points }) {
    const medals = {
        1: { bg: "bg-yellow-400", emoji: "🥇" },
        2: { bg: "bg-gray-300", emoji: "🥈" },
        3: { bg: "bg-amber-500", emoji: "🥉" },
    };
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <div className={`w-7 h-7 grid place-items-center rounded-md text-sm ${medals[place].bg}`}>{place}</div>
                <div className="text-xl font-semibold text-neutral-800">{name}</div>
            </div>
            <div className="text-xl font-bold text-neutral-900">
                {points.toLocaleString()} <span className="font-semibold text-neutral-600">pts</span>
            </div>
        </div>
    );
}