const BASE_URL =
  'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*'
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

async function doSearchWikipedia(query, count = 10) {
  const response1 = await fetch(
    `${BASE_URL}&srlimit=${count}&list=search&srsearch=${query}`,
  )

  const json1 = await response1.json()
  const terms = json1.query.search.filter(
    (item) => !item.snippet.includes(' may refer to: '),
  )

  const promises = terms.map(async (item) => {
    const response = await fetch(
      `${BASE_URL}&prop=links&pllimit=10&titles=${item.title}`,
    )
    const json = await response.json()
    return {
      root: item.title,
      links: json.query.pages[item.pageid].links,
    }
  })

  const raw = await Promise.all(promises)
  const graph = createGraphData(raw)

  console.info('graph', graph)

  return graph
}

function createGraphData(raw) {
  let graph = {
    nodes: [],
    edges: [],
  }

  let ids = {}

  function pushNode(id, extra) {
    if (ids[id] == null) {
      graph.nodes.push({ id, label: id, ...extra })

      ids[id] = id
    }
  }

  raw.forEach((item) => {
    pushNode(item.root, {
      color: {
        background: 'orange',
      },
    })
    item.links.forEach((link) => {
      pushNode(link.title)
      graph.edges.push({ from: item.root, to: link.title })
    })
  })

  return graph
}

export function searchWikipedia(query) {
  const promise = doSearchWikipedia(query)
  return wrapPromise(promise)
}
