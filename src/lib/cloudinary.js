import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Upload usando el backend (signed upload)
 * @param {File} file - Archivo de imagen a subir
 * @returns {Promise<Object>} Objeto con URL y datos de la imagen
 */
export async function uploadToCloudinary(file) {
  // Validaciones de archivo
  if (!file) {
    throw new Error("No se ha seleccionado ningún archivo");
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Tipo de archivo no permitido. Solo se aceptan JPG, PNG y WebP");
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("El archivo es demasiado grande. Máximo 5MB permitido");
  }

  console.log("🚀 Subiendo imagen vía backend...");
  console.log("📁 Archivo:", file.name);
  console.log("📊 Tamaño:", (file.size / 1024).toFixed(1) + "KB");

  const formData = new FormData();
  formData.append("imagen", file);

  try {
    const response = await fetch(`${API}/api/cloudinary/upload`, {
      method: "POST",
      mode: 'cors',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Error desconocido del servidor");
    }

    console.log("✅ Upload exitoso!");
    console.log("🔗 URL:", data.url);
    
    return {
      url: data.url,
      publicId: data.publicId,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes
    };
    
  } catch (error) {
    console.error("❌ Error al subir imagen:", error);
    throw error;
  }
}

/**
 * Genera URLs optimizadas para diferentes tamaños
 * @param {string} publicId - ID público de la imagen en Cloudinary
 * @returns {Object} URLs para diferentes tamaños
 */
export function generateOptimizedUrls(publicId) {
  const baseUrl = `https://res.cloudinary.com/drmelc560/image/upload`;
  
  return {
    thumbnail: `${baseUrl}/w_300,h_200,c_fill,q_auto,f_auto/${publicId}`,
    medium: `${baseUrl}/w_600,h_400,c_fill,q_auto,f_auto/${publicId}`,
    large: `${baseUrl}/w_1200,h_800,c_fill,q_auto,f_auto/${publicId}`,
    original: `${baseUrl}/q_auto,f_auto/${publicId}`
  };
}

/**
 * Hook personalizado para manejar la subida de imágenes
 * @returns {Object} Estados y funciones para manejar uploads
 */
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const uploadImage = async (file, options = {}) => {
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Simular progreso (Cloudinary no proporciona progreso real en uploads simples)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadToCloudinary(file, options);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return result;
    } catch (error) {
      setUploadError(error.message);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset después de 1 segundo
    }
  };

  return {
    uploadImage,
    uploading,
    uploadProgress,
    uploadError,
    resetError: () => setUploadError(null)
  };
}