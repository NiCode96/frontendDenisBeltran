"use client"
import {useParams} from "next/navigation";
import {useState, useEffect} from "react";
import {toast} from "react-hot-toast";
import ToasterClient from "@/componentes/ToasterClient";
import formatearFecha from "@/FuncionesTranversales/funcionesTranversales.js"
import {ShadcnButton} from "@/componentes/shadcnButton";
import {useRouter} from "next/navigation";
import {ShadcnInput} from "@/componentes/shadcnInput";
import {ShadcnSelect} from "@/componentes/shadcnSelect";
import ShadcnDatePicker from "@/componentes/shadcnDatePicker";
import * as React from "react";




export default function Paciente(){

    const {id_paciente} = useParams();
    const [detallePaciente, setDetallePaciente] = useState([])
    const API = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);




    //PARAMETROS USESTATE PARA INSERCION DE DATOS EN PACIENTES
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

    function volverAingreso(){
        router.push("/dashboard/GestionPaciente");
    }




    //FUNCION PARA LA ACTUALIZACION DE DATOS DEL PACIENTE
    async function actualizarDatosPacientes(nombre,apellido,rut,nacimiento,sexo, prevision,telefono,correo,direccion,pais,id_paciente ) {

        let prevision_id = null;

        if (prevision.includes("FONASA")) {
            prevision_id = 1
        }else if (prevision.includes("ISAPRE")) {
            prevision_id = 2
        }else {
            prevision_id = 0
        }

        try {
            if (!nombre || !apellido || !rut || !nacimiento || !sexo || !prevision_id || !telefono || !correo || !direccion || !pais || !id_paciente) {
                return toast.error("Debe llenar todos los campos para proceder con la actualziacion")
            }

            const res = await fetch(`${API}/pacientes/pacientesActualizar`, {
                method: "POST",
                headers: {Accept: "application/json",
                    "Content-Type": "application/json"},
                mode: "cors",
                body: JSON.stringify({nombre,apellido,rut,nacimiento,sexo,prevision_id,telefono,correo,direccion,pais,id_paciente})
            })

            if(!res.ok) {
                return toast.error("Debe llenar todos los campos para proceder con la actualziacion")
            } else{
                const resultadoQuery = await res.json();
                if(resultadoQuery.message === true){
                    setNombre("");
                    setApellido("");
                    setNacimiento("");
                    setTelefono("");
                    setCorreo("");
                    setDireccion("");
                    setRut("");
                    setSexo("");
                    setPais("");
                   await buscarPacientePorId(id_paciente);
                    return toast.success("Datos del paciente actualizados con Exito!");
                }else{
                    return toast.error("No se han podido Actualizar los datos del paciente. Intente mas tarde.")
                }
            }
        }catch(err) {
            console.log(err);
            return toast.error("Ha ocurrido un problema en el servidor")
        }
    }


    async function buscarPacientePorId(id_paciente){
        try {
            if(!id_paciente){
                return toast.error("No se puede cargar los datos del paciente seleccionado. Debe haber seleccionado el paciente para poder ver el detalle de los datos.");
            }

            const res = await fetch(`${API}/pacientes/pacientesEspecifico`, {
                method: "POST",
                headers: {Accept: "application/json",
                "Content-Type": "application/json"},
                body: JSON.stringify({id_paciente})
            })

            if(!res.ok){
                return toast.error("No se puede cargar los datos del paciente seleccionado.");
            }

            const dataPaciente = await res.json();
            // Asegurar que siempre guardamos un array para poder mapear sin errores
            setDetallePaciente(Array.isArray(dataPaciente) ? dataPaciente : [dataPaciente]);

        }catch(error){
            console.log(error);
            return toast.error("No se puede cargar los datos del paciente seleccionado. Por favor contacte a soporte de Medify");

        }
    }

    // Ejecutar la búsqueda cuando cambie id_paciente (Next puede resolver el param después del primer render)
    useEffect(() => {
        if (!id_paciente) return;
        buscarPacientePorId(id_paciente)
    }, [id_paciente]);


    function previsionDeterminacion(id_prevision){
        let previsionString = null;

        if(id_prevision === 1){
             previsionString = "FONASA"
        }else if(id_prevision === 2){
             previsionString = "ISAPRE"
        }else{
             previsionString = "SIN DEFINIR"
        }
        return previsionString;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white py-10">
            <ToasterClient/>

            <div className="max-w-4xl mx-auto px-4">
                <header className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Datos del Paciente</h1>
                            <p className="mt-1 text-sm text-slate-500">Información de contacto del Paciente </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-3">
                            <span className="text-xs text-slate-500">Registros:</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-medium text-sm">{detallePaciente.length}</span>
                            <ShadcnButton nombre={"Volver a Ingreso"} funcion={()=> volverAingreso()}/>
                        </div>
                    </div>
                </header>

                <div className="space-y-4">
                    {detallePaciente.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">No hay datos disponibles o se están cargando...</div>
                    ) : (
                        detallePaciente.map(paciente => (
                            <article key={paciente.id_paciente} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                                    {/* Left: identidad */}
                                    <div className="sm:col-span-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-lg font-semibold text-slate-900">{paciente.nombre} {paciente.apellido}</h2>
                                                <p className="mt-1 text-sm text-slate-500">RUT: <span className="font-medium text-slate-700">{paciente.rut}</span></p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-800">{previsionDeterminacion(paciente.prevision_id)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="bg-slate-50 p-3 rounded-md">
                                                <p className="text-xs text-slate-500">Fecha de nacimiento</p>
                                                <p className="mt-1 font-medium text-slate-700">{formatearFecha(paciente.nacimiento)}</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-md">
                                                <p className=" text-slate-500">Sexo</p>
                                                <p className="mt-1 font-medium text-black">{paciente.sexo}</p>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Right: contacto */}
                                    <div className="sm:col-span-1">
                                        <div className="flex flex-col gap-3">
                                            <div className="text-sm">
                                                <p className="text-xs text-slate-500">Teléfono</p>
                                                <p className="mt-1 font-medium text-slate-700">{paciente.telefono || '-'} </p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="text-xs text-slate-500">Correo</p>
                                                <p className="mt-1 font-medium text-slate-700 break-all">{paciente.correo || '-'}</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="text-xs text-slate-500">Dirección</p>
                                                <p className="mt-1 font-medium text-slate-700">{paciente.direccion || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>

               <div className="mt-5"> <ShadcnButton nombre={mostrarFormulario ?  "Ocultar Formulario" : "Actualizar Datos" } funcion={()=> setMostrarFormulario((estadoBooleano) => !estadoBooleano)}/></div>

            </div>

            {/* FORMULARIO DE ACTUALIZACION */}
            {mostrarFormulario ? (
                <div className="mt-10 bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-blue-900">Actualizar Datos Paciente</h2>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="">
                            <label className="text-sm font-medium text-gray-700">Nombre</label>
                            <div className="mt-1">
                                <ShadcnInput
                                    value={nombre}
                                    placeholder={"Ej: Jose Nicolas "}
                                    onChange={(e) => setNombre(e.target.value)} className="bg-gray-50" />
                            </div>
                        </div>


                        <div className="">
                            <label className="text-sm font-medium text-gray-700">Apellido</label>
                            <div className="mt-1">
                                <ShadcnInput
                                    value={apellido}
                                    placeholder={"Ej: Gonzalez Garrido "}
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
                                    placeholder={"Colombia"}
                                    value={pais}
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
                                onClick={()=> actualizarDatosPacientes(nombre,apellido,rut,nacimiento,sexo, prevision,telefono,correo,direccion,pais,id_paciente )}
                            >Actualizar</button>

                        </div>

                    </div>
                </div>
            ) : null}


        </div>
    )
}