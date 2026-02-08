
import { createFileRoute } from '@tanstack/react-router'

const PYTHON_API = 'http://localhost:8000'

export const Route = createFileRoute('/api/nfl/datasets/$datasetId/schema')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { datasetId } = params
        const res = await fetch(`${PYTHON_API}/datasets/${datasetId}/schema`)
        if (!res.ok) {
          return new Response(JSON.stringify({ error: `Failed to fetch schema for ${datasetId}` }), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return Response.json(await res.json())
      },
    },
  },
})
