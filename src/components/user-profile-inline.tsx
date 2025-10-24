"use client"

import { ChevronsUpDown, LogOut, User as UserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "@/i18n/navigation";

type UserProfileInlineProps = {
  user: {
    name: string
    email: string
    avatar?: string | null
  }
  className?: string
  onAccount?: () => void
  onLogout?: () => void
}

export function UserProfileInline({ user, className, onAccount, onLogout }: UserProfileInlineProps) {
  const initials = user.name?.trim().slice(0, 2).toUpperCase() || "?"
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-muted",
            className
          )}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-2 px-3 py-2">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(event) => {
          event.preventDefault()
          onAccount?.()
        }}>
          <UserIcon className="mr-2 size-4" /> Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={async (event) => {
            event.preventDefault()
            onLogout?.()
            router.push("/") 
          }}
        >
          <LogOut className="mr-2 size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
