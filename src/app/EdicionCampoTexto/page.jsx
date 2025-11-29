"use client"

import { useState } from "react";

// Base de la API configurable por entorno (dev/prod)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function EdicionCampoTexto(){
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Datos del formulario:", formData);
        fetch(`${API}/campos/editar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
          .then(res => res.json())
          .then(data => console.log("Respuesta del servidor:", data))
          .catch(err => console.error("Error al actualizar campo:", err));
    };

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input 
                        type="text" 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                    />
                </label>
                <br />
                <label>
                    Descripción:
                    <input 
                        type="text" 
                        name="descripcion" 
                        value={formData.descripcion} 
                        onChange={handleChange} 
                    />
                </label>
                <br />
                <button type="submit">Guardar</button>
            </form>
        </div>
    )
}