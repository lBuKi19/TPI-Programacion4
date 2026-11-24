interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}


function ErrorState({
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <h2 className="text-lg font-bold text-red-800">
        No se pudo cargar la información
      </h2>

      <p className="mt-2 text-sm text-red-700">
        {message}
      </p>

      {onRetry !== undefined && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Reintentar
        </button>
      )}
    </section>
  );
}


export default ErrorState;