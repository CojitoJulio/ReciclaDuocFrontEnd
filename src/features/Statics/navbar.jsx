import { Link } from "react-router";
import HomeIcon from "@icons/HomeIcon";
import { useLocation } from "react-router";

import chartIcon from "@icons/ChartIcon.png";
import addIcon from "@icons/addIcon.png";
import trophyIcon from "@icons/TrophyIcon.png";
import { useTheme } from "@/app/context/ThemeContext";

export default function Navbar() {
    const location = useLocation();

    const { colors } = useTheme();

    return (
        <nav className="px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            <div className="rounded-[26px] shadow-md" style={{ backgroundColor: colors.darkTeal }}>
                <div className="flex items-center justify-around py-3">

                    <Link to={'/'}>
                        <NavIcon label="Inicio" active={location.pathname === '/'}>
                            <HomeIcon />
                        </NavIcon>
                    </Link>

                    <Link to={'/stats'}>
                        <NavIcon label="Estadísticas" active={location.pathname === '/stats'}>
                            <img src={chartIcon} alt="" />
                        </NavIcon>
                    </Link>

                    <Link to={'/recycle'}>
                        <NavIcon label="Agregar" active={location.pathname === '/recycle'}>
                            <img src={addIcon} alt="" />
                        </NavIcon>
                    </Link>

                    <Link to={'/rewards'}>
                        <NavIcon label="Premios" active={location.pathname === '/rewards'}>
                            <img src={trophyIcon} alt="" />
                        </NavIcon>
                    </Link>

                </div>
            </div>
        </nav>
    );
}


function NavIcon({ children, active = false }) {
    return (
        <div className="flex flex-col items-center gap-1 text-white/90">
            <div className={`w-15 h-15 rounded-[18px] grid place-items-center ${active ? "bg-white/15" : ""}`}>{children}</div>
        </div>
    );
}
