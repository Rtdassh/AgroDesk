"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export type ReportData = {
  kpis: {
    ingresosMes: number
    egresosMes: number
    gananciaNeta: number
    ticketPromedio: number
    utilidadAcumulada: number
    margenPromedio: number
  }
  ventasPorMes: { mes: string; total: number }[]
  ingresosVsEgresos: { mes: string; ingresos: number; egresos: number }[]
  topProductos: { producto: string; cantidad: number; total: number }[]
  ventasPorCategoria: { categoria: string; total: number }[]
  topClientes: { cliente: string; total: number; compras: number }[]
  topProveedores: { proveedor: string; total: number; ordenes: number }[]
  proximosAVencer: {
    producto: string
    lote: string
    fecha_vencimiento: string
    stock: number
    dias: number
  }[]
}

const monthLabel = (year: number, month: number) => {
  const labels = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ]
  return `${labels[month]} ${year.toString().slice(-2)}`
}

export async function getReportData(rangeDays = 365): Promise<ReportData> {
  await requireAdmin()
  const supabase = await createClient()

  const now = new Date()
  const fromDate = new Date(now)
  fromDate.setDate(fromDate.getDate() - rangeDays)

  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    ventasRes,
    detallesRes,
    pagosRes,
    cierresRes,
    comprasRes,
    lotesRes,
    productosRes,
  ] = await Promise.all([
    supabase
      .from("ventas")
      .select("id_venta, total, fecha, estado, clientes(nombre)")
      .gte("fecha", fromDate.toISOString()),
    supabase
      .from("detalle_ventas")
      .select(
        "cantidad, subtotal, precio_unitario, productos(id_producto, nombre, precio_compra, categorias(nombre)), ventas(fecha)"
      )
      .gte("ventas.fecha", fromDate.toISOString()),
    supabase
      .from("pagos_proveedores")
      .select("monto_pagado, fecha_pago")
      .gte("fecha_pago", fromDate.toISOString()),
    supabase
      .from("cierres_caja")
      .select("utilidad_bruta, total_ventas"),
    supabase
      .from("compras")
      .select("id_compra, total, fecha, proveedores(nombre)")
      .gte("fecha", fromDate.toISOString()),
    supabase
      .from("lotes")
      .select(
        "id_lote, numero_lote, fecha_vencimiento, stock_actual, productos(nombre)"
      )
      .gt("stock_actual", 0)
      .not("fecha_vencimiento", "is", null),
    supabase.from("productos").select("id_producto, precio_compra, precio_venta"),
  ])

  const ventas = ventasRes.data ?? []
  const detalles = detallesRes.data ?? []
  const pagos = pagosRes.data ?? []
  const cierres = cierresRes.data ?? []
  const compras = comprasRes.data ?? []
  const lotes = lotesRes.data ?? []
  const productosCat = productosRes.data ?? []

  // ---- KPIs del mes actual
  let ingresosMes = 0
  let egresosMes = 0
  ventas.forEach((v: any) => {
    if (new Date(v.fecha) >= startOfCurrentMonth) ingresosMes += Number(v.total)
  })
  pagos.forEach((p: any) => {
    if (new Date(p.fecha_pago) >= startOfCurrentMonth)
      egresosMes += Number(p.monto_pagado)
  })
  const gananciaNeta = ingresosMes - egresosMes

  const ventasMes = ventas.filter(
    (v: any) => new Date(v.fecha) >= startOfCurrentMonth
  )
  const ticketPromedio =
    ventasMes.length > 0
      ? ventasMes.reduce((s: number, v: any) => s + Number(v.total), 0) /
        ventasMes.length
      : 0

  const utilidadAcumulada = cierres.reduce(
    (s: number, c: any) => s + Number(c.utilidad_bruta || 0),
    0
  )

  // Margen promedio = (precio_venta - precio_compra) / precio_venta promedio
  const margenes: number[] = []
  productosCat.forEach((p: any) => {
    const venta = Number(p.precio_venta)
    const compra = Number(p.precio_compra)
    if (venta > 0) margenes.push((venta - compra) / venta)
  })
  const margenPromedio =
    margenes.length > 0
      ? margenes.reduce((a, b) => a + b, 0) / margenes.length
      : 0

  // ---- Series mensuales (12 meses)
  const months: { year: number; month: number; key: string; label: string }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: monthLabel(d.getFullYear(), d.getMonth()),
    })
  }

  const sumByMonth = (
    items: any[],
    dateField: string,
    amountField: string
  ): Map<string, number> => {
    const m = new Map<string, number>()
    items.forEach((it) => {
      const d = new Date(it[dateField])
      const key = `${d.getFullYear()}-${d.getMonth()}`
      m.set(key, (m.get(key) ?? 0) + Number(it[amountField] ?? 0))
    })
    return m
  }

  const ventasMap = sumByMonth(ventas as any[], "fecha", "total")
  const pagosMap = sumByMonth(pagos as any[], "fecha_pago", "monto_pagado")

  const ventasPorMes = months.map((m) => ({
    mes: m.label,
    total: ventasMap.get(m.key) ?? 0,
  }))
  const ingresosVsEgresos = months.map((m) => ({
    mes: m.label,
    ingresos: ventasMap.get(m.key) ?? 0,
    egresos: pagosMap.get(m.key) ?? 0,
  }))

  // ---- Top productos
  const productoAgg = new Map<
    string,
    { producto: string; cantidad: number; total: number }
  >()
  detalles.forEach((d: any) => {
    const nombre = d.productos?.nombre ?? "Producto"
    const cur = productoAgg.get(nombre) ?? {
      producto: nombre,
      cantidad: 0,
      total: 0,
    }
    cur.cantidad += Number(d.cantidad ?? 0)
    cur.total += Number(d.subtotal ?? 0)
    productoAgg.set(nombre, cur)
  })
  const topProductos = Array.from(productoAgg.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10)

  // ---- Ventas por categoria
  const categoriaAgg = new Map<string, number>()
  detalles.forEach((d: any) => {
    const cat = d.productos?.categorias?.nombre ?? "Sin categoria"
    categoriaAgg.set(
      cat,
      (categoriaAgg.get(cat) ?? 0) + Number(d.subtotal ?? 0)
    )
  })
  const ventasPorCategoria = Array.from(categoriaAgg.entries())
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)

  // ---- Top clientes
  const clienteAgg = new Map<
    string,
    { cliente: string; total: number; compras: number }
  >()
  ventas.forEach((v: any) => {
    const nombre = v.clientes?.nombre ?? "Consumidor Final"
    const cur = clienteAgg.get(nombre) ?? {
      cliente: nombre,
      total: 0,
      compras: 0,
    }
    cur.total += Number(v.total ?? 0)
    cur.compras += 1
    clienteAgg.set(nombre, cur)
  })
  const topClientes = Array.from(clienteAgg.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // ---- Top proveedores
  const provAgg = new Map<
    string,
    { proveedor: string; total: number; ordenes: number }
  >()
  compras.forEach((c: any) => {
    const nombre = c.proveedores?.nombre ?? "Proveedor"
    const cur = provAgg.get(nombre) ?? {
      proveedor: nombre,
      total: 0,
      ordenes: 0,
    }
    cur.total += Number(c.total ?? 0)
    cur.ordenes += 1
    provAgg.set(nombre, cur)
  })
  const topProveedores = Array.from(provAgg.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // ---- Proximos a vencer (30 dias)
  const today = new Date()
  const limite = new Date()
  limite.setDate(limite.getDate() + 30)
  const proximosAVencer = lotes
    .map((l: any) => {
      const fv = new Date(l.fecha_vencimiento)
      const dias = Math.ceil(
        (fv.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        producto: l.productos?.nombre ?? "Producto",
        lote: l.numero_lote,
        fecha_vencimiento: fv.toISOString().split("T")[0],
        stock: Number(l.stock_actual ?? 0),
        dias,
      }
    })
    .filter((x) => x.dias <= 30)
    .sort((a, b) => a.dias - b.dias)

  return {
    kpis: {
      ingresosMes,
      egresosMes,
      gananciaNeta,
      ticketPromedio,
      utilidadAcumulada,
      margenPromedio,
    },
    ventasPorMes,
    ingresosVsEgresos,
    topProductos,
    ventasPorCategoria,
    topClientes,
    topProveedores,
    proximosAVencer,
  }
}
