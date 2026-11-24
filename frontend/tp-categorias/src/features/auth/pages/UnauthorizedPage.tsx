import {
  Link,
} from "react-router-dom";


function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="text-5xl"
        >
          🔒
        </div>

        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          Acceso no autorizado
        </h1>

        <p className="mt-3 text-slate-600">
          La sesión es válida, pero la cuenta no
          tiene permisos para acceder a esta sección.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Volver al catálogo
        </Link>
      </section>
    </main>
  );
}


export default UnauthorizedPage;