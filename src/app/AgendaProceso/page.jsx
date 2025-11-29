"use client";

import {useMemo, useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import React from 'react';
import {ToastContainer, toast} from 'react-toastify';
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


//FUNCIONES RELACIONADAS CON EL CALENDARIO (NO TOCAR)

// ===============================
// Calendario de agenda semanal
// ===============================
// ✔ Selección de 1 de los 7 días de la semana
// ✔ Visualización de las 24 horas (en intervalos de 30 min)
// ✔ Respeta la calendarización del profesional (ventanas horarias)
// ✔ Preparado para integrarse con un backend (ver TODOs)
const API = process.env.NEXT_PUBLIC_API_URL;
const WEEK_DAYS = [
    {key: 1, label: "Lunes"},
    {key: 2, label: "Martes"},
    {key: 3, label: "Miércoles"},
    {key: 4, label: "Jueves"},
    {key: 5, label: "Viernes"},
    {key: 6, label: "Sábado"},
    {key: 0, label: "Domingo"},
];
const SLOT_MINUTES = DURACION_CITA; // Usar configuración centralizada
const PROFESSIONAL_WINDOWS = HORARIOS_PROFESIONAL; // Usar configuración centralizada

// Mantener funciones locales por compatibilidad
function toMinutes(hhmm) {
    return horaAMinutos(hhmm);
}

function minutesToHHMM(min) {
    return minutosAHora(min);
}

function dateToYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function minutesFromMidnight(dateObj) {
    return dateObj.getHours() * 60 + dateObj.getMinutes();
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 dom,1 lun
    const diff = (day === 0 ? -6 : 1) - day; // mover al lunes
    return addDays(d, diff);
}

function getMonthMatrix(year, month) {
    // Matriz de 6 semanas x 7 días (42 celdas), comenzando en lunes
    const first = new Date(year, month, 1);
    const gridStart = getMonday(first);
    const days = [];
    for (let i = 0; i < 42; i++) {
        days.push(addDays(gridStart, i));
    }
    return days;
}

function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function generateDaySlots(slotMinutes = SLOT_MINUTES) {
    const slots = [];
    for (let t = 0; t < 24 * 60; t += slotMinutes) {
        const start = t;
        const end = t + slotMinutes;
        slots.push({
            start,
            end,
            label: `${minutesToHHMM(start)} - ${minutesToHHMM(end)}`,
        });
    }
    return slots;
}

function isWithinWindows(slot, windows) {
    if (!windows || windows.length === 0) return false;
    return windows.some((w) => {
        const ws = toMinutes(w.start);
        const we = w.end === "24:00" ? 24 * 60 : toMinutes(w.end);
        return slot.start >= ws && slot.end <= we;
    });
}

//=====================================


// FUNCIÓN QUE DA INICIO AL COMPONENTE GRAFICO DE REACT
//=====================================

export default function Page() {

    const router = useRouter();
    const today = new Date();
    const jsDay = today.getDay(); // 0=Dom,1=Lun,...
    const defaultDay = WEEK_DAYS.find((d) => d.key === jsDay) ? jsDay : 1;
    const [viewMode, setViewMode] = useState("week"); // "week" | "month"
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedDay, setSelectedDay] = useState(defaultDay);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [notice, setNotice] = useState("");


    // ===============================
    // Reservas existentes del día
    // (números de minutos desde 00:00 que ya están ocupados)
    // ===============================
    const [reservedStarts, setReservedStarts] = useState([]); // e.g., [480, 510]
    const [loadingRes, setLoadingRes] = useState(false);
    const [loading, setLoading] = useState(false);


    // ===============================
    // Datos del paciente (formulario)
    // ===============================


    // ID del profesional dueño del calendario (ajústalo desde BD)
    const professionalId = 1;

    // Zona horaria local (afecta al Calendar)
    const timezone = "America/Santiago";

    // Traer reservas del backend para la fecha/profesional actual
    useEffect(() => {
        let ignore = false;

        async function loadReservations() {
            try {
                setLoadingRes(true);
                const ymd = dateToYMD(selectedDate);
                const url = `${API}/reservas/horarios-ocupados/${ymd}`;
                console.log('🔍 Cargando reservas para fecha:', ymd);

                const res = await fetch(url);
                if (!res.ok) {
                    console.warn('⚠️ No se pudieron cargar reservas:', res.status);
                    throw new Error('No se pudieron cargar reservas');
                }

                const data = await res.json();
                console.log('📦 Datos recibidos del backend:', data);

                // Soportar múltiples formatos de respuesta
                let horariosOcupados = [];

                // Formato 1: { horariosOcupados: ['09:00', '10:00'] }
                if (Array.isArray(data?.horariosOcupados)) {
                    horariosOcupados = data.horariosOcupados;
                }
                // Formato 2: Array directo ['09:00', '10:00']
                else if (Array.isArray(data)) {
                    horariosOcupados = data;
                }
                // Formato 3: { items: [{hora: '09:00'}, ...] }
                else if (Array.isArray(data?.items)) {
                    horariosOcupados = data.items.map(item => item.hora || item.start_time).filter(Boolean);
                }
                // Formato 4: { reservas: [{hora: '09:00'}, ...] }
                else if (Array.isArray(data?.reservas)) {
                    horariosOcupados = data.reservas.map(item => item.hora || item.start_time).filter(Boolean);
                }

                console.log('🕐 Horarios ocupados (formato HH:MM):', horariosOcupados);

                // Convertir todos los horarios a minutos desde medianoche
                const occupied = horariosOcupados.map((hora) => {
                    // Si ya es un número (minutos), devolverlo directamente
                    if (typeof hora === 'number') return hora;

                    // Si es string en formato HH:MM, convertir a minutos
                    if (typeof hora === 'string' && hora.includes(':')) {
                        return toMinutes(hora);
                    }

                    return null;
                }).filter((n) => typeof n === 'number');

                console.log('✅ Horarios ocupados (en minutos):', occupied);
                console.log('✅ Horarios ocupados (en formato HH:MM):', occupied.map(m => minutesToHHMM(m)));

                if (!ignore) {
                    setReservedStarts(occupied);
                    if (occupied.length > 0) {
                        toast.info(`${occupied.length} horario(s) ya reservado(s) para esta fecha`);
                    }
                }
            } catch (e) {
                console.error('❌ Error al cargar reservas:', e);
                if (!ignore) setReservedStarts([]);
            } finally {
                if (!ignore) setLoadingRes(false);
            }
        }

        loadReservations();
        return () => {
            ignore = true;
        };
    }, [selectedDate, professionalId]);

    // TODO: aquí podrías consultar un backend para traer las ventanas
    const windowsForDay = PROFESSIONAL_WINDOWS[selectedDay] || [];

    const allSlots = useMemo(() => generateDaySlots(SLOT_MINUTES), []);
    const availableSlots = useMemo(
        () => allSlots
            .filter((s) => isWithinWindows(s, windowsForDay))
            .map((s) => ({...s, reserved: reservedStarts.includes(s.start)})),
        [allSlots, windowsForDay, reservedStarts]
    );

    // ===============================
    // Confirmar: valida y envía al backend
    //  - Toma el slot seleccionado + fecha
    //  - Incluye nombre y correo del paciente
    //  - Envía POST a /api/agenda/reservar para crear el evento + Meet
    // ===============================
    const handleConfirm = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        if (!selectedSlot) {
            toast.error('Selecciona un horario antes de confirmar la reserva.');
            return;
        }

        // Validar que el horario no esté ya reservado
        if (reservedStarts.includes(selectedSlot.start)) {
            toast.error('⚠️ Este horario ya está reservado. Por favor selecciona otro horario disponible.');
            setNotice('Este horario ya no está disponible. Selecciona otro horario.');
            setSelectedSlot(null);
            return;
        }

        // Validaciones básicas usando los estados del formulario ya presentes
        if (!nombre_comprador || !identificacion_comprador || !telefono_comprador || !email_Comprador) {
            setNotice('Por favor completa los campos requeridos.');
            toast.error('Falta un dato para ingresar tu hora correctamente.');
            return;
        }

        if (!email_Comprador.includes('@')) {
            setNotice('El correo electrónico no es válido.');
            return;
        }

        setLoading(true);

        try {
            // Verificación final: recargar horarios ocupados antes de reservar
            const ymd = dateToYMD(selectedDate);
            const resCheck = await fetch(`${API}/reservas/horarios-ocupados/${ymd}`);

            if (resCheck.ok) {
                const dataCheck = await resCheck.json();
                let horariosOcupados = [];

                if (Array.isArray(dataCheck?.horariosOcupados)) {
                    horariosOcupados = dataCheck.horariosOcupados;
                } else if (Array.isArray(dataCheck)) {
                    horariosOcupados = dataCheck;
                }

                const ocupados = horariosOcupados.map((hora) => {
                    if (typeof hora === 'number') return hora;
                    if (typeof hora === 'string' && hora.includes(':')) return toMinutes(hora);
                    return null;
                }).filter((n) => typeof n === 'number');

                // Si el horario ahora está ocupado, detener el proceso
                if (ocupados.includes(selectedSlot.start)) {
                    toast.error('⚠️ Lo sentimos, este horario acaba de ser reservado por otro usuario. Por favor selecciona otro horario.');
                    setNotice('Este horario ya no está disponible.');
                    setReservedStarts(ocupados);
                    setSelectedSlot(null);
                    setLoading(false);
                    return;
                }
            }

            // PASO 1: Crear la reserva
            const payloadReserva = {
                nombre_paciente: nombre_comprador.trim(),
                rut: identificacion_comprador.trim(),
                telefono: telefono_comprador.trim(),
                email: email_Comprador.trim(),
                fecha: dateToYMD(selectedDate),
                hora: minutesToHHMM(selectedSlot.start),
            };

            console.log('📝 Creando reserva:', payloadReserva);
            const resReserva = await fetch(`${API}/reservas/reservar-horario`, {
                method: "POST",
                headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
                body: JSON.stringify(payloadReserva),
            });

            const dataReserva = await resReserva.json().catch(() => ({}));

            if (!resReserva.ok) {
                setNotice(dataReserva.error || 'No se pudo registrar la reserva.');
                toast.error(dataReserva.error || 'No se pudo registrar la reserva.');
                setLoading(false);
                return;
            }

            // Reserva exitosa
            const horarioReservado = `${selectedDate.toLocaleDateString('es-CL')} a las ${selectedSlot.label}`;
            console.log('✅ Reserva creada exitosamente:', dataReserva);
            toast.success(`¡Reserva confirmada! Redirigiendo a pago...`, {duration: 2000});

            // Agregar el horario a la lista de reservados
            setReservedStarts((prev) => [...prev, selectedSlot.start]);

            // PASO 2: Crear orden de Mercado Pago y redirigir
            setNotice("⏳ Redirigiendo al checkout de pago...");

            const comprador = {
                nombre_comprador: nombre_comprador.trim(),
                apellidosComprador: apellidosComprador.trim(),
                telefono_comprador: telefono_comprador.trim(),
                email_Comprador: email_Comprador.trim(),
                identificacion_comprador: identificacion_comprador.trim(),
                direccion_despacho: direccion_despacho ? direccion_despacho.trim() : '',
                comuna: comuna ? comuna.trim() : '',
                regionPais: regionPais ? regionPais.trim() : '',
                comentarios: comentarios ? comentarios.trim() : '',
                totalPagado: Number(totalPagado) || 16500,
                // Agregar datos de la reserva
                fecha_reserva: dateToYMD(selectedDate),
                hora_reserva: minutesToHHMM(selectedSlot.start),
                reserva_id: dataReserva?.reserva?.id || null
            };

            const payloadPago = {
                comprador: comprador,
            };

            console.log('💳 Creando orden de Mercado Pago:', payloadPago);
            const resPago = await fetch(`${API}/pagosMercadoPago/create-order`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payloadPago),
            });

            const dataPago = await resPago.json().catch(() => null);

            if (!resPago.ok) {
                const msg = dataPago?.error || dataPago?.message || 'No se puede procesar el pago. Por favor contáctanos por WhatsApp.';
                toast.error(msg);
                setLoading(false);
                return;
            }

            // El backend devuelve init_point / sandbox_init_point
            const checkoutUrl = dataPago?.sandbox_init_point || dataPago?.init_point;

            if (!checkoutUrl) {
                const msg = dataPago?.error || 'No se generó la URL de checkout. Por favor contáctanos.';
                toast.error(msg);
                setLoading(false);
                return;
            }

            console.log('✅ Redirigiendo a Mercado Pago:', checkoutUrl);

            // Redirigir al usuario al Checkout Pro de Mercado Pago
            setTimeout(() => {
                window.location.href = checkoutUrl;
            }, 1500);

        } catch (e) {
            console.error('Error en handleConfirm:', e);
            setNotice(`Error: ${e.message}`);
            toast.error('Error al procesar tu solicitud. Intenta nuevamente.');
            setLoading(false);
        }
    };

    // Calcula los Date del inicio/fin en base a la fecha y slot seleccionados
    let startISO = "";
    let endISO = "";
    if (selectedSlot && selectedDate) {
        const date = new Date(selectedDate);

        const startLocal = new Date(date);
        startLocal.setHours(
            Math.floor(selectedSlot.start / 60),
            selectedSlot.start % 60,
            0,
            0
        );

        const endLocal = new Date(date);
        endLocal.setHours(
            Math.floor(selectedSlot.end / 60),
            selectedSlot.end % 60,
            0,
            0
        );

        // Google Calendar espera formato: YYYYMMDDTHHmmssZ
        const toGCFormat = (d) =>
            d
                .toISOString()
                .replace(/[-:]/g, "")
                .replace(/\.\d{3}Z$/, "Z")
                .slice(0, 16) + "00Z";

        startISO = toGCFormat(startLocal);
        endISO = toGCFormat(endLocal);
    }

    const googleCalendarUrl =
        selectedSlot && startISO && endISO
            ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Sesión+Psicología&dates=${startISO}/${endISO}&details=Reserva+confirmada&location=Online`
            : "#";


    //------------------------------------------------------------------------------------------------------------------------------------------------------------

    // Estados del formulario
    const [nombre_comprador, setnombre_comprador] = useState('');
    const [apellidosComprador, setapellidosComprador] = useState('');
    const [telefono_comprador, settelefono_comprador] = useState('');
    const [email_Comprador, setemail_Comprador] = useState('');
    const [identificacion_comprador, setidentificacion_comprador] = useState('');
    const [direccion_despacho, setdireccion_despacho] = useState('');
    const [comuna, setComuna] = useState('');
    const [regionPais, setRegionPais] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [totalPagado] = useState(16500); // Precio fijo


    return (

        <div className="max-w-5xl mx-auto p-4 sm:p-8">
            <ToastContainer/>
            {/* Título */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-rose-600 text-center mb-6">
                Agenda de Atención
            </h1>

            {/* Botón para volver */}
            <button
                onClick={() => router.push("/")}
                className="mb-6 bg-rose-200 hover:bg-rose-500 text-gray-800 font-semibold py-2 px-6 rounded-2xl shadow transition-all duration-200"
            >
                ← Volver a la portada
            </button>

            {/* Selector de modo */}
            <div className="flex items-center justify-center gap-3 mb-4">
                <button
                    onClick={() => setViewMode("week")}
                    className={`px-3 py-1 rounded-md border text-sm ${viewMode === "week" ? "border-rose-600 bg-rose-50 text-rose-700" : "border-gray-200 hover:border-rose-300"}`}
                >
                    Vista semanal
                </button>
                <button
                    onClick={() => setViewMode("month")}
                    className={`px-3 py-1 rounded-md border text-sm ${viewMode === "month" ? "border-rose-600 bg-rose-50 text-rose-700" : "border-gray-200 hover:border-rose-300"}`}
                >
                    Vista mensual
                </button>
            </div>

            {/* Selector de día (Semanal) */}
            {viewMode === "week" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
                    {WEEK_DAYS.map((d) => {
                        const active = d.key === selectedDay;
                        return (
                            <button
                                key={d.key}
                                onClick={() => {
                                    setSelectedDay(d.key);
                                    // sincroniza selectedDate al próximo día de la semana (hoy si coincide)
                                    const base = new Date();
                                    const todayKey = base.getDay();
                                    let diff = d.key - todayKey;
                                    if (diff < 0) diff += 7;
                                    const newDate = new Date(base);
                                    newDate.setDate(base.getDate() + diff);
                                    setSelectedDate(newDate);
                                    setSelectedSlot(null);
                                    setNotice("");
                                }}
                                disabled={addDays(new Date(), d.key - jsDay) < today} // Deshabilita si es pasado
                                className={`rounded-md border px-3 py-2 text-sm sm:text-base transition ${active ? "border-rose-600 bg-rose-50 text-rose-700" : "border-gray-200 hover:border-rose-300"} ${addDays(new Date(), d.key - jsDay) < today ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                                {d.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Calendario mensual */}
            {viewMode === "month" && (
                <div className="mb-6">
                    {/* Header del mes */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            className="px-3 py-1 rounded-md border text-sm border-gray-200 hover:border-rose-300"
                        >
                            ← Anterior
                        </button>
                        <div className="text-base sm:text-lg font-medium text-rose-700">
                            {currentMonth.toLocaleDateString("es-CL", {month: "long", year: "numeric"})}
                        </div>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            className="px-3 py-1 rounded-md border text-sm border-gray-200 hover:border-rose-300"
                        >
                            Siguiente →
                        </button>
                    </div>

                    {/* Cabecera L–D */}
                    <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
                        <div>L</div>
                        <div>M</div>
                        <div>M</div>
                        <div>J</div>
                        <div>V</div>
                        <div>S</div>
                        <div>D</div>
                    </div>

                    {/* Grilla de días */}
                    <div className="grid grid-cols-7 gap-1">
                        {getMonthMatrix(currentMonth.getFullYear(), currentMonth.getMonth()).map((d, idx) => {
                            const inMonth = d.getMonth() === currentMonth.getMonth();
                            const isToday = isSameDay(d, new Date());
                            const active = isSameDay(d, selectedDate);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSelectedDate(d);
                                        const weekdayKey = d.getDay();
                                        setSelectedDay(weekdayKey);
                                        setSelectedSlot(null);
                                        setNotice("");
                                    }}
                                    disabled={d < today}
                                    className={`h-10 rounded-md border text-sm transition flex items-center justify-center
                    ${active ? "border-rose-600 bg-rose-50 text-rose-700" : "border-gray-200 hover:border-rose-300"}
                    ${!inMonth ? "opacity-40" : ""}
                    ${isToday && !active ? "ring-1 ring-rose-300" : ""}
                    ${d < today ? "opacity-40 cursor-not-allowed" : ""}
                  `}
                                    title={d.toLocaleDateString("es-CL")}
                                >
                                    {d.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Información de disponibilidad */}
            <div
                className="mb-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-gray-700">
                        {windowsForDay.length > 0 ? (
                            <div>
                                <p className="mb-1">
                                    <span className="font-semibold text-rose-700">📅 Fecha:</span>{" "}
                                    <span className="font-medium">{selectedDate.toLocaleDateString("es-CL")}</span>
                                    {" · "}
                                    <span
                                        className="font-medium">{WEEK_DAYS.find((d) => d.key === selectedDay)?.label}</span>
                                </p>
                                <p>
                                    <span className="font-semibold text-rose-700">🕐 Horario profesional:</span>{" "}
                                    {windowsForDay.map((w, i) => (
                                        <span key={i}
                                              className="inline-block ml-1 bg-white px-2 py-0.5 rounded text-xs font-medium border border-rose-200">
                      {w.start}–{w.end}
                    </span>
                                    ))}
                                </p>
                            </div>
                        ) : (
                            <p className="text-amber-700 font-medium">⚠️ No hay horas disponibles este día.</p>
                        )}
                    </div>

                    {/* Contador de reservas */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg px-4 py-2 border border-rose-300 shadow-sm">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Reservadas</div>
                            <div className="text-2xl font-bold text-rose-600">{reservedStarts.length}</div>
                        </div>
                        <div className="bg-white rounded-lg px-4 py-2 border border-emerald-300 shadow-sm">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Disponibles</div>
                            <div className="text-2xl font-bold text-emerald-600">
                                {availableSlots.filter(s => !s.reserved).length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {loadingRes && (
                <div
                    className="flex items-center justify-center gap-2 text-sm text-rose-600 mb-3 bg-rose-50 rounded-lg py-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Actualizando reservas…
                </div>
            )}

            {/* Leyenda de colores */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-gray-200 bg-white"></div>
                    <span className="text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-rose-600 bg-rose-50"></div>
                    <span className="text-gray-600">Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-red-400 bg-red-100"></div>
                    <span className="text-gray-600">Ya reservado</span>
                </div>
            </div>

            {/* Grid de 24 horas (bloques de 45 min) */}
            <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[420px] overflow-y-auto border rounded-md p-3 bg-white shadow-inner">
                {availableSlots.map((slot) => {
                    const isActive = selectedSlot?.start === slot.start;
                    return (
                        <button
                            key={slot.start}
                            onClick={() => {
                                if (!slot.reserved) {
                                    setSelectedSlot(slot);
                                    setNotice("");
                                }
                            }}
                            disabled={slot.reserved}
                            className={`text-left rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 relative font-medium
                ${slot.reserved
                                ? "bg-red-100 text-red-800 border-red-400 cursor-not-allowed opacity-75 line-through"
                                : isActive
                                    ? "border-rose-600 bg-rose-50 text-rose-700 shadow-md ring-2 ring-rose-200 scale-105"
                                    : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/30 hover:shadow-sm active:scale-95"
                            }`}
                            title={slot.reserved ? "Este horario ya está reservado" : "Click para seleccionar este horario"}
                        >
                            <div className="flex items-center justify-between">
                                <span className={slot.reserved ? "line-through" : ""}>{slot.label}</span>
                                {slot.reserved && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600"
                                         viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                                              clipRule="evenodd"/>
                                    </svg>
                                )}
                            </div>
                            {slot.reserved && (
                                <span className="block text-[10px] uppercase tracking-wide font-bold mt-1 text-red-700">
                  ✗ No disponible
                </span>
                            )}
                        </button>
                    );
                })}

                {availableSlots.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Sin bloques disponibles en este día.
                    </div>
                )}
            </div>

            {/* =====================================
          Formulario de datos del paciente
          - Se requiere para crear el evento y enviar la invitación
          - Email será invitado al Google Meet automáticamente
         ===================================== */}
            <form
                className="space-y-5 bg-white/90 rounded-3xl shadow-2xl border border-rose-100 p-8 mt-8 max-w-lg mx-auto"
                onSubmit={handleConfirm}
            >
                <h2 className="text-2xl font-bold text-rose-600 text-center mb-2">Reserva tu hora</h2>
                <p className="text-center text-pink-600 mb-4">Completa tus datos para agendar tu atención</p>
                <div>
                    <label className="block text-sm font-semibold text-rose-700 mb-1">Nombres</label>
                    <input
                        type="text"
                        value={nombre_comprador}
                        onChange={e => setnombre_comprador(e.target.value)}
                        className="block w-full rounded-xl border-rose-200 focus:border-rose-400 focus:ring-rose-300 shadow-sm py-2 px-3"
                        required
                        placeholder="Ej: Camila Ignacia"
                    />
                </div>


                <div>
                    <label className="block text-sm font-semibold text-rose-700 mb-1">Apellidos</label>
                    <input
                        type="text"
                        value={apellidosComprador}
                        onChange={e => setapellidosComprador(e.target.value)}
                        className="block w-full rounded-xl border-rose-200 focus:border-rose-400 focus:ring-rose-300 shadow-sm py-2 px-3"
                        required
                        placeholder="Ej: González Nuñez"
                    />
                </div>


                <div>
                    <label className="block text-sm font-semibold text-rose-700 mb-1">Telefono</label>
                    <input
                        type="text"
                        value={telefono_comprador}
                        onChange={e => settelefono_comprador(e.target.value)}
                        className="block w-full rounded-xl border-rose-200 focus:border-rose-400 focus:ring-rose-300 shadow-sm py-2 px-3"
                        required
                        placeholder="Ej: 932765420 "
                    />
                </div>


                <div>
                    <label className="block text-sm font-semibold text-rose-700 mb-1">Email</label>
                    <input
                        type="text"
                        value={email_Comprador}
                        onChange={e => setemail_Comprador(e.target.value)}
                        className="block w-full rounded-xl border-rose-200 focus:border-rose-400 focus:ring-rose-300 shadow-sm py-2 px-3"
                        required
                        placeholder="Ej: micorreo@hmail.com "
                    />
                </div>


                <div>
                    <label className="block text-sm font-semibold text-rose-700 mb-1">Rut / DNI </label>
                    <input
                        type="text"
                        value={identificacion_comprador}
                        onChange={e => setidentificacion_comprador(e.target.value)}
                        className="block w-full rounded-xl border-rose-200 focus:border-rose-400 focus:ring-rose-300 shadow-sm py-2 px-3"
                        required
                        placeholder="Ej: correo@ejemplo.com"
                    />
                </div>


                <div>
                    <label className="block text-sm font-semibold text-rose-700 mb-1">Direccion</label>
                    <input
                        type="text"
                        value={direccion_despacho}
                        onChange={e => setdireccion_despacho(e.target.value)}
                        className="block w-full rounded-xl border-rose-200 focus:border-rose-400 focus:ring-rose-300 shadow-sm py-2 px-3"
                        required
                        placeholder="Ej: Cochrane 123"
                    />
                </div>


                <div>
                    <label className="block text-sm font-semibold text-rose-700 mb-1">Comuna</label>
                    <input
                        type="text"
                        value={comuna}
                        onChange={e => setComuna(e.target.value)}
                        className="block w-full rounded-xl border-rose-200 focus:border-rose-400 focus:ring-rose-300 shadow-sm py-2 px-3"
                        required
                        placeholder="Ej: Cochrane 123"
                    />
                </div>


                <div>
                    <label className="block text-sm font-semibold text-rose-700 mb-1">Regio / Pais</label>
                    <input
                        type="text"
                        value={regionPais}
                        onChange={e => setRegionPais(e.target.value)}
                        className="block w-full rounded-xl border-rose-200 focus:border-rose-400 focus:ring-rose-300 shadow-sm py-2 px-3"
                        required
                        placeholder="Ej: Concepcion / Chile"
                    />
                </div>


                <div>
                    <label className="block text-sm font-semibold text-rose-700 mb-1">Prevision</label>
                    <input
                        type="text"
                        value={comentarios}
                        onChange={e => setComentarios(e.target.value)}
                        className="block w-full rounded-xl border-rose-200 focus:border-rose-400 focus:ring-rose-300 shadow-sm py-2 px-3"
                        required
                        placeholder="Ej: Fonasa / "
                    />
                </div>


                <button

                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 text-white font-bold text-lg shadow-lg hover:from-rose-500 hover:to-pink-500 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                   viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span>Procesando...</span>
            </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Confirmar mi cita</span>
            </span>
                    )}
                </button>
            </form>

            {/* Mensaje */}
            {notice && (
                <div
                    className={`mt-4 rounded-md p-3 text-center text-lg font-semibold shadow ${
                        notice.toLowerCase().includes("reservada")
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                >
                    {notice}
                </div>
            )}

            {/* Enlace a Google Calendar solo si la reserva fue exitosa */}
            {notice && notice.toLowerCase().includes("reservada") && (
                <div className="flex justify-center mt-6">
                    <a
                        href={googleCalendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
              inline-flex items-center gap-2 px-6 py-3 rounded-2xl
              bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500
              hover:from-rose-500 hover:to-pink-500
              text-white font-bold text-lg shadow-lg
              transition-all duration-200
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2
            "
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 4h8a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        Agrega tu hora a Google Calendar
                    </a>
                </div>
            )}

            {/**
             ========================
             NOTAS PARA INTEGRACIONES (MANTENCIÓN)
             - Cambia las ventanas horarias en PROFESSIONAL_WINDOWS para reflejar la calendarización real.
             - Ajusta la duración de cada bloque con SLOT_MINUTES (p. ej., 20, 30, 60).
             - Integra con tu API (POST/GET) en handleConfirm y donde se obtiene windowsForDay.
             - Este formulario envía nombre, rut, teléfono y correo al backend en /api/agenda/reservar para crear la reunión Meet y bloquear el slot.
             ========================
             */}

            {/* Mensajes informativos para pacientes/usuarios */}
            <div
                className="mx-auto mt-8 max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm">
                <h3 className="mb-2 text-base font-semibold">Importante</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                    <li>
                        Revisa tu <strong>correo electrónico</strong> para confirmar la hora y recibir el enlace a la
                        videollamada.
                    </li>
                    <li>
                        Si no puedes asistir, por favor <strong>cancela con 24 horas de anticipación</strong>.
                    </li>
                    <li>
                        Los <strong>reagendamientos</strong> se realizan desde esta misma plataforma usando tu misma
                        información.
                    </li>
                    <li>
                        Ante dudas, responde el correo de confirmación o contáctanos desde la sección
                        de <strong>Contacto</strong>.
                    </li>
                </ul>
            </div>
        </div>
    );
}

function validarRut(rut) {
    return /^[0-9]+-[0-9kK]{1}$/.test(rut);
}