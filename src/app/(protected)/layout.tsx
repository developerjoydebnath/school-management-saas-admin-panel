import { AppSidebar } from '@/shared/components/custom/app-sidebar'
import Header from '@/shared/components/layout/Header'
import { SidebarProvider, SidebarInset } from '@/shared/components/ui/sidebar'
import React from 'react'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className='flex-1 bg-accent relative sm:p-6 p-4'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
