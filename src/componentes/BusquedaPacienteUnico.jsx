import "server-only";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function obtenerPacientes({ rut }) {
  const common = { cache: "no-store" };

  if (rut && rut.trim() !== "") {
    const payload = {
      ...common,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rut }),
    };

    // 1) intento con /pacientes/contieneRut
    let res = await fetch(`${API}/pacientes/contieneRut`, payload);

    // 2) si no existe esa ruta (404), reintenta sin prefijo: /contieneRut
    if (res.status === 404) {
      res = await fetch(`${API}/contieneRut`, payload);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "(sin cuerpo)");
      throw new Error(
        `Error consultando paciente por similitud de RUT (status ${res.status}): ${errText}`
      );
    }

    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } else {
    const res = await fetch(`${API}/pacientes`, common).catch(() => null);
    if (res && res.ok) {
      return await res.json();
    }
    // Fallback por si la lista general también está montada en raíz
    const res2 = await fetch(`${API}/`, common);
    if (!res2.ok) {
      const errText = await res2.text().catch(() => "(sin cuerpo)");
      throw new Error(
        `Error al listar Pacientes (status ${res2.status}): ${errText}`
      );
    }
    return await res2.json();
  }
}