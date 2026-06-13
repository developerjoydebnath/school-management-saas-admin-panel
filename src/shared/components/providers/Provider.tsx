import React from 'react'
import { Toaster } from '../ui/sonner'
import { TooltipProvider } from '../ui/tooltip'
import AuthProvider from './AuthProvider'
import { ThemeProvider } from './theme-provider'

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
      <Toaster richColors />
    </>
  )
}