import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { scheduleTokenExpiryLogoutFromStoredUser } from './lib/authSession'

scheduleTokenExpiryLogoutFromStoredUser()

createRoot(document.getElementById("root")!).render(<App />);
