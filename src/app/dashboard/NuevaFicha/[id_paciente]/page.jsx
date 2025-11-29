"use client"

import {useParams} from "next/navigation";
import {useState, useEffect} from "react";
import {toast} from "react-hot-toast";
import {ShadcnSelect} from "@/componentes/shadcnSelect";
import {Textarea} from "@/components/ui/textarea";
import ShadcnDatePicker from "@/componentes/shadcnDatePicker";
import ToasterClient from "@/componentes/ToasterClient";
import Link from "next/link";

// FUNCION PRINCIPAL DEL COMPONENTE
export default function NuevaFicha() {

    // ESTADOS DE REACT QUE MANJEAN LA INFROMACION DEL PACINETE Y TRAEN LA DATA USADO EL ID DE LA PAGINA DE ORIGEN
    const {id_paciente} = useParams();
    const [dataPaciente, setDataPaciente] = useState([]);
    const API = process.env.NEXT_PUBLIC_API_URL;


    //ESTADOS REACT PARA LA INSERCION DE NUEVA FICHA
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
    const [consentimientoFirmado, setConsentimientoFirmado] = useState("");


    //FUNCION PARA LA INSERCION DE NUEVA FICHA CLINICA

    async function insertarFicha(
        id_paciente,
        tipoAtencion,
        motivoConsulta,
        signosVitales,
        observaciones,
        anotacionConsulta,
        anamnesis,
        diagnostico,
        indicaciones,
        archivosAdjuntos,
        fechaConsulta,
        consentimientoFirmado
    ) {
        try {
            if (!id_paciente) {
                return toast.error('Debe seleccionar un paciente para ingresar una nueva ficha.')
            } else {
                const res = await fetch(`${API}/ficha/insertarFichaClinica`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_paciente,
                        tipoAtencion,
                        motivoConsulta,
                        signosVitales,
                        observaciones,
                        anotacionConsulta,
                        anamnesis,
                        diagnostico,
                        indicaciones,
                        archivosAdjuntos,
                        fechaConsulta,
                        consentimientoFirmado
                    }),
                    mode: "cors"
                })

                if (!res.ok) {
                    return toast.error("Ha ocurrido un error en el servidor, Contacte a soporte tecnico de Medify");
                }

                const respuestaQuery = await res.json();
                if (respuestaQuery.message === true) {
                    setConsentimientoFirmado("");
                    setArchivosAdjuntos("");
                    setIndicaciones("");
                    setDiagnostico("");
                    setAnamnesis(" ");
                    setAnotacionConsulta(" ");
                    setObservaciones(" ");
                    setSignosVitales(" ");
                    setMotivoConsulta(" ");
                    setTipoAtencion(" ");
                    return toast.success("Nueva ficha ingresada con Exito!");


                } else if (respuestaQuery.message === false) {
                    return toast.error("Faltan datos para ingresar la nueva ficha.");
                } else {
                    return toast.error("Faltan datos para ingresar la nueva ficha.");
                }
            }
        } catch (error) {
            console.log(error);
            return toast.error("Ha ocurrido un error en el servidor, Contacte a soporte tecnico de Medify");
        }

    }


    //FUNCION PARA TRAER AL PACIENTE ESPECIFICO POR ID
    async function buscarPacientePorId(id_paciente) {
        try {
            if (!id_paciente) {
                return toast.error(
                    "No se puede cargar los datos del paciente seleccionado. Debe haber seleccionado el paciente para poder ver el detalle de los datos."
                );
            }

            const res = await fetch(`${API}/pacientes/pacientesEspecifico`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({id_paciente}),
            });

            if (!res.ok) {
                return toast.error("No se puede cargar los datos del paciente seleccionado.");
            }

            const data = await res.json();
            setDataPaciente(Array.isArray(data) ? data : [data]);
        } catch (error) {
            console.log(error);
            return toast.error(
                "No se puede cargar los datos del paciente seleccionado. Por favor contacte a soporte de Medify"
            );
        }
    }

    useEffect(() => {
        if (!id_paciente) return;
        buscarPacientePorId(id_paciente);
    }, [id_paciente]);


    //FUNCION PARA CAMBIAR EL ESTADO DE TIPO DE ATENCION USANDO EL SELECT DE SHADCN
    function cambiarTipoAtencion(valorSeleccionado) {
        setTipoAtencion(valorSeleccionado);
    }


    //INICIO DEL COMPONENTE REACT UI
    return (
        <div className="min-h-screen py-10 bg-gradient-to-b from-slate-50 to-white">
            <ToasterClient/>
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-sky-600 to-cyan-400 bg-clip-text text-transparent mb-6">
                    Ingreso de Ficha Clínica
                </h1>

                <div
                    className="border border-sky-100 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden ring-1 ring-sky-50">
                    {dataPaciente.map((paciente) => (
                        <div
                            key={paciente.id_paciente}
                            className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start transition-colors rounded-lg"
                        >
                            <div className="md:col-span-2">
                                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                                    Datos del Paciente
                                </h2>
                                <div className="space-y-3 text-slate-700">
                                    <p className="flex items-center text-sm">
                                        <span className="font-semibold text-sky-600">Nombre paciente:</span>
                                        <span className="text-slate-700 ml-2">{paciente.nombre}</span>
                                    </p>
                                    <p className="flex items-center text-sm">
                                        <span className="font-semibold text-sky-600">Apellido paciente:</span>
                                        <span className="text-slate-700 ml-2">{paciente.apellido}</span>
                                    </p>
                                    <p className="flex items-center text-sm">
                                        <span className="font-semibold text-sky-600">RUT paciente:</span>
                                        <span className="text-slate-700 ml-2">{paciente.rut}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-1 flex flex-col gap-3 items-stretch">
                                <div
                                    className="px-4 py-4 bg-gradient-to-br from-sky-50 to-white border border-sky-100 rounded-lg text-center shadow-sm">
                                    <span className="text-xs text-sky-700 font-medium">ID Paciente</span>
                                    <div className="text-sm font-semibold text-slate-800">#{paciente.id_paciente}</div>
                                </div>
                                <div
                                    className="px-4 py-4 bg-white border border-slate-100 rounded-lg text-center shadow-sm">
                                    <span className="text-xs text-slate-500">Registro</span>
                                    <div className="text-sm text-slate-700">{paciente.fecha || "-"}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/*FICHA CLINICA ANOTACIONES GENERALES*/}

            <div className="max-w-4xl mx-auto px-4 mt-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-end items-center">
                    <Link href={"/dashboard/FichaClinica"} className="w-full sm:w-auto">
                        <button
                            className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-sky-200 text-sky-700 rounded-xl font-semibold hover:bg-sky-50 hover:border-sky-400 transition-all duration-200 shadow-sm flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Volver a Listado
                        </button>
                    </Link>

                    <button
                        onClick={() => insertarFicha(
                            id_paciente,
                            tipoAtencion,
                            motivoConsulta,
                            signosVitales,
                            observaciones,
                            anotacionConsulta,
                            anamnesis,
                            diagnostico,
                            indicaciones,
                            archivosAdjuntos,
                            fechaConsulta,
                            consentimientoFirmado
                        )}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-600 to-cyan-500 text-white rounded-xl font-semibold hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Ingresar Ficha
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-10">
                <div className="bg-white/90 border border-sky-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        <ShadcnDatePicker
                            className="border-blue-600"
                            label="Fecha Consulta"
                            value={fechaConsulta}
                            onChange={(fecha) => setFechaConsulta(fecha)}/>

                        <br/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">

                            <div>
                                <h3 className="text-sm font-semibold text-sky-600">Tipo Atención</h3>
                                <p className="text-xs text-slate-500 mb-2">Selecciona el tipo de consulta</p>

                            </div>

                            <div>
                                <ShadcnSelect value1={"PSICOLOGIA GENERAL"}
                                              nombreDefault={"Seleccione"}
                                              onChange={cambiarTipoAtencion}
                                />
                            </div>
                        </div>

                        <div className="border-t border-sky-50 mt-4 pt-4">
                            <h3 className="text-sm font-semibold text-sky-600 mb-3">Anotaciones Consulta</h3>
                            <Textarea className="min-h-[100px] resize-none border-blue-600"
                                      value={anotacionConsulta}
                                      onChange={(e) => setAnotacionConsulta(e.target.value)}
                                      placeholder="Escribe las anotaciones de la consulta..."/>
                        </div>
                    </div>
                </div>
            </div>


            {/*
            <div className="max-w-4xl mx-auto px-4 mt-10 mb-10">
                <div className="bg-white/90 border border-sky-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-sky-600 mb-6">Detalle Ficha</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-sky-600 mb-2">Motivo de
                                    Consulta</label>
                                <Textarea className="min-h-[100px] resize-none" placeholder="Describe el motivo..."
                                          value={motivoConsulta}
                                          onChange={(e) => setMotivoConsulta(e.target.value)}/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sky-600 mb-2">Signos Vitales</label>
                                <Textarea className="min-h-[100px] resize-none"
                                          placeholder="Registra los signos vitales..."
                                          value={signosVitales}
                                          onChange={(e) => setSignosVitales(e.target.value)}/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sky-600 mb-2">Observaciones</label>
                                <Textarea className="min-h-[100px] resize-none"
                                          placeholder="Escribe tus observaciones..."
                                          value={observaciones}
                                          onChange={(e) => setObservaciones(e.target.value)}/>
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-sky-600 mb-2">Anamnesis</label>
                                <Textarea className="min-h-[100px] resize-none" placeholder="Detalla la anamnesis..."
                                          value={anamnesis}
                                          onChange={(e) => setAnamnesis(e.target.value)}/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sky-600 mb-2">Diagnóstico</label>
                                <Textarea className="min-h-[100px] resize-none"
                                          placeholder="Establece el diagnóstico..."
                                          value={diagnostico}
                                          onChange={(e) => setDiagnostico(e.target.value)}/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sky-600 mb-2">Indicaciones</label>
                                <Textarea className="min-h-[100px] resize-none"
                                          placeholder="Proporciona indicaciones..."
                                          value={indicaciones}
                                          onChange={(e) => setIndicaciones(e.target.value)}/>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                                                        <div>
                                <label className="block text-sm font-medium text-sky-600 mb-2">Consentimiento
                                    Informado</label>
                                <div
                                    className="rounded-lg border-2 border-dashed border-sky-200 bg-sky-50/30 p-4 hover:border-sky-300 transition-colors">
                                    <Input type="file"
                                           className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                                           value={consentimientoFirmado}
                                           onChange={(e) => setConsentimientoFirmado(e.target.value)}/>
                                </div>
                            </div>




                                                        <div>
                                <label className="block text-sm font-medium text-sky-600 mb-2">Archivos Del
                                    Paciente</label>
                                <div
                                    className="rounded-lg border-2 border-dashed border-sky-200 bg-sky-50/30 p-4 hover:border-sky-300 transition-colors">
                                    <Input type="file"
                                           className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                                           value={archivosAdjuntos}
                                           onChange={(e) => setArchivosAdjuntos(e.target.value)}/>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
                             */}
        </div>
    );
}

