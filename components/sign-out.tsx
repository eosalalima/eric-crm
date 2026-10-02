"use client";
import { useRouter } from "next/navigation";
export function SignOutButton(){const router=useRouter();async function signOut(){await fetch("/api/auth/sign-out",{method:"POST"});router.push("/login");router.refresh()}return <button className="secondary-action" onClick={signOut}>Sign out</button>}
