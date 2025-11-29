"use client";
import { useState } from "react";
import { UserPlusIcon, UserIcon } from "@heroicons/react/24/outline";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function FormularIngresoCliente() {
  const [nombre, setnombre] = useState("");
  const [apellido, setapellido] = useState("");
  const [rut, setrut] = useState("");
  const [nacimiento, setnacimiento] = useState("");
  const [sexo, setsexo] = useState("");
  const [prevision_id, setprevision_id] = useState("");
  const [telefono, settelefono] = useState("");
  const [correo, setcorreo] = useState("");
  const [direccion, setdireccion] = useState("");
  const [pais, setpais] = useState("");
  const [mensaje, setmensaje] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmitInsert(evento) {
    try {
      evento.preventDefault();
      setIsSubmitting(true);
      const res = await fetch(`${API}/pacientes/pacientesInsercion`, {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json" },
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
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setmensaje("Nuevo Paciente Ingresado Correctamente");
        setnombre("");
        setapellido("");
        setrut("");
        setnacimiento("");
        setsexo("");
        setprevision_id("");
        settelefono("");
        setcorreo("");
        setdireccion("");
        setpais("");
      } else {
        setmensaje(
          "Nuevo Paciente NO se pudo ingresar / Contacte a Soporte IT"
        );
      }
    } catch (error) {
      console.error(error);
      setmensaje("Ocurrió un error inesperado. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          
          {/* Header profesional */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/10 rounded-full">
                  <UserPlusIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white">Registro de Paciente</h1>
              <p className="text-slate-200 mt-2">Ingreso de nuevos pacientes al sistema</p>
            </div>
          </div>

          {/* Formulario profesional */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <UserIcon className="h-5 w-5 text-slate-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Datos del Paciente</h2>
            </div>

            <form onSubmit={handleSubmitInsert} className="space-y-6">
              {/* Grid de campos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nombre">
                    Nombre *
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="Ej: Juan"
                    value={nombre}
                    onChange={(evento) => setnombre(evento.target.value.toUpperCase())}
                    required
                  />
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="apellido">
                    Apellido *
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    type="text"
                    name="apellido"
                    id="apellido"
                    placeholder="Ej: Pérez"
                    value={apellido}
                    onChange={(evento) => setapellido(evento.target.value.toUpperCase())}
                    required
                  />
                </div>

                {/* RUT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rut">
                    RUT *
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    type="text"
                    name="rut"
                    id="rut"
                    placeholder="Ej: 12.345.678-9"
                    value={rut}
                    onChange={(evento) => setrut(evento.target.value)}
                    required
                  />
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nacimiento">
                    Fecha de Nacimiento
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    type="date"
                    name="nacimiento"
                    id="nacimiento"
                    value={nacimiento}
                    onChange={(evento) => setnacimiento(evento.target.value)}
                  />
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sexo">
                    Sexo *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    name="sexo"
                    id="sexo"
                    value={sexo}
                    onChange={(evento) => setsexo(evento.target.value)}
                    required
                  >
                    <option value="">Selecciona...</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                {/* Previsión */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="prevision_id">
                    Previsión *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    name="prevision_id"
                    id="prevision_id"
                    value={prevision_id}
                    onChange={(evento) => setprevision_id(parseInt(evento.target.value) || "")}
                    required
                  >
                    <option value="">Selecciona...</option>
                    <option value="1">Fonasa</option>
                    <option value="2">Isapre</option>
                    <option value="3">Otro</option>
                  </select>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="telefono">
                    Teléfono
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    type="tel"
                    name="telefono"
                    id="telefono"
                    placeholder="Ej: +56 9 2344 3315"
                    value={telefono}
                    onChange={(evento) => settelefono(evento.target.value)}
                  />
                </div>

                {/* Correo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="correo">
                    Correo Electrónico
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    type="email"
                    name="correo"
                    id="correo"
                    placeholder="Ej: juan.perez@gmail.com"
                    value={correo}
                    onChange={(evento) => setcorreo(evento.target.value)}
                  />
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="direccion">
                    Dirección
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    type="text"
                    name="direccion"
                    id="direccion"
                  placeholder="Ej: Avenida Siempre Viva 123"
                  value={direccion} // <- estado de useState
                  onChange={(evento) => setdireccion(evento.target.value)} // <- actualiza el estado
                />
              </div>

                {/* País */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="pais">
                    País
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    type="text"
                    name="pais"
                    id="pais"
                    placeholder="Ej: Chile"
                    value={pais}
                    onChange={(evento) => setpais(evento.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <div className="flex justify-end pt-4">
                <button
                  className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-md hover:from-slate-800 hover:to-slate-900 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Paciente'}
                </button>
              </div>

              {/* Mensaje de estado */}
              {mensaje && (
                <div className={`p-3 rounded-md text-sm ${
                  mensaje.includes('Correctamente') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {mensaje}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
