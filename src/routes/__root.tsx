import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import Header from '../components/Header'
import { ThemeProvider } from '../contexts/theme-context'
import { TeamProvider } from '../contexts/team-context'
import { useTeamTheme } from '../hooks/use-team-theme'
import { useTeamContext } from '../contexts/team-context'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'NFL Data Explorer' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous' as const,
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function ThemeApplicator() {
  useTeamTheme()
  return null
}

function AmbientGlow() {
  const { teamInfo } = useTeamContext()
  return (
    <div
      className="pointer-events-none fixed inset-0 transition-opacity duration-700 z-0"
      style={{
        background: `radial-gradient(ellipse at top, ${teamInfo ? teamInfo.team_color : '#013369'}18 0%, transparent 50%)`,
      }}
    />
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('nfl-charts-theme');if(t!=='light')document.documentElement.classList.add('dark')})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background">
        <ThemeProvider>
          <TeamProvider>
            <ThemeApplicator />
            <AmbientGlow />
            <Header />
            <main className="relative z-10">{children}</main>
          </TeamProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <Scripts />
      </body>
    </html>
  )
}
