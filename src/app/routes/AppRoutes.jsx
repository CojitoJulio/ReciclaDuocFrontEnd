import { Route, Routes } from "react-router";
import LoginScreen from "@/auth/pages/Login";
import RegisterScreen from "@/auth/pages/Register";
import MainMenu from "@/features/MainMenu";
import HomePage from "@/features/home/Home";
import RewardsScreen from "@/features/rewards/rewards";
import { AuthProvider } from "@/auth/api/AuthContext";
import ProfileScreen from "@/features/profile/profileScreen";
import RecycleScreen from "@/features/recycle/recycleScreen";
import ResultsList from "@/features/recycle/listScreen";
import RecycleSummary from "@/features/recycle/resumeRecycle";
import AdminPage from "@/features/admin/adminpage";
import QRscanScreen from "@/features/admin/QRscanScreen";
import RewardsHistory from "@/features/admin/rewarshistory";
import ManageRewards from "@/features/admin/managerewards";
import StatsScreen from "@/features/stats/StatsPage";

import ProtectedRoute from "./ProtectedRoute";
import RedirectIfAuthenticated from "./RedirectIfAuthenticated";
import AdminRoute from "./AdminRoute";
import AddPremio from "@/features/admin/premios/addPremio";
import ModPremio from "@/features/admin/premios/modPremio";
import CreateAdmin from "@/features/admin/createAdmin";

export default function AppRouter() {
    const primary = "#00bfb3";
    const darkTeal = "#0a615c";
    const lightTeal = "#d7efee";
    return (
        <AuthProvider>
            <Routes>

                <Route element={<RedirectIfAuthenticated to="/" />}>
                    <Route path="/login" element={<LoginScreen />} />
                    <Route path="/register" element={<RegisterScreen />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<MainMenu />}>
                        <Route index element={<HomePage />} />
                        <Route path="rewards" element={<RewardsScreen />} />
                        <Route path="/recycle" element={<RecycleScreen />} />
                        <Route path="/profile" element={<ProfileScreen />} />
                        <Route path="/list" element={<ResultsList />} />
                        <Route path="/summary" element={<RecycleSummary />} />
                        <Route path="/stats" element={<StatsScreen />} />

                        <Route element={<AdminRoute />}>
                            <Route path="/admin/qrscan" element={<QRscanScreen />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/admin/rewards" element={<RewardsHistory />} />
                            <Route path="/admin/managerewards" element={<ManageRewards />} />
                            <Route path="/admin/managerewards/addreward" element={<AddPremio />} />
                            <Route path="/admin/managerewards/modreward/:id" element={<ModPremio />} />
                            <Route path="/admin/createadmin" element={<CreateAdmin />} />

                        </Route>

                    </Route>
                </Route>

            </Routes>
        </AuthProvider>
    );
}
