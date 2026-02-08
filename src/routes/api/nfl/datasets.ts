import { createFileRoute } from '@tanstack/react-router'

const PYTHON_API = 'http://localhost:8000'

export const Route = createFileRoute('/api/nfl/datasets')({
  server: {
    handlers: {
      GET: async () => {
        const res = await fetch(`${PYTHON_API}/datasets`)
        if (!res.ok) {
          return new Response(JSON.stringify({ error: 'Failed to fetch datasets' }), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return Response.json(await res.json())
      },
    },
  },
})
