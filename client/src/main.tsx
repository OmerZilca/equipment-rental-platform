/**
 * Vite entry: mounts `<App />` into `#root` with StrictMode.
 * (Classic CRA-style `index.tsx` is usually named `main.tsx` in Vite.)
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
