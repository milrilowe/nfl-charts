import { createFileRoute } from '@tanstack/react-router'

const PYTHON_API = 'http://localhost:8000'

export const Route = createFileRoute('/api/nfl/datasets/$datasetId/data')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const { datasetId } = params
        const url = new URL(request.url)
        const queryString = url.search

        const res = await fetch(`${PYTHON_API}/datasets/${datasetId}/data${queryString}`)
        if (!res.ok) {
          return new Response(JSON.stringify({ error: `Failed to fetch data for ${datasetId}` }), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return Response.json(await res.json())
      },
    },
  },
})
