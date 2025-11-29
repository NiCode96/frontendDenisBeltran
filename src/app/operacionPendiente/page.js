export default function OperacionPendiente() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
            <div className="max-w-md">
                <h1 className="text-3xl font-bold text-yellow-600 mb-4">
                    Operación Pendiente
                </h1>

                <p className="text-gray-700 text-lg mb-6">
                    Tu transacción está siendo procesada. Esto puede tomar unos momentos.
                </p>

                <div className="flex items-center justify-center">
                    <div className="w-20 h-20 bg-yellow-100 border border-yellow-300 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-yellow-600 text-4xl">⏳</span>
                    </div>
                </div>

                <p className="text-gray-600 mt-6">
                    Si la operación no se actualiza en unos minutos, intenta nuevamente.
                </p>
            </div>
        </div>
    );
}