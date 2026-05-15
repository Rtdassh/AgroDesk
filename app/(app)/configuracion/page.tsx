import { requireAdmin } from "@/lib/auth"
import { getConfig } from "@/app/actions/settings"
import { ConfiguracionClient } from "./configuracion-client"



export default async function ConfiguracionPage() {
  await requireAdmin()
  const config = await getConfig()
  return <ConfiguracionClient initialConfig={config} />
}
