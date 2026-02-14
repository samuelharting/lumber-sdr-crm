import './style.css'
import LeadsPage from './components/LeadsPage'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="app-root"></div>
`

// Mount the React component
import React from 'react'
import ReactDOM from 'react-dom/client'
import LeadsPage from './components/LeadsPage'

ReactDOM.createRoot(document.getElementById('app-root')!).render(
  <React.StrictMode>
    <LeadsPage />
  </React.StrictMode>
)