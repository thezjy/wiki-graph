const BASE_URL =
  'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*'

const ROOT_NODE_OPTION = {
  color: {
    background: 'orange',
    size: 40,
  },
}

/**
 * react concurrent mode stuff
 * https://reactjs.org/docs/concurrent-mode-patterns.html
 */
function wrapPromise(promise) {
  let status = 'pending'
  let result
  let suspender = promise.then(
    (r) => {
      status = 'success'
      result = r
    },
    (e) => {
      status = 'error'
      result = e
    },
  )
  return {
    read() {
      if (status === 'pending') {
        throw suspender
      } else if (status === 'error') {
        throw result
      } else if (status === 'success') {
        return result
      }
    },
  }
}

async function doSearchWikipedia(query, count) {
  const response = await fetch(
    `${BASE_URL}&srlimit=${count}&list=search&srsearch=${query}`,
  )

  const json = await response.json()

  const results = json.query.search.filter(
    (result) => !result.snippet.includes(' may refer to: '), // naive way to filter out disambiguation page
  )

  // after some googling I just can't find a way to fetch all search results with page links in a single request.
  const promises = results.map(async (result) => {
    const response = await fetch(
      `${BASE_URL}&prop=links&pllimit=20&titles=${result.title}`,
    )
    const json = await response.json()
    return {
      root: result.title,
      links: json.query.pages[result.pageid]?.links ?? [],
    }
  })

  const raw = await Promise.all(promises)
  const graph = createGraphData(raw)

  return graph
}

function createGraphData(raw) {
  let graph = {
    nodes: [],
    edges: [],
  }

  // cache for quick existence check
  let ids = {}

  // we use wikipedia title as id because it's kind of unique
  function pushNode(id, isRoot = false) {
    if (ids[id] == null) {
      let node = { id, label: id }
      if (isRoot) {
        node = {
          ...node,
          ...ROOT_NODE_OPTION,
        }
      }
      graph.nodes.push(node)

      ids[id] = id
    }
  }

  raw.forEach((item) => {
    pushNode(item.root, true)
    item.links.forEach((link) => {
      pushNode(link.title)
      graph.edges.push({ from: item.root, to: link.title })
    })
  })

  return graph
}

export function searchWikipedia(query, count) {
  const promise = doSearchWikipedia(query, count)
  return wrapPromise(promise)
}
