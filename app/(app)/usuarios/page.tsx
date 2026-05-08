import { requireAdmin } from "@/lib/auth"
import { getRoles, getUsers } from "@/app/actions/users"
import { UsuariosClient } from "./usuarios-client"

export const dynamic = "force-dynamic"

export default async function UsuariosPage() {
  await requireAdmin()
  const [users, roles] = await Promise.all([getUsers(), getRoles()])
  return <UsuariosClient initialUsers={users} roles={roles} />
}
