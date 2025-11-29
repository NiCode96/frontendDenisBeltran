// src/app/layout.js (o layout.tsx)

import {Lexend} from "next/font/google";

const lexend = Lexend({
    weight: "400", // Lexend: usamos peso 400
    subsets: ["latin"],
});

import {Sour_Gummy} from "next/font/google";

const sourGummy = Sour_Gummy({
    subsets: ["latin"], // debes elegir los subsets
    weight: ["400", "500", "700"], // los pesos que quieras usar
});


import NavBar from "@/componentes/NavBar";
import Link from "next/link";
import Image from "next/image";

// Base de la API configurable por entorno (dev/prod)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function cargarTitulos() {
    try {
        const res = await fetch(`${API}/titulo`, {
            cache: 'no-store',
            // Agregar timeout y mejor manejo de errores
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.warn('No se pudieron cargar los títulos:', res.status);
            return [];
        }

        const dataTitulos = await res.json();
        return dataTitulos;
    } catch (error) {
        console.warn('Error al cargar títulos (puede ser normal durante build):', error.message);
        // Retornar títulos por defecto para que el build funcione
        return [
            {id_titulo: 1, titulo: 'Bienvenido a tu espacio de bienestar'},
            {id_titulo: 2, titulo: 'Psicología clínica con enfoque humanista'}
        ];
    }
}

export default async function Portada() {
    const titulos = await cargarTitulos();

    const tituloPrincipal = titulos.find((item) => item.id_titulo === 1);
    const subtitulo = titulos.find((item) => item.id_titulo === 2);

    return (
        <div>
            <NavBar/>
            <div
                className="relative min-h-screen bg-gradient-to-b from-rose-200 via-rose-50 to-white flex flex-col items-center justify-center px-6 md:px-12 overflow-hidden">
                {/* Background imagen */}

                {/* Content above video */}
                <div className="relative z-10 flex flex-col items-center text-center text-gray-800">
                    {/*Titulo principal*/}
                    {tituloPrincipal && (
                        <h1
                            className={`${lexend.className} text-4xl md:text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm mt-24`}
                        >
                            {tituloPrincipal.titulo}
                        </h1>
                    )}

                    <div
                        className={`${sourGummy.className} mt-6 md:hidden text-lg font-medium text-rose-500`}
                    >
                        <h1>
                            Regálate este momento para ti… primera sesión con precio especial{" "}
                        </h1>
                    </div>
                    {/* Subtitulo */}
                    {subtitulo && (
                        <h1
                            className={`${lexend.className} mt-8 text-2xl md:text-4xl font-semibold text-rose-600 max-w-2xl`}
                        >
                            {subtitulo.titulo}
                        </h1>
                    )}
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link href={"/AgendaProceso"}>
                            <button
                                className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:from-rose-600 hover:to-pink-600">
                                Agendar mi Hora
                            </button>
                        </Link>
                        <Link href={"/Precios"}>
                            <button
                                className="hidden md:inline-flex rounded-xl border border-rose-300 bg-white/90 px-6 py-3 font-semibold text-rose-600 shadow-sm transition hover:bg-white hover:scale-105">
                                Precios
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
