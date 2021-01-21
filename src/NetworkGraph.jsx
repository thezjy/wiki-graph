import { debounce } from 'lodash-es'
import React, { useEffect, useRef } from 'react'
import VisNetworkReactComponent from 'vis-network-react'

function NetworkGraph({ resource }) {
  const data = resource.read()
  const networkRef = useRef()
  const getNetwork = (network) => {
    networkRef.current = network
  }

  useEffect(() => {
    const handleResize = debounce(() => {
      networkRef.current.redraw()
    }, 500)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="flex-1">
      <VisNetworkReactComponent
        data={data}
        events={{
          stabilized: () => {
            networkRef.current.moveTo({ scale: 1 })
          },
        }}
        getNetwork={getNetwork}
      />
    </div>
  )
}

export default NetworkGraph
