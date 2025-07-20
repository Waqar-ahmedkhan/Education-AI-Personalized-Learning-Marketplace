// pages/layouts.tsx
import { ThemeProvider } from '@/components/core/ThemeProvider'
import { LayoutManager } from '@/components/dashboard/LayoutManger'

export default function LayoutsPage() {
  return (
    <ThemeProvider>
      <LayoutManager/>
    </ThemeProvider>
  )
}