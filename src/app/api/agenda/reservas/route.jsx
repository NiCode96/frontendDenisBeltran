// frontend/src/app/api/agenda/reservas/route.js
import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Función para convertir hora "HH:MM" a minutos desde medianoche
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date"); // "YYYY-MM-DD"
    const professionalId = url.searchParams.get("professionalId");

    if (!date || !professionalId) {
      return NextResponse.json(
        { message: "Faltan parámetros date o professionalId" },
        { status: 400 }
      );
    }

    // Consultar horarios ocupados desde el backend
    const backendUrl = `${API}/reservas/horarios-ocupados/${date}`;
    
    try {
      const res = await fetch(backendUrl, {
        mode: 'cors'
      });
      if (!res.ok) {
        throw new Error(`Error del backend: ${res.status}`);
      }
      
      const data = await res.json();
      const horariosOcupados = data.horariosOcupados || [];
      
      // Convertir las horas a minutos desde medianoche
      const items = horariosOcupados.map(hora => ({
        startMinutes: timeToMinutes(hora)
      }));

      return NextResponse.json({ items });
      
    } catch (backendError) {
      console.error('Error consultando backend:', backendError);
      // Si hay error con el backend, devolver array vacío para que funcione
      return NextResponse.json({ items: [] });
    }

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Error obteniendo reservas" },
      { status: 500 }
    );
  }
}
