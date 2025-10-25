'use client'

import { Calendar, Home, Inbox, ChevronRight, LogOutIcon, BookOpen, ClipboardList } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
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
import { useStudentRouteParams } from '../hooks/useStudentRouteParams'

export function AppSidebar() {
  const [activeItem, setActiveItem] = useState('calendar')
  const pathname = usePathname()
  const { studentId } = useStudentRouteParams()

  const items = useMemo(
    () => [
      
      
      {
        id: 'calendar',
        title: 'Quizzes',
        url: `/student-dashboard/${studentId}/quizzes`,
        icon: Calendar,
        color: 'text-orange-600',
        bgHover: 'hover:bg-orange-50',
        activeColor: 'text-orange-700',
        activeBg: 'bg-orange-100',
        borderColor: 'border-orange-300'
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
    ],
    [studentId]
  )

  useEffect(() => {
    const currentItem = items.find((item) => item.url === pathname)
    if (currentItem) {
      setActiveItem(currentItem.id)
    }
  }, [pathname, items])

  return (
    <Sidebar className='border-r border-orange-200 bg-gradient-to-b from-orange-50 to-white'>
      <SidebarContent className='p-4'>
        {/* Header Section */}
        <div className='mb-8 px-2'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center shadow-md'>
              <span className='text-white font-bold text-sm'>S</span>
            </div>
            <div>
              <h2 className='text-lg font-bold text-slate-800'>TamaMali AI</h2>
              <p className='text-xs text-orange-600'>Student Dashboard</p>
            </div>
          </div>
          <div className='h-px bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200'></div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3 px-2'>
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className='space-y-1'>
              {items.map((item) => {
                const isActive = activeItem === item.id

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ease-in-out relative overflow-hidden border
                          ${
                            isActive
                              ? `${item.activeBg} ${item.activeColor} ${item.borderColor} shadow-md border-opacity-50 font-semibold`
                              : `text-slate-700 hover:translate-x-1 hover:shadow-sm ${item.bgHover} border-transparent hover:border-orange-200`
                          }`}
                      >
                        {isActive && (
                          <div className='absolute inset-0 bg-gradient-to-r from-orange-100/60 to-orange-50/40'></div>
                        )}
                        {!isActive && (
                          <div className='absolute inset-0 bg-gradient-to-r from-orange-50/0 to-orange-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
                        )}

                        <div
                          className={`relative z-10 transition-transform duration-200 ${
                            isActive ? `${item.activeColor} scale-105` : `${item.color} group-hover:scale-110`
                          }`}
                        >
                          <item.icon size={20} className='shrink-0' />
                        </div>

                        <span
                          className={`relative z-10 text-sm transition-colors duration-200 ${
                            isActive ? 'font-semibold' : 'font-medium group-hover:text-slate-900'
                          }`}
                        >
                          {item.title}
                        </span>

                        <ChevronRight
                          size={14}
                          className={`relative z-10 ml-auto transition-all duration-200 ${
                            isActive
                              ? 'opacity-100 translate-x-1 text-current'
                              : 'text-slate-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1'
                          }`}
                        />

                        {isActive && (
                          <div
                            className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full ${
                              item.id === 'sign-out'
                                ? 'bg-gradient-to-b from-slate-500 to-slate-600'
                                : 'bg-gradient-to-b from-orange-500 to-orange-700'
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
      </SidebarContent>
    </Sidebar>
  )
}
