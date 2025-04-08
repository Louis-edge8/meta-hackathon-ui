"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const supabase = createClientComponentClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your sign up.",
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        router.refresh()
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookAuth = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message || "An error occurred during Facebook authentication",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={handleFacebookAuth} disabled={isLoading}>
        <Facebook className="mr-2 h-4 w-4" />
        Facebook
      </Button>
    </div>
  )
}
