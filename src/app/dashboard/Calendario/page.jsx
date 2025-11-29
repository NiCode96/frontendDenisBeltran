'use client';
import React, {useState, useEffect} from 'react';
import {
    HORARIOS_PROFESIONAL,
    DURACION_CITA,
    esDiaBloqueado,
    esFechaBloqueada,
    obtenerVentanasHorarias,
    generarSlotsHorarios,
    horaAMinutos,
    minutosAHora,
    nombreDiaSemana
} from '@/config/horariosConfig';

// Base de la API configurable por entorno (dev/prod)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * PÁGINA FRONTEND (Next.js) — SIN CÓDIGO DE EXPRESS
 * ESTILOS CON TAILWIND (EN MAYÚSCULAS LOS BLOQUES PRINCIPALES)
 */

// Convierte "YYYY-MM-DDTHH:MM" (input local) a ISO con zona
function toISOWithOffset(localValue) {
    if (!localValue) return '';
    const [datePart, timePart] = localValue.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const d = new Date(year, month - 1, day, hour, minute, 0, 0);
    const offsetMin = d.getTimezoneOffset();
    const sign = offsetMin > 0 ? '-' : '+';
    const abs = Math.abs(offsetMin);
    const offH = String(Math.floor(abs / 60)).padStart(2, '0');
    const offM = String(abs % 60).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const MM = String(d.getMinutes()).padStart(2, '0');
    const SS = '00';
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}${sign}${offH}:${offM}`;
}

// Formato tradicional dd/mm/yyyy HH:MM con información adicional
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    // Obtener el nombre del día
    const dayName = d.toLocaleDateString('es-CL', {weekday: 'long'});

    return `${dayName}, ${day}/${month}/${year} ${hours}:${minutes}`;
}

// Función para formatear solo la hora
function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export default function CalendarioPage() {
    const now = new Date();
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);

    const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
    ).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const defaultEnd = `${in1h.getFullYear()}-${String(in1h.getMonth() + 1).padStart(2, '0')}-${String(
        in1h.getDate()
    ).padStart(2, '0')}T${String(in1h.getHours()).padStart(2, '0')}:${String(in1h.getMinutes()).padStart(2, '0')}`;

    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState(defaultStart);
    const [end, setEnd] = useState(defaultEnd);
    const [location, setLocation] = useState('Valdivia');
    const [attendee, setAttendee] = useState('');
    const [rutPaciente, setRutPaciente] = useState(''); // Nuevo campo para RUT
    const [telefonoPaciente, setTelefonoPaciente] = useState(''); // Nuevo campo para teléfono
    const [msg, setMsg] = useState('');
    const [eventLink, setEventLink] = useState('');
    const [loading, setLoading] = useState(false); // Loading para crear eventos
    const [loadingHoy, setLoadingHoy] = useState(false); // Loading específico para citas de hoy
    const [loadingProximos, setLoadingProximos] = useState(false); // Loading específico para próximas citas
    const [list, setList] = useState([]);
    const [eventosAnulados, setEventosAnulados] = useState(new Set()); // Para rastrear eventos anulados
    const [ordenamiento, setOrdenamiento] = useState('mas-recientes'); // 'mas-recientes' | 'mas-antiguas'
    const [alertaDisponibilidad, setAlertaDisponibilidad] = useState(null); // Para mostrar alertas de horario

    // Estados para el selector visual mejorado
    const [modoSelector, setModoSelector] = useState('visual'); // 'visual' | 'manual'
    const [vistaCalendario, setVistaCalendario] = useState('mensual'); // 'mensual' | 'semanal' | 'diaria'
    const [fechaSeleccionada, setFechaSeleccionada] = useState(() => new Date());
    const [mesActual, setMesActual] = useState(() => new Date());
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
    const [cargandoHorarios, setCargandoHorarios] = useState(false);
    const [reservasPorFecha, setReservasPorFecha] = useState({}); // {fecha: [horas]}

    // FUNCIÓN PARA ORDENAR CITAS
    function ordenarCitas(items, tipoOrden = 'mas-recientes') {
        return [...items].sort((a, b) => {
            const fechaA = new Date(a.start?.dateTime || a.start?.date);
            const fechaB = new Date(b.start?.dateTime || b.start?.date);

            if (tipoOrden === 'mas-recientes') {
                return fechaB - fechaA;
            } else {
                return fechaA - fechaB;
            }
        });
    }

    // FUNCIONES AUXILIARES PARA EL SELECTOR VISUAL
    // Usar configuración centralizada para consistencia con vista pública
    function generarHorarios45Min(fecha = new Date()) {
        const diaSemana = fecha.getDay();
        // Usar la función centralizada que respeta los horarios profesionales
        return generarSlotsHorarios(diaSemana, []);
    }

    function formatearFecha(fecha) {
        return fecha.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function obtenerProximosDias(cantidad = 14) {
        const dias = [];
        const hoy = new Date();
        for (let i = 0; i < cantidad; i++) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() + i);
            // Saltar domingos (día 0)
            if (fecha.getDay() !== 0) {
                dias.push(fecha);
            }
        }
        return dias;
    }

    // GENERAR MATRIZ DE DÍAS DEL MES (para vista mensual)
    function generarDiasMes(mes) {
        const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
        const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);

        // Días del mes anterior para completar la primera semana
        const diasPrevios = [];
        let diaSemana = primerDia.getDay();
        diaSemana = diaSemana === 0 ? 6 : diaSemana - 1; // Lunes = 0

        for (let i = diaSemana - 1; i >= 0; i--) {
            const dia = new Date(primerDia);
            dia.setDate(dia.getDate() - i - 1);
            diasPrevios.push(dia);
        }

        // Días del mes actual
        const diasMes = [];
        for (let d = 1; d <= ultimoDia.getDate(); d++) {
            diasMes.push(new Date(mes.getFullYear(), mes.getMonth(), d));
        }

        // Días del siguiente mes para completar la última semana
        const diasSiguientes = [];
        const totalDias = diasPrevios.length + diasMes.length;
        const diasFaltantes = 42 - totalDias; // 6 semanas completas

        for (let i = 1; i <= diasFaltantes; i++) {
            const dia = new Date(ultimoDia);
            dia.setDate(dia.getDate() + i);
            diasSiguientes.push(dia);
        }

        return [...diasPrevios, ...diasMes, ...diasSiguientes];
    }

    // OBTENER DÍAS DE LA SEMANA ACTUAL
    function obtenerDiasSemana(fecha) {
        const dias = [];
        const diaSemana = fecha.getDay();
        const diff = diaSemana === 0 ? -6 : 1 - diaSemana; // Lunes como inicio

        for (let i = 0; i < 7; i++) {
            const dia = new Date(fecha);
            dia.setDate(fecha.getDate() + diff + i);
            dias.push(dia);
        }

        return dias;
    }

    // VERIFICAR SI UNA FECHA TIENE RESERVAS
    function tieneReservas(fecha) {
        const fechaStr = fecha.toISOString().split('T')[0];
        return reservasPorFecha[fechaStr] && reservasPorFecha[fechaStr].length > 0;
    }

    // CONTAR RESERVAS EN UNA FECHA
    function contarReservas(fecha) {
        const fechaStr = fecha.toISOString().split('T')[0];
        return (reservasPorFecha[fechaStr] || []).length;
    }

    // VERIFICAR SI ES HOY
    function esHoy(fecha) {
        const hoy = new Date();
        return fecha.toDateString() === hoy.toDateString();
    }

    // VERIFICAR SI ES LA FECHA SELECCIONADA
    function esFechaSeleccionada(fecha) {
        return fecha.toDateString() === fechaSeleccionada.toDateString();
    }

    // VERIFICAR SI LA FECHA ES PASADA
    function esFechaPasada(fecha) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaComparar = new Date(fecha);
        fechaComparar.setHours(0, 0, 0, 0);
        return fechaComparar < hoy;
    }

    // VERIFICAR SI LA FECHA ESTÁ BLOQUEADA (usa configuración centralizada)
    function esFechaBloqueadaLocal(fecha) {
        return esFechaBloqueada(fecha);
    }

    // CARGAR HORARIOS DISPONIBLES PARA UNA FECHA
    async function cargarHorariosDisponibles(fecha) {
        setCargandoHorarios(true);
        try {
            const diaSemana = fecha.getDay();

            // Verificar si el día está bloqueado
            if (esDiaBloqueado(diaSemana)) {
                console.log(`📅 Día ${nombreDiaSemana(diaSemana)} está bloqueado`);
                setHorariosDisponibles([]);
                setCargandoHorarios(false);
                return;
            }

            // Consultar horarios ocupados desde el backend
            const fechaStr = fecha.toISOString().split('T')[0];
            const res = await fetch(`${API}/reservas/horarios-ocupados/${fechaStr}`);

            let horariosOcupados = [];
            if (res.ok) {
                const data = await res.json();
                horariosOcupados = data.horariosOcupados || [];
                console.log(`📅 Horarios ocupados para ${fechaStr}:`, horariosOcupados);

                // Actualizar el mapa de reservas por fecha
                setReservasPorFecha(prev => ({
                    ...prev,
                    [fechaStr]: horariosOcupados
                }));
            }

            // Generar slots con horarios ocupados marcados
            const horarios = generarSlotsHorarios(diaSemana, horariosOcupados);
            setHorariosDisponibles(horarios);

        } catch (error) {
            console.error('Error cargando horarios:', error);
            const diaSemana = fecha.getDay();
            const horarios = generarSlotsHorarios(diaSemana, []);
            setHorariosDisponibles(horarios);
        } finally {
            setCargandoHorarios(false);
        }
    }

    // SELECCIONAR HORARIO Y ACTUALIZAR FORMULARIO
    function seleccionarHorario(horario) {
        setHorarioSeleccionado(horario);

        // Actualizar campos del formulario
        const fechaStr = fechaSeleccionada.toISOString().split('T')[0];
        const inicioDateTime = `${fechaStr}T${horario.inicio}`;
        const finDateTime = `${fechaStr}T${horario.fin}`;

        setStart(inicioDateTime);
        setEnd(finDateTime);

        // Verificar disponibilidad automáticamente
        setTimeout(() => {
            verificarDisponibilidadAutomatica(inicioDateTime, finDateTime);
        }, 500);
    }

    // CARGAR HORARIOS CUANDO CAMBIE LA FECHA SELECCIONADA
    useEffect(() => {
        if (modoSelector === 'visual') {
            cargarHorariosDisponibles(fechaSeleccionada);
        }
    }, [fechaSeleccionada, modoSelector]);

    // CARGAR RESERVAS DEL MES CUANDO CAMBIE EL MES ACTUAL
    useEffect(() => {
        async function cargarReservasMes() {
            try {
                const dias = generarDiasMes(mesActual);

                // Cargar reservas para cada día del mes visible
                for (const dia of dias) {
                    const fechaStr = dia.toISOString().split('T')[0];

                    // Solo cargar si no tenemos datos ya
                    if (!reservasPorFecha[fechaStr]) {
                        try {
                            const res = await fetch(`${API}/reservas/horarios-ocupados/${fechaStr}`);
                            if (res.ok) {
                                const data = await res.json();
                                const horariosOcupados = data.horariosOcupados || [];

                                setReservasPorFecha(prev => ({
                                    ...prev,
                                    [fechaStr]: horariosOcupados
                                }));
                            }
                        } catch (error) {
                            console.error(`Error cargando reservas para ${fechaStr}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error('Error cargando reservas del mes:', error);
            }
        }

        if (vistaCalendario === 'mensual') {
            cargarReservasMes();
        }
    }, [mesActual, vistaCalendario]);

    // CAMBIAR ORDENAMIENTO Y REORDENAR LISTA ACTUAL
    function cambiarOrdenamiento(nuevoOrden) {
        setOrdenamiento(nuevoOrden);
        if (list.length > 0) {
            const listaReordenada = ordenarCitas(list, nuevoOrden);
            setList(listaReordenada);
            console.log(`Lista reordenada: ${nuevoOrden === 'mas-recientes' ? 'más actuales primero' : 'más antiguas primero'}`);
        }
    }

    // FUNCIÓN PARA VERIFICAR AUTOMÁTICAMENTE AL CAMBIAR FECHAS
    async function verificarDisponibilidadAutomatica(fechaInicio, fechaFin) {
        if (!fechaInicio || !fechaFin) {
            setAlertaDisponibilidad(null);
            return;
        }

        // Verificar que la fecha de fin sea posterior a la de inicio
        if (new Date(fechaInicio) >= new Date(fechaFin)) {
            setAlertaDisponibilidad({
                tipo: 'error',
                mensaje: 'La hora de fin debe ser posterior a la hora de inicio'
            });
            return;
        }

        try {
            const disponibilidad = await verificarDisponibilidad(fechaInicio, fechaFin);

            if (!disponibilidad.disponible && disponibilidad.conflictos.length > 0) {
                const conflicto = disponibilidad.conflictos[0];
                const fechaConflicto = formatDate(conflicto.start?.dateTime || conflicto.start?.date);

                setAlertaDisponibilidad({
                    tipo: 'conflicto',
                    mensaje: `Conflicto detectado: "${conflicto.summary || 'Sin título'}" el ${fechaConflicto}`,
                    conflictos: disponibilidad.conflictos
                });
            } else {
                setAlertaDisponibilidad({
                    tipo: 'disponible',
                    mensaje: 'Horario disponible'
                });
            }
        } catch (error) {
            console.error('Error en verificación automática:', error);
            setAlertaDisponibilidad(null);
        }
    }

    // FUNCIÓN PARA VERIFICAR DISPONIBILIDAD DE HORARIO
    async function verificarDisponibilidad(fechaInicio, fechaFin) {
        try {
            setMsg('Verificando disponibilidad...');

            // Validar que tenemos las fechas
            if (!fechaInicio || !fechaFin) {
                console.warn('⚠️ Fechas inválidas para verificar disponibilidad');
                setMsg('');
                return {
                    disponible: true,
                    conflictos: [],
                    message: 'Fechas inválidas'
                };
            }

            // Convertir fechas a ISO
            const startISO = toISOWithOffset(fechaInicio);
            const endISO = toISOWithOffset(fechaFin);

            console.log('🔍 Verificando disponibilidad:', {
                fechaInicio,
                fechaFin,
                startISO,
                endISO,
                endpoint: `${API}/calendar/events/check-availability`
            });

            // Verificar en Google Calendar con timeout y retry
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

            const res = await fetch(`${API}/calendar/events/check-availability`, {
                method: 'POST',
                mode: 'cors',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    start: startISO,
                    end: endISO
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('❌ Error HTTP al verificar disponibilidad:', {
                    status: res.status,
                    statusText: res.statusText,
                    error: errorData
                });

                setMsg('');
                return {
                    disponible: true, // En caso de error, permitir continuar
                    conflictos: [],
                    message: errorData.error || 'Error al verificar disponibilidad'
                };
            }

            const data = await res.json();
            console.log('✅ Respuesta del servidor:', data);

            setMsg(''); // Limpiar mensaje de verificación

            // El backend puede responder con { ok, disponible, conflictos, message }
            return {
                disponible: data.disponible !== false, // Por defecto true si no viene
                conflictos: data.conflictos || [],
                message: data.message || ''
            };
        } catch (error) {
            console.error('Error al verificar disponibilidad:', {
                mensaje: error.message || 'Error desconocido',
                nombre: error.name || 'Error',
                stack: error.stack || 'No disponible',
                errorCompleto: error
            });

            setMsg('');

            // Si es un error de abort (timeout), dar un mensaje específico
            if (error.name === 'AbortError') {
                console.warn('⏱️ Verificación de disponibilidad cancelada por timeout');
                return {
                    disponible: true,
                    conflictos: [],
                    message: 'Timeout al verificar - continuando'
                };
            }

            // Si es un error de red
            if (error.message && error.message.includes('fetch')) {
                console.warn('🌐 Error de conexión de red');
                return {
                    disponible: true,
                    conflictos: [],
                    message: 'Error de red - continuando'
                };
            }

            return {
                disponible: true, // En caso de error, permitir continuar
                conflictos: [],
                message: error.message || 'Error de conexión'
            };
        }
    }

    async function crearEvento(e) {
        e.preventDefault();
        setMsg('');
        setEventLink('');
        setLoading(true);

        try {
            // PASO 1: Verificar disponibilidad antes de crear
            const disponibilidad = await verificarDisponibilidad(start, end);

            if (!disponibilidad.disponible && disponibilidad.conflictos.length > 0) {
                // Mostrar alerta de conflicto
                const conflicto = disponibilidad.conflictos[0];
                const fechaConflicto = formatDate(conflicto.start?.dateTime || conflicto.start?.date);

                const confirmar = window.confirm(
                    `CONFLICTO DE HORARIO DETECTADO\n\n` +
                    `Ya existe una cita programada:\n` +
                    `${fechaConflicto}\n` +
                    `${conflicto.summary || 'Sin título'}\n\n` +
                    `¿Deseas continuar y agendar de todas formas?\n` +
                    `(Se crearán dos citas en el mismo horario)`
                );

                if (!confirmar) {
                    setMsg('Agendamiento cancelado por conflicto de horario');
                    setLoading(false);
                    return;
                } else {
                    setMsg('Creando cita con conflicto de horario...');
                }
            }

            // PASO 2: Crear el evento usando SOLO el endpoint que maneja Google Calendar + Base de Datos
            const startISO = toISOWithOffset(start);
            const endISO = toISOWithOffset(end);
            const bodyCalendar = {
                summary,
                description,
                start: startISO,
                end: endISO,
                location,
                rutPaciente: rutPaciente.trim(),
                telefonoPaciente: telefonoPaciente.trim()
            };
            if (attendee && /\S+@\S+\.\S+/.test(attendee)) bodyCalendar.attendees = [{email: attendee}];

            console.log('Creando cita con datos:', bodyCalendar);

            const res = await fetch(`${API}/calendar/events`, {
                method: 'POST',
                mode: 'cors',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(bodyCalendar),
            });

            const data = await res.json();

            if (res.ok && data?.event) {
                console.log('Evento creado exitosamente:', data);
                setMsg('Cita creada exitosamente! Se guardó en Google Calendar y base de datos');
                setEventLink(data.event.htmlLink);

                // Mostrar una notificación más prominente
                alert('Cita creada exitosamente!\n\n' +
                    'Guardada en Google Calendar\n' +
                    'Guardada en base de datos\n' +
                    'RUT del paciente registrado\n' +
                    'Event ID asignado');

                // Limpiar formulario después de crear exitosamente
                setSummary('');
                setDescription('');
                setLocation('Valdivia');
                setAttendee('');
                setRutPaciente('');
                setTelefonoPaciente('');

                // NO recargar automáticamente para evitar interferencias con otros botones
                // El usuario puede hacer clic en "Citas de Hoy" o "Próximas Citas" manualmente
            } else {
                console.error('Error creando evento:', data);
                setMsg('Error al crear evento: ' + (data.error || 'Error desconocido'));
                alert('Error al crear la cita: ' + (data.error || 'Error desconocido'));
            }
        } catch (err) {
            setMsg('Error de conexión con el backend');
            console.error('Error en crearEvento:', err);
        } finally {
            setLoading(false);
        }
    }

    async function listarEventosHoy() {
        // Evitar múltiples llamadas simultáneas
        if (loadingHoy) return;

        console.log('Iniciando listarEventosHoy...');

        // Solo activar loading, no limpiar otros estados para evitar parpadeo
        setLoadingHoy(true);

        try {
            // Obtener fecha de hoy en formato YYYY-MM-DD
            const hoy = new Date();
            const fechaHoy = hoy.toISOString().split('T')[0];

            console.log('Buscando citas de hoy:', fechaHoy);

            // Usar el endpoint de reservas que conecta con la base de datos
            const res = await fetch(`${API}/reservas/con-paciente`);

            console.log('Respuesta recibida - Status:', res.status, 'OK:', res.ok);

            const data = await res.json();
            console.log('Datos recibidos de BD:', data);

            if (res.ok) {
                // Filtrar solo las citas de hoy
                const citasHoy = Array.isArray(data) ? data.filter(cita => {
                    const fechaCita = new Date(cita.fecha).toISOString().split('T')[0];
                    return fechaCita === fechaHoy;
                }) : [];

                // Convertir formato de BD a formato esperado por la UI
                const citasFormateadas = citasHoy.map(cita => ({
                    id: cita.event_id || `db-${cita.id_paciente}`,
                    dbId: cita.id_paciente,
                    summary: cita.nombre,
                    start: {
                        dateTime: `${cita.fecha.split('T')[0]}T${cita.hora}`
                    },
                    description: `RUT: ${cita.rut}\nTeléfono: ${cita.telefono}\nEmail: ${cita.email}\nEstatus: ${cita.status}`,
                    attendees: cita.email ? [{email: cita.email}] : [],
                    hangoutLink: null, // Se podría obtener de Google Calendar si es necesario
                    created: cita.created_at
                }));

                // Aplicar ordenamiento según la configuración actual
                const itemsOrdenados = ordenarCitas(citasFormateadas, ordenamiento);

                // Actualizar todos los estados en un solo batch para evitar parpadeo
                requestAnimationFrame(() => {
                    setList(itemsOrdenados);
                    setMsg(citasFormateadas.length === 0 ? 'No hay citas programadas para hoy' : '');
                    setEventLink('');
                    setLoadingHoy(false);
                });

                return; // Salir sin usar finally para evitar conflictos

            } else {
                console.error('Error en la respuesta:', data);
                requestAnimationFrame(() => {
                    setList([]);
                    setMsg('No se pudieron listar las citas de hoy');
                    setEventLink('');
                    setLoadingHoy(false);
                });
                return;
            }
        } catch (error) {
            console.error('Error en listarEventosHoy:', error);
            requestAnimationFrame(() => {
                setList([]);
                setMsg('Error de conexión con el backend');
                setEventLink('');
                setLoadingHoy(false);
            });
        }
    }

    async function listarProximos() {
        // Evitar múltiples llamadas simultáneas
        if (loadingProximos) return;

        console.log('Iniciando listarProximos...');

        // Solo activar loading, no limpiar otros estados para evitar parpadeo
        setLoadingProximos(true);

        try {
            // Usar el endpoint de reservas que conecta con la base de datos
            const res = await fetch(`${API}/reservas/con-paciente`);
            const data = await res.json();

            if (res.ok) {
                // Filtrar solo las citas futuras (incluyendo hoy)
                const ahora = new Date();
                const fechaHoy = ahora.toISOString().split('T')[0];

                const citasFuturas = Array.isArray(data) ? data.filter(cita => {
                    const fechaCita = new Date(cita.fecha).toISOString().split('T')[0];
                    return fechaCita >= fechaHoy; // >= para incluir citas de hoy
                }) : [];

                // Convertir formato de BD a formato esperado por la UI
                const citasFormateadas = citasFuturas.map(cita => ({
                    id: cita.event_id || `db-${cita.id_paciente}`,
                    dbId: cita.id_paciente,
                    summary: cita.nombre,
                    start: {
                        dateTime: `${cita.fecha.split('T')[0]}T${cita.hora}`
                    },
                    description: `RUT: ${cita.rut}\nTeléfono: ${cita.telefono}\nEmail: ${cita.email}\nEstatus: ${cita.status}`,
                    attendees: cita.email ? [{email: cita.email}] : [],
                    hangoutLink: null,
                    created: cita.created_at
                }));

                // Aplicar ordenamiento según la configuración actual
                const itemsOrdenados = ordenarCitas(citasFormateadas, ordenamiento);

                console.log(`${citasFormateadas.length} citas futuras encontradas`);

                // Actualizar todos los estados en un solo batch para evitar parpadeo
                requestAnimationFrame(() => {
                    setList(itemsOrdenados);
                    setMsg(citasFormateadas.length === 0 ? 'No hay citas programadas' : '');
                    setEventLink('');
                    setLoadingProximos(false);
                });

                return; // Salir sin usar finally para evitar conflictos

            } else {
                console.error('Error en la respuesta:', data);
                requestAnimationFrame(() => {
                    setList([]);
                    setMsg('No se pudieron listar las próximas citas');
                    setEventLink('');
                    setLoadingProximos(false);
                });
                return;
            }
        } catch (error) {
            console.error('Error en listarProximos:', error);
            requestAnimationFrame(() => {
                setList([]);
                setMsg('Error de conexión con el backend');
                setEventLink('');
                setLoadingProximos(false);
            });
        }
    }

    // ANULAR RESERVA (SIMILAR A GESTIONAGENDAS)
    async function anularReserva(eventId, nombreEvento) {
        if (window.confirm(`¿Estás seguro de que deseas anular la cita "${nombreEvento}"?`)) {
            console.log('Iniciando anulación de evento:', eventId);
            try {
                // Primero necesitamos encontrar el id_paciente basado en el event_id
                const buscarRes = await fetch(`${API}/reservas/con-paciente`);
                const reservas = await buscarRes.json();
                const reserva = reservas.find(r => r.event_id === eventId);

                if (!reserva) {
                    setMsg('No se encontró la reserva en la base de datos');
                    return;
                }

                console.log('Enviando petición a:', `${API}/reservas/anular`);
                const res = await fetch(`${API}/reservas/anular`, {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({id: reserva.id_paciente}),
                });

                console.log('Respuesta recibida - Status:', res.status);
                const data = await res.json();
                console.log('Datos de respuesta:', data);

                if (res.ok) {
                    setMsg('Cita anulada exitosamente');
                    // Marcar como anulado en el estado local
                    setEventosAnulados(prev => new Set([...prev, eventId]));

                    // Opcional: refrescar automáticamente la lista
                    // await listarEventosHoy(); // o listarProximos() según corresponda
                } else {
                    console.error('Error del servidor:', data);
                    setMsg(`Error al anular la cita: ${data.message || 'Error desconocido'}`);
                }
            } catch (error) {
                console.error('Error en anularReserva:', error);
                setMsg('Error de conexión al anular la cita');
            }
        }
    }

    // VERIFICAR SI UN EVENTO ESTÁ ANULADO
    async function verificarStatusEvento(eventId) {
        try {
            const res = await fetch(`${API}/reservas/con-paciente`);
            const reservas = await res.json();
            const reserva = reservas.find(r => r.event_id === eventId);
            return reserva?.status === 'cancelada';
        } catch (error) {
            console.error('Error al verificar status:', error);
            return false;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Header */}
                <div
                    className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Gestión de Calendario</h1>
                            <p className="text-slate-200">Programa y administra citas con pacientes de manera
                                eficiente</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Panel de gestión de citas y calendario</span>
                    </div>
                </div>

                {/* Formulario de Nueva Cita */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Nueva Cita</h2>
                                <p className="text-sm text-gray-600">Programa una nueva sesión con el paciente</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={crearEvento} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del
                                        Paciente</label>
                                    <input
                                        placeholder="Ingrese el nombre del paciente"
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                                    <input
                                        placeholder="Lugar de atención"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RUT del
                                        Paciente</label>
                                    <input
                                        placeholder="12.345.678-9"
                                        value={rutPaciente}
                                        onChange={(e) => setRutPaciente(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono del
                                        Paciente</label>
                                    <input
                                        placeholder="+56 9 1234 5678"
                                        value={telefonoPaciente}
                                        onChange={(e) => setTelefonoPaciente(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de
                                    Consulta</label>
                                <textarea
                                    placeholder="Descripción del motivo de la consulta"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>

                            {/* Selector de Modo (Visual vs Manual) */}
                            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                <div
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                                    <label className="text-sm font-medium text-gray-700">Programación de Fecha y
                                        Hora</label>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Selector de Modo */}
                                        <div className="flex bg-white border border-gray-300 rounded-md p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setModoSelector('visual')}
                                                className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                                                    modoSelector === 'visual'
                                                        ? 'bg-slate-700 text-white shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-800'
                                                }`}
                                            >
                                                Visual
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setModoSelector('manual')}
                                                className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                                                    modoSelector === 'manual'
                                                        ? 'bg-slate-700 text-white shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-800'
                                                }`}
                                            >
                                                Manual
                                            </button>
                                        </div>

                                        {/* Selector de Vista (solo en modo visual) */}
                                        {modoSelector === 'visual' && (
                                            <div className="flex bg-white border border-gray-300 rounded-md p-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setVistaCalendario('mensual')}
                                                    className={`px-2 py-1 text-xs rounded font-medium transition-all flex items-center gap-1 ${
                                                        vistaCalendario === 'mensual'
                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                                    title="Vista Mensual"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                    </svg>
                                                    Mes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setVistaCalendario('semanal')}
                                                    className={`px-2 py-1 text-xs rounded font-medium transition-all flex items-center gap-1 ${
                                                        vistaCalendario === 'semanal'
                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                                    title="Vista Semanal"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                                                    </svg>
                                                    Semana
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setVistaCalendario('diaria')}
                                                    className={`px-2 py-1 text-xs rounded font-medium transition-all flex items-center gap-1 ${
                                                        vistaCalendario === 'diaria'
                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                                    title="Vista Diaria"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                    Día
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {modoSelector === 'visual' ? (
                                    /* MODO VISUAL */
                                    <div className="space-y-3">
                                        {/* VISTA MENSUAL */}
                                        {vistaCalendario === 'mensual' && (
                                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                                                {/* Header con navegación de mes y contador */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const nuevoMes = new Date(mesActual);
                                                            nuevoMes.setMonth(mesActual.getMonth() - 1);
                                                            setMesActual(nuevoMes);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                             viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M15 19l-7-7 7-7"/>
                                                        </svg>
                                                    </button>

                                                    <div className="text-center">
                                                        <h3 className="text-base font-semibold text-gray-800">
                                                            {mesActual.toLocaleDateString('es-CL', {
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </h3>
                                                        <div className="flex items-center justify-center gap-2 mt-1">
                              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                {(() => {
                                    const diasMes = generarDiasMes(mesActual).filter(d => d.getMonth() === mesActual.getMonth());
                                    const totalCitas = diasMes.reduce((sum, fecha) => sum + contarReservas(fecha), 0);
                                    return `${totalCitas} cita${totalCitas !== 1 ? 's' : ''} este mes`;
                                })()}
                              </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const nuevoMes = new Date(mesActual);
                                                            nuevoMes.setMonth(mesActual.getMonth() + 1);
                                                            setMesActual(nuevoMes);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                             viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M9 5l7 7-7 7"/>
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Días de la semana */}
                                                <div className="grid grid-cols-7 gap-0.5 mb-1">
                                                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
                                                        <div key={dia}
                                                             className="text-center text-[10px] font-semibold text-gray-600 py-1">
                                                            {dia}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Días del mes - MÁS PEQUEÑOS */}
                                                <div className="grid grid-cols-7 gap-0.5">
                                                    {generarDiasMes(mesActual).map((fecha, idx) => {
                                                        const esMesActual = fecha.getMonth() === mesActual.getMonth();
                                                        const seleccionada = esFechaSeleccionada(fecha);
                                                        const hoy = esHoy(fecha);
                                                        const pasada = esFechaPasada(fecha);
                                                        const reservas = contarReservas(fecha);
                                                        const bloqueado = esFechaBloqueadaLocal(fecha); // Usar configuración centralizada

                                                        return (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (!pasada && !bloqueado && esMesActual) {
                                                                        setFechaSeleccionada(fecha);
                                                                        setHorarioSeleccionado(null);
                                                                    }
                                                                }}
                                                                disabled={pasada || bloqueado || !esMesActual}
                                                                title={
                                                                    bloqueado
                                                                        ? `${nombreDiaSemana(fecha.getDay())} - Día bloqueado (sin atención)`
                                                                        : reservas > 0
                                                                            ? `${reservas} cita${reservas !== 1 ? 's' : ''} agendada${reservas !== 1 ? 's' : ''}`
                                                                            : ''
                                                                }
                                                                className={`h-8 w-full rounded text-[11px] font-medium transition-all relative flex items-center justify-center ${
                                                                    !esMesActual
                                                                        ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                                                                        : pasada || bloqueado
                                                                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed line-through'
                                                                            : seleccionada
                                                                                ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400'
                                                                                : hoy
                                                                                    ? 'bg-sky-50 text-sky-700 ring-2 ring-sky-300 font-bold'
                                                                                    : reservas > 0
                                                                                        ? 'bg-amber-100 text-amber-900 border-2 border-amber-400 hover:bg-amber-200 font-semibold'
                                                                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-sky-50 hover:border-sky-300'
                                                                }`}
                                                            >
                                <span
                                    className={reservas > 0 && esMesActual && !pasada && !bloqueado ? 'relative z-10' : ''}>
                                  {fecha.getDate()}
                                </span>
                                                                {reservas > 0 && esMesActual && !pasada && !bloqueado && (
                                                                    <div
                                                                        className="absolute top-0.5 right-0.5 bg-amber-600 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-sm">
                                                                        {reservas}
                                                                    </div>
                                                                )}
                                                                {bloqueado && esMesActual && (
                                                                    <div
                                                                        className="absolute top-0.5 left-0.5 w-2 h-2 bg-red-500 rounded-full shadow-sm"
                                                                        title="Día bloqueado">
                                                                        <span
                                                                            className="text-white text-[8px] flex items-center justify-center">✗</span>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Leyenda */}
                                                <div
                                                    className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-gray-200 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <div
                                                            className="w-3 h-3 bg-sky-50 border-2 border-sky-300 rounded"></div>
                                                        <span className="text-gray-600">Hoy</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div
                                                            className="w-3 h-3 bg-amber-100 border-2 border-amber-400 rounded relative">
                                                            <div
                                                                className="absolute -top-1 -right-1 bg-amber-600 text-white text-[6px] font-bold rounded-full w-2 h-2 flex items-center justify-center">2
                                                            </div>
                                                        </div>
                                                        <span className="text-gray-600">Con citas agendadas</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div
                                                            className="w-3 h-3 bg-gray-100 text-gray-400 rounded flex items-center justify-center line-through"
                                                            style={{fontSize: '8px'}}>15
                                                        </div>
                                                        <span className="text-gray-600">Cerrado</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 bg-sky-600 rounded"></div>
                                                        <span className="text-gray-600">Día seleccionado</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* VISTA SEMANAL */}
                                        {vistaCalendario === 'semanal' && (
                                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                                                {/* Header con navegación de semana y contador */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const nuevaFecha = new Date(fechaSeleccionada);
                                                            nuevaFecha.setDate(fechaSeleccionada.getDate() - 7);
                                                            setFechaSeleccionada(nuevaFecha);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                             viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M15 19l-7-7 7-7"/>
                                                        </svg>
                                                    </button>

                                                    <div className="text-center">
                                                        <h3 className="text-xs font-semibold text-gray-800">
                                                            Semana
                                                            del {obtenerDiasSemana(fechaSeleccionada)[0].toLocaleDateString('es-CL')}
                                                        </h3>
                                                        <div className="mt-1">
                              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                {(() => {
                                    const diasSemana = obtenerDiasSemana(fechaSeleccionada);
                                    const totalCitas = diasSemana.reduce((sum, fecha) => sum + contarReservas(fecha), 0);
                                    return `${totalCitas} cita${totalCitas !== 1 ? 's' : ''} esta semana`;
                                })()}
                              </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const nuevaFecha = new Date(fechaSeleccionada);
                                                            nuevaFecha.setDate(fechaSeleccionada.getDate() + 7);
                                                            setFechaSeleccionada(nuevaFecha);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                             viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M9 5l7 7-7 7"/>
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Días de la semana - MÁS PEQUEÑOS */}
                                                <div className="grid grid-cols-7 gap-1">
                                                    {obtenerDiasSemana(fechaSeleccionada).map((fecha, idx) => {
                                                        const seleccionada = esFechaSeleccionada(fecha);
                                                        const hoy = esHoy(fecha);
                                                        const pasada = esFechaPasada(fecha);
                                                        const reservas = contarReservas(fecha);
                                                        const bloqueado = esFechaBloqueadaLocal(fecha); // Usar configuración centralizada

                                                        return (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (!pasada && !bloqueado) {
                                                                        setFechaSeleccionada(fecha);
                                                                        setHorarioSeleccionado(null);
                                                                    }
                                                                }}
                                                                disabled={pasada || bloqueado}
                                                                title={bloqueado ? `${nombreDiaSemana(fecha.getDay())} - Día bloqueado (sin atención)` : ''}
                                                                className={`p-2 rounded-lg text-center transition-all ${
                                                                    pasada || bloqueado
                                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                        : seleccionada
                                                                            ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                                                                            : hoy
                                                                                ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-300 font-bold'
                                                                                : reservas > 0
                                                                                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                                                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                <div className="text-[10px] font-medium mb-0.5">
                                                                    {fecha.toLocaleDateString('es-CL', {weekday: 'short'})}
                                                                </div>
                                                                <div
                                                                    className={`text-lg font-bold ${bloqueado ? 'line-through' : ''}`}>
                                                                    {fecha.getDate()}
                                                                </div>
                                                                <div className="text-[10px] mt-0.5">
                                                                    {fecha.toLocaleDateString('es-CL', {month: 'short'})}
                                                                </div>
                                                                {reservas > 0 && !pasada && !bloqueado && (
                                                                    <div
                                                                        className="mt-1 text-[10px] font-semibold text-amber-600">
                                                                        {reservas}
                                                                    </div>
                                                                )}
                                                                {bloqueado && (
                                                                    <div
                                                                        className="mt-0.5 text-[9px] font-semibold text-red-500">
                                                                        Cerrado
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* VISTA DIARIA */}
                                        {vistaCalendario === 'diaria' && (
                                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                {/* Header con navegación de día */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const nuevaFecha = new Date(fechaSeleccionada);
                                                            nuevaFecha.setDate(fechaSeleccionada.getDate() - 1);
                                                            setFechaSeleccionada(nuevaFecha);
                                                        }}
                                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor"
                                                             viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M15 19l-7-7 7-7"/>
                                                        </svg>
                                                    </button>

                                                    <div className="text-center">
                                                        <h3 className="text-lg font-bold text-gray-800">
                                                            {fechaSeleccionada.getDate()}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {fechaSeleccionada.toLocaleDateString('es-CL', {
                                                                weekday: 'long',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const nuevaFecha = new Date(fechaSeleccionada);
                                                            nuevaFecha.setDate(fechaSeleccionada.getDate() + 1);
                                                            setFechaSeleccionada(nuevaFecha);
                                                        }}
                                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor"
                                                             viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M9 5l7 7-7 7"/>
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Información del día */}
                                                <div className="space-y-3">
                                                    {esFechaPasada(fechaSeleccionada) ? (
                                                        <div
                                                            className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center">
                                                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400"
                                                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                      strokeWidth={2}
                                                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                            </svg>
                                                            <p className="text-sm font-medium text-gray-600">Fecha
                                                                pasada</p>
                                                            <p className="text-xs text-gray-500 mt-1">No se pueden
                                                                agendar citas en fechas pasadas</p>
                                                        </div>
                                                    ) : esFechaBloqueadaLocal(fechaSeleccionada) ? (
                                                        <div
                                                            className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                                            <svg className="w-8 h-8 mx-auto mb-2 text-red-500"
                                                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                      strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                                            </svg>
                                                            <p className="text-sm font-medium text-red-600">{nombreDiaSemana(fechaSeleccionada.getDay())} -
                                                                Cerrado</p>
                                                            <p className="text-xs text-red-500 mt-1">No hay atención
                                                                este día de la semana</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {esHoy(fechaSeleccionada) && (
                                                                <div
                                                                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                                                    <p className="text-sm font-medium text-blue-600">📅
                                                                        Hoy</p>
                                                                </div>
                                                            )}

                                                            {contarReservas(fechaSeleccionada) > 0 && (
                                                                <div
                                                                    className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <svg className="w-5 h-5 text-amber-600"
                                                                             fill="none" stroke="currentColor"
                                                                             viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round"
                                                                                  strokeLinejoin="round" strokeWidth={2}
                                                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                                        </svg>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-amber-800">
                                                                                {contarReservas(fechaSeleccionada)} cita{contarReservas(fechaSeleccionada) > 1 ? 's' : ''} programada{contarReservas(fechaSeleccionada) > 1 ? 's' : ''}
                                                                            </p>
                                                                            <p className="text-xs text-amber-600">
                                                                                Revisa los horarios disponibles abajo
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {contarReservas(fechaSeleccionada) === 0 && (
                                                                <div
                                                                    className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                                                    <svg className="w-6 h-6 mx-auto mb-1 text-green-600"
                                                                         fill="none" stroke="currentColor"
                                                                         viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round"
                                                                              strokeLinejoin="round" strokeWidth={2}
                                                                              d="M5 13l4 4L19 7"/>
                                                                    </svg>
                                                                    <p className="text-sm font-medium text-green-700">Todos
                                                                        los horarios disponibles</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Horarios Disponibles */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-2">
                                                Horarios - {formatearFecha(fechaSeleccionada)}:
                                            </label>
                                            {cargandoHorarios ? (
                                                <div className="flex items-center justify-center py-4 text-gray-500">
                                                    <svg className="animate-spin h-4 w-4 mr-2" fill="none"
                                                         viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor"
                                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-xs">Cargando...</span>
                                                </div>
                                            ) : (
                                                <div
                                                    className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md p-2">
                                                    {horariosDisponibles.map((horario) => {
                                                        const esSeleccionado = horarioSeleccionado?.inicio === horario.inicio;
                                                        return (
                                                            <button
                                                                key={horario.inicio}
                                                                type="button"
                                                                onClick={() => seleccionarHorario(horario)}
                                                                disabled={!horario.disponible}
                                                                title={!horario.disponible ? '🚫 Horario ya reservado' : 'Click para seleccionar'}
                                                                className={`p-1.5 text-xs rounded border transition-all relative ${
                                                                    !horario.disponible
                                                                        ? 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed opacity-75 line-through'
                                                                        : esSeleccionado
                                                                            ? 'border-green-600 bg-green-50 text-green-800 font-semibold shadow-md'
                                                                            : 'border-gray-200 hover:border-sky-400 hover:bg-sky-50 hover:shadow-sm'
                                                                }`}
                                                            >
                                                                {!horario.disponible && (
                                                                    <div
                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                                                        🔒
                                                                    </div>
                                                                )}
                                                                <div className="font-medium">{horario.inicio}</div>
                                                                <div className="text-xs opacity-70">45m</div>
                                                                {!horario.disponible && (
                                                                    <div
                                                                        className="text-xs font-bold mt-0.5">OCUPADO</div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Resumen de Selección - Más compacto */}
                                        {horarioSeleccionado && (
                                            <div className="bg-green-50 border border-green-200 rounded-md p-2">
                                                <div className="flex items-center gap-2 text-green-800">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2} d="M5 13l4 4L19 7"/>
                                                    </svg>
                                                    <div className="text-xs">
                                                        <span className="font-semibold">Seleccionado:</span>
                                                        <span
                                                            className="ml-1">{formatearFecha(fechaSeleccionada)} • {horarioSeleccionado.inicio} - {horarioSeleccionado.fin}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* MODO MANUAL */
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Inicio de
                                                Atención</label>
                                            <input
                                                type="datetime-local"
                                                value={start}
                                                onChange={(e) => {
                                                    const nuevoInicio = e.target.value;
                                                    setStart(nuevoInicio);
                                                    setAlertaDisponibilidad(null); // Limpiar alerta previa

                                                    // Auto-calcular fin sumando 45 minutos
                                                    if (nuevoInicio) {
                                                        const inicioDate = new Date(nuevoInicio);
                                                        const finDate = new Date(inicioDate.getTime() + 45 * 60 * 1000);
                                                        const finStr = finDate.toISOString().slice(0, 16);
                                                        setEnd(finStr);

                                                        // Verificar disponibilidad automáticamente con un pequeño delay
                                                        clearTimeout(window.verificarTimer);
                                                        window.verificarTimer = setTimeout(() => {
                                                            verificarDisponibilidadAutomatica(nuevoInicio, finStr);
                                                        }, 1000);
                                                    }
                                                }}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-xs"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Fin de
                                                Atención</label>
                                            <input
                                                type="datetime-local"
                                                value={end}
                                                onChange={(e) => {
                                                    const nuevoFin = e.target.value;
                                                    setEnd(nuevoFin);
                                                    setAlertaDisponibilidad(null); // Limpiar alerta previa

                                                    // Verificar disponibilidad automáticamente con un pequeño delay
                                                    clearTimeout(window.verificarTimer);
                                                    window.verificarTimer = setTimeout(() => {
                                                        verificarDisponibilidadAutomatica(start, nuevoFin);
                                                    }, 1000);
                                                }}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-xs"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Alerta de Disponibilidad */}
                            {alertaDisponibilidad && (
                                <div className={`p-3 rounded-md text-sm font-medium ${
                                    alertaDisponibilidad.tipo === 'disponible'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : alertaDisponibilidad.tipo === 'conflicto'
                                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        {alertaDisponibilidad.tipo === 'disponible' && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M5 13l4 4L19 7"/>
                                            </svg>
                                        )}
                                        {(alertaDisponibilidad.tipo === 'conflicto' || alertaDisponibilidad.tipo === 'error') && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                            </svg>
                                        )}
                                        <span>{alertaDisponibilidad.mensaje}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email del
                                    Invitado</label>
                                <input
                                    placeholder="correo@ejemplo.com"
                                    type="email"
                                    value={attendee}
                                    onChange={(e) => setAttendee(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-md hover:from-slate-800 hover:to-slate-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                                >
                                    {loading ? 'Agendando...' : 'Agendar Cita'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Mensajes */}
                    {msg && (
                        <div className={`mt-4 p-4 rounded-lg border-l-4 ${
                            msg.includes('exitosamente') || msg.includes('Exitosamente') || msg.includes('creada') ? 'bg-green-50 border-green-400 text-green-800' :
                                msg.includes('Error') || msg.includes('error') ? 'bg-red-50 border-red-400 text-red-800' :
                                    'bg-blue-50 border-blue-400 text-blue-800'
                        }`}>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {msg.includes('exitosamente') || msg.includes('Exitosamente') || msg.includes('creada') ? (
                                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    ) : msg.includes('Error') || msg.includes('error') ? (
                                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{msg}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {eventLink && (
                        <div
                            className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Evento creado exitosamente</p>
                                    <a
                                        href={eventLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-green-600 hover:text-green-800 underline font-medium"
                                    >
                                        Ver en Google Calendar →
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sección de Consultar Citas */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Consultar Citas</h2>
                                <p className="text-sm text-gray-600">Visualiza las citas programadas</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={listarEventosHoy}
                                disabled={loadingHoy}
                                className="flex-1 group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    <span>{loadingHoy ? 'Cargando...' : 'Citas de Hoy'}</span>
                                    {loadingHoy && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                </div>
                            </button>

                            <button
                                onClick={listarProximos}
                                disabled={loadingProximos}
                                className="flex-1 group relative px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                                    </svg>
                                    <span>{loadingProximos ? 'Cargando...' : 'Próximas Citas'}</span>
                                    {loadingProximos && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* Controles de ordenamiento */}
                        {list.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <span className="text-sm font-medium text-gray-700">Ordenar citas por fecha:</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => cambiarOrdenamiento('mas-recientes')}
                                            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                                                ordenamiento === 'mas-recientes'
                                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                                            }`}
                                        >
                                            Más Recientes Primero
                                        </button>
                                        <button
                                            onClick={() => cambiarOrdenamiento('mas-antiguas')}
                                            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                                                ordenamiento === 'mas-antiguas'
                                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                                            }`}
                                        >
                                            Más Antiguas Primero
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Últimas Reservas (Top 3) */}
                {list.length > 0 && (
                    <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow p-4">
                            <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                                </svg>
                                Últimas Reservas
                            </h3>
                            <div className="divide-y divide-blue-100">
                                {list.slice(0, 3).map((ev) => (
                                    <EventoItem
                                        key={ev.id}
                                        evento={ev}
                                        anularReserva={anularReserva}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de Citas */}
                {list.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Citas Programadas</h2>
                                </div>
                                <span
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {list.length} {list.length === 1 ? 'cita' : 'citas'}
                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {list.map((ev) => (
                                <EventoItem
                                    key={ev.id}
                                    evento={ev}
                                    anularReserva={anularReserva}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// COMPONENTE PARA CADA EVENTO INDIVIDUAL
function EventoItem({evento, anularReserva}) {
    const [estaAnulado, setEstaAnulado] = useState(false);
    const [verificandoStatus, setVerificandoStatus] = useState(false);

    // Verificar status al montar el componente
    useEffect(() => {
        async function verificarStatus() {
            setVerificandoStatus(true);
            try {
                const res = await fetch(`${API}/reservas/con-paciente`);
                const reservas = await res.json();
                const reserva = reservas.find(r => r.event_id === evento.id);
                setEstaAnulado(reserva?.status === 'cancelada');
            } catch (error) {
                console.error('Error al verificar status:', error);
            }
            setVerificandoStatus(false);
        }

        verificarStatus();
    }, [evento.id]);

    const manejarAnulacion = async () => {
        await anularReserva(evento.id, evento.summary);
        setEstaAnulado(true); // Actualizar estado local
    };

    const startDate = evento.start?.dateTime || evento.start?.date;
    const endDate = evento.end?.dateTime || evento.end?.date;
    const meetUrl = evento.hangoutLink || (evento.conferenceData?.entryPoints || []).find(ep => ep.entryPointType === 'video')?.uri || '';

    // Formatear fecha y hora
    const fechaFormateada = startDate ? formatDate(startDate) : 'Sin fecha';
    const horaInicio = startDate ? formatTime(startDate) : '';
    const horaFin = endDate ? formatTime(endDate) : '';
    const rangoHoras = horaInicio && horaFin ? `${horaInicio} - ${horaFin}` : horaInicio;

    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{evento.summary || '(Sin título)'}</h3>
                    <p className="text-sm text-gray-600 mt-1">{evento.description || '(Sin motivo especificado)'}</p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="font-medium text-gray-700">{fechaFormateada}</span>
                                {rangoHoras && (
                                    <span
                                        className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full text-xs">
                    {rangoHoras}
                  </span>
                                )}
                            </div>
                        </div>
                        {evento.location && (
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                {evento.location}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    {evento.htmlLink && (
                        <a
                            href={evento.htmlLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 text-center transition-colors"
                        >
                            Google Calendar
                        </a>
                    )}

                    <button
                        type="button"
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors text-center ${
                            estaAnulado
                                ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
                                : 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
                        }`}
                        onClick={estaAnulado ? undefined : manejarAnulacion}
                        disabled={estaAnulado || verificandoStatus}
                    >
                        {verificandoStatus ? 'Verificando...' : (estaAnulado ? 'Anulada' : 'Anular Cita')}
                    </button>

                    <a
                        href={meetUrl || 'https://meet.google.com/new'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 text-center transition-colors"
                        title={meetUrl ? 'Abrir Meet del evento' : 'Crear Meet nuevo'}
                    >
                        Google Meet
                    </a>
                </div>
            </div>
        </div>
    );
}