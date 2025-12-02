import React, { useEffect, useRef } from 'react';
// 1. CAMBIO IMPORTANTE: Importamos 'animate' con llaves para la V4
import { animate } from 'animejs';
import ReciclAI from "@icons/ReciclAI.png"

const FloatingCharacter = () => {
    const characterRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        // Verificamos que el elemento exista antes de animar
        if (characterRef.current) {

            animationRef.current = animate(characterRef.current, {
                y: [5, -5, 5],
                rotate: [0, 5, 0],
                duration: 3000,
                easing: 'inOutSine',
                playbackEase: "inOutSine",
                loop: true
            });
        }

        return () => {
            // En v4, para cancelar/pausar se usa .pause() en la referencia
            if (animationRef.current) animationRef.current.pause();
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '100px', margin: '0 auto' }}>
            <img
                ref={characterRef}
                src={ReciclAI}
                alt="Personaje ReciclaDuoc"
                style={{
                    width: '100%',
                    willChange: 'transform',
                    filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.3))'
                }}
            />
        </div>
    );
};

export default FloatingCharacter;