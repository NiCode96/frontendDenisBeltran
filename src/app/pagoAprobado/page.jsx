import { MoveRight, CheckCircle2, Mail, Calendar, Clock } from "lucide-react";
import Link from "next/link";

const CORREO = "dennisbeltranmedify@gmail.com";

const CTA1 = () => (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            {/* Success Icon */}
            <div className="flex justify-center mb-8 animate-bounce">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <CheckCircle2 className="relative w-20 h-20 md:w-24 md:h-24 text-emerald-500" strokeWidth={1.5} />
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-200/50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6 text-center">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-3">
                        ✓ Pago Confirmado
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        ¡Pago Aprobado!
                    </h1>
                </div>

                {/* Content */}
                <div className="px-8 py-10 space-y-8">
                    {/* Success Message */}
                    <div className="text-center">
                        <p className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">
                            Tu agendamiento fue realizado con éxito
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Tu cita de telemedicina ha quedado confirmada
                        </p>
                    </div>

                    {/* Info Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                            <Mail className="w-8 h-8 text-blue-600 mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-1">Correo de confirmación</h3>
                            <p className="text-sm text-gray-600">Recibirás todos los detalles en minutos</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                            <Calendar className="w-8 h-8 text-purple-600 mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-1">Fecha y hora</h3>
                            <p className="text-sm text-gray-600">Incluido en tu correo</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                            <Clock className="w-8 h-8 text-amber-600 mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-1">Confirmación previa</h3>
                            <p className="text-sm text-gray-600">Te contactaremos antes de la cita</p>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            Próximos pasos
                        </h3>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                                <span className="leading-relaxed">Recibirás un correo con todos los detalles: fecha, hora, enlace de conexión e instrucciones</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                                <span className="leading-relaxed">La profesional se pondrá en contacto contigo para una confirmación adicional</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                                <span className="leading-relaxed">¿Necesitas modificar o cancelar? Responde al correo de confirmación</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-6 text-white text-center">
                        <Mail className="w-6 h-6 mx-auto mb-2 opacity-90" />
                        <p className="text-sm font-medium mb-1 opacity-90">Correo de contacto</p>
                        <a href={`mailto:${CORREO}`} className="text-lg font-semibold hover:underline">
                            {CORREO}
                        </a>
                    </div>

                    {/* CTA Button */}
                    <div className="flex justify-center pt-4">
                        <Link href="/">
                            <button className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-emerald-300/50 hover:shadow-xl hover:shadow-emerald-400/50 transition-all duration-300 flex items-center gap-3 transform hover:scale-105">
                                Volver a página principal
                                <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-gray-500 text-sm mt-8 px-4">
                Gracias por confiar en nosotros para tu atención de salud mental 💚
            </p>
        </div>
    </div>
);

export default function PagoAprobadoPage() {
    return <CTA1 />;
}