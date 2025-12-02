export default function RecycleLoader() {
  return (
    <div className="flex flex-col items-center justify-center relative mt-40">
      {/* Estilos inline para las animaciones personalizadas que antes estaban en tailwind.config */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Efecto de "Aura" o Eco detrás del logo */}
      <div className="absolute w-32 h-32 bg-[#00A89B]/20 rounded-full animate-ping-slow"></div>
      <div className="absolute w-24 h-24 bg-[#00A89B]/10 rounded-full blur-xl"></div>

      {/* El SVG proporcionado con animación de rotación */}
      <svg
        className="w-24 h-24 animate-spin-slow drop-shadow-lg z-10"
        viewBox="0 0 93 93"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M22.9388 61.5818L29.5101 50.2474L35.9032 53.6009L27.0831 37.932H9.05378L15.0304 41.8107L12.042 47.1897C10.3849 50.2534 12.0632 53.8152 12.1628 54.0145L20.5058 68.8925L22.0633 68.0655C21.1187 66.1729 22.3955 62.7016 22.9388 61.5818Z" fill="#006057" />
        <path d="M40.6572 59.6862H26.9502L26.7027 60.1601C26.5638 60.4226 23.3643 66.677 25.8968 71.428C27.3275 74.1175 30.2585 75.7294 34.6051 76.2154L34.6624 76.2214L40.7748 76.0886C43.6273 76.0252 45.9485 73.6527 45.9485 70.7972V64.9775C45.9486 62.0587 43.5761 59.6862 40.6572 59.6862Z" fill="#00A89B" />
        <path d="M74.2166 15.1758L67.92 18.5113L64.6691 13.2923C62.7976 10.3523 58.8646 10.0988 58.6442 10.0867L41.5898 10.1531L41.5536 11.9159C43.6665 12.0095 46.0873 14.8106 46.8057 15.8309L53.5218 27.0718L47.4667 31.035L65.4569 30.9324L74.2166 15.1758Z" fill="#006057" />
        <path d="M36.648 12.9034C33.6053 12.8249 30.774 14.63 28.2385 18.1918L25.3499 23.6522C24.0187 26.1787 24.9665 29.3602 27.4628 30.7456L32.546 33.5709C33.3579 34.0206 34.2363 34.235 35.1056 34.235C36.968 34.235 38.7761 33.251 39.742 31.5123L46.3948 19.526L46.102 19.0793C45.9358 18.8317 42.0269 12.9971 36.648 12.9034Z" fill="#00A89B" />
        <path d="M75.946 58.4727L62.894 59.0493L62.2753 51.8442L53.8265 67.7153L63.5491 82.9134L63.5883 75.7838L69.7249 75.4004C73.2082 75.1469 75.297 71.8144 75.4087 71.6274L83.4499 56.5772L81.9135 55.7079C80.8359 57.5158 77.2711 58.3128 75.946 58.4727Z" fill="#006057" />
        <path d="M78.8739 36.5677C77.2832 34.1982 74.0353 33.522 71.6295 35.0584L66.7305 38.1946C65.5383 38.9553 64.7172 40.1355 64.4124 41.515C64.1105 42.8944 64.361 44.3101 65.1247 45.5024L72.5109 57.0512L73.0422 57.0059C73.341 56.9787 80.3319 56.3056 82.973 51.6119C84.4641 48.9557 84.2407 45.6202 82.309 41.6992L78.8739 36.5677Z" fill="#00A89B" />
      </svg>

      {/* Texto de carga */}
      <div className="mt-8 flex flex-col items-center">
        <span className="text-[#006057] font-bold text-lg tracking-wider animate-pulse">
          CARGANDO
        </span>
        <span className="text-[#00A89B] text-sm mt-1 opacity-80">
          Por favor espere...
        </span>
      </div>
    </div>
  );
};
