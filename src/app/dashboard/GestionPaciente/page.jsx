"use client"

import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {useState, useEffect} from "react";
import ToasterClients from "@/componentes/ToasterClient";
import {ShadcnInput} from "@/componentes/shadcnInput";
import {ShadcnSelect} from "@/componentes/shadcnSelect";
import {ShadcnButton} from "@/componentes/shadcnButton";
import {toast} from "react-hot-toast";
import * as React from "react"
import ShadcnDatePicker from "@/componentes/shadcnDatePicker";
import {useRouter} from "next/navigation";
import { UserIcon } from "@heroicons/react/24/outline";


export default function GestionPaciente() {

//PARAMETROS USESTATE PARA INSERCION DE DATOS EN PACIENTES
    const API = process.env.NEXT_PUBLIC_API_URL;
    const [listaPacientes, setListaPacientes] = useState([]);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [rut, setRut] = useState("");
    const [nacimiento, setNacimiento] = useState("");
    const [sexo, setSexo] = useState("");
    const [prevision, setPrevision] = useState("");
    const [telefono, setTelefono] = useState("");
    const [correo, setCorreo] = useState("");
    const [direccion, setDireccion] = useState("");
    const[pais, setPais] = useState("");



    //PARAMETRO PARA BUSCAR POR SIMILITUD DE NOMBRES
    const[nombreBuscado, setNombreBuscado] = useState("");


    //PARAMETRO PARA BUSCAR POR SIMILITUD DE RUT
    const [rutBuscado, setRutBuscado] = useState("");


    //PARAMETRO PARA LA NAVEGACION ENTRE COMPONENTES EL COMPONENTE LE POGO NOMBRE DE ROUTER
    const router = useRouter();

    
    //SE CREA UNA FUNCION PARA PODER NAVEGAR A LA RUTA DINAMICA POR ID DE CADA PACIENTE ( EN ESTE CASO USO LINK PERO EN CASO DE BOTON USAR ESTA FN
    function verDetallePaciente(id_paciente) {
        router.push(`/dashboard/paciente/${id_paciente}`);
    }


    //FUNCION PARA ENCONTRAR PACIENTES POR SIMILITD DE RUT
    async function buscarRutSimilar(rutBuscado){
        try {
            if (!rutBuscado){
                toast.error("Debe ingresar previamente un RUT para buscar similitudes.")
            }

            let rut = rutBuscado;

            const res = await fetch(`${API}/pacientes/contieneRut`, {
                method: "POST",
                headers: {Accept: "application/json",
                "Content-Type": "application/json"},
                body: JSON.stringify({rut}),
                mode: "cors"
            })
            if(!res.ok){
                return res.json();
            }else {
                const dataRutSimilar = await res.json()

                if(Array.isArray(dataRutSimilar) && dataRutSimilar.length > 0){
                    setListaPacientes(dataRutSimilar)
                    return toast.success("Similitud encontrada!")
                }else {
                    return toast.error("No se han encontrado similitudes.")
                }

            }
        }catch(err){
            console.log(err);
            return toast.error("Ha ocurrido un problema en el servidor")
        }
    }




//FUNCION PARA BUSCAR POR SIMILITUD DE NOMBRES
    async function buscarNombreSimilar(nombreBuscado) {
        try {

            let nombre = nombreBuscado.trim();

            if (!nombreBuscado) {
                toast.error("Debe ingresar previamente un nombre para buscar similitudes.")
            }

            const res = await fetch(`${API}/pacientes/contieneNombre`, {
                method: "POST",
                headers: {Accept: "application/json",
                "Content-Type": "application/json"},
                body: JSON.stringify({nombre}),
                mode: "cors",
                cache: "no-cache"
            })

            if(!res.ok) {
                return res.json();
            }else {

                const dataSimilar = await res.json();

                if(Array.isArray(dataSimilar) && dataSimilar.length > 0){
                    setListaPacientes(dataSimilar);
                    return toast.success("Similitud encontrada!")
                }else{
                    return toast.error("No se han encontrado similitudes.")
                }
            }
        }catch(err) {
            console.log(err);
            return toast.error("Ha habido un problema en el servidor por favor contacte a soporte de Medify");
        }

    }


//FUNCION PARA INSERTAR NUEVOS PACIENTES
    async function insertarPaciente(nombre,apellido,rut,nacimiento,sexo,prevision,telefono,correo,direccion,pais) {
        try {
            let prevision_id = null;

            if (prevision.includes("FONASA")) {
                prevision_id = 1;
            }else if (prevision.includes("ISAPRE")) {
                prevision_id = 2;
            }else {
                return toast.error("Debe seleccionar al menos una prevision")
            }

            if(!nombre || !apellido || !rut || !nacimiento || !sexo || !prevision_id || !telefono || !correo || !direccion || !pais){
                return  toast.error("Debe llenar todos los campos para ingresar un nuevo paciente en las bases de datos.")
            }

            const res = await fetch(`${API}/pacientes/pacientesInsercion`,{
                method: "POST",
                headers: {Accept: "application/json",
                "Content-Type": "application/json"},
                body: JSON.stringify({nombre,apellido,rut,nacimiento,sexo,prevision_id,telefono,correo,direccion,pais}),
                mode: "cors"
            })

            if(!res.ok) {
                return toast.error("Problema al Ingresar nuevo paciente en el servidor. Por favor contacte a soporte Tecnico de Medify")
            }else{
                const respuestaBackend = await res.json();

                if (respuestaBackend.message === true) {

                    setNombre("");
                    setApellido("");
                    setRut("");
                    setTelefono("");
                    setCorreo("");
                    setDireccion("");
                    setPais("");

                    return toast.success("Nuevo paciente ingresado con exito!");

                }else{
                    return toast.error("No se ha podido ingresar paciente. Intente mas tarde");
                }
            }
        }catch(err) {
            console.error(err);
            return toast.error("Problema al Ingresar nuevo paciente en el servidor. Por favor contacte a soporte Tecnico de Medify")

        }
    }



//FUNCION PARA LISTAR TODOS LOS PACIENTES INGRESADOS
    async function listarPacientes() {
        try {
            const res = await fetch(`${API}/pacientes`, {
                method: "GET",
                headers: {
                    Accept: "application/json",},
                mode: "cors"
            })

            if (!res.ok) {
                return toast.error("Ha ocurrido un error listando los pacientes . contacte a soporte IT de Medify")
            }else{
                const dataPacientes = await res.json()
                setListaPacientes(dataPacientes);
            }

        }catch(error) {
            console.log(error);
            return toast.success("Ha ocurrido un error contacte a soporte de Medify");

        }
    }
    useEffect(() => {
        listarPacientes();
    }, [])


    // OBJETO JS QUE SE LE PASA LA DATA ENCONTRADA EN LA PETICION HTTP AL BACKEND ( DE ACA SE LISTAN)
    const pacientesParaRenderizarEnTabla = listaPacientes;


    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
            <ToasterClients />
            <div className="max-w-5xl mx-auto">

                <div className="mb-6">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight">Gestión e Ingreso de pacientes</h1>
                  <p className="mt-2 text-gray-600 max-w-2xl">Registra pacientes rápidamente para abrir su ficha clínica.</p>
               </div>



                <div className="space-y-6">

                  {/* Form card */}
                  <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-blue-900">Ingreso de paciente</h2>
                     </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="">
                        <label className="text-sm font-medium text-gray-700">Nombre</label>
                        <div className="mt-1">
                          <ShadcnInput
                              value={nombre}
                              placeholder={"Ej: Andrea Ignacia "}
                              onChange={(e) => setNombre(e.target.value)} className="bg-gray-50" />
                        </div>
                    </div>


                    <div className="">
                        <label className="text-sm font-medium text-gray-700">Apellido</label>
                        <div className="mt-1">
                        <ShadcnInput
                        value={apellido}
                        placeholder={"Ej: Varela Garrido "}
                        onChange={(e) => setApellido(e.target.value)} className="bg-gray-50" />
                        </div>
                    </div>

                    <div className="">
                        <label className="text-sm font-medium text-gray-700">Número Identificación (RUT)</label>
                        <div className="mt-1">
                        <ShadcnInput
                        value={rut}
                        placeholder={"Ej: 12.345.567-8 "}
                        onChange={(e) => setRut(e.target.value)} className="bg-gray-50" />
                        </div>
                    </div>


                    <div className="">
                        <label className="text-sm font-medium text-gray-700">Sexo</label>
                        <div className="mt-1">
                        <ShadcnInput
                        value={sexo}
                        placeholder={"Ej: Femenino"}
                        onChange={(e) => setSexo(e.target.value)} className="bg-gray-50" />
                        </div>
                    </div>


                    <div className="">
                        <label className="text-sm font-medium text-gray-700">Seleccione Previsión</label>
                        <div className="mt-1">
              <ShadcnSelect nombreDefault={"Seleccion Prevision"}
                            value1={"FONASA"}
                            value2={"ISAPRE"}
                            onChange={(value) => setPrevision(value)}/>
                        </div>
                    </div>


                    <div className="">
                        <label className="text-sm font-medium text-gray-700">Teléfono</label>
                        <div className="mt-1">
                        <ShadcnInput
                        value={telefono}
                        placeholder={"Ej: +569 99764369"}
                        onChange={(e) => setTelefono(e.target.value)} className="bg-gray-50" />
                        </div>
                    </div>

                    <div className="">
                        <label className="text-sm font-medium text-gray-700">Correo</label>
                        <div className="mt-1">
                        <ShadcnInput
                        value={correo}
                        placeholder={"CorreoDelPaciente@gmail.com"}
                        onChange={(e) => setCorreo(e.target.value)} className="bg-gray-50" />
                        </div>
                    </div>


                    <div className="">
                        <label className="text-sm font-medium text-gray-700">Dirección</label>
                        <div className="mt-1">
                        <ShadcnInput
                            placeholder={"Avenida España 123 / Concepcion"}
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)} className="bg-gray-50" />
                        </div>
                    </div>

                    <div className="">
                        <label className="text-sm font-medium text-gray-700">País del Paciente</label>
                        <div className="mt-1">
                        <ShadcnInput
                            value={pais}
                            placeholder={"Ej: Argentina"}
                            onChange={(e) => setPais(e.target.value)} className="bg-gray-50" />
                        </div>
                    </div>


                    <div className="sm:col-span-2">
                        <div className="mt-1">
                            <ShadcnDatePicker
                                label="Fecha de nacimiento"
                                value={nacimiento}
                                onChange={(fecha) => setNacimiento(fecha)}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2 flex justify-end">

                    <button
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-sky-700 to-blue-600 text-white font-semibold shadow-lg hover:from-sky-800 hover:to-blue-700 transition"
                     type={"button"}
                     onClick={() => insertarPaciente(nombre,apellido,rut,nacimiento,sexo,prevision,telefono,correo,direccion,pais)}
                     >Ingresar</button>

                    </div>

                    </div>
                  </div>


                  {/* Search card */}
                  <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-sky-800">Búsqueda de pacientes</h3>
                     <p className="text-sm text-gray-500 mt-1">Busca por nombre o RUT para evitar duplicados.</p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Buscar por similitud de Nombres</label>
                            <div className="mt-1 flex gap-2">
                                <ShadcnInput
                                    placeholder="Ej: Nicolas Andres .."
                                    value={nombreBuscado}
                                    onChange={(e) => setNombreBuscado(e.target.value)}
                                />

                                <ShadcnButton
                                    nombre={"Buscar"}
                                    funcion={() => buscarNombreSimilar(nombreBuscado)}/>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Buscar por similitud de RUT</label>
                            <div className="mt-1 flex gap-2">
                                <ShadcnInput
                                value={rutBuscado}
                                placeholder={"12.345.678-9"}
                                onChange={(e) => setRutBuscado(e.target.value)}
                                />

                                <ShadcnButton
                                    nombre={"Buscar"}
                                    funcion={() => buscarRutSimilar(rutBuscado)}/>
                            </div>
                        </div>
                    </div>

                  </div>


                  {/* Table card */}
                  <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 overflow-x-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Listado de Pacientes</h3>
                        <div className="text-sm text-gray-500">Total: <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">{pacientesParaRenderizarEnTabla.length}</span></div>
                     </div>

                      <ShadcnButton nombre={"Mostrar Todos"} funcion={()=> listarPacientes()}/>

                    <Table>
                        <TableCaption className="font-semibold text-sky-700">Listado de Pacientes Ingresados</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px] text-left font-bold">Ver Datos</TableHead>
                                <TableHead className="w-[120px] text-left font-bold">Nombre</TableHead>
                                <TableHead className="text-left font-bold" >Apellido</TableHead>
                                <TableHead className="text-left font-bold" >RUT</TableHead>
                                <TableHead className="text-right font-bold">Telefono</TableHead>
                                <TableHead className="text-right font-bold">Correo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pacientesParaRenderizarEnTabla.map((paciente) => (
                                <TableRow key={paciente.id_paciente} className="hover:bg-sky-50">
                                    <TableCell className="font-medium text-gray-800 text-left"> <button
                                    onClick={()=>verDetallePaciente(paciente.id_paciente)}
                                    ><UserIcon className="w-6 h-6 text-sky-700 hover:text-green-400" /></button></TableCell>
                                    <TableCell className="font-medium text-gray-800 text-left">{paciente.nombre}</TableCell>
                                    <TableCell className="text-gray-600 text-left">{paciente.apellido}</TableCell>
                                    <TableCell className="text-gray-600 text-left">{paciente.rut}</TableCell>
                                    <TableCell className="text-right text-gray-600">{paciente.telefono}</TableCell>
                                    <TableCell className="text-right text-gray-600">{paciente.correo}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>

                  </div>

                </div>

            </div>
        </div>
    )
}