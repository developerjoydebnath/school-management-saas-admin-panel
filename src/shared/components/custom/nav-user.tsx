"use client"
import {
  CreditCard,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  Ticket,
  User
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { useSidebar } from "@/shared/components/ui/sidebar"
import { useTheme } from "next-themes"
import { useAuthStore } from "@/shared/stores/authStore"
import { useRouter } from "next/navigation"
import { PATHS } from "@/shared/configs/paths.config"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    role?: string
  }
}) {
  const { isMobile } = useSidebar()
  const { setTheme, theme } = useTheme()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const router = useRouter()

  const handleLogout = () => {
    // Clear proxy auth cookie
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
    // Clear client auth store
    clearAuth();
    // Redirect to login
    router.push(PATHS.AUTH.LOGIN);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full outline-hidden ring-sidebar-ring hover:ring-2 focus-visible:ring-2">
          <Avatar className="h-9 w-9 rounded-full border">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-full">AD</AvatarFallback>
          </Avatar>
        </button>
      }>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-lg shadow"
        side={isMobile ? "bottom" : "bottom"}
        align="end"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full">AD</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <div className="flex justify-between items-center gap-1 p-0">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 cursor-pointer flex items-center justify-center p-2 rounded hover:bg-accent hover:text-accent-foreground ${theme === 'light' ? 'bg-accent/50 ring-1 ring-border' : 'bg-accent/50'}`}
            title="Light Theme"
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 cursor-pointer flex items-center justify-center p-2 rounded hover:bg-accent hover:text-accent-foreground ${theme === 'dark' ? 'bg-accent/50 ring-1 ring-border' : 'bg-accent/50'}`}
            title="Dark Theme"
          >
            <Moon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`flex-1 cursor-pointer flex items-center justify-center p-2 rounded hover:bg-accent hover:text-accent-foreground ${theme === 'system' ? 'bg-accent/50 ring-1 ring-border' : 'bg-accent/50'}`}
            title="System Theme"
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Ticket className="mr-2 h-4 w-4" />
            Tickets
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/30 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
