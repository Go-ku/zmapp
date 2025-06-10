"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Redirect based on user role
      const userRole = data.user.role
      const redirectMap = {
        SYSTEM_ADMIN: "/dashboard/admin",
        LANDLORD: "/dashboard/landlord", 
        TENANT: "/dashboard/tenant",
        STAFF: "/dashboard/staff"
      }

      const redirectUrl = redirectMap[userRole] || "/dashboard"
      router.push(redirectUrl)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your Zambia Real Estate account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-input focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="text-sm">
                Remember me
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="zambia"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </form>

        {/* Demo credentials for testing */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center mb-2">
              Demo Credentials (Development Only)
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFormData({
                  email: "admin@zambiaproperties.com",
                  password: "Admin123!",
                  rememberMe: false
                })}
                className="p-2 text-left bg-muted rounded text-muted-foreground hover:bg-muted/80"
              >
                Admin: admin@zambiaproperties.com
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  email: "landlord@zambiaproperties.com", 
                  password: "Landlord123!",
                  rememberMe: false
                })}
                className="p-2 text-left bg-muted rounded text-muted-foreground hover:bg-muted/80"
              >
                Landlord: landlord@zambiaproperties.com
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  email: "tenant@zambiaproperties.com",
                  password: "Tenant123!",
                  rememberMe: false
                })}
                className="p-2 text-left bg-muted rounded text-muted-foreground hover:bg-muted/80"
              >
                Tenant: tenant@zambiaproperties.com
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}