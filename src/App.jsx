import React, {
  Suspense,
  unstable_useTransition as useTransition,
  useState,
} from 'react'
import { searchWikipedia } from './apis'
import NetworkGraph from './NetworkGraph'

const INITIAL_QUERY = 'React'
const DEFAULT_NODE_COUNT = 10
const INITIAL_RESOURCE = searchWikipedia(INITIAL_QUERY, DEFAULT_NODE_COUNT)

function App() {
  const [query, setQuery] = useState(INITIAL_QUERY)
  const [resource, setResource] = useState(INITIAL_RESOURCE)
  const [nodeCount, setNodeCount] = useState(DEFAULT_NODE_COUNT)

  const [startTransition, isPending] = useTransition({ timeoutMs: 5000 })

  const updateResource = (query, count) => {
    startTransition(() => {
      setResource(searchWikipedia(query, count))
    })
  }

  const handleChangeQuery = (event) => {
    const nextQuery = event.target.value

    setQuery(nextQuery)
    if (nextQuery.length > 0) {
      updateResource(nextQuery, nodeCount)
    }
  }

  const handleChangeNodeCount = (event) => {
    const nextNodeCount = event.target.value
    setNodeCount(nextNodeCount)
    updateResource(query, nextNodeCount)
  }

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <div className="w-62 border p-4 flex flex-col justify-between">
        <div>
          <input
            className="border bg-white appearance-none block w-full rounded-md py-1 px-2 focus:outline-none"
            value={query}
            onChange={handleChangeQuery}
            placeholder="search"
          />
          <div className="h-6">{isPending ? 'updating...' : ''}</div>

          <label htmlFor="nodeCount">
            select root node count:
            <select
              name="nodeCount"
              value={nodeCount}
              onChange={handleChangeNodeCount}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
          </label>
          <div>(please be kind to the wikipedia server :))</div>
        </div>

        <div className="hidden md:block">
          <h2 className="text-lg font-bold">Notice: </h2>
          <ul className="list-disc list-inside">
            <li>English only</li>
            <li>search results are in orange background</li>
            <li>scroll to zoom in/out</li>
          </ul>
        </div>
      </div>

      <Suspense fallback={<p>Loading...</p>}>
        <NetworkGraph resource={resource} />
      </Suspense>
    </div>
  )
}

export default App
