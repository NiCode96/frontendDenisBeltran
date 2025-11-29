import Link from "next/link";
import Image from "next/image";

export default function SeccionEleccion(){
    return(
        <div><br />
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="  ">

                    {/**TITULO PORQUE ELEJIRNOS */}
                <h1 className="hidden md:block ml-35 justify-center text-2xl md:text-6xl font-bold text-rose-600">¿Por qué elegirme?</h1><br />

                    <div className="pl-10 md:pl-35">
                        <h1 className=" md:hidden flex justify-center mr-14 text-4xl md:text-6xl font-bold text-rose-600">¿Por qué elegirme?</h1><br />
                        <ul>
                            <li className="text-2xl text-justify mr-6 ">Comunicación empática y sin juicios</li><br className="md:hidden"/>
                            <li className="text-2xl text-justify mr-6 ">Confidencialidad profesional absoluta</li><br className="md:hidden"/>
                            <li className="text-2xl text-justify mr-6">Terapias basadas en ciencia y evidencia</li><br className="md:hidden"/>
                            <li className="text-2xl text-justify mr-6">Especial atención a mujeres con desafíos emocionales</li><br className="md:hidden"/>
                            <li className="text-2xl text-justify mr-6">Atención online, cómoda y accesible</li><br className="md:hidden"/>
                        </ul>
                    </div>

<br /><br /><br />
                    <div className="ml-40">
<Link href="/AgendaProceso">
                        <button className="
                        p-2 rounded-4xl w-100
                        border-2 border-rose-600
                        text-2xl font-bold text-white
                        bg-rose-400 hover:bg-rose-600
                        hover:translate-x-5 transform duration-300 ease-in-out
                       
                        hover:scale-105
                        hidden md:block
                        
                        
                    

                        ">Agendar mi Primera Sesion</button>
</Link>
                    </div>



                                        <div className="ml-30">
                        <button className="
                        p-2 rounded-4xl 
                        border-2 border-rose-600
                        text-2xl font-bold text-white
                        bg-rose-400 hover:bg-rose-600
                        hover:translate-x-5 transform duration-300 ease-in-out
                       
                        hover:scale-105
                       
                        md:hidden
                   flex justify-center
                        
                        
                    

                        ">Primera Sesion</button>
                    </div>

                </div>

                <div className="">

                    <Image
                    src={"/seccionEleccion.png"}
                    alt="eleccionimagen"
                    height={500}
                    width={500}
                    className="rounded-4xl ml-10 hidden md:block"/>


                </div>
            </div>
        </div>
    )
}