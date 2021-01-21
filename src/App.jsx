import React, {
  Suspense,
  useState,
  unstable_useTransition as useTransition,
} from 'react'
import { searchWikipedia } from './apis'

const initialQuery = 'React'
const initialResource = searchWikipedia(initialQuery)

function List({ resource }) {
  return (
    <div className="whitespace-pre-wrap">
      {JSON.stringify(resource.read(), null, 2)}
    </div>
  )
}

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
    <div>
      <input value={query} onChange={handleChange} placeholder="search" />
      <Suspense fallback={<p>Loading...</p>}>
        <div className={`text-${isPending ? 'gray' : 'green'}-500`}>
          <List resource={resource} />
        </div>
      </Suspense>
    </div>
  )
}

export default App
