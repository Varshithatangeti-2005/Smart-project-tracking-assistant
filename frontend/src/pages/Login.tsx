import React, { useState, useCallback } from "react"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { SignInIcon } from "@phosphor-icons/react"
import useDocumentMetadata from "@/hooks/useDocumentMetadata"

import { useAuth } from "@/context/AuthContext"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

export default function Login() {
  useDocumentMetadata({
    title: "Sign In",
    description: "Login to access your smart project tracking assistant."
  })

  const { token, login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const [error, setError] = useState("")

  const handleSubmit = useCallback(
    async (event: React.SubmitEvent) => {
      event.preventDefault()

      setError("")

      try {
        setIsLoading(true)

        await login({
          email: form.email,
          password: form.password,
        })

        navigate("/")
      } catch {
        setError(
          "Login failed. Check your credentials and try again."
        )
      } finally {
        setIsLoading(false)
      }
    },
    [form, login, navigate]
  )

  if (token) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">
            Welcome Back
          </CardTitle>

          <CardDescription>
            Sign in to your Smart Project Tracking account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              <SignInIcon weight="bold" />

              {isLoading
                ? "Signing In..."
                : "Sign In"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Create one
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}