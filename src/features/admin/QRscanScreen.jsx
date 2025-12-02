import { useState, useCallback } from 'react';
import LectorQR from './QRReader';
import { useAuth } from '../../auth/api/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { useNavigate } from 'react-router';

function QRscanScreen() {
    const [datosDelQR, setDatosDelQR] = useState(null);
    const [datosCanje, setDatosCanje] = useState(null);
    const { api } = useAuth();
    const [loading, setLoading] = useState(false);
    const { colors } = useTheme();
    const navigate = useNavigate();
    const [error, setError] = useState(null);


    const handleScanExitoso = useCallback((datos) => {
        setLoading(true);
        setDatosDelQR(datos);

        getResumen(datos).then((resumen) => {
            if (resumen.error) {
                setError(resumen.error);
                setLoading(false);
                return;
            }
            setDatosCanje(resumen);
            setLoading(false);
        }).catch((error) => {
            console.error("Error al obtener el resumen del canje:", error);
        });
    }, [api]);


    const getResumen = async (id_canje) => {
        const body = { "id_canje": id_canje };
        const { data } = await api.post("/api/canje/resumen", body);
        return data;
    };

    const handleConfirmarCanje = async (id_canje) => {
        try {
            const body = { "uuid": id_canje };
            const { data } = await api.post("/api/canje/validarCanje", body);
            alert(data.mensaje);
            navigate('/admin');

            setDatosDelQR(null);
            setDatosCanje(null);
        } catch (error) {
            console.error("Error al confirmar el canje:", error);
            alert("Error al confirmar el canje.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-8 flex flex-col items-center">

            <h1 className="mt-2 text-[40px] leading-none font-extrabold" style={{ color: colors.darkTeal }}>Escanear QR</h1>

            {!datosDelQR && (
                <>
                    <p className="text-center text-gray-600 mb-4">Apunta la cámara al código QR del premio.</p>
                    <LectorQR onScanExitoso={handleScanExitoso} />
                </>
            )}

            {loading && (
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-green-600">¡QR Recibido!</h2>
                    <p>Validando premio...</p>
                </div>
            )}

            {error && (<div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
                <button
                    className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                        setError(null);
                        setDatosDelQR(null);
                        setDatosCanje(null);
                    }}
                >
                    Escanear de nuevo
                </button>
            </div>
            )}

            {datosCanje && (
                <div>
                    <h2 className="text-2xl font-semibold text-green-600 text-center mb-4">Resumen del Canje</h2>
                    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-lg mb-2"><strong>ID Canje:</strong> {datosCanje.id_canje}</p>
                        <p className="text-lg mb-2"><strong>Premio:</strong> {datosCanje.premio}</p>
                        <p className="text-lg mb-2"><strong>Usuario:</strong> {datosCanje.nombre}</p>
                        <p className="text-lg mb-2"><strong>Fecha de Canje:</strong> {new Date(datosCanje.fecha).toLocaleDateString()}</p>
                        <p className="text-lg mb-2"><strong>Puntos Requeridos:</strong> {datosCanje.puntos_requeridos}</p>
                        <p className="text-lg mb-2"><strong>Puntos del Usuario:</strong> {datosCanje.puntos}</p>
                        {datosCanje.stock > 0 && (
                            <p className="text-lg mb-2"><strong>Stock:</strong> {datosCanje.stock}</p>
                        )}
                        {datosCanje.stock === 0 && (
                            <p className="text-lg mb-2 text-red-500 font-bold"><strong>Stock:</strong> Agotado</p>
                        )}

                        {datosCanje.estado === 'Canjeado' && (
                            <button
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                onClick={() => handleConfirmarCanje(datosCanje.id_canje)}
                            >
                                Confirmar Canje
                            </button>
                        )}

                        {datosCanje.estado !== 'Canjeado' && (
                            <div className='flex flex-col items-center'>
                                <p className="text-lg text-red-500 font-bold">Estado: {datosCanje.estado}</p>
                                <button
                                    className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => {
                                        setError(null);
                                        setDatosDelQR(null);
                                        setDatosCanje(null);
                                    }}
                                >
                                    Escanear de nuevo
                                </button>
                            </div>

                        )}

                    </div>
                </div>)}
        </div>
    );
}

export default QRscanScreen;