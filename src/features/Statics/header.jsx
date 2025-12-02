import ReciclajeIcon from "../../assets/Icons/ReciclajeIcon";
import UserIcon from "../../assets/Icons/UserIcon";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/api/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";

export default function Header() {

    const [user, setUser] = useState()
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const { api } = useAuth();
    const { colors } = useTheme();

    const getProfile = async () => {
        const { data } = await api.get("/api/usuario/getPerfil");
        return data;
    };

    useEffect(() => {
        (async () => {
            try {
                const data = await getProfile();
                setUser(data.perfil);

            } catch (e) {
                console.error("Error al obtener el perfil de usuario:", e);
                setErr(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [api]);

    const shownUser = user ?? {};

    return (
        <header className="px-4 pt-4 m-1">
            <div className="flex items-center justify-between">
                <ReciclajeIcon />
                <div className="flex items-center gap-2">
                    <div className="text-teal-900 font-semibold text-xl" style={{ color: colors.darkTeal }}>{shownUser.nombre}</div>
                    <Link to={'/profile'}>
                        <UserIcon />
                    </Link>
                </div>
            </div>
        </header>
    );
}
