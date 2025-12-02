import { Link } from "react-router";
import { useTheme } from "@/app/context/ThemeContext";

export default function AdminPage() {

    const { colors } = useTheme();

    return (
        <div className="pb-6 px-4 ">
            <h1 className="mt-2 text-[40px] leading-none font-extrabold" style={{ color: colors.darkTeal }}>Admin Panel</h1>
            <Link to="/admin/qrscan">
                <button
                    className="mt-6 w-full rounded-2xl py-4 text-white text-2xl font-bold shadow-md active:scale-[.99] transition"
                    style={{ backgroundColor: colors.darkTeal }}
                >
                    Escanear QR Premio
                </button>
            </Link>
            <Link to="/admin/rewards">
                <button
                    className="mt-6 w-full rounded-2xl py-4 text-white text-2xl font-bold shadow-md active:scale-[.99] transition"
                    style={{ backgroundColor: colors.darkTeal }}
                >
                    Historial de Premios
                </button>
            </Link>
            <Link to="/admin/managerewards">
                <button
                    className="mt-6 w-full rounded-2xl py-4 text-white text-2xl font-bold shadow-md active:scale-[.99] transition"
                    style={{ backgroundColor: colors.darkTeal }}
                >
                    Gestionar Premios
                </button>
            </Link>

            <Link to="/admin/createadmin">
                <button
                    className="mt-6 w-full rounded-2xl py-4 text-white text-2xl font-bold shadow-md active:scale-[.99] transition"
                    style={{ backgroundColor: colors.darkTeal }}
                >
                    Crear Usuario Administrador
                </button>
            </Link>

        </div>
    );
}
