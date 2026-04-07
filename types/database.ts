export type Database = {
  public: {
    Tables: {
      roles: {
        Row: {
          id_rol: number
          nombre: string
        }
        Insert: {
          id_rol?: number
          nombre: string
        }
        Update: {
          id_rol?: number
          nombre?: string
        }
      }
      categorias: {
        Row: {
          id_categoria: number
          nombre: string
          descripcion: string | null
        }
        Insert: {
          id_categoria?: number
          nombre: string
          descripcion?: string | null
        }
        Update: {
          id_categoria?: number
          nombre?: string
          descripcion?: string | null
        }
      }
      clientes: {
        Row: {
          id_cliente: number
          nit: string | null
          nombre: string
          direccion: string | null
          telefono: string | null
          tipo_cliente: string | null
        }
        Insert: {
          id_cliente?: number
          nit?: string | null
          nombre: string
          direccion?: string | null
          telefono?: string | null
          tipo_cliente?: string | null
        }
        Update: {
          id_cliente?: number
          nit?: string | null
          nombre?: string
          direccion?: string | null
          telefono?: string | null
          tipo_cliente?: string | null
        }
      }
      proveedores: {
        Row: {
          id_proveedor: number
          nit: string | null
          nombre: string
          direccion: string | null
          telefono: string | null
          contacto: string | null
        }
        Insert: {
          id_proveedor?: number
          nit?: string | null
          nombre: string
          direccion?: string | null
          telefono?: string | null
          contacto?: string | null
        }
        Update: {
          id_proveedor?: number
          nit?: string | null
          nombre?: string
          direccion?: string | null
          telefono?: string | null
          contacto?: string | null
        }
      }
      usuarios: {
        Row: {
          id_usuario: number
          nombre: string
          email: string
          password: string
          id_rol: number | null
        }
        Insert: {
          id_usuario?: number
          nombre: string
          email: string
          password: string
          id_rol?: number | null
        }
        Update: {
          id_usuario?: number
          nombre?: string
          email?: string
          password?: string
          id_rol?: number | null
        }
      }
      productos: {
        Row: {
          id_producto: number
          codigo: string
          nombre: string
          id_categoria: number | null
          precio_compra: number
          precio_venta: number
          stock_minimo: number
        }
        Insert: {
          id_producto?: number
          codigo: string
          nombre: string
          id_categoria?: number | null
          precio_compra: number
          precio_venta: number
          stock_minimo?: number
        }
        Update: {
          id_producto?: number
          codigo?: string
          nombre?: string
          id_categoria?: number | null
          precio_compra?: number
          precio_venta?: number
          stock_minimo?: number
        }
      }
      lotes: {
        Row: {
          id_lote: number
          id_producto: number | null
          numero_lote: string
          fecha_vencimiento: string | null
          stock_actual: number
        }
        Insert: {
          id_lote?: number
          id_producto?: number | null
          numero_lote: string
          fecha_vencimiento?: string | null
          stock_actual?: number
        }
        Update: {
          id_lote?: number
          id_producto?: number | null
          numero_lote?: string
          fecha_vencimiento?: string | null
          stock_actual?: number
        }
      }
      alertas: {
        Row: {
          id_alerta: number
          id_producto: number | null
          tipo_alerta: string
          descripcion: string
          fecha_creacion: string
          estado: string
        }
        Insert: {
          id_alerta?: number
          id_producto?: number | null
          tipo_alerta: string
          descripcion: string
          fecha_creacion?: string
          estado?: string
        }
        Update: {
          id_alerta?: number
          id_producto?: number | null
          tipo_alerta?: string
          descripcion?: string
          fecha_creacion?: string
          estado?: string
        }
      }
      ventas: {
        Row: {
          id_venta: number
          id_cliente: number | null
          id_usuario: number | null
          fecha: string
          total: number
          estado: string
        }
        Insert: {
          id_venta?: number
          id_cliente?: number | null
          id_usuario?: number | null
          fecha?: string
          total: number
          estado?: string
        }
        Update: {
          id_venta?: number
          id_cliente?: number | null
          id_usuario?: number | null
          fecha?: string
          total?: number
          estado?: string
        }
      }
      detalle_ventas: {
        Row: {
          id_detalle_venta: number
          id_venta: number | null
          id_producto: number | null
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Insert: {
          id_detalle_venta?: number
          id_venta?: number | null
          id_producto?: number | null
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Update: {
          id_detalle_venta?: number
          id_venta?: number | null
          id_producto?: number | null
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
        }
      }
      comprobantes: {
        Row: {
          id_comprobante: number
          id_venta: number | null
          tipo_comprobante: string
          serie: string | null
          correlativo: string
          fecha_emision: string
        }
        Insert: {
          id_comprobante?: number
          id_venta?: number | null
          tipo_comprobante: string
          serie?: string | null
          correlativo: string
          fecha_emision?: string
        }
        Update: {
          id_comprobante?: number
          id_venta?: number | null
          tipo_comprobante?: string
          serie?: string | null
          correlativo?: string
          fecha_emision?: string
        }
      }
      compras: {
        Row: {
          id_compra: number
          id_proveedor: number | null
          id_usuario: number | null
          fecha: string
          numero_factura: string | null
          total: number
        }
        Insert: {
          id_compra?: number
          id_proveedor?: number | null
          id_usuario?: number | null
          fecha?: string
          numero_factura?: string | null
          total: number
        }
        Update: {
          id_compra?: number
          id_proveedor?: number | null
          id_usuario?: number | null
          fecha?: string
          numero_factura?: string | null
          total?: number
        }
      }
      detalle_compras: {
        Row: {
          id_detalle_compra: number
          id_compra: number | null
          id_producto: number | null
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Insert: {
          id_detalle_compra?: number
          id_compra?: number | null
          id_producto?: number | null
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Update: {
          id_detalle_compra?: number
          id_compra?: number | null
          id_producto?: number | null
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
        }
      }
      cierres_caja: {
        Row: {
          id_cierre: number
          id_usuario: number | null
          fecha_cierre: string
          total_ventas: number
          total_egresos: number
          utilidad_bruta: number
          saldo_final: number
          observaciones: string | null
        }
        Insert: {
          id_cierre?: number
          id_usuario?: number | null
          fecha_cierre?: string
          total_ventas?: number
          total_egresos?: number
          utilidad_bruta?: number
          saldo_final: number
          observaciones?: string | null
        }
        Update: {
          id_cierre?: number
          id_usuario?: number | null
          fecha_cierre?: string
          total_ventas?: number
          total_egresos?: number
          utilidad_bruta?: number
          saldo_final?: number
          observaciones?: string | null
        }
      }
      pagos_proveedores: {
        Row: {
          id_pago: number
          id_compra: number | null
          id_usuario: number | null
          fecha_pago: string
          monto_pagado: number
          metodo_pago: string
          referencia: string | null
        }
        Insert: {
          id_pago?: number
          id_compra?: number | null
          id_usuario?: number | null
          fecha_pago?: string
          monto_pagado: number
          metodo_pago: string
          referencia?: string | null
        }
        Update: {
          id_pago?: number
          id_compra?: number | null
          id_usuario?: number | null
          fecha_pago?: string
          monto_pagado?: number
          metodo_pago?: string
          referencia?: string | null
        }
      }
    }
  }
}
