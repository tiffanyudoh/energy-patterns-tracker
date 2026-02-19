import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { migrateRestorerToBoost } from './utils/dataMigration'

// Run data migrations before rendering
migrateRestorerToBoost()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
