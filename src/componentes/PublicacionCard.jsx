"use client";
import { useState } from "react";
import Image from "next/image";

export default function PublicacionCard({ publicacion }) {
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(false);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.01] max-w-sm mx-auto transform hover:-translate-y-1">
      
      {/* Header con Avatar y Grupo de Avatars (como el ejemplo) */}
      <div className="p-6 flex items-center justify-between">
        {/* Avatar principal de la psicóloga */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-200">
          <Image
            src="/denis.png"
            alt="Dra. Denisse Beltrán"
            width={64}
            height={64}
            className="w-full h-full object-cover"
            onError={() => {
              // Fallback si no encuentra la imagen
            }}
          />
        </div>

        {/* Grupo de avatars pequeños (comunidad de seguidores) */}
        <div className="flex items-center space-x-1">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 border-2 border-white flex items-center justify-center text-white text-xs">
              
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-green-400 to-green-500 border-2 border-white flex items-center justify-center text-white text-xs">
              
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs">
              
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
              +2K
            </div>
          </div>
        </div>
      </div>

      {/* Imagen de la publicación */}
      {publicacion.imagen_url && !imageError && (
        <div className="relative h-48 w-full">
          <Image
            src={publicacion.imagen_url}
            alt={publicacion.titulo}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Contenido */}
      <div className="p-6">
        {/* Título */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {publicacion.titulo}
        </h3>
        
        {/* Descripción */}
        {publicacion.descripcion && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {publicacion.descripcion}
          </p>
        )}

        {/* Footer con fecha y badge destacada */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{formatearFecha(publicacion.fecha_creacion)}</span>
          </div>

          {publicacion.destacada && (
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Destacada
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons como en el ejemplo Material-UI */}
      <div className="px-6 pb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center space-x-1 transition-colors ${
              liked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'
            }`}
          >
            <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm">{liked ? '124' : '123'}</span>
          </button>

          {/* Share Button */}
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="text-sm">Compartir</span>
          </button>
        </div>

        {/* More Options */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}