"use client"

import { useState } from "react"
import { User, LogOut, Settings } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { ThemeToggle } from "./theme-toggle"
import UserAvatar from "./UserAvatar"

interface UserMenuProps {
  user: {
    name?: string
    email?: string
  }
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      router.push("/auth")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleProfile = () => {
    // Navigate to profile page - adjust route as needed
    router.push("/profile")
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {user.email ? (
            <UserAvatar email={user.email} size={32} alt={user.name || "User"} />
          ) : (
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            {user.email ? (
              <UserAvatar email={user.email} size={40} alt={user.name || "User"} />
            ) : (
              <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleProfile}
            className="w-full justify-start px-4 py-2 h-auto font-normal"
          >
            <Settings className="w-4 h-4 mr-3" />
            Profile & Settings
          </Button>

          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-medium">Dark Mode</span>
            <ThemeToggle />
          </div>

          <div className="border-t my-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start px-4 py-2 h-auto font-normal text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}