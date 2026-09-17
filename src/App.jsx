import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ServerConfigProvider } from './context/ServerConfigContext';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ServerConfigProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ServerConfigProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
