import { useState, useCallback } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { UserPlusIcon } from "@phosphor-icons/react"
import useDocumentMetadata from "@/hooks/useDocumentMetadata"

import { useAuth } from "@/context/AuthContext"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

const passwordRules = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (pw: string) => pw.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    id: "number",
    label: "At least one number",
    test: (pw: string) => /[0-9]/.test(pw),
  },
  {
    id: "special",
    label: "At least one special character",
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
]

export default function Register() {
  useDocumentMetadata({
    title: "Create Account",
    description: "Sign up to track backlogs, sprints, and workload allocations with AI."
  })

  const { token, register } = useAuth()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  })

  const isPasswordValid = passwordRules.every((rule) =>
    rule.test(form.password)
  )

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      setError("")

      if (!isPasswordValid) {
        setError(
          "Password does not meet the required criteria."
        )
        return
      }

      try {
        setIsLoading(true)

        await register({
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
        })

        navigate("/login")
      } catch (err: unknown) {
        let errorMsg = "Registration failed. Please try again."
        if (err && typeof err === "object") {
          const e = err as {
            response?: {
              data?: {
                detail?: string
              }
            }
            message?: string
          }
          errorMsg =
            e.response?.data?.detail ||
            e.message ||
            errorMsg
        }
        setError(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [form, register, navigate, isPasswordValid]
  )

  if (token) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">
            Create Account
          </CardTitle>

          <CardDescription>
            Start managing your projects and tasks
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name
              </Label>

              <Input
                id="fullName"
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                required
              />
            </div>

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
                maxLength={72}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
              />

              <div className="space-y-1 text-xs">
                {passwordRules.map((rule) => {
                  const passed = rule.test(
                    form.password
                  )

                  return (
                    <div
                      key={rule.id}
                      className={
                        passed
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      {passed ? "✓" : "○"}{" "}
                      {rule.label}
                    </div>
                  )
                })}
              </div>
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
              disabled={
                isLoading || !isPasswordValid
              }
            >
              <UserPlusIcon weight="bold" />

              {isLoading
                ? "Creating Account..."
                : "Create Account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}