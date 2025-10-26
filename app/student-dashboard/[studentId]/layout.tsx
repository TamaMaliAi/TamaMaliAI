import { Inter } from 'next/font/google'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { Menu } from 'lucide-react'
import { AppSidebar } from './components/AppSidebar'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* <html lang='en'>
          <body className={`${inter.variable} antialiased`}> */}
            {/* Professional Styled SidebarTrigger */}
            <div className='flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6'>
              <SidebarTrigger className='group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-gradient-to-b hover:from-slate-50 hover:to-slate-100 hover:text-slate-900 hover:shadow-md active:scale-95 data-[state=open]:border-blue-300 data-[state=open]:bg-gradient-to-b data-[state=open]:from-blue-50 data-[state=open]:to-blue-100 data-[state=open]:text-blue-700 data-[state=open]:shadow-md'>
                {/* Background gradient overlay */}
                <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100'></div>

                {/* Icon with smooth rotation */}
                <Menu
                  size={18}
                  className='relative z-10 transition-transform duration-200 group-data-[state=open]:rotate-90'
                />

                {/* Subtle glow effect on hover */}
                <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
              </SidebarTrigger>

              {/* Optional: Add page title */}
              <div className='flex items-center gap-2'>
                <div className='h-6 w-px bg-slate-300'></div>
                <h1 className='text-lg font-semibold text-slate-900'>Student Dashboard</h1>
              </div>
            </div>

            {/* Main Content - Automatically adjusts with sidebar */}
            <div className='flex-1 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen'>{children}</div>
          {/* </body>
        </html> */}
      </SidebarInset>
    </SidebarProvider>
  )
}
