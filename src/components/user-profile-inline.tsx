import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserProfileInline({
  user,
}: {
  user: { name: string; email: string; avatar?: string }
}) {
  return (
    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="rounded-lg">
          {user.name?.slice(0, 2) || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </div>
  )
}