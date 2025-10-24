"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

import { AuthFormDivider } from "./FormDivider"

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
    acceptTerms: z
      .boolean()
      .refine((value) => value, "You must accept the terms to continue"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupValues = z.infer<typeof signupSchema>

export type SignupFormProps = React.ComponentProps<"form">

export function SignupForm({ className, ...props }: SignupFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form

  const passwordValue = watch("password")
  const passwordStrength = useMemo(() => {
    if (!passwordValue) return ""
    if (passwordValue.length < 6) return "Weak password"
    if (!/[A-Z]/.test(passwordValue) || !/[0-9]/.test(passwordValue)) return "Medium password"
    return "Strong password"
  }, [passwordValue])

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setFormError(null)
    setSuccessMessage(null)

    const { data, error } = await authClient.signUp.email({
      name,
      email, 
      password,
      callbackURL: '/'
    })

    if (error || !data) {
      setFormError(error?.message ?? "Unable to complete sign up. Please try again.")
      return
    }

    setSuccessMessage(`Welcome, ${name}! Your account is ready.`)
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to get started.
          </p>
        </div>

        <FormField<SignupValues, "name">
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="John Doe" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<SignupValues, "email">
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="m@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormDescription>
                We&apos;ll use this to contact you. We will not share your email with anyone else.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<SignupValues, "password">
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription className={passwordStrength.includes("Weak") ? "text-destructive" : undefined}>
                {passwordStrength || "Must be at least 6 characters and include a mix of letters and numbers."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<SignupValues, "confirmPassword">
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription>Please confirm your password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<SignupValues, "acceptTerms">
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                  I agree to the terms and privacy policy
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
          {formError ? (
            <p className="text-destructive text-center text-sm">{formError}</p>
          ) : null}
          {successMessage ? (
            <p className="text-center text-sm text-emerald-600">{successMessage}</p>
          ) : null}
        </div>

        <AuthFormDivider />

        <p className="text-muted-foreground text-center text-sm">
          Already have an account? <a href="/login" className="underline underline-offset-4">Sign in</a>
        </p>
      </form>
    </Form>
  )
}
