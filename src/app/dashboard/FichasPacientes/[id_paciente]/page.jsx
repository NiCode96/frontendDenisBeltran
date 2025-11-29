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
import {CheckboxIcon} from "@radix-ui/react-icons";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";


export default function Paciente() {

    const {id_paciente} = useParams();
    const [detallePaciente, setDetallePaciente] = useState([])
    const API = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    function nuevaFichaClinica() {
        router.push(`/dashboard/NuevaFicha/${id_paciente}`);
    }


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
    const [pais, setPais] = useState("");


    const [checked, setChecked] = useState(true);


    //USESTATES PARA MANIPULAR DATOS DE LA FICHACLINICA
    const [tipoAtencion, setTipoAtencion] = useState("");
    const [motivoConsulta, setMotivoConsulta] = useState("");
    const [signosVitales, setSignosVitales] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [anotacionConsulta, setAnotacionConsulta] = useState("");
    const [anamnesis, setAnamnesis] = useState("");
    const [diagnostico, setDiagnostico] = useState("");
    const [indicaciones, setIndicaciones] = useState("");
    const [archivosAdjuntos, setArchivosAdjuntos] = useState("");
    const [fechaConsulta, setFechaConsulta] = useState("");
    const [estadoFicha, setEstadoFicha] = useState("");
    const [consentimientoFirmado, setConsentimientoFirmado] = useState("");


    //PARAMETROS PARA LISTAR FICHAS CLINICAS
    const [listaFichas, setListaFichas] = useState([]);

    //FUNCION PARA LISTAR LAS FICHAS CLINICAS POR ID DE PACIENTE
    async function listarFichasClinicasPaciente(id_paciente) {
        try {
            if (!id_paciente) {
                return toast.error("No se ha seleccionado ningun Id, si el problema persiste contcate a soporte de Medify")
            } else {

                const res = await fetch(`${API}/ficha/seleccionarFichasPaciente`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({id_paciente}),
                    mode: "cors"
                })


                if (!res.ok) {
                    return toast.error("Ha ocurrido un error Contacte a soporte de Medify")
                }

                const dataFichasClinicas = await res.json();
                setListaFichas(dataFichasClinicas);
            }
        } catch (e) {
            console.log(e)
            return toast.error("Ha ocurrido un error en el servidor: " + e)
        }

    }


    //FUNCION QUE PERMITE NAVEGAR ENTRE PAGINAS Y VOLVER A LA FECHA CLINCA CON USEROUTER
    function volverAFichas() {
        router.push("/dashboard/FichaClinica");
    }


    //FUNCION PARA LA ACTUALIZACION DE DATOS DEL PACIENTE
    async function actualizarDatosPacientes(nombre, apellido, rut, nacimiento, sexo, prevision, telefono, correo, direccion, pais, id_paciente) {

        let prevision_id = null;

        if (prevision.includes("FONASA")) {
            prevision_id = 1
        } else if (prevision.includes("ISAPRE")) {
            prevision_id = 2
        } else {
            prevision_id = 0
        }

        try {
            if (!nombre || !apellido || !rut || !nacimiento || !sexo || !prevision_id || !telefono || !correo || !direccion || !pais || !id_paciente) {
                return toast.error("Debe llenar todos los campos para proceder con la actualziacion")
            }

            const res = await fetch(`${API}/pacientes/pacientesActualizar`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                mode: "cors",
                body: JSON.stringify({
                    nombre,
                    apellido,
                    rut,
                    nacimiento,
                    sexo,
                    prevision_id,
                    telefono,
                    correo,
                    direccion,
                    pais,
                    id_paciente
                })
            })

            if (!res.ok) {
                return toast.error("Debe llenar todos los campos para proceder con la actualziacion")
            } else {
                const resultadoQuery = await res.json();
                if (resultadoQuery.message === true) {
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
                } else {
                    return toast.error("No se han podido Actualizar los datos del paciente. Intente mas tarde.")
                }
            }
        } catch (err) {
            console.log(err);
            return toast.error("Ha ocurrido un problema en el servidor")
        }
    }


    async function buscarPacientePorId(id_paciente) {
        try {
            if (!id_paciente) {
                return toast.error("No se puede cargar los datos del paciente seleccionado. Debe haber seleccionado el paciente para poder ver el detalle de los datos.");
            }
            const res = await fetch(`${API}/pacientes/pacientesEspecifico`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({id_paciente})
            })

            if (!res.ok) {
                return toast.error("No se puede cargar los datos del paciente seleccionado.");
            }

            const dataPaciente = await res.json();
            // Asegurar que siempre guardamos un array para poder mapear sin errores
            setDetallePaciente(Array.isArray(dataPaciente) ? dataPaciente : [dataPaciente]);

        } catch (error) {
            console.log(error);
            return toast.error("No se puede cargar los datos del paciente seleccionado. Por favor contacte a soporte de Medify");

        }
    }

    // Ejecutar la búsqueda cuando cambie id_paciente (Next puede resolver el param después del primer render)
    useEffect(() => {
        if (!id_paciente) return;
        buscarPacientePorId(id_paciente)
    }, [id_paciente]);


    function previsionDeterminacion(id_prevision) {
        let previsionString = null;

        if (id_prevision === 1) {
            previsionString = "FONASA"
        } else if (id_prevision === 2) {
            previsionString = "ISAPRE"
        } else {
            previsionString = "SIN DEFINIR"
        }
        return previsionString;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white py-10">
            <ToasterClient/>

            <div className="max-w-5xl mx-auto px-4">
                <header className="mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Historial Clínico</h1>
                            <p className="mt-1 text-sm text-slate-500">Detalle y fichas del paciente</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-3">
                                <span className="text-xs text-slate-500">Registros:</span>
                                <span
                                    className="inline-flex items-center px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-medium text-sm">{detallePaciente.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShadcnButton nombre={"Volver a Fichas Clinicas"} funcion={() => volverAFichas()}/>
                            </div>
                        </div>
                    </div>
                </header>

                {/* CONTENEDOR CON INFORMACION DEL PACIENTE */}
                <div className="mb-6">
                    {detallePaciente.length === 0 ? (
                        <div
                            className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">No
                            hay datos disponibles o se están cargando...</div>
                    ) : (
                        detallePaciente.map(paciente => (
                            <article key={paciente.id_paciente}
                                     className="bg-white rounded-2xl shadow-lg border border-sky-50 overflow-hidden">
                                <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="sm:col-span-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">{paciente.nombre} {paciente.apellido}</h2>
                                                <p className="mt-1 text-sm text-slate-500">RUT: <span
                                                    className="font-medium text-slate-700">{paciente.rut}</span></p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-800">{previsionDeterminacion(paciente.prevision_id)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-3 rounded-md">
                                                <p className="text-xs text-slate-500">Fecha de nacimiento</p>
                                                <p className="mt-1 font-medium text-slate-700">{formatearFecha(paciente.nacimiento)}</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-md">
                                                <p className="text-xs text-slate-500">Sexo</p>
                                                <p className="mt-1 font-medium text-slate-700">{paciente.sexo}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <div className="flex flex-col gap-3">
                                            <div className="text-sm bg-slate-50 p-3 rounded-md">
                                                <p className="text-xs text-slate-500">Teléfono</p>
                                                <p className="mt-1 font-medium text-slate-700">{paciente.telefono || '-'}</p>
                                            </div>
                                            <div className="text-sm bg-slate-50 p-3 rounded-md">
                                                <p className="text-xs text-slate-500">Correo</p>
                                                <p className="mt-1 font-medium text-slate-700 break-all">{paciente.correo || '-'}</p>
                                            </div>
                                            <div className="text-sm bg-slate-50 p-3 rounded-md">
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

                {/*BOTONES VER FICHAS Y NUEVA FICHA*/}
                <div className="mt-4 flex justify gap-4">
                    <ShadcnButton nombre={"Ver Fichas"} funcion={() => listarFichasClinicasPaciente(id_paciente)}/>

                    <ShadcnButton nombre={"Nueva Ficha"} funcion={() => nuevaFichaClinica(id_paciente)}/>


                </div>
                {/* Fichas Listado envuelto en contenedores div */}
                <section className="mt-8 grid grid-cols-1 gap-4">
                    {listaFichas.length === 0 ? (
                        <div className="text-center text-sm text-slate-500">No hay fichas cargadas para este
                            paciente.</div>
                    ) : (
                        listaFichas.map((ficha) => (
                            <article key={ficha.id_ficha}
                                     className="bg-white border border-sky-50 shadow-sm rounded-2xl p-5 sm:p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Ficha
                                            #{ficha.id_ficha}</h3>
                                        <p className="mt-1 text-sm text-slate-500">{formatearFecha(ficha.fechaConsulta)}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-500">Tipo:</span>
                                        <div
                                            className="mt-1 inline-flex items-center px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 text-sm font-medium">{ficha.tipoAtencion || '-'}</div>
                                    </div>
                                </div>


                                <div className="mt-4 grid grid-cols-1 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-slate-500">Anotacion General de Consulta</p>
                                            <p className="mt-1 text-sm text-slate-700">{ficha.anotacionConsulta || '-'}</p>
                                            <br/>
                                            <ShadcnButton nombre={"Editar"}/>
                                        </div>


                                    </div>


                                </div>
                            </article>
                        ))
                    )}
                </section>

            </div>

        </div>
    )
}