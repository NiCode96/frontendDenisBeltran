"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';


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
    { key: 1, label: "Lunes" },
    { key: 2, label: "Martes" },
    { key: 3, label: "Miércoles" },
    { key: 4, label: "Jueves" },
    { key: 5, label: "Viernes" },
    { key: 6, label: "Sábado" },
    { key: 0, label: "Domingo" },
];
const SLOT_MINUTES = 45; // 45 min por bloque
const PROFESSIONAL_WINDOWS = {
    1: [{ start: "08:00", end: "20:00" }], // Lunes
    2: [{ start: "08:00", end: "20:00" }], // Martes
    3: [{ start: "08:00", end: "20:00" }], // Miércoles
    4: [{ start: "08:00", end: "20:00" }], // Jueves
    5: [{ start: "08:00", end: "20:00" }], // Viernes
    6: [{ start: "08:00", end: "12:45" }], // Sábado
    0: [], // Domingo sin atención
};
function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}
function minutesToHHMM(min) {
    const h = Math.floor(min / 60) % 24;
    const m = min % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}`;
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
    const [nombre, setNombre] = useState("");
    const [rut, setRut] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");

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
                const res = await fetch(url);
                if (!res.ok) throw new Error('No se pudieron cargar reservas');
                const data = await res.json();
                // Soportar dos formatos: {items:[{startMinutes:480}]} o {items:[{start_utc:ISO}]}
                const items = Array.isArray(data?.items) ? data.items : [];
                const occupied = items.map((it) => {
                    if (typeof it.startMinutes === 'number') return it.startMinutes;
                    if (it.start_utc) {
                        const d = new Date(it.start_utc);
                        // convertir a la fecha local seleccionada
                        return minutesFromMidnight(d);
                    }
                    return null;
                }).filter((n) => typeof n === 'number');
                if (!ignore) setReservedStarts(occupied);
            } catch (e) {
                if (!ignore) setReservedStarts([]);
            } finally {
                if (!ignore) setLoadingRes(false);
            }
        }
        loadReservations();
        return () => { ignore = true; };
    }, [selectedDate, professionalId]);

    // TODO: aquí podrías consultar un backend para traer las ventanas
    const windowsForDay = PROFESSIONAL_WINDOWS[selectedDay] || [];

    const allSlots = useMemo(() => generateDaySlots(SLOT_MINUTES), []);
    const availableSlots = useMemo(
        () => allSlots
            .filter((s) => isWithinWindows(s, windowsForDay))
            .map((s) => ({ ...s, reserved: reservedStarts.includes(s.start) })),
        [allSlots, windowsForDay, reservedStarts]
    );

    // ===============================
    // Confirmar: valida y envía al backend
    //  - Toma el slot seleccionado + fecha
    //  - Incluye nombre y correo del paciente
    //  - Envía POST a /api/agenda/reservar para crear el evento + Meet
    // ===============================
    const handleConfirm = async () => {
        if (!selectedSlot) return;

        if (!nombre || !rut || !telefono || !email.trim()) {
            setNotice("Por favor completa todos los campos.");
            return toast.error("Falta un dato para ingresar tu hora correctamente.")
        }
        if (!email.includes("@")) {
            setNotice("El correo electrónico no es válido.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                nombre_paciente: nombre.trim(),
                rut: rut.trim(),
                telefono: telefono.trim(),
                email: email.trim(),
                fecha: dateToYMD(selectedDate),
                hora: minutesToHHMM(selectedSlot.start),
            };

            const res = await fetch(`${API}/reservas/reservar-horario`, {
                method: "POST",
                headers: { Accept: "application/json" ,
                    "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok) {
                setNotice(`Hora reservada y registrada en Google Calendar para ${selectedDate.toLocaleDateString("es-CL")} ${selectedSlot.label}`);
                setReservedStarts((prev) => [...prev, selectedSlot.start]);
                setSelectedSlot(null);
                setNombre("");
                setRut("");
                setTelefono("");
                setEmail("");
            } else {
                setNotice(data.error || "No se pudo registrar la reserva.");
            }
        } catch (e) {
            setNotice(`Error: ${e.message}`);
        } finally {
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

    // Aquí deberías llamar a tu backend para crear la preferencia de pago
    // y obtener la URL de Mercado Pago
    // opcion agregar botón mercado pago
    const handlePagar = async () => {
        try {
            const response = await fetch("/api/mercadopago/preferencia", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    email: email.trim(),
                    fecha: dateToYMD(selectedDate),
                    hora: minutesToHHMM(selectedSlot.start),
                }),
            });


            const data = await response.json();
            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                setNotice("No se pudo iniciar el pago");
            }
        } catch (error) {
            console.error("Error en handlePagar:", error);
            setNotice("Error al procesar el pago: " + error.message);
        }
    };




    const [title, setTitle] = useState('Consulta Psicologia Clinica – PS. Deniss Beltran Varela');
    const [unitPrice, setUnitPrice] = useState(16500);
    const [quantity, setQuantity] = useState(1);


    async function ProcesarPago(event) {
        event.preventDefault();
        setLoading(true);


        try {
            // Armamos el body tal como lo espera el backend:
            const body = {
                title,
                unit_price: Number(unitPrice),
                quantity: Number(quantity),
            };

            const res = await fetch('https://eric-tepid-claretha.ngrok-free.dev/mercadoPago/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const text = await res.text();
            }

            const data = await res.json();
            // El backend devuelve: id, init_point, sandbox_init_point
            const checkoutUrl = data.sandbox_init_point || data.init_point;
            if (!checkoutUrl) {
                throw new Error('No se recibió URL de checkout desde el backend');
            }

            // Redirigir al Checkout Pro
            window.location.href = checkoutUrl;
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error inesperado');
            setLoading(false);
        }
    }




    return (

        <div className="max-w-5xl mx-auto p-4 sm:p-8">
            <ToastContainer />
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
                            {currentMonth.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
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
                        <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
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

            {/* Leyenda de disponibilidad */}
            <div className="mb-4 text-sm text-gray-600">
                {windowsForDay.length > 0 ? (
                    <p>
                        Fecha seleccionada: <span className="font-medium">{selectedDate.toLocaleDateString("es-CL")}</span> · Horario del profesional para <span className="font-medium">{WEEK_DAYS.find((d) => d.key === selectedDay)?.label}</span>:
                        {" "}
                        {windowsForDay.map((w, i) => (
                            <span key={i} className="inline-block ml-2">
                {w.start}–{w.end}
              </span>
                        ))}
                    </p>
                ) : (
                    <p>No hay horas disponibles este día.</p>
                )}
            </div>
            {loadingRes && (
                <div className="text-xs text-gray-500 mb-2">Actualizando reservas…</div>
            )}

            {/* Grid de 24 horas (bloques de 30 min) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[420px] overflow-y-auto border rounded-md p-3 bg-white">
                {availableSlots.map((slot) => {
                    const isActive = selectedSlot?.start === slot.start;
                    return (
                        <button
                            key={slot.start}
                            onClick={() => setSelectedSlot(slot)}
                            disabled={slot.reserved}
                            className={`text-left rounded-md border px-3 py-2 text-sm transition relative
                ${slot.reserved ? "bg-rose-200 text-rose-700 border-rose-300 cursor-not-allowed font-bold" : isActive
                                ? "border-rose-600 bg-rose-50 text-rose-700"
                                : "border-gray-200 hover:border-rose-300"
                            }`}
                        >
                            {slot.label}
                            {slot.reserved && (
                                <span className="absolute top-1 right-2 text-[6px] uppercase tracking-wide">Agendado</span>
                            )}
                        </button>
                    );
                })}

                {availableSlots.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                        Sin bloques disponibles en este día.
                    </div>
                )}
            </div>

<div className="flex justify-center">
    <button
        className="
                p-2 mt-5
                rounded-lg
                border rounded-2
                text-rose-600
                font-bold
                bg-rose-100
                hover:bg-rose-700 hover:text-white
                "
        onClick={ProcesarPago}
    >
        Agendar mi Hora
    </button>
</div>





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
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm">
                <h3 className="mb-2 text-base font-semibold">Importante</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                    <li>
                        Revisa tu <strong>correo electrónico</strong> para confirmar la hora y recibir el enlace a la videollamada.
                    </li>
                    <li>
                        Si no puedes asistir, por favor <strong>cancela con 24 horas de anticipación</strong>.
                    </li>
                    <li>
                        Los <strong>reagendamientos</strong> se realizan desde esta misma plataforma usando tu misma información.
                    </li>
                    <li>
                        Ante dudas, responde el correo de confirmación o contáctanos desde la sección de <strong>Contacto</strong>.
                    </li>
                </ul>
            </div>
        </div>
    );
}

function validarRut(rut) {
    return /^[0-9]+-[0-9kK]{1}$/.test(rut);
}