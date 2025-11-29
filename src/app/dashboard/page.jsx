"use client";
import { Michroma } from "next/font/google";

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
});

export default function DashboardHome() {

  return (
    <div>
      <style jsx>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        @keyframes slowspin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-slowspin {
          animation: slowspin 25s linear infinite;
        }
      `}</style>
      <div className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-white px-4 py-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-16 w-72 h-72 bg-white  rounded-3xl blur-2xl"></div>
          <div className="absolute top-1/2 -right-40 w-[420px] h-[420px] bg-white  rounded-full blur-3xl opacity-70"></div>
          <div className="absolute bottom-[-40px] left-1/3 w-64 h-64 bg-white  rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-1 mb-4 text-xs font-medium text-gray-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Plataforma para clínicas modernas</span>
          </div>
          <h1 className={`${michroma.className} text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 animate-fadeInUp`}>
            M e d i f y
          </h1>
          <h2 className={`${michroma.className} mt-4 text-base md:text-xl font-medium text-gray-700 opacity-90 animate-fadeInUp delay-200`}>
            Clinica en la Nube
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full animate-fadeInUp delay-200">
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Agenda médica</p>
              <p className="mt-1 text-sm text-gray-800">Organiza horarios, profesionales y box clínicos en tiempo real.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Historia clínica</p>
              <p className="mt-1 text-sm text-gray-800">Centraliza fichas, evoluciones y documentos de tus pacientes.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Reportes y métricas</p>
              <p className="mt-1 text-sm text-gray-800">Visualiza indicadores clave de tu centro médico en segundos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}