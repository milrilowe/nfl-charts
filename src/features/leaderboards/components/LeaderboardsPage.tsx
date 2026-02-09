import { useMemo } from 'react'
import { useLeaderboardData, filterAndSort } from '../hooks/use-leaderboard'
import { STAT_CATEGORIES } from '../stat-columns'
import { StatCategoryTabs } from './StatCategoryTabs'
import { LeaderboardFilters } from './LeaderboardFilters'
import { LeaderboardChart } from './LeaderboardChart'
import { LeaderboardTable } from './LeaderboardTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAvailableYears } from '@/lib/nfl-queries'

type Category = 'passing' | 'rushing' | 'receiving'
type Conference = 'AFC' | 'NFC'

interface LeaderboardSearch {
  year: number
  category: Category
  stat: string
  topN: number
  position?: string
  team?: string
  conference?: Conference
}

interface LeaderboardsPageProps {
  search: LeaderboardSearch
  onSearchChange: (updates: Partial<LeaderboardSearch>) => void
}

export function LeaderboardsPage({
  search,
  onSearchChange,
}: LeaderboardsPageProps) {
  const { year, category, stat, topN, position, team, conference } = search

  const { data, isLoading, error, availablePositions, availableTeams } =
    useLeaderboardData(year)
  const { data: yearsData } = useAvailableYears()
  const maxYear = yearsData?.latest ?? 2024

  const filtered = useMemo(
    () => filterAndSort(data, { stat, position, team, conference }),
    [data, stat, position, team, conference]
  )

  const chartData = filtered.slice(0, topN)

  function handleCategoryChange(newCategory: string) {
    const defaultStat = STAT_CATEGORIES[newCategory]?.defaultStat
    onSearchChange({ category: newCategory as Category, stat: defaultStat })
  }

  return (
    <div className="text-foreground p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide border-l-4 border-nfl-red pl-3">
          NFL Leaderboards
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <StatCategoryTabs
            category={category}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        <LeaderboardFilters
          year={year}
          maxYear={maxYear}
          category={category}
          stat={stat}
          topN={topN}
          position={position}
          team={team}
          conference={conference}
          availablePositions={availablePositions}
          availableTeams={availableTeams}
          onYearChange={(v) => onSearchChange({ year: v })}
          onStatChange={(v) => onSearchChange({ stat: v })}
          onTopNChange={(v) => onSearchChange({ topN: v })}
          onPositionChange={(v) => onSearchChange({ position: v })}
          onTeamChange={(v) => onSearchChange({ team: v })}
          onConferenceChange={(v) => onSearchChange({ conference: v as Conference })}
        />

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
            Failed to load data: {error.message}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full bg-card" />
            <Skeleton className="h-[300px] w-full bg-card" />
          </div>
        ) : (
          <>
            <Card className="bg-card/50 border-team-primary/20">
              <CardHeader>
                <CardTitle className="font-display text-lg uppercase tracking-wider text-foreground">
                  Top {topN}{' '}
                  {STAT_CATEGORIES[category]?.stats.find(
                    (s) => s.key === stat
                  )?.label ?? stat}
                  {position ? ` (${position})` : ''}
                  {team ? ` - ${team}` : ''}
                  {conference ? ` - ${conference}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardChart
                  data={chartData}
                  statKey={stat}
                  category={category}
                />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-team-primary/20">
              <CardHeader>
                <CardTitle className="font-display text-lg uppercase tracking-wider text-foreground">
                  All Players ({filtered.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  data={filtered}
                  category={category}
                  statKey={stat}
                  topN={topN}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
