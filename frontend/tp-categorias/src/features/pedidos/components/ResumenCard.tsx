interface ResumenCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  variant?:
    | "amber"
    | "blue"
    | "green"
    | "red"
    | "purple"
    | "slate";
}


const variantClasses = {
  amber: {
    card: "border-amber-200 bg-amber-50",
    icon: "bg-amber-100 text-amber-700",
    value: "text-amber-900",
  },

  blue: {
    card: "border-blue-200 bg-blue-50",
    icon: "bg-blue-100 text-blue-700",
    value: "text-blue-900",
  },

  green: {
    card: "border-green-200 bg-green-50",
    icon: "bg-green-100 text-green-700",
    value: "text-green-900",
  },

  red: {
    card: "border-red-200 bg-red-50",
    icon: "bg-red-100 text-red-700",
    value: "text-red-900",
  },

  purple: {
    card: "border-purple-200 bg-purple-50",
    icon: "bg-purple-100 text-purple-700",
    value: "text-purple-900",
  },

  slate: {
    card: "border-slate-200 bg-white",
    icon: "bg-slate-100 text-slate-700",
    value: "text-slate-900",
  },
} as const;


function ResumenCard({
  title,
  value,
  description,
  icon,
  variant = "slate",
}: ResumenCardProps) {
  const classes =
    variantClasses[variant];

  return (
    <article
      className={[
        "rounded-2xl border p-6 shadow-sm",
        classes.card,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">
            {title}
          </p>

          <p
            className={[
              "mt-3 text-3xl font-bold",
              classes.value,
            ].join(" ")}
          >
            {value}
          </p>
        </div>

        <span
          aria-hidden="true"
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
            classes.icon,
          ].join(" ")}
        >
          {icon}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}


export default ResumenCard;