import { requireAdmin } from "@/lib/auth"
import { getReportData } from "@/app/actions/reports"
import { ReportesClient } from "./reportes-client"



export default async function ReportesPage() {
  await requireAdmin()
  const data = await getReportData(365)
  return <ReportesClient data={data} />
}
