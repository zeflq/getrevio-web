"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"
import { authClient, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { AuthFormDivider } from "./FormDivider"

const REMEMBER_ME_KEY = "auth.remember-email"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
})

type LoginValues = z.infer<typeof loginSchema>
export type LoginFormProps = React.ComponentProps<"form">

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: session, isPending } = useSession()
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form

  // Restore remembered email
  useEffect(() => {
    const storedEmail =
      typeof window !== "undefined" ? window.localStorage.getItem(REMEMBER_ME_KEY) : null
    if (storedEmail) {
      reset((current) => ({ ...current, email: storedEmail, rememberMe: true }))
    }
  }, [reset])


  const onSubmit = handleSubmit(async ({ email, password, rememberMe }) => {
    setFormError(null)

    const { data, error } = await authClient.signIn.email({
      email, 
      password,
      rememberMe,
      callbackURL: "/" ,
    })

    if (error || !data) {
      setFormError(error?.message ?? "Unable to sign in. Please try again.")
      return
    }

    if (rememberMe) {
      window.localStorage.setItem(REMEMBER_ME_KEY, email)
    } else {
      window.localStorage.removeItem(REMEMBER_ME_KEY)
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        <FormField<LoginValues, "email">
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="m@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<LoginValues, "password">
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel>Password</FormLabel>
                <a href="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
                  Forgot your password?
                </a>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<LoginValues, "rememberMe">
          control={control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  Remember me on this device
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
          {formError && (
            <p className="text-destructive text-center text-sm">{formError}</p>
          )}
        </div>

        <AuthFormDivider />

        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </form>
    </Form>
  )
}
