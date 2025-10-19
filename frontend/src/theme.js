import { createTheme } from '@mui/material/styles';

// Define tu tema aquí (puedes elegir modo 'light' o 'dark')
const theme = createTheme({
  palette: {
    mode: 'dark', // Cambia a 'light' para el tema claro
    primary: {
      main: '#00bfff', // Azul cielo
    },
    secondary: {
      main: '#ffc107', // Amarillo/Naranja
    },
    background: {
      default: '#121212', // Fondo muy oscuro
      paper: '#1e1e1e', // Fondo para tarjetas/papeles
    },
    text: {
      primary: '#ffffff', // Texto principal blanco
      secondary: '#b3b3b3', // Texto secundario gris claro
    },
  },
  // Puedes personalizar más cosas, como la tipografía
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;