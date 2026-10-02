import { Suspense } from "react"; import { AuthCard } from "@/components/auth-card"; import { AuthForm } from "@/components/auth-forms";
export default function ResetPage(){return <AuthCard title="Choose a new password" subtitle="Create a strong, unique password for your account."><Suspense><AuthForm mode="reset"/></Suspense></AuthCard>}
