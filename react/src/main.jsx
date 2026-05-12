import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Added
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
// Added
import BottomNav from './components/BottomNav.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className='content'>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </div>
  </StrictMode>,
)
