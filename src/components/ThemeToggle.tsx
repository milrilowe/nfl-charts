import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

export function ThemeToggle() {
  const { toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 hidden dark:block" />
      <Moon className="h-4 w-4 block dark:hidden" />
    </button>
  )
}
