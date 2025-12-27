'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Store,
  Layers,
  UserCog,
  Link2,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    name: 'Menu Management',
    icon: UtensilsCrossed,
    children: [
      { name: 'Items', href: '/admin/menu/items' },
      { name: 'Modifier Groups', href: '/admin/menu/modifiers' },
    ],
  },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  {
    name: 'Promotions',
    icon: Store,
    children: [
      { name: 'Coupons', href: '/admin/coupons' },
      { name: 'Loyalty Program', href: '/admin/loyalty' },
    ],
  },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Integrations', href: '/admin/integrations', icon: Link2 },
  { name: 'POS Config', href: '/admin/pos', icon: Layers },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'Branch Info', href: '/admin/settings/branch' },
    ],
  },
  { name: 'Users', href: '/admin/users', icon: UserCog },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState(['Menu Management', 'Settings'])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [restaurantName, setRestaurantName] = useState('Bam Burgers')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const auth = localStorage.getItem('riwa_admin_auth')
    if (!auth && pathname !== '/admin/login') {
      router.push('/admin/login')
    } else if (auth) {
      setIsLoggedIn(true)
      // Fetch restaurant name
      fetch('/api/admin/settings/tenant')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.name) {
            setRestaurantName(data.data.name)
          }
        })
        .catch(() => {})
    }
    setLoading(false)
  }, [pathname, router])

  const toggleExpand = (name) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('riwa_admin_auth')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div>
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return children
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1e3a5f] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold">{restaurantName}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-white/10"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-[#1e3a5f] transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">{restaurantName}</h1>
                <p className="text-[#a8c5e6] text-xs">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleExpand(item.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          "text-[#a8c5e6] hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedItems.includes(item.name) && "rotate-180"
                          )}
                        />
                      </button>
                      {expandedItems.includes(item.name) && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "block px-3 py-2 rounded-lg text-sm transition-colors",
                                pathname === child.href
                                  ? "bg-[#d4af37] text-white"
                                  : "text-[#a8c5e6] hover:bg-white/10 hover:text-white"
                              )}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-[#d4af37] text-white"
                          : "text-[#a8c5e6] hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
