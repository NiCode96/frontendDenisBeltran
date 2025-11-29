import { MoveRight, XCircle, Mail, AlertTriangle, CreditCard, RefreshCw } from "lucide-react";
import Link from "next/link";

const CORREO = "dennisbeltranmedify@gmail.com";

const CTA1 = () => (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            {/* Error Icon */}
            <div className="flex justify-center mb-8 animate-pulse">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <XCircle className="relative w-20 h-20 md:w-24 md:h-24 text-red-500" strokeWidth={1.5} />
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-red-200/50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-8 py-6 text-center">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-3">
                        ✗ Pago Rechazado
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        Pago No Procesado
                    </h1>
                </div>

                {/* Content */}
                <div className="px-8 py-10 space-y-8">
                    {/* Error Message */}
                    <div className="text-center">
                        <p className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">
                            La transacción fue rechazada
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            No pudimos procesar tu pago en este momento
                        </p>
                    </div>

                    {/* Reason Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                            <CreditCard className="w-8 h-8 text-amber-600 mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-1">Fondos insuficientes</h3>
                            <p className="text-sm text-gray-600">Verifica el saldo disponible</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                            <AlertTriangle className="w-8 h-8 text-purple-600 mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-1">Verificación fallida</h3>
                            <p className="text-sm text-gray-600">Datos incorrectos o vencidos</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                            <RefreshCw className="w-8 h-8 text-blue-600 mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-1">Restricción bancaria</h3>
                            <p className="text-sm text-gray-600">Contacta a tu banco</p>
                        </div>
                    </div>

                    {/* Solutions Section */}
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            ¿Qué puedes hacer?
                        </h3>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                                <span className="leading-relaxed">Intenta nuevamente con otro medio de pago (otra tarjeta o método)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                                <span className="leading-relaxed">Verifica que tu tarjeta tenga fondos suficientes y no esté vencida</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                                <span className="leading-relaxed">Comunícate con tu banco para verificar restricciones o bloqueos</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                                <span className="leading-relaxed">Si el problema persiste, contáctanos directamente por WhatsApp</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white text-center">
                        <Mail className="w-6 h-6 mx-auto mb-2 opacity-90" />
                        <p className="text-sm font-medium mb-1 opacity-90">¿Necesitas ayuda adicional?</p>
                        <a href={`mailto:${CORREO}`} className="text-lg font-semibold hover:underline">
                            {CORREO}
                        </a>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <Link href="/AgendaProceso">
                            <button className="group bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-red-300/50 hover:shadow-xl hover:shadow-red-400/50 transition-all duration-300 flex items-center gap-3 transform hover:scale-105">
                                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                Intentar nuevamente
                            </button>
                        </Link>
                        <Link href="/">
                            <button className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-gray-300/50 hover:shadow-xl hover:shadow-gray-400/50 transition-all duration-300 flex items-center gap-3 transform hover:scale-105">
                                Volver a página principal
                                <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-gray-500 text-sm mt-8 px-4">
                Estamos aquí para ayudarte. No dudes en contactarnos 💬
            </p>
        </div>
    </div>
);

export default function PagoRechazadoPage() {
    return <CTA1 />;
}