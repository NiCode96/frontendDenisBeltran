import { Sour_Gummy } from "next/font/google";

const sourGummy = Sour_Gummy({
  subsets: ["latin"], // debes elegir los subsets
  weight: ["400", "500", "700"], // los pesos que quieras usar
});



export default function PrimeraSesion(){
    return(
        <div className="w-full hidden md:block">
            <div className={`${sourGummy.className} flex justify-center  text-4xl text-rose-400`}>

  <h1 >Regálate este momento para ti… primera sesión con precio especial </h1><br /><br /><br />
  

            </div>

        </div>
    )
}