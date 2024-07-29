import React from 'react'
import ReactDOM from 'react-dom/client'
import { Map } from './Map'
import { data } from './data'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <Map data={data} />
  </React.StrictMode>,
)
