/**
 * CONFIGURACIÓN CENTRALIZADA DE HORARIOS
 * Esta configuración se comparte entre:
 * - /AgendaProceso (vista pública para pacientes)
 * - /dashboard/Calendario (vista administrativa)
 */

// Configuración de ventanas horarias por día de la semana
// key: 0=Domingo, 1=Lunes, 2=Martes, etc.
export const HORARIOS_PROFESIONAL = {
  1: [{ start: "08:00", end: "20:00" }], // Lunes
  2: [{ start: "08:00", end: "20:00" }], // Martes
  3: [{ start: "08:00", end: "20:00" }], // Miércoles
  4: [{ start: "08:00", end: "20:00" }], // Jueves
  5: [{ start: "08:00", end: "20:00" }], // Viernes
  6: [{ start: "08:00", end: "12:45" }], // Sábado (medio día)
  0: [], // Domingo - SIN ATENCIÓN
};

// Duración de cada bloque de cita (en minutos)
export const DURACION_CITA = 45;

// Días bloqueados (0=Domingo, 1=Lunes, etc.)
export const DIAS_BLOQUEADOS = [0]; // Solo domingos bloqueados

/**
 * Verifica si un día de la semana está bloqueado
 * @param {number} diaSemana - 0=Domingo, 1=Lunes, etc.
 * @returns {boolean}
 */
export function esDiaBloqueado(diaSemana) {
  return DIAS_BLOQUEADOS.includes(diaSemana) || !HORARIOS_PROFESIONAL[diaSemana] || HORARIOS_PROFESIONAL[diaSemana].length === 0;
}

/**
 * Verifica si una fecha está bloqueada
 * @param {Date} fecha
 * @returns {boolean}
 */
export function esFechaBloqueada(fecha) {
  const diaSemana = fecha.getDay();
  return esDiaBloqueado(diaSemana);
}

/**
 * Obtiene las ventanas horarias para un día específico
 * @param {number} diaSemana - 0=Domingo, 1=Lunes, etc.
 * @returns {Array} Array de objetos {start, end}
 */
export function obtenerVentanasHorarias(diaSemana) {
  return HORARIOS_PROFESIONAL[diaSemana] || [];
}

/**
 * Convierte HH:MM a minutos desde medianoche
 * @param {string} hhmm - Formato "HH:MM"
 * @returns {number}
 */
export function horaAMinutos(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Convierte minutos desde medianoche a HH:MM
 * @param {number} minutos
 * @returns {string}
 */
export function minutosAHora(minutos) {
  const h = Math.floor(minutos / 60) % 24;
  const m = minutos % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

/**
 * Genera todos los slots horarios disponibles para un día
 * @param {number} diaSemana - 0=Domingo, 1=Lunes, etc.
 * @param {Array} horariosOcupados - Array de horas ocupadas ["08:00", "09:45"]
 * @returns {Array} Array de objetos {inicio, fin, disponible}
 */
export function generarSlotsHorarios(diaSemana, horariosOcupados = []) {
  const ventanas = obtenerVentanasHorarias(diaSemana);
  const slots = [];

  ventanas.forEach(ventana => {
    const inicioMin = horaAMinutos(ventana.start);
    const finMin = horaAMinutos(ventana.end);

    for (let min = inicioMin; min < finMin; min += DURACION_CITA) {
      const horaInicio = minutosAHora(min);
      const horaFin = minutosAHora(min + DURACION_CITA);

      // Verificar si está ocupado
      const ocupado = horariosOcupados.some(ho => {
        const hoOcupada = ho.startsWith ? ho : ho.hora || "";
        return hoOcupada.startsWith(horaInicio);
      });

      slots.push({
        start: min,
        end: min + DURACION_CITA,
        label: horaInicio,
        inicio: horaInicio,
        fin: horaFin,
        reserved: ocupado,
        disponible: !ocupado
      });
    }
  });

  return slots;
}

/**
 * Obtiene el nombre del día de la semana en español
 * @param {number} diaSemana - 0=Domingo, 1=Lunes, etc.
 * @returns {string}
 */
export function nombreDiaSemana(diaSemana) {
  const nombres = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
  ];
  return nombres[diaSemana];
}

