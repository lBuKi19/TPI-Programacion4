import type {
  EstadoPedido,
} from "../types/pedido.types";


interface PedidoEstadoBadgeProps {
  estado: EstadoPedido;
}


const etiquetas: Record<
  EstadoPedido,
  string
> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};


const clases: Record<
  EstadoPedido,
  string
> = {
  PENDIENTE:
    "bg-amber-100 text-amber-800",

  EN_PREPARACION:
    "bg-blue-100 text-blue-800",

  ENTREGADO:
    "bg-green-100 text-green-800",

  CANCELADO:
    "bg-red-100 text-red-800",
};


function PedidoEstadoBadge({
  estado,
}: PedidoEstadoBadgeProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        clases[estado],
      ].join(" ")}
    >
      {etiquetas[estado]}
    </span>
  );
}


export default PedidoEstadoBadge;