"use client";
import { useState } from "react";
import { Michroma } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
});

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItemClass = (href) =>
    `${pathname && pathname.startsWith(href) ? "bg-white text-gray-900 shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"} flex items-center gap-3 w-full rounded-lg px-4 py-3 transition-colors`;

  const Sidebar = () => (
    <>
      <div className="mb-6">
        <div className="text-center">
          <h1 className={`${michroma.className} text-3xl md:text-4xl font-extrabold tracking-wider text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]`}>
            Medify
          </h1>
          <h2 className={`${michroma.className} text-sm md:text-base tracking-wide text-white/80`}>
            Clínica en la Nube
          </h2>
        </div>
      </div>

      <nav>
        <div className="text-[10px] uppercase tracking-widest text-white/40 px-2 mb-2">Módulos</div>
        <ul className="flex flex-col gap-1">
          <li>
            <Link className={navItemClass("/dashboard/Calendario")} href="/dashboard/Calendario">
              Modulo Agenda
            </Link>
          </li>
          <li>
            <Link className={navItemClass("/dashboard/GestionAgendas")} href="/dashboard/GestionAgendas">
              Gestión de Agendas
            </Link>
          </li>
          <li>
            <Link className={navItemClass("/dashboard/GestionPaciente")} href="/dashboard/GestionPaciente">
              Ingreso de Pacientes
            </Link>
          </li>

            <li>
                <Link className={navItemClass("/dashboard/GestionPaciente")} href="/dashboard/GestionPagos">
                    Gestion de Pagos
                </Link>
            </li>

          <li>
            <Link className={navItemClass("/dashboard/FichaClinica")} href="/dashboard/FichaClinica">
              Ficha Clinica
            </Link>
          </li>
        </ul>

        <div className="text-[10px] uppercase tracking-widest text-white/40 px-2 mt-6 mb-2">Ajustes</div>
        <ul className="flex flex-col gap-1">
          <li>
            <button
              className={`flex items-center justify-between w-full rounded-lg px-4 py-3 text-left transition-colors ${open ? "bg-white text-gray-900" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
              onClick={() => setOpen(!open)}
              type="button"
            >
              <span className="flex items-center gap-3">Ajustes Página Web</span>
            </button>
            {open && (
              <ul className="ml-2 border-l border-white/10 pl-4 mt-2 flex flex-col gap-1">
                <li>
                  <Link className={navItemClass("/dashboard/EdicionTextos")} href="/dashboard/EdicionTextos">
                    Edición de Pagina Principal
                  </Link>
                </li>
                <li>
                  <Link className={navItemClass("/dashboard/Publicaciones")} href="/dashboard/Publicaciones">
                    Gestión de Publicaciones
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <div className="mt-8">
        <Link 
          href="/"
          className="flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 text-white hover:bg-white/[0.06] transition-all duration-300 shadow-sm"
        >
          Ver Página Principal
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      {/* Header móvil */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-md border border-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          </button>
          <div className="flex flex-col items-center gap-0">
            <div className="flex items-center gap-2">
              <div className="relative w-50 h-50">
                <Image src="/medify.png" alt="Medify" fill sizes="200px" className="object-contain" />
              </div>
              <span className={`${michroma.className} text-base text-gray-900`}>Medify</span>
            </div>
            <span className={`${michroma.className} text-xs text-gray-500`} style={{ lineHeight: "1" }}>Clínica en la Nube</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Layout principal */}
      <div className="grid lg:grid-cols-5">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block col-span-1 sticky top-0 h-screen overflow-y-auto bg-gradient-to-b from-slate-950 to-slate-900 text-white p-6 border-r border-white/10">
          <Sidebar />
        </aside>

        {/* Contenido */}
        <main className="col-span-4 bg-white text-black p-6 lg:p-8 min-h-screen lg:max-h-screen lg:overflow-y-auto">{children}</main>
      </div>

      {/* Drawer móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-gradient-to-b from-slate-950 to-slate-900 text-white p-6 border-r border-white/10 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <Image src="/medify.png" alt="Medify" fill sizes="32px" className="object-contain" />
                </div>
                <span className={`${michroma.className} text-lg`}>Medify</span>
              </div>
              <span className={`${michroma.className} text-xs text-white/80`} style={{ lineHeight: "1" }}>Clínica en la Nube</span>
            </div>
            <button
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-md border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="mt-4 overflow-y-auto h-[calc(100%-3rem)]">
            <Sidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}