"use client"
import {useEffect, useState} from "react";
import {toast, Toaster} from "react-hot-toast";
import {ShadcnButton} from "@/componentes/shadcnButton";
import {ShadcnInput} from "@/componentes/shadcnInput";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function PedidosCompra() {
    const [pedidos, setPedidos] = useState([]);
    const [comprador, setComprador] = useState("");

    const API = process.env.NEXT_PUBLIC_API_URL;

    const router = useRouter();


    function formatearFecha(fecha) {
        const date = new Date(fecha);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1);
        const day = String(date.getDate());
        return `${year}-${month}-${day}`;
    }


    async function filtrarSimilitudNombre(nombre_comprador) {
        try {
            const res = await fetch(`${API}/pedidos/seleccionarPorComprador`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({nombre_comprador}),
                cache: "no-cache",
            })

            if (!res.ok) {
                return toast.error('Debe indicar un nombre para realizar el filtro (NO APELLIDO)');
            } else {
                const dataFiltradoPorNombre = await res.json();
                setPedidos(dataFiltradoPorNombre);
                toast.success(`Se encontraron ${dataFiltradoPorNombre.length} pedido(s)`);
            }

        } catch (error) {
            console.log(error);
            return toast.error('Se ha Producido el siguiente error , contacte a soporte de NativeCode: ' + error);
        }
    }


    async function filtrarPorEstado(estado_pedido) {
        try {
            if (!estado_pedido) {
                return toast.error('Debe seleccionar una categoria para realizar el filtro');
            }
            const res = await fetch(`${API}/pedidos/seleccionarPorEstados`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({estado_pedido}),
                mode: "cors"
            })
            if (!res.ok) {
                return toast.error('Se ha Producido el siguiente error , contacte a soporte de NativeCode');
            } else {
                const dataPedidosFiltrados = await res.json();
                setPedidos(dataPedidosFiltrados);
            }
        } catch (error) {
            console.log(error);
            return toast.error('Se ha Producido el siguiente error , contacte a soporte de NativeCode: ' + error);
        }
    }

    async function listarPedidos() {
        try {
            const resultado = await fetch(`${API}/pedidos/seleccionarPedidos`, {
                method: "GET",
                headers: {Accept: "application/json"},
                mode: "cors"
            });
            if (!resultado.ok) {
                return toast.error('Ha ocurrido un problema al listar los pedidos contacte a soporte de Medify')
            } else {
                const data = await resultado.json();
                setPedidos(data);
            }
        } catch (error) {
            console.log(error);
            return toast.error('Se ha Producido el siguiente error , contacte a soporte de NativeCode: ' + error);
        }
    }

    useEffect(() => {
        listarPedidos();
    }, [])

    return (
        <div className="mt-10">
            <Toaster position="top-center"/>
            <div className="px-4 sm:px-6 lg:px-8">
                <div
                    className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="w-full sm:max-w-xl">

                        <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
                            Gestión de Pagos
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gestiona y revisa el estado de los pagos de tus agendamientos.
                        </p>

                        <div className="mt-4">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                                Buscar estado de pago por nombre
                            </p>
                            <div
                                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                                <ShadcnInput
                                    value={comprador}
                                    onChange={e => setComprador(e.target.value)}
                                    placeholder={"Busca por similitud en nombres"}
                                    className="flex-1 border-none bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                <ShadcnButton
                                    nombre={"Buscar Pedido"}
                                    funcion={() => filtrarSimilitudNombre(comprador)}
                                />
                            </div>
                            <p className="mt-1 text-[11px] text-gray-400">
                                IMPORTANTE: Escribe solo el nombre del paciente, sin apellidos.
                            </p>
                        </div>
                    </div>

                    <div className="mt-2 w-full sm:mt-0 sm:w-auto">
                        <div
                            className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
                            <ShadcnButton funcion={() => listarPedidos()} nombre={'Total Agendamientos'}></ShadcnButton>
                            <ShadcnButton funcion={() => filtrarPorEstado(1)} nombre={'Pago Realizado'}></ShadcnButton>
                            <ShadcnButton funcion={() => filtrarPorEstado(2)}
                                          nombre={'Citas Confirmadas'}></ShadcnButton>
                            <ShadcnButton funcion={() => filtrarPorEstado(3)}
                                          nombre={'Citas Completadas'}></ShadcnButton>
                            <ShadcnButton funcion={() => filtrarPorEstado(4)} nombre={'Citas Anuladas'}></ShadcnButton>
                            <ShadcnButton funcion={() => filtrarPorEstado("0")}
                                          nombre={'Pendientes Pagos'}></ShadcnButton>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                >
                                    N° Transaccion
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                >
                                    Fecha
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                >
                                    Paciente
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                >
                                    Total pagado
                                </th>
                                <th
                                    scope="col"
                                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                                >
                                    Estado del pago
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                            {pedidos.map((pedido) => (
                                <tr
                                    key={pedido.id_pedido}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                        #{pedido.id_pedido}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                        {formatearFecha(pedido.fecha_pedido)}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                        <Link href={`/dashboard/pedidosDetalle?id=${pedido.id_pedido}`}>

                                            {pedido.nombre_comprador + ' ' + pedido.apellidosComprador}
                                        </Link>
                                    </td>


                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                                        ${" "}{pedido.totalPagado}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm ">
                                         <span className={

                                             pedido.estado_pedido === 1 ? "text-blue-600 bg-blue-50 rounded-lg p-2 font-bold w-24 text-center "
                                                 : pedido.estado_pedido === 2 ? "text-amber-600 bg-yellow-200 rounded-lg p-2 font-bold w-24 text-center"
                                                     : pedido.estado_pedido === 3 ? "text-green-800  bg-green-200  rounded-lg p-2 font-bold w-24 text-center"
                                                         : pedido.estado_pedido === 0 ? "text-red-600 bg-red-200 rounded-lg p-2 font-bold w-24 text-center"

                                                             : "text-gray-800 bg-gray-200 rounded-lg p-2 font-bold w-24 text-center"}


                                         >
                                             {pedido.estado_pedido === 1 ? "Pago Realizado"
                                                 : pedido.estado_pedido === 2 ? "Cita Confirmada"
                                                     : pedido.estado_pedido === 3 ? "Cita Completada"
                                                         : pedido.estado_pedido === 0 ? "Pago Pendiente"
                                                             : "Anulado"}
                                         </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}