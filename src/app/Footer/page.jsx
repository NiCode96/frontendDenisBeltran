import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa";


export default function Footer() {
  return (
    <div className="relative bg-gradient-to-b from-rose-100 via-white to-white rounded-t-3xl shadow-inner">

      {/**CONTENEDOR PRINCIPAL*/}
      <div className="p-8 w-full grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
        <h1 className="text-rose-700 font-semibold tracking-wide hidden md:block">CONSULTAS</h1>
        <h1 className="text-rose-700 font-semibold tracking-wide hidden md:block">SEGUIMIENTO</h1>
        <h1 className="text-rose-700 font-semibold tracking-wide hidden md:block">TRATAMIENTO</h1>

        <div className="flex justify-center md:justify-end space-x-4 text-2xl md:text-3xl">
          <Link
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="text-rose-600 hover:text-rose-400" />
          </Link>
          <Link
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook className="text-rose-600 hover:text-rose-400" />
          </Link>
          <Link
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="text-rose-600 hover:text-rose-400" />
          </Link>
          <Link
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTiktok className="text-rose-600 hover:text-rose-400" />
          </Link>
        </div>
      </div>

      <div className="w-full  grid grid-cols-2 md:grid-cols-4 p-8">
        <ul className="text-rose-500 text-sm font-medium space-y-2">
          <li className="hover:text-rose-800 transition-colors duration-200">Anisedad</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Ataques de Panico</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Fobias específicas</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Trastorno de pánico</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Ansiedad generalizada</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Trastorno TOC</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Ansiedad social</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Fobia social</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Hipocondría</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Trastorno de adaptación</li>
        </ul>

        <ul className="text-rose-500 text-sm font-medium space-y-2">
          <li className="hover:text-rose-800 transition-colors duration-200">Depresión</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Estrés crónico</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Trastorno Alimatario</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Trastorno bipolar</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Distimia</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Esquizofrenia</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Trastorno esquizoafectivo</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Trastorno ciclotímico</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Trastornos del sueño</li>
          <li className="hover:text-rose-800 transition-colors duration-200">
            Trastornos de la alimentación{" "}
          </li>
        </ul>

        <ul className="text-rose-500 text-sm font-medium space-y-2 hidden md:block">
          <li className="hover:text-rose-800 transition-colors duration-200">Problemas de autoestima</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Terapia de pareja</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Duelo y pérdidas</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Manejo de la ira</li>
          <li className="hover:text-rose-800 transition-colors duration-200">Estrés postraumático</li>
          <li className="hover:text-rose-800 transition-colors duration-200">
            Problemas de dependencia emocional
          </li>
          <li className="hover:text-rose-800 transition-colors duration-200">Trastornos de personalidad</li>
          <li className="hover:text-rose-800 transition-colors duration-200">
            Dificultades en habilidades sociales
          </li>
          <li className="hover:text-rose-800 transition-colors duration-200">
            Problemas de adaptación laboral
          </li>
          <li className="hover:text-rose-800 transition-colors duration-200">Conflictos familiares</li>
        </ul>

        <div className="flex flex-col gap-3 items-center">
          <Image src={"/ps.png"} alt="udd" width={150} height={100} className="hidden md:block opacity-80 hover:opacity-100 transition"></Image>
          <Image src={"/udd.png"} alt="udd" width={150} height={100} className="hidden md:block opacity-80 hover:opacity-100 transition"></Image>
        </div>
      </div>
      <hr className="my-6 border-t border-rose-300 w-11/12 mx-auto" />

      <div className="flex gap-3 justify-center">
         <Image src={"/ps.png"} alt="udd" width={150} height={100} className="md:hidden opacity-80 hover:opacity-100 transition"></Image>
          <Image src={"/udd.png"} alt="udd" width={150} height={100} className="md:hidden opacity-80 hover:opacity-100 transition"></Image>
      </div>


      <div className="bg-rose-500 py-3 flex justify-center items-center">
        <p className="text-white text-xs tracking-wide">
          © {new Date().getFullYear()} Medify. Todos los derechos reservados.
        </p>
      </div>

      <div></div>
    </div>
  );
}
