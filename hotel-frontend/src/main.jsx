import React from 'react'; // Importa React
import ReactDOM from 'react-dom/client'; // Cambia la importación
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // <<< 1. IMPORTA AUTH
import { BrowserRouter } from 'react-router-dom'; // <<< 2. IMPORTA ROUTER

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>   {/* <-- 3. ENVUELVE CON ROUTER */}
      <AuthProvider>    {/* <-- 4. ENVUELVE CON AUTH */}
        <ThemeProvider> {/* <-- 5. ENVUELVE CON THEME */}
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);