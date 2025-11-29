import Link from "next/link";

export default function Pricing() {
  const plans = [
    {
      id: "Tarifa Unica",
      title: "FONASA",
      price: "$14.000 ",
      note: "X sesión",
      desc: "Promoción exclusiva para pacientes nuevas",
      accent: "text-rose-600",
      li: "text-gray-600",
      tick: "text-rose-600",
      btn: "bg-rose-600 hover:bg-rose-700 text-white focus-visible:outline-rose-600",
      dark: false,
      popular: false,
      tag: null,
      feats: [
        "Duración: 45 minutos",
        "Sesión online vía videollamada",
        "Espacio seguro para conocerte, compartir tus motivos de consulta y explorar tus objetivos",
        "Atención orientada a mujeres, desde una mirada clínica y empática",
        "Modalidad online | Confidencialidad garantizada",
        "Recordatorio de sesión por correo",
        "Plan de trabajo personalizado tras evaluación inicial"
      ],
    },
    {
      id: "Paquete 4 Sesiones",
      title: "PARTICULAR",
      price: "$16.500",
      note: "X sesión",
      desc: "Ideal para un proceso terapéutico sostenido y enfocado en objetivos a mediano plazo.",
      accent: "text-rose-600",
      li: "text-gray-600",
      tick: "text-rose-600",
      btn: "bg-rose-600 hover:bg-rose-700 text-white focus-visible:outline-rose-600",
      dark: false,
      popular: true,
      tag: "Más elegido",
      feats: [
        "Duración: 45 minutos",
        "Sesión online vía videollamada",
        "Espacio seguro para conocerte, compartir tus motivos de consulta y explorar tus objetivos",
        "Atención orientada a mujeres, desde una mirada clínica y empática",
        "Modalidad online | Confidencialidad garantizada",
        "Incluye boleta para reembolso",
        "Prioridad para reagendar dentro de la semana",
        "Material de apoyo entre sesiones (si aplica)"
      ],
    },
  ];

  return (
    <section className="relative isolate px-6 py-24 sm:py-32 lg:px-8">
      {/* Título */}
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-rose-600">
          <strong>Terapia a tu ritmo, desde donde estés.</strong>
        </h2>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-6xl">
          Atención profesional, confidencial y con enfoque clínico femenino.
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-justify text-lg font-medium text-pretty text-gray-600 sm:text-xl/8">
        Acompañamiento especializado para ansiedad, estrés, autoestima, relaciones y etapas del ciclo vital femenino (PMS/PMDD, embarazo y posparto si aplica). Modalidad online, segura y confidencial.
      </p>

      <div id="precios" className="mt-32">
        {/* Planes */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-y-6 sm:mt-20 md:grid-cols-2 md:gap-x-8 justify-center">
          {plans.map((p) => (
            <div
              key={p.id}
              className={
                p.dark
                  ? "relative rounded-3xl bg-gray-900 p-8 shadow-2xl ring-1 ring-gray-900/10 sm:p-10 flex flex-col h-full transition hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] hover:-translate-y-0.5"
                  : "relative rounded-3xl bg-white/60 supports-[backdrop-filter]:backdrop-blur p-8 ring-1 ring-gray-900/10 sm:mx-8 sm:p-10 lg:mx-0 flex flex-col h-full transition hover:shadow-xl hover:-translate-y-0.5"
              }
            >
              {p.popular && (
                <span className="absolute -top-3 right-4 inline-flex items-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  {p.tag}
                </span>
              )}
              <div className="flex-1">
                <h3 id={`tier-${p.id}`} className={`text-base/7 font-semibold ${p.accent}`}>
                  {/* Título del plan - editable */}
                  {p.title}
                </h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span
                    className={`text-5xl font-semibold tracking-tight ${
                      p.dark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {/* Precio - editable */}
                    {p.price}
                  </span>
                  <span
                    className={`text-sm tracking-wide ${
                      p.dark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {/* Nota debajo del precio - editable */}
                    {p.note}
                  </span>
                </p>
                <p
                  className={`mt-6 text-base/7 text-justify ${
                    p.dark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {/* Descripción - editable */}
                  {p.desc}
                </p>

                {/* Lista de features */}
                <ul
                  role="list"
                  className={`mt-8 space-y-3 text-sm/6 ${p.li} sm:mt-10`}
                >
                  {/* Lista de características - editar cada item en el array feats */}
                  {p.feats.map((f, i) => (
                    <li key={i} className="flex gap-x-3">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className={`h-6 w-5 flex-none ${p.tick}`} // p.tick sets the color of the tick icon
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 
                          1.052l-8 10.5a.75.75 0 0 
                          1-1.127.075l-4.5-4.5a.75.75 0 
                          1 1.06-1.06l3.894 3.893 
                          7.48-9.817a.75.75 0 0 1 
                          1.05-.143Z"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón */}
              <Link
                href="/Agenda"
                aria-describedby={`tier-${p.id}`}
                className={`mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-semibold shadow-md transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 ${p.btn} ${p.dark ? "sm:mt-10" : "sm:mt-10"}`}
              >
                Agendar sesión
              </Link>
              <p className={`mt-2 text-[11px] ${p.dark ? "text-gray-400" : "text-gray-500"}`}>
                Respuesta en menos de 24 horas. Sesiones online, confidenciales.
              </p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-3xl text-center text-sm text-gray-500">
          <p>
            * Los valores informados corresponden a sesiones individuales de 45 minutos. Emisión de boleta disponible para reembolso (según cobertura). Esta atención no reemplaza servicios de urgencia. Si estás en riesgo, comunícate con tu red de apoyo o llama al 131.
          </p>
        </div>
      </div>
    </section>
  );
}