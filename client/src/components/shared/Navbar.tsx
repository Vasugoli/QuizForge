import React, { useState, useEffect } from 'react'
import authStore from '@/store/authStore'
import navigationStore from '@/store/navigationStore'
import type { AppView } from '@/store/navigationStore'
import ThemeToggle from '@/components/shared/ThemeToggle'
import Avatar from 'boring-avatars'
import {
  LogOut,
  BookOpen,
  Trophy,
  LayoutDashboard,
  Shield,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const Navbar: React.FC = () => {
  const { user, logout } = authStore()
  const { view, setView } = navigationStore()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768
      setIsMobileScreen(isMobile)
      if (!isMobile) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setView('catalog')
    setIsMobileOpen(false)
  }

  const handleNavClick = (targetView: AppView) => {
    setView(targetView)
    setIsMobileOpen(false)
  }

  const navItems: { id: AppView; label: string; icon: any }[] = [
    { id: 'catalog', label: 'Assessments', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]

  if (user?.role === 'ADMIN') {
    navItems.push({ id: 'admin', label: 'Admin Console', icon: Shield })
  }

  const renderNavLinks = () => (
    <nav className="flex flex-col gap-1 w-full">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = view === item.id
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={`w-full justify-start gap-3 px-4 py-5 text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                : "text-foreground hover:bg-muted"
            }`}
            onClick={() => handleNavClick(item.id)}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Button>
        )
      })}
    </nav>
  )

  const renderUserProfile = () => {
    if (!user) return null
    return (
      <div className="flex flex-col gap-4 pt-4 border-t border-border w-full mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-muted overflow-hidden">
            {!user.avatarUrl || user.avatarUrl.includes('unsplash.com') ? (
              <Avatar
                size={40}
                name={user.name}
                variant="beam"
                colors={['#4F6EF7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']}
              />
            ) : (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {user.role}
            </span>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <ThemeToggle />
          <Button
            variant="outline"
            className="flex-1 gap-2 cursor-pointer text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    )
  }

  // Mobile Header & Drawer
  if (isMobileScreen) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 px-4 flex items-center justify-between bg-card border-b border-border z-100 shadow-sm">
        <a href="/" className="flex items-center gap-3 text-lg font-bold text-foreground" onClick={handleLogoClick}>
          <div className="flex items-center justify-center bg-linear-to-br from-primary to-blue-400 text-white w-8 h-8 rounded-md font-extrabold text-sm shadow-sm">
            Q
          </div>
          <span>QuizForge</span>
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 cursor-pointer">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-6 flex flex-col gap-6 bg-card border-r border-border">
              <a href="/" className="flex items-center gap-3 text-lg font-bold text-foreground mb-4" onClick={handleLogoClick}>
                <div className="flex items-center justify-center bg-linear-to-br from-primary to-blue-400 text-white w-8 h-8 rounded-md font-extrabold text-sm shadow-sm">
                  Q
                </div>
                <span>QuizForge</span>
              </a>
              {renderNavLinks()}
              {renderUserProfile()}
            </SheetContent>
          </Sheet>
        </div>
      </header>
    )
  }

  // Desktop Sidebar
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-card border-r border-border p-6 flex flex-col gap-6 z-50">
      <a href="/" className="flex items-center gap-3 text-xl font-bold text-foreground mb-4" onClick={handleLogoClick}>
        <div className="flex items-center justify-center bg-linear-to-br from-primary to-blue-400 text-white w-9 h-9 rounded-md font-extrabold text-base shadow-md">
          Q
        </div>
        <span>QuizForge</span>
      </a>

      {renderNavLinks()}
      {renderUserProfile()}
    </aside>
  )
}

export default Navbar
