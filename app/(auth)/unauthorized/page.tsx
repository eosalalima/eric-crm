import Link from "next/link"; import { AuthCard } from "@/components/auth-card";
export default function Unauthorized(){return <AuthCard title="You don’t have access" subtitle="Your role does not permit this action."><Link href="/" className="primary-action link-button">Return to CRM</Link></AuthCard>}
