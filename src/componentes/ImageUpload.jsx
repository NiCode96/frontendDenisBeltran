"use client";
import { useState, useRef } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function ImageUpload({ 
  onImageUploaded, 
  currentImage = null, 
  label = "Subir Imagen",
  className = "",
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  disabled = false 
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(currentImage);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Crear preview inmediatamente
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setError(null);

    try {
      setUploading(true);
      
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85));
      }, 200);

      // Upload sin transformaciones (se aplicarán en el preset o al generar URLs)
      const result = await uploadToCloudinary(file);

      clearInterval(progressInterval);
      setProgress(100);

      // Limpiar preview temporal y usar la URL de Cloudinary
      URL.revokeObjectURL(previewUrl);
      setPreview(result.url);
      
      // Notificar al componente padre
      onImageUploaded(result);

      setTimeout(() => setProgress(0), 1000);
      
    } catch (err) {
      setError(err.message);
      setPreview(currentImage); // Volver a la imagen anterior si falla
      console.error("Error al subir imagen:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const removeImage = () => {
    setPreview(null);
    setError(null);
    onImageUploaded(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Área de upload */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || uploading}
        />

        {preview ? (
          /* Preview de la imagen */
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
            />
            
            {!uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm">Subiendo... {progress}%</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Área de upload vacía */
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            
            <div>
              <p className="text-gray-600">
                {uploading ? (
                  <>
                    <span className="text-blue-600">Subiendo imagen...</span>
                    <br />
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </>
                ) : (
                  <>
                    <span className="text-blue-600 hover:text-blue-500">Haz clic para subir</span>
                    <span className="text-gray-500"> o arrastra una imagen aquí</span>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WebP hasta 5MB
              </p>
            </div>
          </div>
        )}

        {/* Barra de progreso */}
        {uploading && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-200 rounded-b-lg overflow-hidden">
            <div 
              className="h-1 bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Información adicional */}
      {preview && !uploading && (
        <div className="text-xs text-gray-500 text-center">
          Imagen guardada en Cloudinary
        </div>
      )}
    </div>
  );
}