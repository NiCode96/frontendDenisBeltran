"use client";

export default function GestionDeImagenes() {
  return (
    <div>
      <form action="">
        <h1 className="tituloResponsive">Gestion de Imagenes</h1>
        <br />
        <br />
        <div>
          <label className="block mb-1">Subir Imagen</label>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            className="w-full px-3 py-2 border border-white rounded bg-white text-black"
            onChange={(e) => {
              const file = e.target.files[0];
              console.log("Imagen seleccionada:", file);
              // aquí podrías subirla al backend
            }}
          />
        </div>{" "}
        <br />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition w-70"
        >
          Guardar
        </button>
      </form>
<br /><br />

<h2 className="font-black">Seleccione imagen a eliminar</h2>
      <select className="bg-blue-300 text-base text-black font-bold w-80 h-10 " name="" id="">
        <option value="">Imagen 1</option>
        <option value="">Imagen 2</option>
        <option value="">Imagen 3</option>
        
      </select>
    </div>
  );
}
