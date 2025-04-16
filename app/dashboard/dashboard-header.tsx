"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type { User as SupabaseUser } from "@supabase/auth-helpers-nextjs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { LogOut, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

interface DashboardHeaderProps {
  user: SupabaseUser
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      })
    }
  }

  // Navigation tabs
  // Commented out navigation items
  /*const navItems = [
    { name: "Travelers", href: "/dashboard", icon: User },
    { name: "Providers", href: "/dashboard/providers", icon: PackageOpen },
  ]*/

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Centered logo */}
          <div className="flex-1"></div>
          <div className="flex items-center justify-center">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/travel-buddy-logo.png"
                alt="Travel Buddy"
                width={48}
                height={48}
                className="rounded-md"
              />
            </Link>
          </div>
          <div className="flex-1 flex justify-end">
            {/* Desktop user menu */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 py-2">{user.email}</div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
