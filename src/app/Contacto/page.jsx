// src/app/layout.js (o layout.tsx)

import {Lexend} from "next/font/google";

const lexend = Lexend({
    weight: "400", // Lexend: usamos peso 400
    subsets: ["latin"],
});

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function cargarTitulos() {
    try {
        const res = await fetch(`${API}/titulo`, {
            mode: 'cors',
            cache: 'no-store',
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
        return [{id_titulo: 6, titulo: 'Contacto'}];
    }
}

async function cargarContactoDatos() {
    try {
        const res = await fetch(`${API}/contacto`, {
            mode: 'cors',
            cache: 'no-store',
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.warn('No se pudieron cargar datos de contacto:', res.status);
            return [];
        }

        const dataDatos = await res.json();
        return dataDatos;
    } catch (error) {
        console.warn('Error al cargar datos de contacto (puede ser normal durante build):', error.message);
        return [];
    }
}

export default async function Contacto() {
    const titulos = await cargarTitulos();
    const contactoTitulo = titulos.find(item => item.id_titulo === 6);

    const contactoDato = await cargarContactoDatos();
    const telefono = contactoDato.find(item => item.id_DatosContacto === 1);
    const correo = contactoDato.find(item => item.id_DatosContacto === 1);
    const linkedin = contactoDato.find(item => item.id_DatosContacto === 1);


    return (
        <div className="flex justify-center items-center
bg-gradient-radial from-rose-400 via-rose-300 to-white

">
            <div className=" 
            p-4 border-2 border-rose-800 rounded-2xl w-200
            bg-rose-50">
                {contactoTitulo &&
                    <h1 className={` ${lexend.className} text-2xl font-bold text-rose-600 flex justify-center`}>{contactoTitulo.titulo}</h1>}
                <br/>
                <br/>
                {telefono &&
                    <h1 className={` ${lexend.className} text-2xl text-rose-600 flex justify-center`}>{telefono.telefono}</h1>}
                <br/>
                {correo &&
                    <h1 className={` ${lexend.className} text-2xl text-rose-600 flex justify-center`}>{correo.correo}</h1>}
                <br/>
                {linkedin &&
                    <h1 className={` ${lexend.className} text-2xl text-rose-600 flex justify-center`}>{linkedin.red_social_1}</h1>}
            </div>
        </div>
    )

}