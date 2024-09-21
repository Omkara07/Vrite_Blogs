import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// import Navbar from './components/navbar.component.tsx'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <BrowserRouter>
    <Toaster richColors />
    <App />
  </BrowserRouter>
  // </StrictMode>,
)
