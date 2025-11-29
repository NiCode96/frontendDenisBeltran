import Dashboard from "./dashboard/layout";
import Portada from "./Portada/page";
import SobreNosotros from "./SobreNosotros/page";
import SeccionPublicaciones from "./SeccionPublicaciones/page";
import PortafolioProyectos from "./PortafolioProyectos/page";
import Contacto from "./Contacto/page";
import Footer from "./Footer/page";
import AgendaPacientes from "@/app/AgendaPacientes/page"
import Precios from "@/app/Precios/page"
import SeccionEleccion from "./SeccionEleccion/page";
import PrimeraSesion from "./PrimeraSesion/page";

export default function Home(){
  return(
    <div>
      <Portada/>

      <PrimeraSesion/>

      <SobreNosotros/>
     
      <SeccionEleccion/>

      <SeccionPublicaciones/>

      <Precios/>

      <Footer/>

     
    </div>

    
  )
}