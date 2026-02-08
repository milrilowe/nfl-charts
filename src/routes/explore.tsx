import { createFileRoute } from '@tanstack/react-router'
import { ExplorePage } from '@/features/explore'

export const Route = createFileRoute('/explore')({
  component: ExplorePage,
})
