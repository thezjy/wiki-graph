import React, {
  Suspense,
  useState,
  unstable_useTransition as useTransition,
} from 'react'
import { searchWikipedia } from './apis'
import NetworkGraph from './NetworkGraph'

const initialQuery = 'React'
const initialResource = searchWikipedia(initialQuery)

function App() {
  const [query, setQuery] = useState(initialQuery)
  const [resource, setResource] = useState(initialResource)

  const [startTransition, isPending] = useTransition({ timeoutMs: 5000 })

  function handleChange(e) {
    const value = e.target.value

    setQuery(value)
    if (value.length > 0) {
      startTransition(() => {
        setResource(searchWikipedia(value))
      })
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <div>
        <input value={query} onChange={handleChange} placeholder="search" />
      </div>
      <Suspense fallback={<p>Loading...</p>}>
        <NetworkGraph resource={resource} />
      </Suspense>
    </div>
  )
}

export default App
