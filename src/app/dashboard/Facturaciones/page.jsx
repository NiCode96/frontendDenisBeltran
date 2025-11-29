"use client";
import { useState } from "react";

export default function Facturaciones(){
    const [formData, setFormData] = useState({
        monto: '',
        fecha: '',
        banco: '',
        comprobante: '',
        titular: '',
        rut: '',
        motivo: '',
        cuentaDestino: ''
    });

    const [mensaje, setMensaje] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para enviar los datos
        setMensaje('Pago registrado exitosamente');
        // Limpiar formulario
        setFormData({
            monto: '',
            fecha: '',
            banco: '',
            comprobante: '',
            titular: '',
            rut: '',
            motivo: '',
            cuentaDestino: ''
        });
    };

    return(
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Facturaciones y Ventas</h1>
                    <p className="text-gray-600">Gestiona los pagos y facturación de la clínica</p>
                </div>

                {/* Formulario de Ingreso de Pago */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Ingreso de Pago Manual</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Monto Pagado *
                                </label>
                                <input
                                    type="number"
                                    name="monto"
                                    value={formData.monto}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Ingrese el monto"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Transferencia *
                                </label>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Banco de Origen
                                </label>
                                <input
                                    type="text"
                                    name="banco"
                                    value={formData.banco}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Ej: Banco de Chile"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número de Comprobante
                                </label>
                                <input
                                    type="text"
                                    name="comprobante"
                                    value={formData.comprobante}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Número del comprobante"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Titular de la Cuenta
                                </label>
                                <input
                                    type="text"
                                    name="titular"
                                    value={formData.titular}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Nombre del titular"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    RUT / Identificación
                                </label>
                                <input
                                    type="text"
                                    name="rut"
                                    value={formData.rut}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="12.345.678-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Motivo del Pago
                            </label>
                            <textarea
                                name="motivo"
                                value={formData.motivo}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Descripción del motivo del pago"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cuenta de Destino
                            </label>
                            <select
                                name="cuentaDestino"
                                value={formData.cuentaDestino}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="">Seleccione cuenta de destino</option>
                                <option value="cuenta-principal">Cuenta Principal</option>
                                <option value="cuenta-consultas">Cuenta Consultas</option>
                                <option value="cuenta-tratamientos">Cuenta Tratamientos</option>
                            </select>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-md hover:from-slate-800 hover:to-slate-900 font-medium text-sm transition-all"
                            >
                                Registrar Pago
                            </button>
                        </div>

                        {mensaje && (
                            <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm">
                                {mensaje}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}