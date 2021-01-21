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

async function doSearchWikipedia(query) {
  const response1 = await fetch(`${BASE_URL}&list=search&srsearch=${query}`)

  const terms = await response1.json()
  console.info('terms', terms.query.search)

  const promises = terms.query.search
    .filter((item) => !item.snippet.includes(' may refer to: '))
    .map(async (item) => {
      const response = await fetch(
        `${BASE_URL}&generator=links&gpllimit=100&pageids=${item.pageid}`,
      )
      const json = await response.json()
      return { root: item, links: json.query.pages }
    })

  const json2 = await Promise.all(promises)

  return json2
}

export function searchWikipedia(query) {
  const promise = doSearchWikipedia(query)
  return wrapPromise(promise)
}
