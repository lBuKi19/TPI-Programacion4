interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}


function LoadingState({
  message = "Cargando...",
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={[
        "flex w-full items-center justify-center",
        fullScreen
          ? "min-h-screen"
          : "min-h-52",
      ].join(" ")}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
        />

        <p className="text-sm font-medium text-slate-600">
          {message}
        </p>

        <span className="sr-only">
          {message}
        </span>
      </div>
    </div>
  );
}


export default LoadingState;