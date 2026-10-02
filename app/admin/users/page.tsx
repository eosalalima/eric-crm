import { requireActiveUser } from "@/lib/authorization";
import { UserManagement } from "@/components/user-management";
export default async function UsersPage(){await requireActiveUser(["ADMIN"]);return <UserManagement/>}
