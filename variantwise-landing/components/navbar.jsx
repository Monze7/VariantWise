"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Moon, Sun, User } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const pathname = usePathname()

  // Check if user is on auth pages
  const isAuthPage = pathname === "/signin" || pathname === "/signup"

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-primary-500/95 backdrop-blur supports-[backdrop-filter]:bg-primary-500/60 border-b border-primary-400"
          : "bg-primary-500"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 ml-2 md:ml-0">
            <span className="text-xl font-bold interactive-text text-white">
              <span className="text-primary-100">Variant</span>Wise
            </span>
          </Link>
        </div>
        <nav className="hidden gap-6 md:flex">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary-200 text-white">
            Home
          </Link>
          <Link href="/features" className="text-sm font-medium transition-colors hover:text-primary-200 text-white">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium transition-colors hover:text-primary-200 text-white">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary-200 text-white">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full border-primary-300 bg-primary-400">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-white" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary-200" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-primary-400 border-primary-300">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="cursor-pointer text-white hover:bg-primary-500"
              >
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="cursor-pointer text-white hover:bg-primary-500"
              >
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="cursor-pointer text-white hover:bg-primary-500"
              >
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {!isAuthPage && (
            <>
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="/dashboard">
                  <User className="h-5 w-5 text-white" />
                  <span className="sr-only">Profile</span>
                </Link>
              </Button>
              <Button
                className="hidden md:flex bg-black hover:bg-primary-400 text-white border border-primary-300"
                asChild
              >
                <Link href="/signin">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

