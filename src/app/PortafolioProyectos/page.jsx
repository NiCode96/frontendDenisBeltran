"use client";
import Crard from "@/componentes/Cards";

// Base de la API configurable por entorno (dev/prod)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function CargarTitulos() {
    try {
        const res = await fetch(`${API}/titulo`, {
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
        return [{id_titulo: 5, titulo: 'Portafolio de Proyectos'}];
    }
}

async function cargarProyectos() {
    try {
        const res = await fetch(`${API}/proyectos`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.warn('No se pudieron cargar los proyectos:', res.status);
            return [];
        }

        const dataProyectos = await res.json();
        return dataProyectos;
    } catch (error) {
        console.warn('Error al cargar proyectos (puede ser normal durante build):', error.message);
        return [];
    }
}

export default async function PortafolioProyectis() {
    const titulos = await CargarTitulos();
    const proyecto = titulos.find((item) => item.id_titulo === 5);

    const proyectos = await cargarProyectos();
    const proyecto1 = proyectos.find((item) => item.portafolio_id === 1);
    const proyecto2 = proyectos.find((item) => item.portafolio_id === 2);
    const proyecto3 = proyectos.find((item) => item.portafolio_id === 3);

    return (
        <div>
            {/**TITULO PROYECTOS */}
            {proyecto && (
                <h1 className="tituloResponsive pl-10 md:pl-25">{proyecto.titulo}</h1>
            )}{" "}
            <br/><br/><br/>
            {/**CONTENEDOR PRINCIPAL CARDS*/}
            <div className="grid grid-cols-1 md:grid-cols-3 justify-center pl-25 gap-y-10">
                {proyecto1 && (
                    <div>
                        <Crard
                            titulo={proyecto1.titulo}
                            descripcion={proyecto1.descripcion_breve}
                            imagen={""}
                            rutaBoton={''}
                        />
                    </div>
                )}
                {proyecto2 && (
                    <div>
                        <Crard
                            titulo={proyecto2.titulo}
                            descripcion={proyecto2.descripcion_breve}
                            imagen={""}
                            rutaBoton={''}
                        />
                    </div>
                )}
                {proyecto3 && (
                    <div>
                        <Crard
                            titulo={proyecto3.titulo}
                            descripcion={proyecto3.descripcion_breve}
                            imagen={""}
                            rutaBoton={''}
                        />
                    </div>
                )}
            </div>
        </div>

    );
}
