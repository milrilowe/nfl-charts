import { Link } from '@tanstack/react-router'

const navLinkClass =
  'px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors text-gray-300'
const navLinkActiveClass =
  'px-3 py-2 rounded-lg text-sm font-medium bg-cyan-600 hover:bg-cyan-700 transition-colors text-white'

export default function Header() {
  return (
    <header className="px-6 py-3 flex items-center gap-8 bg-gray-800 text-white shadow-lg">
      <h1 className="text-xl font-semibold">
        <Link to="/">NFL Charts</Link>
      </h1>
      <nav className="flex items-center gap-1">
        <Link
          to="/leaderboards"
          className={navLinkClass}
          activeProps={{ className: navLinkActiveClass }}
        >
          Leaderboards
        </Link>
        <Link
          to="/explore"
          className={navLinkClass}
          activeProps={{ className: navLinkActiveClass }}
        >
          Explore
        </Link>
      </nav>
    </header>
  )
}
