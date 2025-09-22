'use client'
import { Calendar, Home, Inbox, Search, ChevronRight, LogOutIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const items = [
  {
    id: 'home',
    title: 'Home',
    url: '/teacher-dashboard',
    icon: Home,
    color: 'text-blue-600',
    bgHover: 'hover:bg-blue-50',
    activeColor: 'text-blue-700',
    activeBg: 'bg-blue-100',
    borderColor: 'border-blue-200'
  },
  {
    id: 'inbox',
    title: 'Students',
    url: '/teacher-dashboard/students',
    icon: Inbox,
    color: 'text-emerald-600',
    bgHover: 'hover:bg-emerald-50',
    activeColor: 'text-emerald-700',
    activeBg: 'bg-emerald-100',
    borderColor: 'border-emerald-200'
  },
  {
    id: 'calendar',
    title: 'Quizzes',
    url: '/teacher-dashboard/quizzes',
    icon: Calendar,
    color: 'text-purple-600',
    bgHover: 'hover:bg-purple-50',
    activeColor: 'text-purple-700',
    activeBg: 'bg-purple-100',
    borderColor: 'border-purple-200'
  },
  {
    id: 'search',
    title: 'Create Quiz',
    url: '/teacher-dashboard/quizzes/create',
    icon: Search,
    color: 'text-amber-600',
    bgHover: 'hover:bg-amber-50',
    activeColor: 'text-amber-700',
    activeBg: 'bg-amber-100',
    borderColor: 'border-amber-200'
  },
  {
    id: 'sign-out',
    title: 'Sign-out',
    url: '/sign-out',
    icon: LogOutIcon,
    color: 'text-slate-600',
    bgHover: 'hover:bg-slate-50',
    activeColor: 'text-slate-700',
    activeBg: 'bg-slate-100',
    borderColor: 'border-slate-200'
  }
]

export function AppSidebar() {
  const [activeItem, setActiveItem] = useState('home')
  const pathname = usePathname()

  // Update active item based on current pathname
  useEffect(() => {
    const currentItem = items.find((item) => item.url === pathname)
    if (currentItem) {
      setActiveItem(currentItem.id)
    }
  }, [pathname])

  return (
    <Sidebar className='border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white'>
      <SidebarContent className='p-4'>
        {/* Header Section */}
        <div className='mb-8 px-2'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>T</span>
            </div>
            <div>
              <h2 className='text-lg font-bold text-slate-800'>TamaMali AI</h2>
              <p className='text-xs text-slate-500'>Teacher Dashboard</p>
            </div>
          </div>
          <div className='h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200'></div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2'>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='space-y-1'>
              {items.map((item) => {
                const isActive = activeItem === item.id
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ease-in-out relative overflow-hidden border
                          ${
                            isActive
                              ? `${item.activeBg} ${item.activeColor} ${item.borderColor} shadow-md border-opacity-50 font-semibold`
                              : `text-slate-700 hover:translate-x-1 hover:shadow-sm ${item.bgHover} border-transparent hover:border-slate-200`
                          }`}
                      >
                        {/* Active state background gradient */}
                        {isActive && (
                          <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-white/40'></div>
                        )}

                        {/* Subtle gradient background on hover for non-active items */}
                        {!isActive && (
                          <div className='absolute inset-0 bg-gradient-to-r from-white/0 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
                        )}

                        {/* Icon with custom color */}
                        <div
                          className={`relative z-10 transition-transform duration-200 ${
                            isActive ? `${item.activeColor} scale-105` : `${item.color} group-hover:scale-110`
                          }`}
                        >
                          <item.icon size={20} className='shrink-0' />
                        </div>

                        {/* Text */}
                        <span
                          className={`relative z-10 text-sm transition-colors duration-200 ${
                            isActive ? 'font-semibold' : 'font-medium group-hover:text-slate-900'
                          }`}
                        >
                          {item.title}
                        </span>

                        {/* Arrow indicator - always visible for active, on hover for others */}
                        <ChevronRight
                          size={14}
                          className={`relative z-10 ml-auto transition-all duration-200 ${
                            isActive
                              ? 'opacity-100 translate-x-1 text-current'
                              : 'text-slate-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1'
                          }`}
                        />

                        {/* Active state left border indicator */}
                        {isActive && (
                          <div
                            className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full ${
                              item.id === 'home'
                                ? 'bg-gradient-to-b from-blue-500 to-blue-600'
                                : item.id === 'inbox'
                                ? 'bg-gradient-to-b from-emerald-500 to-emerald-600'
                                : item.id === 'calendar'
                                ? 'bg-gradient-to-b from-purple-500 to-purple-600'
                                : item.id === 'search'
                                ? 'bg-gradient-to-b from-amber-500 to-amber-600'
                                : 'bg-gradient-to-b from-slate-500 to-slate-600'
                            }`}
                          ></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom section */}
        <div className='mt-auto pt-6'>
          <div className='px-2'>
            <div className='h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 mb-4'></div>
            <div className='flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200'>
              <div className='w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center'>
                <span className='text-white text-xs font-semibold'>TD</span>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-slate-800 truncate'>Teacher Dashboard</p>
                <p className='text-xs text-slate-500 truncate'>Manage your classroom</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
