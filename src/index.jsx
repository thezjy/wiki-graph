import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'

const rootEl = document.getElementById('root')
if (rootEl == null) {
  throw new Error('No #root element!')
}

ReactDOM.unstable_createRoot(rootEl).render(<App />)

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept()
}
