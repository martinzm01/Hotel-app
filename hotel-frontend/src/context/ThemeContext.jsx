import React, { createContext, useState, useEffect, useContext} from 'react';

// 1. Crear el Contexto
const ThemeContext = createContext();

// 2. Crear el Proveedor (Provider)
export function ThemeProvider({ children }) {
  console.log("ThemeProvider RENDERIZADO"); // <-- LOG 1

  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light' 
  );

  useEffect(() => {
    console.log(`EFFECT: Aplicando tema '${theme}' al <html>`); // <-- LOG 2
    const root = window.document.documentElement; 

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme); 
  }, [theme]);

  const toggleTheme = () => {
    console.log("TOGGLE: Botón presionado. Cambiando tema..."); // <-- LOG 3
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // 4. Efecto para aplicar la clase al <html> y guardar en localStorage
  useEffect(() => {
    const root = window.document.documentElement; // Es el <html> tag

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      // ESTA PARTE ES CRUCIAL
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', theme); // Guardar preferencia
  }, [theme]);


  const value = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 6. Hook personalizado para consumir el contexto fácilmente
export const useTheme = () => {
  return useContext(ThemeContext);
};

