import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useAuth } from "../../auth/api/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";
import RecycleLoader from "../Statics/RecycleLoading";

export default function StatsScreen() {
    const [processedStats, setProcessedStats] = useState(null);
    const [loadingState, setLoadingState] = useState(true);
    const [err, setErr] = useState(null);

    const { api } = useAuth();

    const getData = async () => {
        const { data } = await api.get("/api/stats/data");
        return data;
    };

    useEffect(() => {
        (async () => {
            try {
                const response = await getData();
                // La API devuelve una lista de registros.
                const rawData = response.stats; // Asumiendo que es un array de objetos

                if (!rawData || rawData.length === 0) {
                    setProcessedStats({ byMaterial: [], activity: [], bySede: [], topUsers: [], summary: { total: 0, average: 0, busiestDay: null } });
                    return;
                }

                // 1. Procesar datos para el gráfico de barras (por material)
                const materialCounts = rawData.reduce((acc, item) => {
                    const material = item.material || "Desconocido";
                    // Asegurarse de que la cantidad es un número
                    const cantidad = typeof item.cantidad === 'number' ? item.cantidad : 0;
                    acc[material] = (acc[material] || 0) + cantidad;
                    return acc;
                }, {});

                const byMaterial = Object.keys(materialCounts).map(name => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    cantidad: materialCounts[name]
                }));

                // 2. Procesar datos para el gráfico de líneas (tendencia de cantidad por fecha)
                const activityCounts = rawData.reduce((acc, item) => {
                    const date = item.fecha.split(' ')[0]; // Tomar solo la fecha, sin la hora
                    const cantidad = typeof item.cantidad === 'number' ? item.cantidad : 0;
                    acc[date] = (acc[date] || 0) + cantidad; // Sumar la cantidad de items reciclados
                    return acc;
                }, {});

                const activity = Object.keys(activityCounts).map(date => ({
                    date,
                    cantidad: activityCounts[date]
                })).sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordenar por fecha

                // 3. Procesar datos para el gráfico de torta (por sede)
                const sedeCounts = rawData.reduce((acc, item) => {
                    const sede = item.sede || "No especificada";
                    const cantidad = typeof item.cantidad === 'number' ? item.cantidad : 0;
                    acc[sede] = (acc[sede] || 0) + cantidad;
                    return acc;
                }, {});

                const bySede = Object.keys(sedeCounts).map(name => ({
                    name,
                    value: sedeCounts[name]
                }));

                // 4. Procesar datos para el ranking de usuarios
                const userCounts = rawData.reduce((acc, item) => {
                    const user = item.usuario || "Anónimo";
                    const cantidad = typeof item.cantidad === 'number' ? item.cantidad : 0;
                    acc[user] = (acc[user] || 0) + cantidad;
                    return acc;
                }, {});

                const topUsers = Object.keys(userCounts).map(name => ({
                    name,
                    cantidad: userCounts[name]
                })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

                // 5. Calcular tarjetas de resumen
                const totalHistorico = rawData.reduce((sum, item) => sum + (typeof item.cantidad === 'number' ? item.cantidad : 0), 0);
                const uniqueUsers = new Set(rawData.map(item => item.usuario));
                const promedioPorUsuario = uniqueUsers.size > 0 ? totalHistorico / uniqueUsers.size : 0;
                const diaMasActivo = activity.length > 0 ? activity.reduce((max, day) => day.cantidad > max.cantidad ? day : max, activity[0]) : null;

                const summary = {
                    total: totalHistorico,
                    average: promedioPorUsuario.toFixed(1),
                    busiestDay: diaMasActivo ? { date: diaMasActivo.date, cantidad: diaMasActivo.cantidad } : null
                };

                setProcessedStats({ byMaterial, activity, bySede, topUsers, summary });

            } catch (e) {
                console.error("Error al obtener la Data:", e);
                setErr(e);
            } finally {
                setLoadingState(false);
            }
        })();
    }, [api]);

    const { colors } = useTheme();
    const PIE_COLORS = [colors.primary, colors.darkTeal, colors.lightTeal, '#FFBB28', '#FF8042'];

    const StatCard = ({ title, value, unit }) => (
        <div className="p-4 rounded-xl shadow" style={{ backgroundColor: colors.lightTeal }}>
            <p className="text-sm font-semibold" style={{ color: colors.darkTeal }}>{title}</p>
            <p className="text-2xl font-bold" style={{ color: colors.darkTeal }}>
                {value} <span className="text-lg font-medium">{unit}</span>
            </p>
        </div>
    );

    return (
        <div className="pb-6 px-4">

            {loadingState ?
                <RecycleLoader />
                : (<>

                    <h1 className="mt-2 text-[40px] leading-none font-extrabold" style={{ color: colors.darkTeal }}>Estadísticas</h1>

                    {loadingState && <p>Cargando estadísticas...</p>}
                    {err && <p className="text-red-500">Error: No se pudieron cargar las estadísticas.</p>}

                    {processedStats && !loadingState && !err && (
                        <div className="mt-6 flex flex-col gap-8">

                            {/* Tarjetas de Resumen */}
                            <div className="grid grid-cols-1 gap-4">
                                <StatCard title="Total Histórico" value={processedStats.summary.total} unit="items" />
                                <StatCard title="Promedio por Usuario" value={processedStats.summary.average} unit="items" />
                                {processedStats.summary.busiestDay ? (
                                    <div className="p-4 rounded-xl shadow" style={{ backgroundColor: colors.lightTeal }}>
                                        <p className="text-sm font-semibold" style={{ color: colors.darkTeal }}>Día más Activo</p>
                                        <p className="text-xl font-bold" style={{ color: colors.darkTeal }}>
                                            {new Date(processedStats.summary.busiestDay.date).toLocaleDateString('es-CL', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className="text-lg" style={{ color: colors.darkTeal }}>
                                            ({processedStats.summary.busiestDay.cantidad} items)
                                        </p>
                                    </div>
                                ) : <StatCard title="Día más Activo" value="N/A" />}
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {/* Gráfico de Torta por Sede */}
                                {processedStats.bySede && processedStats.bySede.length > 0 && (
                                    <div className="flex flex-col">
                                        <h2 className="text-2xl font-bold mb-4" style={{ color: colors.darkTeal }}>Reciclaje por Sede</h2>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie data={processedStats.bySede} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                                    {processedStats.bySede.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Ranking de Usuarios */}
                                {processedStats.topUsers && processedStats.topUsers.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4" style={{ color: colors.darkTeal }}>🏆 Héroes del Reciclaje</h2>
                                        <div className="divide-y divide-neutral-200 border-y border-neutral-200 rounded-lg overflow-hidden">
                                            {processedStats.topUsers.map((user, index) => (
                                                <div key={user.name} className="flex items-center justify-between p-3" style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f7f7f7' }}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-lg">{index + 1}.</span>
                                                        <div className="text-lg font-semibold text-neutral-800">{user.name}</div>
                                                    </div>
                                                    <div className="text-lg font-bold text-neutral-900">
                                                        {user.cantidad.toLocaleString()} <span className="font-semibold text-neutral-600">items</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Gráfico de Reciclaje por Material */}
                            {processedStats.byMaterial && processedStats.byMaterial.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-4" style={{ color: colors.darkTeal }}>Reciclaje por Material</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={processedStats.byMaterial}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="cantidad" fill={colors.primary} name="Cantidad" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Gráfico de Actividad de Reciclaje */}
                            {processedStats.activity && processedStats.activity.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-4" style={{ color: colors.darkTeal }}>Tendencia de Reciclaje (Cantidad)</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={processedStats.activity}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="cantidad" stroke={colors.darkTeal} name="Items Reciclados" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {processedStats.summary.total === 0 && (
                                <p>No hay datos de estadísticas para mostrar.</p>
                            )}
                        </div>
                    )}
                </>)}
        </div>
    );
}
