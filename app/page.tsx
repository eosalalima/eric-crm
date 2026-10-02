import FunnelDesigner from "@/components/funnel-designer";
import { requireActiveUser } from "@/lib/authorization";

export default async function Home() {
  const { profile } = await requireActiveUser();
  return <FunnelDesigner user={{ name: `${profile.firstName} ${profile.lastName}`, role: profile.role }}/>;
}
