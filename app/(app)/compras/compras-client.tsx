"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DataTable, type Column } from "@/components/data-table"
import { RowActions } from "@/components/row-actions"
import { ShoppingBag, DollarSign, Receipt, Truck, Search, Plus, Eye, FileDown, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPurchase } from "@/app/actions/purchases"
import { exportCSV } from "@/lib/export-csv"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ComprasClient({
  initialPurchases,
  initialProveedores,
  initialProductos,
  initialCategorias,
  isCajaAbierta
}: {
  initialPurchases: any[];
  initialProveedores: any[];
  initialProductos: any[];
  initialCategorias: any[];
  isCajaAbierta: boolean;
}) {
  const router = useRouter()

  // Vista principal vs Formulario a pantalla completa
  const [viewMode, setViewMode] = useState<"list" | "create">("list")

  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const purchases = initialPurchases
  const proveedores = initialProveedores
  const productos = initialProductos
  const categorias = initialCategorias || []

  const [detailPurchase, setDetailPurchase] = useState<any>(null)

  // Nuevo pedido state
  const [providerMode, setProviderMode] = useState<"existente" | "nuevo">("existente")
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [nuevoProviderNombre, setNuevoProviderNombre] = useState("")
  const [nuevoProviderNit, setNuevoProviderNit] = useState("")

  const [invoiceNumber, setInvoiceNumber] = useState<string>("")
  const [serieFactura, setSerieFactura] = useState<string>("")
  const [cart, setCart] = useState<any[]>([])

  // Product Form State
  const [productMode, setProductMode] = useState<"existente" | "nuevo">("existente")
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [prodNombre, setProdNombre] = useState("")
  const [prodCodigo, setProdCodigo] = useState("")
  const [prodDesc, setProdDesc] = useState("")

  const [catMode, setCatMode] = useState<"existente" | "nueva">("existente")
  const [selectedCatId, setSelectedCatId] = useState<string>("")
  const [nuevaCatNombre, setNuevaCatNombre] = useState("")

  const [prodSubcat, setProdSubcat] = useState("")

  // Unidad de Medida State
  const [umMode, setUmMode] = useState<"existente" | "nueva">("existente")
  const [prodUMValor, setProdUMValor] = useState<number | "">("")
  const [prodUMTexto, setProdUMTexto] = useState("")
  const [nuevaUMTexto, setNuevaUMTexto] = useState("")

  const [prodMarca, setProdMarca] = useState("")
  const [prodCompra, setProdCompra] = useState<number>(0)
  const [prodVenta, setProdVenta] = useState<number | "">(0)

  const [selectedQuantity, setSelectedQuantity] = useState<number | "">(1)
  const [selectedLote, setSelectedLote] = useState<string>("")
  const [selectedVencimiento, setSelectedVencimiento] = useState<string>("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalMonth = purchases.reduce((sum: number, s: any) => sum + s.total, 0)

  const uniqueNombres = Array.from(new Set(productos.map((p: any) => p.nombre).filter(Boolean)));
  const uniqueUMs = Array.from(new Set(productos.map((p: any) => p.unidad_medida).filter(Boolean)));

  const filteredPurchases = purchases.filter((s: any) => {
    const matchesSearch = s.provider.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.invoice.toLowerCase().includes(search.toLowerCase()) ||
      (s.serie_factura && s.serie_factura.toLowerCase().includes(search.toLowerCase()));

    const matchesDate = dateFilter ? s.date.includes(dateFilter) : true;

    return matchesSearch && matchesDate;
  })

  const resetProductSelection = () => {
    setSelectedProductId("")
    setProdCodigo("")
    setProdNombre("")
    setProdDesc("")
    setCatMode("existente")
    setSelectedCatId("")
    setNuevaCatNombre("")
    setProdSubcat("")
    setUmMode("existente")
    setProdUMValor("")
    setProdUMTexto("")
    setNuevaUMTexto("")
    setProdMarca("")
    setProdCompra(0)
    setProdVenta(0)
    setSelectedQuantity(1)
    setSelectedLote("")
    setSelectedVencimiento("")
  }

  const handleOpenCreate = () => {
    if (!isCajaAbierta) {
      toast.error("Debe abrir caja desde Finanzas antes de operar.");
      return;
    }
    setProviderMode("existente")
    setSelectedProvider("")
    setNuevoProviderNombre("")
    setNuevoProviderNit("")
    setInvoiceNumber("")
    setSerieFactura("")
    setCart([])
    setProductMode("existente")
    resetProductSelection()
    setViewMode("create")
  }

  const handleProductSelect = (val: string) => {
    if (val === "nuevo") {
      setProductMode("nuevo")
      resetProductSelection()
      return
    }

    setProductMode("existente")
    setSelectedProductId(val)
    const p = productos.find((x: any) => x.id_producto.toString() === val)
    if (p) {
      setProdCodigo(p.codigo || "")
      setProdNombre(p.nombre || "")
      setProdDesc(p.descripcion || "")
      if (p.id_categoria) {
        setCatMode("existente")
        setSelectedCatId(p.id_categoria.toString())
      } else {
        setCatMode("existente")
        setSelectedCatId("")
      }
      setProdSubcat(p.subcategoria || "")
      // Extract number and text if possible from "5 Litros"
      if (p.unidad_medida) {
        const match = p.unidad_medida.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
        if (match) {
          setProdUMValor(parseFloat(match[1]));
          setUmMode("existente");
          setProdUMTexto(match[2]);
        } else {
          setProdUMValor("");
          setUmMode("existente");
          setProdUMTexto(p.unidad_medida);
        }
      } else {
        setProdUMValor("");
        setUmMode("existente");
        setProdUMTexto("");
      }
      setProdMarca(p.marca || "")
      setProdCompra(p.precio_compra || 0)
      setProdVenta(p.precio_venta || 0)
    }
  }

  const addToCart = () => {
    if (!prodNombre) { toast.error("El nombre del producto es obligatorio"); return }
    if (catMode === "existente" && !selectedCatId) { toast.error("Seleccione una categoría"); return }
    if (catMode === "nueva" && !nuevaCatNombre) { toast.error("Ingrese el nombre de la nueva categoría"); return }
    if (productMode === "nuevo" && !prodCodigo) { toast.error("Debe ingresar un código para el nuevo producto"); return }
    if (umMode === "existente" && !prodUMTexto && prodUMValor) { toast.error("Debe seleccionar una unidad de medida existente si ha ingresado una cantidad"); return }
    if (umMode === "nueva" && !nuevaUMTexto) { toast.error("Debe ingresar el nombre de la nueva unidad de medida"); return }

    if (productMode === "nuevo") {
      const exists = productos.some((p: any) => p.codigo?.toLowerCase() === prodCodigo.toLowerCase());
      if (exists) { toast.error(`El código ${prodCodigo} ya existe en el inventario`); return }
      const existsInCart = cart.some((c: any) => c.codigo?.toLowerCase() === prodCodigo.toLowerCase());
      if (existsInCart) { toast.error(`El código ${prodCodigo} ya está en el carrito`); return }
    }

    if (selectedQuantity <= 0) { toast.error("La cantidad debe ser mayor a 0"); return }
    if (prodCompra === "" || prodCompra <= 0) { toast.error("El precio de compra debe ser mayor a 0"); return }
    if (prodVenta === "" || prodVenta <= 0) { toast.error("El precio de venta debe ser mayor a 0"); return }
    if (!selectedLote) { toast.error("El número de lote es obligatorio"); return }
    if (!selectedVencimiento) { toast.error("La fecha de caducidad es obligatoria"); return }

    setCart([...cart, {
      id_producto: productMode === "existente" ? parseInt(selectedProductId) : undefined,
      codigo: productMode === "nuevo" ? prodCodigo : undefined,
      nombre: prodNombre,
      descripcion: prodDesc,
      id_categoria: catMode === "existente" ? parseInt(selectedCatId) : undefined,
      nuevaCategoria: catMode === "nueva" ? nuevaCatNombre : undefined,
      subcategoria: prodSubcat,
      unidad_medida: umMode === "nueva"
        ? (prodUMValor ? `${prodUMValor} ${nuevaUMTexto}` : nuevaUMTexto)
        : (prodUMValor && prodUMTexto ? `${prodUMValor} ${prodUMTexto}` : prodUMTexto),
      marca: prodMarca,
      precio_compra: Number(prodCompra),
      precio_venta: Number(prodVenta),
      cantidad: Number(selectedQuantity),
      subtotal: Number(selectedQuantity) * Number(prodCompra),
      lote: selectedLote,
      vencimiento: selectedVencimiento
    }])

    setProductMode("existente")
    resetProductSelection()
  }

  const removeFromCart = (index: number) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const cartPrecioNeto = cartTotal / 1.12
  const cartIva = cartPrecioNeto * 0.12

  const handleSubmit = async () => {
    setConfirmOpen(false); // Close dialog
    if (providerMode === "existente" && !selectedProvider) { toast.error("Seleccione un proveedor"); return }
    if (providerMode === "nuevo" && !nuevoProviderNombre) { toast.error("Ingrese el nombre del nuevo proveedor"); return }
    if (cart.length === 0) { toast.error("Agregue al menos un producto"); return }
    setIsSubmitting(true)
    try {
      const result = await createPurchase({
        id_proveedor: providerMode === "existente" ? parseInt(selectedProvider) : undefined,
        nuevo_proveedor_nombre: providerMode === "nuevo" ? nuevoProviderNombre : undefined,
        nuevo_proveedor_nit: providerMode === "nuevo" ? nuevoProviderNit : undefined,
        serie_factura: serieFactura || null,
        numero_factura: invoiceNumber || null,
        total: cartTotal,
        precio_neto: cartPrecioNeto,
        iva: cartIva,
        detalles: cart.map(item => ({
          ...item,
          codigo: item.codigo || undefined,
          numero_lote: item.lote || undefined,
          fecha_vencimiento: item.vencimiento || undefined
        })),
      })
      if (result.success) {
        toast.success("Compra registrada exitosamente")
        setViewMode("list")
        router.refresh()
      } else {
        toast.error(result.error || "Error al registrar compra")
      }
    } catch { toast.error("Error inesperado") }
    finally { setIsSubmitting(false) }
  }

  const handleExport = () => {
    exportCSV("compras",
      ["No. Compra", "Fecha", "Proveedor", "NIT", "Serie Factura", "Doc. Factura", "Precio Neto", "IVA", "Total", "Items"],
      filteredPurchases.map((s: any) => [
        s.id, s.date, s.provider, s.nit, s.serie_factura, s.invoice,
        s.precio_neto?.toFixed(2) || "0.00",
        s.iva?.toFixed(2) || "0.00",
        s.total,
        s.items
      ])
    )
  }

  const columns: Column<any>[] = [
    { key: "id", header: "No. Compra", render: (r) => <span className="font-medium">{r.id}</span> },
    { key: "date", header: "Fecha", render: (r) => <span className="text-muted-foreground">{r.date}</span> },
    { key: "provider", header: "Proveedor", render: (r) => r.provider },
    {
      key: "invoice", header: "Serie - Factura", render: (r) => {
        if (r.serie_factura !== "--" && r.invoice !== "--") return `${r.serie_factura} - ${r.invoice}`;
        if (r.serie_factura !== "--") return `Serie ${r.serie_factura}`;
        if (r.invoice !== "--") return r.invoice;
        return "--";
      }
    },
    { key: "items", header: "Items", render: (r) => r.items },
    { key: "total", header: "Total (Q)", render: (r) => <span className="font-medium">Q{r.total.toLocaleString("en", { minimumFractionDigits: 2 })}</span> },
    {
      key: "actions", header: "", render: (r) => (
        <RowActions actions={[
          { label: "Ver detalle", icon: Eye, onClick: () => setDetailPurchase(r) },
        ]} />
      )
    },
  ]

  // ============================================================================
  // VISTA 2: FORMULARIO A PANTALLA COMPLETA
  // ============================================================================
  if (viewMode === "create") {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setViewMode("list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader icon={Plus} title="Registrar Nueva Compra" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Columna Izquierda: Formulario */}
          <div className="lg:col-span-8 space-y-6">

            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
                <CardTitle className="text-lg">1. Datos Generales del Proveedor</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-card">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Proveedor *</Label>
                  <Select value={providerMode === "existente" ? selectedProvider : "nuevo"} onValueChange={(val) => {
                    if (val === "nuevo") {
                      setProviderMode("nuevo")
                      setSelectedProvider("")
                    } else {
                      setProviderMode("existente")
                      setSelectedProvider(val)
                    }
                  }}>
                    <SelectTrigger className="h-11 w-full [&>span]:truncate"><SelectValue placeholder="Seleccione proveedor..." /></SelectTrigger>
                    <SelectContent className="max-w-[80vw] sm:max-w-[400px]">
                      <SelectItem value="nuevo" className="font-bold text-primary">+ Crear Nuevo Proveedor</SelectItem>
                      {proveedores.map((p: any) => (
                        <SelectItem key={p.id_proveedor} value={p.id_proveedor.toString()} className="truncate">
                          {p.nombre} (NIT: {p.nit || "C/F"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {providerMode === "nuevo" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <Input className="h-11" value={nuevoProviderNombre} onChange={(e) => setNuevoProviderNombre(e.target.value)} placeholder="Nombre del proveedor" />
                      <Input className="h-11" value={nuevoProviderNit} onChange={(e) => setNuevoProviderNit(e.target.value)} placeholder="NIT (Opcional)" />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Serie Factura</Label>
                  <Input className="h-11" value={serieFactura} onChange={(e) => setSerieFactura(e.target.value)} placeholder="Ej. A" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Doc. No. (Factura)</Label>
                  <Input className="h-11" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Ej. 12345 (Solo números)" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10">
                <CardTitle className="text-lg text-primary">2. Agregar Productos a la Compra</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6 bg-card">
                <div className="bg-muted/30 p-5 rounded-xl border border-border/50 shadow-inner">
                  <Label className="block mb-2 text-sm font-semibold">Buscador Rápido</Label>
                  <Select value={productMode === "existente" ? selectedProductId : "nuevo"} onValueChange={handleProductSelect}>
                    <SelectTrigger className="h-11 bg-background"><SelectValue placeholder="Buscar producto en inventario..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nuevo" className="font-bold text-primary">+ Crear Nuevo Producto desde Cero</SelectItem>
                      {productos.map((p: any) => (
                        <SelectItem key={p.id_producto} value={p.id_producto.toString()}>
                          {p.codigo} - {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Código del Producto {productMode === "nuevo" && "*"}</Label>
                    <Input
                      className="h-11"
                      value={prodCodigo}
                      onChange={(e) => setProdCodigo(e.target.value)}
                      placeholder="Ej. PRD-001"
                      disabled={productMode === "existente"}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Nombre del Producto *</Label>
                    <Input list="nombres-list" className="h-11" value={prodNombre} onChange={(e) => setProdNombre(e.target.value)} placeholder="Ej. Fertilizante 20-20-20" />
                    <datalist id="nombres-list">
                      {uniqueNombres.map((n: any) => <option key={n} value={n} />)}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Marca</Label>
                    <Input className="h-11" value={prodMarca} onChange={(e) => setProdMarca(e.target.value)} placeholder="Ej. Bayer" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Descripción o Detalle</Label>
                    <Input className="h-11" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Características, color, uso..." />
                  </div>
                </div>

                {/* Área de Categorías con Flex Col para evitar traslapes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-4 p-4 border rounded-xl bg-muted/10">
                    <Label className="text-sm font-bold text-primary block">Categoría *</Label>

                    <div className="space-y-3">
                      <Select value={catMode} onValueChange={(v: any) => setCatMode(v)}>
                        <SelectTrigger className="h-11 bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="existente">Elegir Existente</SelectItem>
                          <SelectItem value="nueva">+ Crear Nueva</SelectItem>
                        </SelectContent>
                      </Select>

                      {catMode === "existente" ? (
                        <Select value={selectedCatId} onValueChange={(val) => {
                          setSelectedCatId(val);
                          const cat = categorias.find((c: any) => c.id_categoria.toString() === val);
                          if (cat && cat.descripcion) {
                            setProdDesc(cat.descripcion);
                          }
                        }}>
                          <SelectTrigger className="h-11 bg-background"><SelectValue placeholder="Seleccione categoría..." /></SelectTrigger>
                          <SelectContent>
                            {categorias.map((c: any) => (
                              <SelectItem key={c.id_categoria} value={c.id_categoria.toString()}>{c.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input className="h-11 bg-background" value={nuevaCatNombre} onChange={(e) => setNuevaCatNombre(e.target.value)} placeholder="Nombre de la nueva..." />
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 p-4 border rounded-xl">
                    <Label className="text-sm font-semibold block mb-1">Subcategoría</Label>
                    <Input className="h-11" value={prodSubcat} onChange={(e) => setProdSubcat(e.target.value)} placeholder="Ej. Foliar" />
                  </div>

                  <div className="space-y-3 p-4 border rounded-xl">
                    <Label className="text-sm font-semibold block mb-1">Unidad Medida</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Cant."
                          className="h-11 w-20 bg-background"
                          value={prodUMValor}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProdUMValor(val === "" ? "" : parseFloat(val));
                          }}
                        />
                        <div className="flex-1">
                          <Select value={umMode} onValueChange={(v: any) => setUmMode(v)}>
                            <SelectTrigger className="h-11 bg-background"><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="existente">Existente</SelectItem>
                              <SelectItem value="nueva">+ Crear Nueva</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {umMode === "existente" ? (
                        <Select value={prodUMTexto} onValueChange={setProdUMTexto}>
                          <SelectTrigger className="h-11 bg-background"><SelectValue placeholder="Seleccione UM..." /></SelectTrigger>
                          <SelectContent>
                            {uniqueUMs.map((u: any) => {
                              // Filter out numeric parts to just show the base units, or just show them all
                              const baseUnitMatch = u.match(/^(?:\d+(?:\.\d+)?\s+)?(.+)$/);
                              const displayUnit = baseUnitMatch ? baseUnitMatch[1] : u;
                              return <SelectItem key={u} value={displayUnit}>{displayUnit}</SelectItem>
                            })}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          className="h-11 bg-background"
                          value={nuevaUMTexto}
                          onChange={(e) => setNuevaUMTexto(e.target.value)}
                          placeholder="Ej. Litro, Saco..."
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Precios */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold">Precio Compra *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">Q</span>
                      <Input
                        className="h-11 pl-8 bg-background font-medium"
                        type="number"
                        step="0.01"
                        min="0"
                        value={prodCompra}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProdCompra(val === "" ? "" : parseFloat(val));
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold">Precio Venta</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">Q</span>
                      <Input
                        className="h-11 pl-8 bg-background font-medium"
                        type="number"
                        step="0.01"
                        min="0"
                        value={prodVenta}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProdVenta(val === "" ? "" : parseFloat(val));
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold">Cantidad a Ingresar *</Label>
                    <Input
                      className="h-11 bg-background font-bold text-primary"
                      type="number"
                      min="1"
                      value={selectedQuantity}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedQuantity(val === "" ? "" : parseInt(val));
                      }}
                    />
                  </div>
                </div>

                {/* Lote y Vencimiento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-muted bg-muted/5">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Número de Lote *</Label>
                    <Input className="h-11" value={selectedLote} onChange={(e) => setSelectedLote(e.target.value)} placeholder="Ej. L-001" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Fecha de Caducidad *</Label>
                    <Input type="date" className="h-11" value={selectedVencimiento} onChange={(e) => setSelectedVencimiento(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={addToCart} type="button" size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-md">
                    <Plus className="mr-2 h-5 w-5" /> Agregar al Carrito
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Columna Derecha: Resumen y Carrito */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="sticky top-6">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-xl">
                <CardTitle className="text-lg flex items-center"><ShoppingBag className="mr-2 h-5 w-5" /> Resumen de Ingreso</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[40vh] overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                      <ShoppingBag className="h-12 w-12 mb-3 opacity-20" />
                      <p>El carrito está vacío</p>
                      <p className="text-xs mt-1">Agrega productos para continuar</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {cart.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-sm line-clamp-2">{item.nombre}</div>
                            <button onClick={() => removeFromCart(idx)} className="text-destructive p-1 rounded-md hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{item.cantidad} x Q{item.precio_compra.toFixed(2)}</span>
                            <span className="font-bold text-foreground">Q{item.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex gap-2 items-center flex-wrap">
                            {item.nuevaCategoria && <div className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">+ Nueva Cat: {item.nuevaCategoria}</div>}
                            {item.lote && <div className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1">Lote: {item.lote}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-muted/30 p-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Precio Neto (sin IVA)</span>
                    <span className="font-medium">Q{cartPrecioNeto.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (12%)</span>
                    <span className="font-medium text-destructive">Q{cartIva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-bold">Total a Pagar</span>
                    <span className="text-2xl font-black text-primary">Q{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-5 pt-2 space-y-3">
                  <Button
                    onClick={() => setConfirmOpen(true)}
                    disabled={isSubmitting || cart.length === 0 || (providerMode === "existente" && !selectedProvider) || (providerMode === "nuevo" && !nuevoProviderNombre)}
                    className="w-full h-14 text-base font-bold shadow-lg"
                  >
                    {isSubmitting ? "Procesando..." : "Confirmar e Ingresar a Inventario"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setViewMode("list")}
                    disabled={isSubmitting}
                    className="w-full h-12 text-muted-foreground hover:text-foreground"
                  >
                    Cancelar y Regresar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Modal de confirmación */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar guardado de compra?</AlertDialogTitle>
              <AlertDialogDescription>
                Está a punto de registrar la factura con un total de <strong>Q{cartTotal.toFixed(2)}</strong>. Esto sumará el stock al inventario y registrará los datos de lotes correspondientes.
                <br /><br />
                ¿Está seguro de que la información ingresada es correcta?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Revisar de nuevo</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => { e.preventDefault(); handleSubmit(); }} disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isSubmitting ? "Procesando..." : "Sí, Ingresar Compra"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    )
  }

  // ============================================================================
  // VISTA 1: TABLA PRINCIPAL
  // ============================================================================
  return (
    <>
      <PageHeader icon={ShoppingBag} title="Gestión de Compras" />

      {!isCajaAbierta && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg border border-destructive/30 flex items-center mb-6">
          <div className="mr-3 p-2 bg-destructive/20 rounded-full">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">La caja está cerrada</h3>
            <p className="text-sm opacity-90">Debe abrir la caja desde el módulo de Finanzas antes de poder registrar nuevas compras o pagos.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Compras Totales" value={purchases.length.toString()} icon={ShoppingBag} subtitle="Histórico" />
        <StatCard title="Inversión Total" value={`Q${totalMonth.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Valor histórico" />
        <StatCard title="Facturas Registradas" value={purchases.filter(p => p.invoice !== "--").length.toString()} icon={Receipt} subtitle="Con documento" />
        <StatCard title="Proveedores" value={proveedores.length.toString()} icon={Truck} subtitle="Activos en compras" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Registro de Compras</CardTitle>
          <CardDescription>Visualiza y registra el ingreso de mercadería al inventario</CardDescription>
          <CardAction>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" />Exportar</Button>
              <Button size="sm" onClick={handleOpenCreate} className={!isCajaAbierta ? "opacity-50 cursor-not-allowed" : ""}><Plus className="mr-2 h-4 w-4" />Nueva Compra</Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por proveedor, factura..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="relative w-full sm:w-auto">
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full sm:w-[200px]" />
              {dateFilter && (
                <button onClick={() => setDateFilter("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-medium">Limpiar</button>
              )}
            </div>
          </div>
          <DataTable columns={columns} data={filteredPurchases} rowKey={(r) => r.id} emptyIcon={ShoppingBag} emptyMessage="No se encontraron compras." />
        </CardContent>
      </Card>

      {/* Detalle de compra */}
      <Dialog open={detailPurchase !== null} onOpenChange={(open) => { if (!open) setDetailPurchase(null) }}>
        <DialogContent className="sm:max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalle de Compra {detailPurchase?.id}</DialogTitle></DialogHeader>
          {detailPurchase && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border bg-muted/20 p-4">
                <h4 className="font-semibold mb-2">Datos Generales</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><span className="text-muted-foreground block text-xs">Fecha</span> <span className="font-medium">{detailPurchase.date}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Proveedor</span> <span className="font-medium">{detailPurchase.provider}</span></div>
                  <div><span className="text-muted-foreground block text-xs">NIT</span> <span className="font-medium">{detailPurchase.nit}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Serie Factura</span> <span className="font-medium">{detailPurchase.serie_factura}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Doc. No.</span> <span className="font-medium">{detailPurchase.invoice}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Precio Neto (Sin IVA)</span> <span className="font-medium">Q{Number(detailPurchase.precio_neto || 0).toLocaleString("en", { minimumFractionDigits: 2 })}</span></div>
                  <div><span className="text-muted-foreground block text-xs">IVA</span> <span className="font-medium">Q{Number(detailPurchase.iva || 0).toLocaleString("en", { minimumFractionDigits: 2 })}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Total Compra</span> <span className="font-bold text-primary">Q{detailPurchase.total.toLocaleString("en", { minimumFractionDigits: 2 })}</span></div>
                </div>
              </div>

              <div className="rounded-lg border">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Producto</th>
                      <th className="px-4 py-2 text-left font-medium">Categoría</th>
                      <th className="px-4 py-2 text-left font-medium">Marca</th>
                      <th className="px-4 py-2 text-left font-medium">No. Lote</th>
                      <th className="px-4 py-2 text-left font-medium">Vencimiento</th>
                      <th className="px-4 py-2 text-right font-medium">Cant.</th>
                      <th className="px-4 py-2 text-right font-medium">Precio U.</th>
                      <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailPurchase.detalles?.map((d: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">
                          <span className="font-medium block text-sm">{d.productos?.nombre}</span>
                          <span className="text-[11px] text-muted-foreground block line-clamp-1 mb-1">{d.productos?.descripcion || "--"}</span>
                          <span className="text-muted-foreground text-xs">{d.productos?.codigo}</span>
                        </td>
                        <td className="px-4 py-2">{d.productos?.categorias?.nombre || "--"}</td>
                        <td className="px-4 py-2">{d.productos?.marca || "--"}</td>
                        <td className="px-4 py-2">{d.numero_lote || d.lote || "S/N"}</td>
                        <td className="px-4 py-2">{d.vencimiento || "--"}</td>
                        <td className="px-4 py-2 text-right">{d.cantidad}</td>
                        <td className="px-4 py-2 text-right">Q{d.precio_unitario.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-medium">Q{d.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
