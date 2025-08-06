import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Web3Provider } from './components/web3Context.jsx'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <Web3Provider>
    <App />
  </Web3Provider>,
)
