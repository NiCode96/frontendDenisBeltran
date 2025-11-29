import Image from "next/image";

// Base de la API configurable por entorno (dev/prod)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function cargarTitulos() {
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
        return [
            {id_titulo: 3, titulo: '¿Quiénes Somos?'},
            {id_titulo: 4, titulo: '¿Qué Hacemos?'}
        ];
    }
}

async function cargarTextos() {
    try {
        const res = await fetch(`${API}/textos`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            console.warn('No se pudieron cargar los textos:', res.status);
            return [];
        }

        const textodata = await res.json();
        return textodata;
    } catch (error) {
        console.warn('Error al cargar textos (puede ser normal durante build):', error.message);
        return [
            {id_Textos: 1, texto: 'Texto por defecto sobre quiénes somos'},
            {id_Textos: 2, texto: 'Texto por defecto sobre qué hacemos'}
        ];
    }
}

export default async function SobreNosotros() {
    const titulos = await cargarTitulos();
    const quienesSomos = titulos.find((item) => item.id_titulo === 3);
    const quehacemos = titulos.find((item) => item.id_titulo === 4);

    const textos = await cargarTextos();
    const textoQuienesSomos = textos.find((item) => item.id_Textos === 1);
    const textoQueHacemos = textos.find((item) => item.id_Textos === 2);

    return (
        /** CONTENEDOR PRINCIPAL  */
        <div className="">
            <div
                className="
      grid grid-cols-1 md:grid-cols-3 
      p-10"
            >


                {/**--------------------------------- */}
                {/** CONTENEDOR DE PRIMERA IMAGEN */}
                {/**--------------------------------- */}

                <div className="flex justify-center p-8 col-span-1 ml-20 ">
                    <Image
                        alt="Imagen1"
                        src={"/denis.png"}
                        width={500}
                        height={300}
                        className="rounded-2xl hidden md:block"
                    />
                </div>


                {/**--------------------------------- */}
                {/** CONTENEDOR DE PRIMER TEXTO */}
                {/**--------------------------------- */}
                <div
                    className="
        col-span-1 md:col-span-2"
                >
                    <br/>

                    {/** Quienes somos Titulo */}
                    {quienesSomos && (
                        <h1 className="text-3xl font-bold md:text-5xl flex md:justify-start md:mr-40 text-rose-600">
                            {quienesSomos.titulo}
                        </h1>
                    )}
                    <br/>

                    {/**Texto Quienes Somos */}
                    {textoQuienesSomos && (
                        <p className="text-2xl text-justify md:pr-10 md:mr-12">
                            {textoQuienesSomos.contenido}
                        </p>
                    )}
                    <br/>
                </div>
            </div>


            {/**--------------------------------- */}
            {/** CONTENEDOR DE SEGUNDO TEXTO */}
            {/**--------------------------------- */}
            <div
                className="
      grid grid-cols-1 md:grid-cols-2 md:p-10"
            >
                <div
                    className="
        col-span-1 "
                >
                    {/** Que Hacemos **/}
                    {quehacemos && (
                        <h1
                            className="text-3xl ml-10 md:ml-28 font-bold md:text-5xl flex   text-rose-600"
                        >
                            {quehacemos.titulo}
                        </h1>
                    )}
                    <br/>

                    {/**Texto Que Hacemos */}
                    {textoQueHacemos && (
                        <p
                            className="text-2xl text-justify
            pl-10  pr-8 md:pl-28"
                        >
                            {textoQueHacemos.contenido}
                        </p>
                    )}
                    <br/>
                </div>
                <div className="md:pr-10 mr-0">
                    <Image
                        alt="Imagen1"
                        src={"/image1.png"}
                        width={400}
                        height={400}
                        className="rounded-2xl hidden md:block ml-30"
                    />
                </div>
            </div>
        </div>
    );
}
