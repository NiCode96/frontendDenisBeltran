'use client';
import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AgendaHorarios() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horariosReservados, setHorariosReservados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // Horarios de trabajo (9:00 AM a 6:00 PM)
  const horariosBase = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    // Establecer fecha mínima como hoy
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split('T')[0];
    setFechaSeleccionada(fechaHoy);
    cargarHorarios(fechaHoy);
  }, []);

  const cargarHorarios = async (fecha) => {
    if (!fecha) return;

    setCargando(true);
    try {
      // Cargar horarios reservados desde localStorage y servidor
      const horariosGuardados = JSON.parse(localStorage.getItem('medify-reservas') || '{}');
      const reservasFecha = horariosGuardados[fecha] || [];

      // También intentar cargar desde el servidor
      try {
        const response = await fetch(`${API}/reservas?fecha=${fecha}`, {
          mode: 'cors'
        });
        if (response.ok) {
          const data = await response.json();
          // Combinar reservas locales con del servidor
          const todasLasReservas = [...reservasFecha, ...data.reservas].filter((v, i, a) => 
            a.findIndex(r => r.hora === v.hora) === i
          );
          setHorariosReservados(todasLasReservas);
        } else {
          setHorariosReservados(reservasFecha);
        }
      } catch (error) {
        console.log('Usando reservas locales:', error.message);
        setHorariosReservados(reservasFecha);
      }

      // Calcular horarios disponibles considerando la hora actual
      const ahora = new Date();
      const fechaHoy = ahora.toISOString().split('T')[0];
      const horaActual = ahora.getHours() * 100 + ahora.getMinutes();

      const disponibles = horariosBase.filter(hora => {
        const [horas, minutos] = hora.split(':').map(Number);
        const horarioEnNumero = horas * 100 + minutos;
        
        // Si es hoy, solo mostrar horarios futuros
        if (fecha === fechaHoy && horarioEnNumero <= horaActual) {
          return false;
        }
        
        // Verificar si no está reservado
        return !reservasFecha.some(reserva => reserva.hora === hora);
      });

      setHorariosDisponibles(disponibles);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setMensaje('Error cargando horarios');
    } finally {
      setCargando(false);
    }
  };

  const reservarHorario = async (hora) => {
    if (!fechaSeleccionada || !hora) return;

    setCargando(true);
    setMensaje('');

    try {
      const nuevaReserva = {
        fecha: fechaSeleccionada,
        hora: hora,
        timestamp: new Date().toISOString(),
        paciente: 'Reserva pendiente' // En una versión completa, esto vendría de un formulario
      };

      // Guardar en localStorage inmediatamente
      const horariosGuardados = JSON.parse(localStorage.getItem('medify-reservas') || '{}');
      if (!horariosGuardados[fechaSeleccionada]) {
        horariosGuardados[fechaSeleccionada] = [];
      }
      horariosGuardados[fechaSeleccionada].push(nuevaReserva);
      localStorage.setItem('medify-reservas', JSON.stringify(horariosGuardados));

      // Intentar guardar en el servidor
      try {
        const response = await fetch(`${API}/reservas`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nuevaReserva),
        });

        if (response.ok) {
          setMensaje(`✅ Horario ${hora} reservado correctamente para ${fechaSeleccionada}`);
        } else {
          setMensaje(`⚠️ Horario reservado localmente (servidor no disponible)`);
        }
      } catch (error) {
        setMensaje(`⚠️ Horario reservado localmente (error de conexión)`);
      }

      // Recargar horarios
      cargarHorarios(fechaSeleccionada);

    } catch (error) {
      console.error('Error reservando horario:', error);
      setMensaje('❌ Error al reservar horario');
    } finally {
      setCargando(false);
    }
  };

  const liberarHorario = async (hora) => {
    if (!fechaSeleccionada || !hora) return;

    setCargando(true);
    setMensaje('');

    try {
      // Eliminar de localStorage
      const horariosGuardados = JSON.parse(localStorage.getItem('medify-reservas') || '{}');
      if (horariosGuardados[fechaSeleccionada]) {
        horariosGuardados[fechaSeleccionada] = horariosGuardados[fechaSeleccionada]
          .filter(reserva => reserva.hora !== hora);
        localStorage.setItem('medify-reservas', JSON.stringify(horariosGuardados));
      }

      // Intentar eliminar del servidor
      try {
        const response = await fetch(`${API}/reservas`, {
          method: 'DELETE',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fecha: fechaSeleccionada, hora: hora }),
        });

        if (response.ok) {
          setMensaje(`✅ Horario ${hora} liberado correctamente`);
        } else {
          setMensaje(`⚠️ Horario liberado localmente (servidor no disponible)`);
        }
      } catch (error) {
        setMensaje(`⚠️ Horario liberado localmente (error de conexión)`);
      }

      // Recargar horarios
      cargarHorarios(fechaSeleccionada);

    } catch (error) {
      console.error('Error liberando horario:', error);
      setMensaje('❌ Error al liberar horario');
    } finally {
      setCargando(false);
    }
  };

  const cambiarFecha = (nuevaFecha) => {
    setFechaSeleccionada(nuevaFecha);
    cargarHorarios(nuevaFecha);
  };

  const obtenerFechaMinima = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarIcon className="h-6 w-6 text-rose-600" />
        <h2 className="text-xl font-semibold text-gray-900">Gestión de Horarios</h2>
      </div>

      {/* Selector de fecha */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar fecha
        </label>
        <input
          type="date"
          value={fechaSeleccionada}
          min={obtenerFechaMinima()}
          onChange={(e) => cambiarFecha(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
        />
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">{mensaje}</p>
        </div>
      )}

      {/* Horarios disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Horarios disponibles */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-green-600" />
            Horarios Disponibles
          </h3>
          
          {cargando ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
          ) : horariosDisponibles.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {horariosDisponibles.map((hora) => (
                <button
                  key={hora}
                  onClick={() => reservarHorario(hora)}
                  className="px-3 py-2 text-sm bg-green-100 text-green-800 border border-green-200 rounded-md hover:bg-green-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {hora}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay horarios disponibles para esta fecha</p>
          )}
        </div>

        {/* Horarios reservados */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-rose-600" />
            Horarios Reservados
          </h3>
          
          {horariosReservados.length > 0 ? (
            <div className="space-y-2">
              {horariosReservados.map((reserva, index) => (
                <div key={index} className="flex items-center justify-between px-3 py-2 bg-rose-100 text-rose-800 border border-rose-200 rounded-md">
                  <span className="text-sm font-medium">{reserva.hora}</span>
                  <button
                    onClick={() => liberarHorario(reserva.hora)}
                    className="text-xs px-2 py-1 bg-rose-200 hover:bg-rose-300 rounded transition-colors duration-200"
                  >
                    Liberar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay horarios reservados para esta fecha</p>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Información:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Los horarios pasados se ocultan automáticamente</li>
          <li>• Las reservas se guardan localmente y se sincronizan con el servidor</li>
          <li>• Los horarios van desde 9:00 AM hasta 6:00 PM</li>
          <li>• Cada sesión dura 30 minutos</li>
        </ul>
      </div>
    </div>
  );
}