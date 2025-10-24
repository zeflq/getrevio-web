export function AuthFormDivider() {
  return (
    <div className="space-y-2">
      <div className="relative flex items-center">
        <span className="bg-border h-px w-full" />
        <span className="bg-background text-muted-foreground absolute left-1/2 -translate-x-1/2 px-2 text-xs uppercase tracking-wide">
          Or continue with
        </span>
      </div>
    </div>
  )
}
