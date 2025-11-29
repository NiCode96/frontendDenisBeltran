"use client";
import { useState, useEffect } from "react";
import PublicacionCard from "@/componentes/PublicacionCard";

// Base de la API configurable por entorno (dev/prod)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Datos de ejemplo temporales
const publicacionesEjemplo = [
  {
    id: "ejemplo_1",
    id_publicacion: 1,
    titulo: "Gestión de la Ansiedad en Tiempos Modernos",
    subtitulo: "Técnicas prácticas para el manejo del estrés diario",
    descripcion: "La ansiedad es una respuesta natural del cuerpo, pero cuando se vuelve crónica puede afectar significativamente nuestra calidad de vida. En este artículo exploramos técnicas basadas en evidencia para su manejo.",
    imagen_url: "/profesional.jpg",
    fecha_creacion: new Date().toISOString(),
    destacada: true
  },
  {
    id: "ejemplo_2", 
    id_publicacion: 2,
    titulo: "La Importancia del Autocuidado Mental",
    subtitulo: "Construyendo hábitos saludables para el bienestar emocional",
    descripcion: "El autocuidado no es un lujo, es una necesidad. Descubre cómo pequeños cambios en tu rutina diaria pueden tener un gran impacto en tu salud mental.",
    imagen_url: "/presentacion.jpg",
    fecha_creacion: new Date().toISOString(),
    destacada: true
  },
  {
    id: "ejemplo_3",
    id_publicacion: 3,
    titulo: "Comunicación Asertiva en Relaciones", 
    subtitulo: "Herramientas para expresar necesidades de manera efectiva",
    descripcion: "Aprender a comunicarnos de manera asertiva es fundamental para mantener relaciones saludables. Te enseñamos las claves para una comunicación efectiva.",
    imagen_url: "/foto.psicologa.jpg",
    fecha_creacion: new Date().toISOString(),
    destacada: true
  }
];

export default function SeccionPublicaciones() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [usandoEjemplos, setUsandoEjemplos] = useState(false);

  useEffect(() => {
    cargarPublicacionesDestacadas();
  }, []);

  const cargarPublicacionesDestacadas = async () => {
    try {
      // Primero intentar cargar publicaciones destacadas
      let response = await fetch(`${API}/api/publicaciones/destacadas`);
      let data = [];
      
      if (response.ok) {
        data = await response.json();
      }
      
      // Si no hay suficientes destacadas, cargar publicaciones recientes
      if (data.length < 3) {
        const responseRecientes = await fetch(`${API}/api/publicaciones`);
        if (responseRecientes.ok) {
          const todasPublicaciones = await responseRecientes.json();
          
          // Filtrar las que no están ya en destacadas
          const publicacionesAdicionales = todasPublicaciones
            .filter(pub => !data.find(dest => dest.id === pub.id))
            .slice(0, 3 - data.length);
          
          data = [...data, ...publicacionesAdicionales];
        }
      }
      
      if (data.length > 0) {
        // Asegurar que siempre tengamos exactamente 3 publicaciones
        const publicacionesMostrar = [...data];
        
        // Si hay menos de 3, completar con ejemplos
        while (publicacionesMostrar.length < 3 && publicacionesMostrar.length < data.length + publicacionesEjemplo.length) {
          const ejemploParaAgregar = publicacionesEjemplo[publicacionesMostrar.length - data.length];
          if (ejemploParaAgregar) {
            publicacionesMostrar.push({
              ...ejemploParaAgregar,
              id: `ejemplo_${publicacionesMostrar.length}`
            });
          } else {
            break;
          }
        }
        
        setPublicaciones(publicacionesMostrar.slice(0, 3));
        setUsandoEjemplos(data.length < 3);
      } else {
        // Si no hay publicaciones en la BD, usar solo ejemplos
        setPublicaciones(publicacionesEjemplo.slice(0, 3));
        setUsandoEjemplos(true);
      }
    } catch (error) {
      console.error("Error de conexión, usando ejemplos:", error);
      // Si hay error de conexión, usar ejemplos
      setPublicaciones(publicacionesEjemplo.slice(0, 3));
      setUsandoEjemplos(true);
      setError(false); // No mostrar error, solo usar ejemplos
    } finally {
      setLoading(false);
    }
  };

  // No mostrar la sección si no hay publicaciones
  if (loading) {
    return (
      <div className="bg-gradient-to-b from-white via-rose-25 to-rose-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-rose-200 border-t-rose-600 rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando publicaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  // No mostrar nada si hay error o no hay publicaciones
  if (error || publicaciones.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-white via-rose-25 to-rose-50 py-20">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Header de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Publicaciones Recientes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre contenido especializado en salud mental y bienestar emocional
          </p>
          
        </div>

        {/* Grid de publicaciones - siempre 3 tarjetas */}
        <div className="grid gap-12 md:grid-cols-3 lg:gap-16">
          {publicaciones.slice(0, 3).map((publicacion) => (
            <PublicacionCard 
              key={publicacion.id || publicacion.id_publicacion} 
              publicacion={publicacion} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}