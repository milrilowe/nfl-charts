import { useMemo } from 'react'
import { useTheme } from '@/contexts/theme-context'

export function useChartTheme() {
  const { theme } = useTheme()

  return useMemo(() => {
    if (theme === 'dark') {
      return {
        tickFill: '#9ca3af',
        tickSecondaryFill: '#d1d5db',
        axisStroke: '#374151',
        tooltipBg: '#111827',
        tooltipBorder: 'rgba(255,255,255,0.1)',
        tooltipText: '#f3f4f6',
      }
    }
    return {
      tickFill: '#6b7280',
      tickSecondaryFill: '#1f2937',
      axisStroke: '#d1d5db',
      tooltipBg: '#ffffff',
      tooltipBorder: '#e5e7eb',
      tooltipText: '#111827',
    }
  }, [theme])
}
