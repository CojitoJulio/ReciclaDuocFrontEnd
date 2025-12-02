import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "@/app/context/ThemeContext";
import { useRecycleStore } from "@/app/context/RecycleStore";

export default function CameraCapture({
    initialFacingMode = "environment",
    imageQuality = 0.85,
    maxWidth,
    maxHeight,
    onCapture,
    takeData = {},
    onRetake,
    onAdd,
    title,
    puntaje,
}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const { colors } = useTheme();
    const { items } = useRecycleStore();

    const [facingMode, setFacingMode] = useState(initialFacingMode);
    const [hasPermission, setHasPermission] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [photoBlob, setPhotoBlob] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [torchOn, setTorchOn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [photoDataUrl, setPhotoDataUrl] = useState(null);

    const navigate = useNavigate();

    // Inicia la cámara
    useEffect(() => {
        let mounted = true;

        const start = async () => {
            setErrorMsg(null);
            setHasPermission(null);
            stopStream();

            try {
                const constraints = {
                    audio: false,
                    video: {
                        facingMode,
                        width: { ideal: 1000 },
                        height: { ideal: 1000 },
                    },
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (!mounted) {
                    stopTracks(stream);
                    return;
                }

                streamRef.current = stream;
                setHasPermission(true);

                const video = videoRef.current;
                video.srcObject = stream;
                await video.play().catch(() => { });
            } catch (err) {
                console.error(err);
                setHasPermission(false);
                setErrorMsg(
                    err && err.name === "NotAllowedError"
                        ? "Permiso denegado. Habilita la cámara para continuar."
                        : "No se pudo acceder a la cámara. Prueba 'Subir foto' o revisa permisos/HTTPS."
                );
            }
        };

        start();
        return () => {
            mounted = false;
            stopStream();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode]);

    useEffect(() => {
        if (!photoBlob && videoRef.current && streamRef.current) {
            const video = videoRef.current;
            video.srcObject = streamRef.current;
            video.play().catch(() => { });
        }
    }, [photoBlob]);


    const stopTracks = (stream) => {
        stream.getTracks().forEach((t) => t.stop());
    };

    const stopStream = () => {
        if (streamRef.current) {
            stopTracks(streamRef.current);
            streamRef.current = null;
        }
    };

    // Linterna
    const toggleTorch = async () => {
        try {
            const stream = streamRef.current;
            if (!stream) return;

            const track = stream.getVideoTracks()[0];
            const caps = track.getCapabilities && track.getCapabilities();
            if (!caps || !("torch" in caps)) {
                setErrorMsg("Tu dispositivo no soporta linterna desde el navegador.");
                return;
            }

            await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
            setTorchOn(!torchOn);
        } catch (e) {
            console.error(e);
            setErrorMsg("No se pudo alternar la linterna.");
        }
    };

    // Capturar frame -> Canvas -> Blob (JPEG) con resize opcional
    const capturePhoto = async () => {
        setIsCapturing(true);
        setErrorMsg(null);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            const vw = video.videoWidth;
            const vh = video.videoHeight;

            // Cálculo de tamaño objetivo
            let targetW = vw;
            let targetH = vh;

            if (maxWidth || maxHeight) {
                const ratio = vw / vh;
                if (maxWidth && !maxHeight) {
                    targetW = Math.min(maxWidth, vw);
                    targetH = Math.round(targetW / ratio);
                } else if (!maxWidth && maxHeight) {
                    targetH = Math.min(maxHeight, vh);
                    targetW = Math.round(targetH * ratio);
                } else if (maxWidth && maxHeight) {
                    targetW = Math.min(maxWidth, vw);
                    targetH = Math.min(Math.round(targetW / ratio), maxHeight);
                }
            }

            canvas.width = targetW;
            canvas.height = targetH;

            const ctx = canvas.getContext("2d");
            if (video.readyState < 2) {
                await video.play().catch(() => { });
            }
            ctx.drawImage(video, 0, 0, targetW, targetH);

            const blob = await new Promise((resolve, reject) =>
                canvas.toBlob(
                    (b) => (b ? resolve(b) : reject(new Error("No se pudo generar Blob"))),
                    "image/jpeg",
                    imageQuality
                )
            );

            const dataUrl = canvas.toDataURL("image/jpeg", imageQuality);

            if (photoUrl) URL.revokeObjectURL(photoUrl);
            const url = URL.createObjectURL(blob);

            setPhotoBlob(blob);
            setPhotoUrl(url);
            setPhotoDataUrl(dataUrl);
            onCapture && onCapture(blob, url);
        } catch (e) {
            console.error(e);
            setErrorMsg("No se pudo capturar la foto.");
        } finally {
            setIsCapturing(false);
        }
    };

    const retake = () => {
        if (photoUrl) URL.revokeObjectURL(photoUrl);
        setPhotoBlob(null);
        setPhotoUrl(null);
        setPhotoDataUrl(null);
        onRetake && onRetake();

        // por si el navegador pausó el video
        const video = videoRef.current;
        if (video && streamRef.current) {
            video.srcObject = streamRef.current;
            video.play?.().catch(() => { });
        }
    };

    const upload = () => {
        if (!photoBlob) return;
        setLoading(true);
        setErrorMsg(null);

        try {
            const item = {
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                photo: photoDataUrl,
                puntaje: puntaje,
                ia: takeData?.IAresponse ?? null,
            };
            onAdd && onAdd(item);
            retake();

            navigate("/list");

        } catch (e) {
            console.error(e);
            setErrorMsg(e && e.message ? e.message : "Error al enviar la foto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-3 p-4 max-w-md mx-auto h-[380px] ">
            <h1 className="text-xl font-semibold">{title}</h1>

            {/* Preview cámara */}
            {!photoBlob && (
                <div className="w-full rounded-xl overflow-hidden border">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-auto h-auto bg-black"
                    />
                </div>
            )}

            {/* Preview foto tomada */}
            {photoBlob && photoUrl && (
                <div className="w-full rounded-xl overflow-hidden border">
                    <img src={photoUrl} alt="preview" className="w-full h-auto" />
                </div>
            )}

            {/* Canvas oculto */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Controles */}
            {!photoBlob ? (
                <div className="flex gap-2 w-full">
                    <button
                        onClick={capturePhoto}
                        disabled={isCapturing || hasPermission === false}
                        className="flex-1 rounded-xl px-4 py-3 text-white disabled:opacity-60"
                        style={{ backgroundColor: colors.darkTeal }}
                    >
                        {isCapturing ? "Capturando..." : "Tomar foto"}
                    </button>

                    {/* <button
                        onClick={toggleFacing}
                        disabled={hasPermission === false}
                        className="rounded-xl px-4 py-3 border w-[46%]"
                        title="Cambiar cámara"
                    >
                        Cambiar cámara
                    </button> */}
                </div>
            ) : (
                <div className="flex gap-2 w-full justify-center">
                    <button
                        onClick={retake}
                        className={`rounded-xl px-4 py-3 ${takeData?.IAresponse?.data_completa ? 'flex-1' : 'w-full'}`}
                        style={{ backgroundColor: colors.lightTeal, color: colors.darkTeal }}
                    >
                        Repetir
                    </button>
                    {takeData?.IAresponse?.data_completa && (
                        <button
                            onClick={upload}
                            disabled={loading}
                            className="rounded-xl px-4 py-3 flex-1 disabled:opacity-60"
                            style={{ backgroundColor: colors.darkTeal, color: "white" }}
                        >
                            {loading ? "Agregando..." : "Agregar"}
                        </button>
                    )}
                </div>
            )}

            {/* Linterna */}
            {hasPermission && !photoBlob && (
                <div className="flex gap-2 w-full">
                    <button onClick={toggleTorch} className="rounded-xl px-4 py-2 flex-1"
                        style={{ backgroundColor: colors.lightTeal, color: colors.darkTeal }}
                        title="Linterna">
                        {torchOn ? "Apagar linterna" : "Encender linterna"}
                    </button>
                    {items.length > 0 && (
                        <button
                            onClick={() => navigate("/list")}
                            className="rounded-xl px-4 py-2 flex-1"
                            style={{ backgroundColor: colors.lightTeal, color: colors.darkTeal }}
                            title="Ver lista"
                        >
                            Lista ({items.length})
                        </button>
                    )}
                </div>
            )}

            {hasPermission === false && (
                <p className="text-red-600 text-sm">
                    No hay permisos para usar la cámara. Revisa los ajustes del navegador o usa “Subir foto”.
                </p>
            )}
            {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

        </div>
    );
}
