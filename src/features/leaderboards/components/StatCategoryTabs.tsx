import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { STAT_CATEGORIES } from '../stat-columns'

interface StatCategoryTabsProps {
  category: string
  onCategoryChange: (category: string) => void
}

export function StatCategoryTabs({
  category,
  onCategoryChange,
}: StatCategoryTabsProps) {
  return (
    <Tabs value={category} onValueChange={onCategoryChange}>
      <TabsList>
        {Object.entries(STAT_CATEGORIES).map(([key, cat]) => (
          <TabsTrigger key={key} value={key}>
            {cat.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
