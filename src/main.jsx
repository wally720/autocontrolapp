import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// 1. Cambia la importación de BrowserRouter a HashRouter
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { VehicleProvider } from './context/VehicleContext'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envuelve tu App con HashRouter en lugar de BrowserRouter */}
    <HashRouter>
      <AuthProvider>
        <VehicleProvider>
          <App />
        </VehicleProvider>
      </AuthProvider>
    </HashRouter>

  </React.StrictMode>,
)
