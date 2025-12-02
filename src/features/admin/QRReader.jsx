import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QR_READER_ID = "qr-reader-container";

function LectorQR({ onScanExitoso }) {
    const [scanResult, setScanResult] = useState(null);
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        const html5QrCode = new Html5Qrcode(QR_READER_ID);

        const onScanSuccess = (decodedText, decodedResult) => {
            setScanResult(decodedText);
            if (onScanExitoso) {
                onScanExitoso(decodedText);
            }

            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    console.log("Scanner detenido tras éxito.");
                    html5QrCode.clear();
                }).catch(err => {
                    console.error("Fallo al detener scanner:", err);
                });
            }
        };

        const onScanFailure = (error) => {
            // No hacer nada
        };

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true
        };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanFailure
        ).catch((err) => {
            console.log("Fallo al iniciar cámara trasera, intentando cámara frontal.", err);
            html5QrCode.start(
                { facingMode: "user" },
                config,
                onScanSuccess,
                onScanFailure
            ).catch((err) => {
                console.error("No se pudo iniciar ninguna cámara.", err);
            });
        });

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    console.log("Scanner detenido por 'unmount'.");
                }).catch(err => {
                    console.error("Error al detener en 'unmount'.", err);
                });
            }
        };
    }, [onScanExitoso]);

    return (
        <div className="w-full max-w-md mx-auto">
            {!scanResult && (
                <div id={QR_READER_ID} className="border-4 border-gray-300 rounded-lg overflow-hidden" />
            )}

            {scanResult && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                    <p className="font-bold">¡Premio Escaneado!</p>
                    <p className="font-mono text-sm break-all">{scanResult}</p>
                </div>
            )}
        </div>
    );
}

export default LectorQR;