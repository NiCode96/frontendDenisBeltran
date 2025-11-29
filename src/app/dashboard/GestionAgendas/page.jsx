"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { LineChart } from '@mui/x-charts/LineChart';

// Base de la API configurable por entorno (dev/prod)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function GestionAgendas() {
  console.log("Componente GestionAgendas iniciado - API:", API);
  
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [rutFiltro, setRutFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todas");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [pacientesExistentes, setPacientesExistentes] = useState([]);

  // FUNCIONES DE FORMATO
  function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";
    try {
      // Si la fecha está en formato YYYY-MM-DD, convertir directamente sin usar Date()
      if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        const [año, mes, dia] = fecha.split('-');
        return `${dia}/${mes}/${año}`;
      }
      // Para otros formatos, usar date-fns
      return format(new Date(fecha), 'dd/MM/yyyy');
    } catch (error) {
      return "Fecha inválida";
    }
  }

  function formatearHora(hora) {
    if (!hora) return "Sin hora";
    return hora.substring(0, 5); // Mostrar solo HH:MM
  }

  // CARGAR TODAS LAS RESERVAS AL INICIALIZAR
  useEffect(() => {
    console.log("useEffect inicial - Cargando reservas y pacientes...");
    cargarReservasConPacientes();
    cargarPacientesExistentes();
  }, []);

  // MOSTRAR TODAS LAS RESERVAS CUANDO SE CARGAN (sin filtrado automático)
  useEffect(() => {
    console.log("useEffect reservas - Longitud:", reservas.length);
    if (reservas.length > 0) {
      // Si no hay filtros activos, mostrar todas
      if (!fechaFiltro && !rutFiltro && !filtroTexto && statusFiltro === "todas") {
        setReservasFiltradas(reservas);
        setMensaje(`Mostrando todas las reservas (${reservas.length})`);
        console.log("Reservas filtradas establecidas:", reservas.length);
      }
    }
  }, [reservas]);

  // CARGAR RESERVAS CON DATOS DE PACIENTE (optimizado)
  async function cargarReservasConPacientes() {
    console.log("FUNCIÓN cargarReservasConPacientes LLAMADA - Estado cargando:", cargando);
    
    // Evitar múltiples llamadas simultáneas
    if (cargando) {
      console.log("Ya está cargando, saliendo...");
      return;
    }
    
    try {
      console.log("INICIANDO cargarReservasConPacientes...");
      console.log("API URL:", API);
      setCargando(true);
      console.log("Intentando conectar con:", `${API}/reservas/con-paciente`);
      
      const res = await fetch(`${API}/reservas/con-paciente`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Respuesta del servidor:", res.status, res.statusText);
      
      const data = await res.json();
      console.log("Datos recibidos - longitud:", data.length);
      console.log("Primer elemento:", data[0]);
      
      if (res.ok) {
        // Ordenar por fecha de creación descendente (más recientes primero)
        const reservasOrdenadas = data.sort((a, b) => {
          const fechaA = new Date(a.created_at);
          const fechaB = new Date(b.created_at);
          return fechaB - fechaA; // Orden descendente (creadas más recientemente primero)
        });
        console.log("Estableciendo reservas...");
        setReservas(reservasOrdenadas);
        setReservasFiltradas(reservasOrdenadas);
        setMensaje(`Se encontraron ${data.length} reservas`);
        console.log("Reservas cargadas exitosamente - total:", reservasOrdenadas.length);
      } else {
        setMensaje(`Error ${res.status}: ${res.statusText}`);
        console.error("Error del servidor:", res.status, data);
      }
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Error nombre:", error.name);
      console.error("Error mensaje:", error.message);
      console.error("Stack trace:", error.stack);
      setMensaje(`Error de conexión: ${error.message}`);
    } finally {
      console.log("Finalizando carga - setCargando(false)");
      setCargando(false);
    }
  }

  // ACTUALIZAR Y APLICAR FILTROS MANUALMENTE (optimizado anti-parpadeo)
  async function actualizarYFiltrar() {
    // Evitar múltiples llamadas simultáneas
    if (cargando) return;
    
    console.log('Iniciando actualización y filtrado...');
    console.log('Filtros activos:', { fechaFiltro, rutFiltro, filtroTexto, statusFiltro });

    setCargando(true);

    try {
      // Cargar reservas más recientes
      const res = await fetch(`${API}/reservas/con-paciente`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await res.json();
      console.log("Datos recibidos:", data.length, "reservas");

      if (res.ok) {
        // Ordenar por fecha de creación descendente
        const reservasOrdenadas = data.sort((a, b) => {
          const fechaA = new Date(a.created_at);
          const fechaB = new Date(b.created_at);
          return fechaB - fechaA;
        });
        
        // Actualizar estado de reservas base
        setReservas(reservasOrdenadas);

        // Aplicar todos los filtros activos
        let resultadoFiltrado = [...reservasOrdenadas];

        // Filtro por fecha
        if (fechaFiltro) {
          resultadoFiltrado = resultadoFiltrado.filter(reserva => {
            if (!reserva.fecha) return false;
            const fechaReserva = reserva.fecha.includes('T')
              ? reserva.fecha.split('T')[0]
              : reserva.fecha;
            return fechaReserva === fechaFiltro;
          });
        }

        // Filtro por RUT
        if (rutFiltro && rutFiltro.trim()) {
          const rutLimpio = rutFiltro.trim().toLowerCase().replace(/[.-]/g, '');
          resultadoFiltrado = resultadoFiltrado.filter(reserva => {
            if (!reserva.rut) return false;
            const rutReserva = reserva.rut.toLowerCase().replace(/[.-]/g, '');
            return rutReserva.includes(rutLimpio);
          });
        }

        // Filtro por nombre
        if (filtroTexto && filtroTexto.trim()) {
          const textoLimpio = filtroTexto.trim().toLowerCase();
          resultadoFiltrado = resultadoFiltrado.filter(reserva => {
            if (!reserva.nombre) return false;
            return reserva.nombre.toLowerCase().includes(textoLimpio);
          });
        }
        
        // Filtro por estado
        if (statusFiltro && statusFiltro !== "todas") {
          resultadoFiltrado = resultadoFiltrado.filter(reserva => {
            return reserva.status === statusFiltro;
          });
        }

        setReservasFiltradas(resultadoFiltrado);

        // Mensaje informativo
        if (fechaFiltro || rutFiltro || filtroTexto || statusFiltro !== "todas") {
          setMensaje(`Filtrado: ${resultadoFiltrado.length} de ${reservasOrdenadas.length} reservas`);
        } else {
          setMensaje(`Mostrando todas las reservas (${reservasOrdenadas.length})`);
        }

        console.log("Filtrado completo:", resultadoFiltrado.length, "reservas");
      } else {
        setMensaje(`Error ${res.status}: ${res.statusText}`);
        console.error("Error del servidor:", res.status, data);
      }
    } catch (error) {
      console.error("Error completo:", error);
      setMensaje(`Error de conexión: ${error.message}`);
    } finally {
      setCargando(false);
    }
  }

  // CARGAR LISTA DE PACIENTES EXISTENTES
  async function cargarPacientesExistentes() {
    console.log("INICIANDO cargarPacientesExistentes()");
    try {
      console.log("Haciendo fetch a:", `${API}/pacientes`);
      const res = await fetch(`${API}/pacientes`);
      console.log("Respuesta pacientes:", res.status, res.statusText);
      
      const data = await res.json();
      console.log("Datos pacientes recibidos:", data.length);
      
      if (res.ok) {
        setPacientesExistentes(data);
        console.log("Pacientes establecidos exitosamente");
      } else {
        console.error("Error en respuesta pacientes:", data);
      }
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    }
  }

  // APLICAR FILTRO POR FECHA
  function aplicarFiltroFecha() {
    console.log('Aplicando filtro de fecha:', fechaFiltro);

    if (!fechaFiltro) {
      // Aplicar otros filtros activos
      let resultado = [...reservas];

      if (rutFiltro && rutFiltro.trim()) {
        const rutLimpio = rutFiltro.trim().toLowerCase().replace(/[.-]/g, '');
        resultado = resultado.filter(reserva => {
          if (!reserva.rut) return false;
          const rutReserva = reserva.rut.toLowerCase().replace(/[.-]/g, '');
          return rutReserva.includes(rutLimpio);
        });
      }

      if (filtroTexto && filtroTexto.trim()) {
        const textoLimpio = filtroTexto.trim().toLowerCase();
        resultado = resultado.filter(reserva => {
          if (!reserva.nombre) return false;
          return reserva.nombre.toLowerCase().includes(textoLimpio);
        });
      }

      if (statusFiltro && statusFiltro !== "todas") {
        resultado = resultado.filter(reserva => reserva.status === statusFiltro);
      }

      setReservasFiltradas(resultado);
      setMensaje(resultado.length === reservas.length ? "Mostrando todas las reservas" : `Filtrado: ${resultado.length} reservas`);
      return;
    }

    // Filtrar reservas por la fecha seleccionada
    let filtradas = reservas.filter(reserva => {
      if (!reserva.fecha) return false;
      
      // Extraer solo la fecha (YYYY-MM-DD) de la fecha ISO del backend
      let fechaReserva;
      if (reserva.fecha.includes('T')) {
        fechaReserva = reserva.fecha.split('T')[0];
      } else {
        fechaReserva = reserva.fecha;
      }
      
      // Comparar con la fecha seleccionada
      return fechaReserva === fechaFiltro;
    });
    
    // Aplicar otros filtros sobre el resultado
    if (rutFiltro && rutFiltro.trim()) {
      const rutLimpio = rutFiltro.trim().toLowerCase().replace(/[.-]/g, '');
      filtradas = filtradas.filter(reserva => {
        if (!reserva.rut) return false;
        const rutReserva = reserva.rut.toLowerCase().replace(/[.-]/g, '');
        return rutReserva.includes(rutLimpio);
      });
    }

    if (filtroTexto && filtroTexto.trim()) {
      const textoLimpio = filtroTexto.trim().toLowerCase();
      filtradas = filtradas.filter(reserva => {
        if (!reserva.nombre) return false;
        return reserva.nombre.toLowerCase().includes(textoLimpio);
      });
    }

    if (statusFiltro && statusFiltro !== "todas") {
      filtradas = filtradas.filter(reserva => reserva.status === statusFiltro);
    }

    console.log('Resultado filtro fecha:', filtradas.length, 'reservas');
    setReservasFiltradas(filtradas);
    setMensaje(`Se encontraron ${filtradas.length} reservas para el ${formatearFecha(fechaFiltro)}`);
  }

  // FUNCIÓN AUXILIAR PARA FORMATEAR FECHA PARA COMPARACIÓN
  function formatearFechaParaComparacion(fechaISO) {
    try {
      const [año, mes, dia] = fechaISO.split('-');
      return `${dia}/${mes}/${año}`;
    } catch (error) {
      return fechaISO;
    }
  }

  // FUNCIÓN AUXILIAR PARA CONVERTIR FECHA A FORMATO ISO
  function convertirFechaAISO(fecha) {
    // Si ya está en formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }
    
    // Si está en formato DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
      const [dia, mes, año] = fecha.split('/');
      return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    
    // Intentar parsear como Date y convertir a ISO
    const fechaObj = new Date(fecha);
    if (!isNaN(fechaObj.getTime())) {
      return fechaObj.toISOString().split('T')[0];
    }
    
    throw new Error('Formato de fecha no reconocido');
  }

  // APLICAR FILTRO POR RUT (función interna mejorada)
  function aplicarFiltroRut() {
    console.log("Aplicando filtro RUT:", rutFiltro);

    // Empezar con todas las reservas
    let resultado = [...reservas];

    // Aplicar filtro de fecha si existe
    if (fechaFiltro) {
      resultado = resultado.filter(reserva => {
        if (!reserva.fecha) return false;
        const fechaReserva = reserva.fecha.includes('T')
          ? reserva.fecha.split('T')[0]
          : reserva.fecha;
        return fechaReserva === fechaFiltro;
      });
    }

    // Aplicar filtro de RUT si existe
    if (rutFiltro && rutFiltro.trim()) {
      const rutLimpio = rutFiltro.trim().toLowerCase().replace(/[.-]/g, '');
      resultado = resultado.filter(reserva => {
        if (!reserva.rut) return false;
        const rutReserva = reserva.rut.toLowerCase().replace(/[.-]/g, '');
        return rutReserva.includes(rutLimpio) || rutReserva.startsWith(rutLimpio);
      });
    }

    // Aplicar filtro de nombre si existe
    if (filtroTexto && filtroTexto.trim()) {
      const textoLimpio = filtroTexto.trim().toLowerCase();
      resultado = resultado.filter(reserva => {
        if (!reserva.nombre) return false;
        return reserva.nombre.toLowerCase().includes(textoLimpio);
      });
    }

    // Aplicar filtro de status si existe
    if (statusFiltro && statusFiltro !== "todas") {
      resultado = resultado.filter(reserva => reserva.status === statusFiltro);
    }

    console.log("Resultado filtro RUT:", resultado.length, "reservas");
    setReservasFiltradas(resultado);

    if (!rutFiltro || !rutFiltro.trim()) {
      const hayFiltros = fechaFiltro || filtroTexto || statusFiltro !== "todas";
      setMensaje(hayFiltros ? `Filtrado: ${resultado.length} reservas` : `Mostrando todas las reservas (${resultado.length})`);
    } else {
      setMensaje(`Se encontraron ${resultado.length} reservas para RUT que contiene: ${rutFiltro}`);
    }
  }

  // FILTRAR POR RUT (evento de formulario)
  function filtrarPorRut(e) {
    e.preventDefault();
    aplicarFiltroRut();
  }

  // MANEJAR CAMBIO EN INPUT DE RUT (filtrado automático)
  function manejarCambioRut(e) {
    const valor = e.target.value;
    setRutFiltro(valor);
    
    // Si el campo está vacío, mostrar todas las reservas
    if (!valor.trim()) {
      setReservasFiltradas(reservas);
      setMensaje("Mostrando todas las reservas");
      return;
    }
    
    // Aplicar filtro automáticamente después de 3 caracteres
    if (valor.trim().length >= 3) {
      // Pequeño delay para mejor UX
      clearTimeout(window.rutTimer);
      window.rutTimer = setTimeout(() => {
        aplicarFiltroRut();
      }, 300);
    }
  }

  // FILTRAR POR STATUS
  function filtrarPorStatus(status) {
    console.log('Filtrando por status:', status);
    setStatusFiltro(status);

    // Empezar con todas las reservas
    let resultado = [...reservas];

    // Aplicar filtro de fecha si existe
    if (fechaFiltro) {
      resultado = resultado.filter(reserva => {
        if (!reserva.fecha) return false;
        const fechaReserva = reserva.fecha.includes('T')
          ? reserva.fecha.split('T')[0]
          : reserva.fecha;
        return fechaReserva === fechaFiltro;
      });
    }

    // Aplicar filtro de RUT si existe
    if (rutFiltro && rutFiltro.trim()) {
      const rutLimpio = rutFiltro.trim().toLowerCase().replace(/[.-]/g, '');
      resultado = resultado.filter(reserva => {
        if (!reserva.rut) return false;
        const rutReserva = reserva.rut.toLowerCase().replace(/[.-]/g, '');
        return rutReserva.includes(rutLimpio);
      });
    }

    // Aplicar filtro de nombre si existe
    if (filtroTexto && filtroTexto.trim()) {
      const textoLimpio = filtroTexto.trim().toLowerCase();
      resultado = resultado.filter(reserva => {
        if (!reserva.nombre) return false;
        return reserva.nombre.toLowerCase().includes(textoLimpio);
      });
    }

    // Aplicar filtro de status
    if (status !== "todas") {
      resultado = resultado.filter(reserva => reserva.status === status);
    }

    console.log('Resultado filtro status:', resultado.length, 'reservas');
    setReservasFiltradas(resultado);

    if (status === "todas") {
      const filtrosActivos = [fechaFiltro, rutFiltro, filtroTexto].filter(Boolean).length;
      if (filtrosActivos > 0) {
        setMensaje(`Filtrado: ${resultado.length} de ${reservas.length} reservas`);
      } else {
        setMensaje(`Mostrando todas las reservas (${resultado.length})`);
      }
    } else {
      setMensaje(`Se encontraron ${resultado.length} reservas ${status}`);
    }
  }

  // APLICAR FILTRO POR NOMBRE (función interna mejorada)
  function aplicarFiltroNombre() {
    console.log("Aplicando filtro nombre:", filtroTexto);

    // Empezar con todas las reservas
    let resultado = [...reservas];

    // Aplicar filtro de fecha si existe
    if (fechaFiltro) {
      resultado = resultado.filter(reserva => {
        if (!reserva.fecha) return false;
        const fechaReserva = reserva.fecha.includes('T')
          ? reserva.fecha.split('T')[0]
          : reserva.fecha;
        return fechaReserva === fechaFiltro;
      });
    }

    // Aplicar filtro de RUT si existe
    if (rutFiltro && rutFiltro.trim()) {
      const rutLimpio = rutFiltro.trim().toLowerCase().replace(/[.-]/g, '');
      resultado = resultado.filter(reserva => {
        if (!reserva.rut) return false;
        const rutReserva = reserva.rut.toLowerCase().replace(/[.-]/g, '');
        return rutReserva.includes(rutLimpio);
      });
    }

    // Aplicar filtro de nombre si existe
    if (filtroTexto && filtroTexto.trim()) {
      const textoLimpio = filtroTexto.trim().toLowerCase();
      resultado = resultado.filter(reserva => {
        if (!reserva.nombre) return false;
        const nombreReserva = reserva.nombre.toLowerCase();

        // Buscar coincidencias en nombre completo o por palabras
        const palabrasBusqueda = textoLimpio.split(' ').filter(p => p.length > 0);

        // Si contiene todas las palabras buscadas
        return palabrasBusqueda.every(palabra => nombreReserva.includes(palabra)) ||
               nombreReserva.includes(textoLimpio);
      });
    }

    // Aplicar filtro de status si existe
    if (statusFiltro && statusFiltro !== "todas") {
      resultado = resultado.filter(reserva => reserva.status === statusFiltro);
    }

    console.log("Resultado filtro nombre:", resultado.length, "reservas");
    setReservasFiltradas(resultado);

    if (!filtroTexto || !filtroTexto.trim()) {
      const hayFiltros = fechaFiltro || rutFiltro || statusFiltro !== "todas";
      setMensaje(hayFiltros ? `Filtrado: ${resultado.length} reservas` : `Mostrando todas las reservas (${resultado.length})`);
    } else {
      setMensaje(`Se encontraron ${resultado.length} reservas para nombre que contiene: ${filtroTexto}`);
    }
  }

  // FILTRAR POR TEXTO (NOMBRE) - evento de input con autocompletado
  function manejarFiltroTexto(e) {
    const texto = e.target.value;
    setFiltroTexto(texto);
    
    if (!texto.trim()) {
      setReservasFiltradas(reservas);
      setMensaje("Mostrando todas las reservas");
      return;
    }

    // Aplicar filtro automáticamente después de 2 caracteres
    if (texto.trim().length >= 2) {
      // Pequeño delay para mejor UX
      clearTimeout(window.nombreTimer);
      window.nombreTimer = setTimeout(() => {
        aplicarFiltroNombre();
      }, 300);
    }
  }

  // FILTRAR POR NOMBRE (evento de formulario)
  function filtrarPorNombre(e) {
    if (e) e.preventDefault();
    aplicarFiltroNombre();
  }

  // ANULAR RESERVA
  async function anularReserva(idReserva) {
    if (window.confirm("¿Estás seguro de que deseas anular esta reserva?")) {
      console.log('Iniciando anulación de reserva:', idReserva);
      try {
        console.log('Enviando petición a:', `${API}/reservas/anular`);
        const res = await fetch(`${API}/reservas/anular`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: idReserva }),
        });

        console.log('Respuesta recibida - Status:', res.status);
        const data = await res.json();
        console.log('Datos de respuesta:', data);

        if (res.ok) {
          setMensaje("Reserva anulada exitosamente");
          console.log('Reserva anulada exitosamente');
          cargarReservasConPacientes(); // Recargar datos
        } else {
          setMensaje(`Error al anular la reserva: ${data.message || 'Error desconocido'}`);
          console.error('Error del servidor:', data);
        }
      } catch (error) {
        console.error("Error en anularReserva:", error);
        setMensaje("Error de conexión al anular la reserva");
      }
    }
  }

  // ACTUALIZAR STATUS DE RESERVA
  async function actualizarStatus(idReserva, nuevoStatus) {
    console.log('Iniciando actualización de status:', idReserva, 'a:', nuevoStatus);
    try {
      console.log('Enviando petición a:', `${API}/reservas/actualizar-status`);
      const res = await fetch(`${API}/reservas/actualizar-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idReserva, status: nuevoStatus }),
      });

      console.log('Respuesta recibida - Status:', res.status);
      const data = await res.json();
      console.log('Datos de respuesta:', data);

      if (res.ok) {
        setMensaje(`Status actualizado a: ${nuevoStatus}`);
        console.log('Status actualizado exitosamente');
        cargarReservasConPacientes(); // Recargar datos
      } else {
        setMensaje(`Error al actualizar status: ${data.message || 'Error desconocido'}`);
        console.error('Error del servidor:', data);
      }
    } catch (error) {
      console.error("Error en actualizarStatus:", error);
      setMensaje("Error de conexión al actualizar status");
    }
  }

  // CONECTAR RESERVA CON PACIENTE EXISTENTE
  async function conectarConPaciente(idReserva, idPaciente) {
    try {
      const res = await fetch(`${API}/reservas/conectar-paciente`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idReserva, idPaciente }),
      });

      if (res.ok) {
        setMensaje("Reserva conectada con paciente exitosamente");
        cargarReservasConPacientes(); // Recargar datos
      } else {
        setMensaje("Error al conectar con paciente");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error al conectar con paciente");
    }
  }

  // CREAR NUEVO PACIENTE DESDE RESERVA
  async function crearPacienteDesdeReserva(idReserva) {
    try {
      const res = await fetch(`${API}/reservas/crear-paciente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idReserva }),
      });

      if (res.ok) {
        const data = await res.json();
        setMensaje(`Paciente creado exitosamente (ID: ${data.idPaciente})`);
        cargarReservasConPacientes(); // Recargar datos
        cargarPacientesExistentes(); // Recargar pacientes
      } else {
        setMensaje("Error al crear paciente");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error al crear paciente");
    }
  }

  // FILTRAR POR RUT USANDO BACKEND (función alternativa más eficiente)
  async function filtrarPorRutBackend(rut) {
    if (!rut || rut.trim() === '') {
      cargarReservasConPacientes();
      return;
    }
    
    try {
      setCargando(true);
      const res = await fetch(`${API}/reservas/buscar-rut`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rut: rut.trim() })
      });
      
      if (res.ok) {
        const data = await res.json();
        setReservasFiltradas(data);
        setMensaje(`Se encontraron ${data.length} reservas para RUT: ${rut}`);
      } else {
        setMensaje('Error al filtrar por RUT');
      }
    } catch (error) {
      console.error('Error al filtrar por RUT:', error);
      setMensaje('Error de conexión al filtrar por RUT');
    } finally {
      setCargando(false);
    }
  }

  // FILTRAR POR FECHA USANDO BACKEND (función alternativa más eficiente)
  async function filtrarPorFechaBackend(fecha) {
    if (!fecha) {
      cargarReservasConPacientes();
      return;
    }
    
    try {
      setCargando(true);
      const res = await fetch(`${API}/reservas/por-fecha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fecha })
      });
      
      if (res.ok) {
        const data = await res.json();
        setReservasFiltradas(data);
        setMensaje(`Se encontraron ${data.length} reservas para el ${formatearFecha(fecha)}`);
      } else {
        setMensaje('Error al filtrar por fecha');
      }
    } catch (error) {
      console.error('Error al filtrar por fecha:', error);
      setMensaje('Error de conexión al filtrar por fecha');
    } finally {
      setCargando(false);
    }
  }

  // LIMPIAR FILTROS
  function limpiarFiltros() {
    setFechaFiltro("");
    setRutFiltro("");
    setStatusFiltro("todas");
    setFiltroTexto("");
    setReservasFiltradas(reservas);
    setMensaje("Filtros limpiados - Mostrando todas las reservas");
    
    // Limpiar timers si existen
    if (window.rutTimer) clearTimeout(window.rutTimer);
    if (window.nombreTimer) clearTimeout(window.nombreTimer);
    
    console.log("Filtros limpiados - Mostrando todas las reservas");
  }

  // PROCESAR DATOS PARA GRÁFICO MENSUAL
  const datosGraficoMensual = useMemo(() => {
    if (!reservas.length) return [];

    const añoActual = new Date().getFullYear();
    const mesesData = {};
    
    // Inicializar todos los meses del año actual
    for (let mes = 0; mes < 12; mes++) {
      const fecha = new Date(añoActual, mes, 1);
      const claveMes = fecha.toISOString().split('T')[0].substring(0, 7); // YYYY-MM
      mesesData[claveMes] = {
        fecha: fecha,
        mes: fecha.toLocaleDateString('es-CL', { month: 'short' }),
        total: 0
      };
    }
    
    // Contar reservas por mes
    reservas.forEach(reserva => {
      if (reserva.fecha) {
        const fechaReserva = new Date(reserva.fecha);
        if (fechaReserva.getFullYear() === añoActual) {
          const claveMes = reserva.fecha.substring(0, 7); // YYYY-MM
          if (mesesData[claveMes]) {
            mesesData[claveMes].total++;
          }
        }
      }
    });
    
    return Object.values(mesesData);
  }, [reservas]);

  // CONFIGURACIÓN DEL GRÁFICO MUI
  const xAxis = [
    {
      dataKey: 'fecha',
      scaleType: 'time',
      valueFormatter: (value) => {
        return new Date(value).toLocaleDateString('es-CL', { month: 'short' });
      },
    },
  ];

  const yAxis = [
    {
      valueFormatter: (value) => `${value} reservas`,
    },
  ];

  const series = [
    {
      dataKey: 'total',
      label: 'Reservas Mensuales',
      showMark: true,
      color: '#3b82f6',
      valueFormatter: (value) => `${value} reservas`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestión de Agendas</h1>
              <p className="text-slate-200">Administra y supervisa todas las reservas de pacientes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Última actualización: {new Date().toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* Controles Principales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={fechaFiltro}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setFechaFiltro(valor);
                    // Filtro manual: usa el botón "Actualizar" para aplicar filtros
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  title="Selecciona una fecha y presiona 'Actualizar' para filtrar"
                />
              </div>
              
              {/* Filtro por RUT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                <input
                  type="text"
                  value={rutFiltro}
                  onChange={(e) => {
                    const valor = e.target.value.toUpperCase();
                    setRutFiltro(valor);
                    
                    // Filtrar automáticamente después de 3 caracteres
                    if (valor.trim().length >= 3) {
                      clearTimeout(window.rutTimer);
                      window.rutTimer = setTimeout(() => {
                        aplicarFiltroRut();
                      }, 300);
                    } else if (valor.trim().length === 0) {
                      setReservasFiltradas(reservas);
                      setMensaje("Mostrando todas las reservas");
                    }
                  }}
                  placeholder="12.345.678-9 (filtro automático)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  title="Filtro automático después de 3 caracteres"
                />
              </div>
              
              {/* Filtro por texto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                <input
                  type="text"
                  placeholder="Nombre (filtro automático)..."
                  value={filtroTexto}
                  onChange={manejarFiltroTexto}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  title="Filtro automático después de 2 caracteres"
                />
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                title="Limpiar todos los filtros"
              >
                Limpiar
              </button>
              <button
                onClick={actualizarYFiltrar}
                disabled={cargando}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                title="Actualizar reservas y aplicar filtros"
              >
                {cargando ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </div>
          
          {/* Filtros por estado */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 py-2">Estado:</span>
            {[
              { key: "todas", label: "Todas", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
              { key: "pendiente", label: "Pendiente", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
              { key: "confirmada", label: "Confirmada", color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
              { key: "completada", label: "Completada", color: "bg-green-100 text-green-800 hover:bg-green-200" },
              { key: "cancelada", label: "Cancelada", color: "bg-red-100 text-red-800 hover:bg-red-200" }
            ].map(status => (
              <button
                key={status.key}
                onClick={() => filtrarPorStatus(status.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFiltro === status.key 
                    ? status.color.replace('hover:bg-', 'bg-').replace('100', '200')
                    : status.color
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

      {/* MENSAJE DE STATUS */}
      {mensaje && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-2xl mb-4">
          {mensaje}
        </div>
      )}

      {/* TABLA DE RESERVAS */}
      {cargando ? (
        <div className="text-center py-8">
          <p className="text-2xl font-bold">Cargando reservas...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Reservas ({reservasFiltradas.length})
              </h2>
              {/* Indicador de filtros activos */}
              {(fechaFiltro || rutFiltro || filtroTexto || statusFiltro !== "todas") && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <span className="px-2 py-1 bg-blue-100 rounded-full text-xs font-medium">
                    Filtros activos: {[fechaFiltro && 'Fecha', rutFiltro && 'RUT', filtroTexto && 'Nombre', statusFiltro !== 'todas' && 'Estado'].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
            {mensaje && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                mensaje.includes('Listo') ? 'bg-green-100 text-green-800' :
                mensaje.includes('Error') ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {mensaje}
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto" style={{ maxHeight: '60vh' }}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-left font-medium text-gray-900">Fecha Creación</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-900">Paciente</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-900">RUT</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-900">Teléfono</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-900">Fecha Cita</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-900">Hora</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-900">Estado</th>
                  <th className="px-3 py-3 text-center font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">

                {reservasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        No hay reservas que mostrar
                      </div>
                    </td>
                  </tr>
                ) : (
                  reservasFiltradas.map((reserva, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-gray-600">
                        {new Date(reserva.created_at).toLocaleDateString('es-CL', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: '2-digit' 
                        })}
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900">{reserva.nombre}</td>
                      <td className="px-3 py-3 text-gray-600 font-mono text-xs">{reserva.rut}</td>
                      <td className="px-3 py-3 text-gray-600 text-xs">{reserva.telefono}</td>
                      <td className="px-3 py-3 text-gray-600">{formatearFecha(reserva.fecha)}</td>
                      <td className="px-3 py-3 text-gray-600 font-mono">{formatearHora(reserva.hora)}</td>
                      <td className="px-3 py-3">
                        <select
                          value={reserva.status || 'pendiente'}
                          onChange={(e) => actualizarStatus(reserva.id_paciente, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="completada">Completada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => anularReserva(reserva.id_paciente)}
                            className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={reserva.status === 'cancelada'}
                          >
                            {reserva.status === 'cancelada' ? 'Cancelada' : 'Anular'}
                          </button>
                          
                          {!reserva.id_paciente && (
                            <>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    conectarConPaciente(reserva.id, e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                                className="text-xs border border-gray-300 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Conectar paciente...</option>
                                {pacientesExistentes.map((paciente) => (
                                  <option key={paciente.id_paciente} value={paciente.id_paciente}>
                                    {paciente.nombre} {paciente.apellido} - {paciente.rut}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => crearPacienteDesdeReserva(reserva.id)}
                                className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                              >
                                Crear Paciente
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ESTADÍSTICAS Y GRÁFICO */}
      <div className="mt-6 space-y-6">
        {/* Contadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <h3 className="font-bold text-2xl text-gray-900">{reservas.length}</h3>
            <p className="text-slate-600 text-sm font-medium">Total Reservas</p>
          </div>
          <div className="bg-white border border-blue-200 rounded-lg p-4 text-center shadow-sm">
            <h3 className="font-bold text-2xl text-blue-600">
              {reservas.filter(r => r.fecha === new Date().toISOString().split('T')[0]).length}
            </h3>
            <p className="text-slate-600 text-sm font-medium">Hoy</p>
          </div>
          <div className="bg-white border border-green-200 rounded-lg p-4 text-center shadow-sm">
            <h3 className="font-bold text-2xl text-green-600">
              {reservas.filter(r => {
                const mesActual = new Date().toISOString().substring(0, 7);
                return r.fecha && r.fecha.substring(0, 7) === mesActual;
              }).length}
            </h3>
            <p className="text-slate-600 text-sm font-medium">Este Mes</p>
          </div>
        </div>

        {/* Gráfico Comparativo Mensual */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Comparativo Mensual de Reservas {new Date().getFullYear()}</h3>
            <p className="text-sm text-gray-600">Visualiza el comportamiento de reservas a lo largo del año</p>
          </div>
          
          {datosGraficoMensual.length > 0 ? (
            <div className="h-80">
              <LineChart
                dataset={datosGraficoMensual}
                xAxis={xAxis}
                yAxis={yAxis}
                series={series}
                height={300}
                grid={{ vertical: true, horizontal: true }}
                margin={{ left: 80, right: 20, top: 20, bottom: 60 }}
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2"><div className="text-4xl mb-2">📈</div></div>
                <p>Cargando datos del gráfico...</p>
              </div>
            </div>
          )}
          
          {/* Resumen estadístico */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <span className="font-medium text-gray-900">
                  {Math.max(...datosGraficoMensual.map(d => d.total))}
                </span>
                <p className="text-gray-600">Mes con más reservas</p>
              </div>
              <div className="text-center">
                <span className="font-medium text-gray-900">
                  {Math.round(datosGraficoMensual.reduce((sum, d) => sum + d.total, 0) / 12)}
                </span>
                <p className="text-gray-600">Promedio mensual</p>
              </div>
              <div className="text-center">
                <span className="font-medium text-gray-900">
                  {datosGraficoMensual.filter(d => d.total > 0).length}
                </span>
                <p className="text-gray-600">Meses activos</p>
              </div>
              <div className="text-center">
                <span className="font-medium text-gray-900">
                  {datosGraficoMensual.reduce((sum, d) => sum + d.total, 0)}
                </span>
                <p className="text-gray-600">Total año</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}