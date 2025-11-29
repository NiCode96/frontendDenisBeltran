export default function NoAccessPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white px-6">

            {/* Contenedor principal */}
            <div className="bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl p-10 max-w-lg text-center border border-sky-100">

                <h1 className="text-4xl font-bold text-sky-600 mb-3">
                    Acceso Denegado
                </h1>

                <p className="text-slate-600 text-lg mb-8">
                    No tienes permisos para ver esta sección.
                    Si crees que esto es un error, contacta al administrador.
                </p>

                {/* Icono */}
                <div className="mb-8">
          <span className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-sky-100">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-14 h-14 text-sky-600"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
                </div>

                {/* Botón volver */}
                <a
                    href="/"
                    className="inline-block bg-sky-600 hover:bg-sky-700 text-white py-3 px-8 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                >
                    Volver al inicio
                </a>
            </div>

            {/* Footer ligero */}
            <p className="mt-10 text-slate-400 text-sm">
                © {new Date().getFullYear()} Medify — Derechos reservados.
            </p>
        </div>
    );
}