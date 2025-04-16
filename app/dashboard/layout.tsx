"use client"

import type { User } from "@supabase/auth-helpers-nextjs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardHeader } from "./dashboard-header"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

                if (authError || !authUser) {
                    router.push("/login")
                    return
                }

                setUser(authUser)
            } catch (error) {
                console.error("Error checking authentication:", error)
                router.push("/login")
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [supabase, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            {user && <DashboardHeader user={user} />}
            {children}
        </div>
    )
} 