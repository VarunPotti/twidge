import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import "@twidge/config/colors.css"
import rspc, {client, queryClient} from "./query"

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <rspc.Provider client={client} queryClient={queryClient}>
      <App />
    </rspc.Provider>
  </React.StrictMode>
)
