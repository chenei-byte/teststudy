import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StudyDataProvider } from './context/StudyDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StudyDataProvider>
      <App />
    </StudyDataProvider>
  </StrictMode>
)
