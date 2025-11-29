"use client";
import { useState, useEffect } from "react";
import ImageUpload from "@/componentes/ImageUpload";

// Base de la API configurable por entorno (dev/prod)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Publicaciones() {
  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    descripcion: "",
    destacada: false,
    imagen_url: null
  });

  // Estados de control
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [seleccionado, setSeleccionado] = useState("");

  // Cargar publicaciones al iniciar
  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/api/publicaciones`);
      if (response.ok) {
        const data = await response.json();
        setPublicaciones(data);
      } else {
        console.error("Error al cargar publicaciones");
        setMensaje("Error al cargar publicaciones existentes");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMensaje("Error de conexión al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageUploaded = (imageData) => {
    setFormData({
      ...formData,
      imagen_url: imageData ? imageData.url : null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      setMensaje("El título es obligatorio");
      return;
    }

    try {
      setLoadingCreate(true);
      setMensaje("Creando publicación...");

      const response = await fetch(`${API}/api/publicaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje("" + data.message);
        
        // Limpiar formulario
        setFormData({ 
          titulo: "", 
          subtitulo: "", 
          descripcion: "",
          destacada: false,
          imagen_url: null
        });
        
        // Recargar publicaciones sin flickering
        await cargarPublicaciones();
      } else {
        setMensaje(data.error || "Error al crear publicación");
      }
    } catch (error) {
      console.error("Error al guardar publicación:", error);
      setMensaje("Error de conexión al guardar");
    } finally {
      setLoadingCreate(false);
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMensaje(""), 5000);
    }
  };

  const handleSeleccion = (e) => {
    setSeleccionado(e.target.value);
  };

  const handleEliminar = async () => {
    if (seleccionado === "") return;
    
    try {
      setMensaje("Eliminando publicación...");
      
      const response = await fetch(`${API}/api/publicaciones/${seleccionado}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje("" + data.message);
        setSeleccionado("");
        
        // Recargar publicaciones
        await cargarPublicaciones();
      } else {
        setMensaje("" + (data.error || "Error al eliminar publicación"));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      setMensaje("Error de conexión al eliminar");
    }
    
    setTimeout(() => setMensaje(""), 5000);
  };

  const toggleDestacada = async (id) => {
    try {
      const response = await fetch(`${API}/api/publicaciones/${id}/destacada`, {
        method: "PUT",
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje("Estado de destacada actualizado");
        await cargarPublicaciones();
      } else {
        setMensaje("" + (data.error || "Error al actualizar"));
      }
    } catch (error) {
      console.error("Error al actualizar destacada:", error);
      setMensaje("Error de conexión");
    }
    
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Publicaciones</h1>
          <p className="text-gray-600">Crea y administra las publicaciones de la clínica</p>
        </div>

        {/* Formulario para Nueva Publicación */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Nueva Publicación</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título de la Publicación *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Ingrese el título de la publicación"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción Breve
              </label>
              <input
                type="text"
                name="subtitulo"
                value={formData.subtitulo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Descripción corta para vista previa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción Detallada
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={4}
                placeholder="Contenido completo de la publicación"
              />
            </div>

            {/* Checkbox para destacada */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="destacada"
                id="destacada"
                checked={formData.destacada}
                onChange={handleChange}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <label htmlFor="destacada" className="text-sm font-medium text-gray-700">
                Marcar como destacada (aparecerá en la portada)
              </label>
            </div>

            {/* Sección de Imágenes - PENDIENTE DE IMPLEMENTAR */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Imágenes de la Publicación</h3>
              
                          {/* Sección de imagen con Cloudinary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    ¡Sistema de Imágenes Activado!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Sube imágenes aquí.</p>
                  </div>
                </div>
              </div>
            </div>

            <ImageUpload
              label="Imagen Principal de la Publicación"
              onImageUploaded={handleImageUploaded}
              currentImage={formData.imagen_url}
              className="col-span-full"
            />
              
              {/* Comentado temporalmente - será implementado próximamente
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen Principal
                  </label>
                  <input
                    type="file"
                    name="imagen1"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      console.log("Imagen 1 seleccionada:", file);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen Secundaria 1
                  </label>
                  <input
                    type="file"
                    name="imagen2"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      console.log("Imagen 2 seleccionada:", file);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen Secundaria 2
                  </label>
                  <input
                    type="file"
                    name="imagen3"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      console.log("Imagen 3 seleccionada:", file);
                    }}
                  />
                </div>
              </div>
              */}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loadingCreate}
                className="px-6 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-md hover:from-rose-600 hover:to-rose-700 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingCreate ? "Creando..." : "Publicar"}
              </button>
            </div>

            {mensaje && (
              <div className={`p-3 rounded-md text-sm ${
                mensaje.includes('agregada') ? 'bg-green-100 text-green-800' : 
                mensaje.includes('eliminada') ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {mensaje}
              </div>
            )}
          </form>
        </div>

        {/* Gestión de Publicaciones Existentes */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center text-gray-500">
              <div className="animate-spin h-8 w-8 border-4 border-rose-200 border-t-rose-600 rounded-full mx-auto mb-2"></div>
              Cargando publicaciones...
            </div>
          </div>
        ) : publicaciones.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestionar Publicaciones ({publicaciones.length})</h2>
            
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Publicación
                </label>
                <select
                  value={seleccionado}
                  onChange={handleSeleccion}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">-- Selecciona una publicación --</option>
                  {publicaciones.map((pub) => (
                    <option key={pub.id || pub.id_publicacion} value={pub.id || pub.id_publicacion}>
                      {pub.titulo} {pub.destacada ? "" : ""} ({new Date(pub.fecha_creacion).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end gap-2">
                {seleccionado && (
                  <button
                    type="button"
                    onClick={() => toggleDestacada(seleccionado)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium text-sm transition-colors"
                  >
                    Toggle
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleEliminar}
                  disabled={seleccionado === ""}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {/* Vista previa de la publicación seleccionada */}
            {seleccionado !== "" && (() => {
              const publicacionSeleccionada = publicaciones.find(pub => pub.id_publicacion == seleccionado);
              return publicacionSeleccionada && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">Vista Previa</h4>
                    {publicacionSeleccionada.destacada && (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                        Destacada
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Título:</span> {publicacionSeleccionada.titulo}</p>
                    {publicacionSeleccionada.subtitulo && (
                      <p><span className="font-medium">Descripción breve:</span> {publicacionSeleccionada.subtitulo}</p>
                    )}
                    {publicacionSeleccionada.descripcion && (
                      <p><span className="font-medium">Descripción:</span> {publicacionSeleccionada.descripcion}</p>
                    )}
                    <p><span className="font-medium">Creada:</span> {new Date(publicacionSeleccionada.fecha_creacion).toLocaleString()}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">No hay publicaciones aún</p>
              <p className="text-sm">Crea tu primera publicación usando el formulario de arriba</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
