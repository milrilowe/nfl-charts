import { useLeaderboards as useLeaderboardsQuery } from '@/lib/nfl-queries'
import { LEADERBOARD_STATS } from '../constants'

export function useLeaderboards(year: number) {
  const query = useLeaderboardsQuery(year)

  return {
    leaderboards: LEADERBOARD_STATS.map((stat) => ({
      stat,
      players: query.data?.leaders[stat.key] ?? [],
      isLoading: query.isLoading,
    })),
    isLoading: query.isLoading,
  }
}
