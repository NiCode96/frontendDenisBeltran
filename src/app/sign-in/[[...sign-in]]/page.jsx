"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

export default function Page() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-br from-sky-50 via-white to-cyan-100">
        <div className="flex items-center gap-3 text-sm text-sky-700">
          <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
          <span className="font-medium">Cargando panel de acceso…</span>
        </div>
      </main>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await signIn.create({
        identifier: email.trim(),
        password: password,
      });

      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push("/dashboard");
      } else {
        // factores adicionales, OTP, etc.
        setError("Se requiere un factor adicional para completar el ingreso.");
      }
    } catch (err) {
      const msg =
        err?.errors?.[0]?.message ||
        "No pudimos iniciar sesión. Revisa tus datos e inténtalo nuevamente.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOAuth(provider) {
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      const msg =
        err?.errors?.[0]?.message || "No fue posible continuar con el proveedor.";
      setError(msg);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-10 md:gap-14">
        {/* Lado izquierdo: branding */}
        <section className="hidden md:flex flex-1 flex-col gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/70 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Inicia Sesion con altos estandares de seguridad
          </span>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Medify
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500">
              Gestion clinica en la nube. Desarrollo digital a tu alcance.
            </span>
          </h1>

          <p className="text-sm lg:text-base text-slate-600 max-w-md">
            Accede a tu panel para gestionar Fichas clinicas, citas y reuniones, diseñado para crecer contigo.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm border border-slate-100">
              <span className="h-4 w-4 rounded-full border border-sky-200 bg-sky-50" />
              Tu espacio de trabajo digital.
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm border border-slate-100">
              <span className="h-4 w-4 rounded-full border border-emerald-200 bg-emerald-50" />
              Accede desde cualquier lugar.
            </div>
          </div>
        </section>

        {/* Lado derecho: tarjeta de login */}
        <section className="flex-1 w-full max-w-md mx-auto">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-sky-300 via-cyan-300 to-emerald-300 opacity-60 blur-2xl -z-10" />

            <div className="bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_18px_60px_rgba(15,23,42,0.18)] rounded-2xl p-8 md:p-9">
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-40 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-white shadow-md">
                  <span className="text-lg font-black">Medify</span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Iniciar sesión
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Usa tu cuenta para acceder al panel de tu tienda.
                </p>
              </div>

              {/* OAuth */}
              <div className="space-y-3">
                <button
                  onClick={() => handleOAuth("google")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 hover:border-sky-200 active:scale-[.99] shadow-sm"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c10.5 0 19.5-7.6 21-18v-6.5z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.8 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16.1 3 9.2 7.4 6.3 14.7z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.1C29.3 35 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.4 5C9.1 41.7 16 45 24 45z"
                    />
                    <path
                      fill="#1976D2"
                      d="M45 24c0-1.4-.1-2.4-.4-3.5H24v8h11.3c-.5 2.6-2 4.8-4.1 6.3l6.2 5.1C40.7 37.4 45 31.4 45 24z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
                  o con tu correo
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="email"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:shadow-[0_0_0_1px_rgba(56,189,248,0.65)]"
                    placeholder="tu@correo.com"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:shadow-[0_0_0_1px_rgba(56,189,248,0.65)]"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <p className="text-[11px] font-medium text-red-600 bg-red-50/90 border border-red-200 rounded-lg px-3 py-2 flex gap-2 items-start">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>{error}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl bg-slate-900 text-xs md:text-sm text-white font-semibold tracking-tight transition hover:bg-slate-950 active:scale-[.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_24px_rgba(15,23,42,0.55)] flex items-center justify-center"
                >
                  {submitting ? "Ingresando…" : "Ingresar"}
                </button>
              </form>

              {/* Footer */}
              <p className="mt-5 text-center text-[11px] text-slate-400">
                ¿No tienes acceso? <span className="font-medium text-slate-600">Contacta al administrador.</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}