export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";


export type FormaPago =
  | "EFECTIVO"
  | "TRANSFERENCIA";


export interface PedidoItemCreate {
  producto_id: number;
  cantidad: number;
}


export interface PedidoCreate {
  items: PedidoItemCreate[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
}


export interface DetallePedido {
  id: number;
  producto_id: number;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: string | number;
  subtotal: string | number;
}


export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: string | number;
  created_at: string;
  updated_at: string;
}


export interface PedidoDetalle extends Pedido {
  detalles: DetallePedido[];
}


export interface PedidoListResponse {
  total: number;
  items: Pedido[];
}


export interface PedidoResumen {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: string | number;
}