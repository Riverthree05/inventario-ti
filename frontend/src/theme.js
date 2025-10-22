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
  // Tipografía mejorada para monitores grandes
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 600,
      '@media (min-width:1200px)': {
        fontSize: '4rem',
      },
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      '@media (min-width:1200px)': {
        fontSize: '3.5rem',
      },
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 500,
      '@media (min-width:1200px)': {
        fontSize: '2.8rem',
      },
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 500,
      '@media (min-width:1200px)': {
        fontSize: '2.2rem',
      },
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
      '@media (min-width:1200px)': {
        fontSize: '1.8rem',
      },
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      '@media (min-width:1200px)': {
        fontSize: '1.5rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (min-width:1200px)': {
        fontSize: '1.125rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (min-width:1200px)': {
        fontSize: '1rem',
      },
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      '@media (min-width:1200px)': {
        fontSize: '1rem',
      },
    },
  },
  // Componentes personalizados para mejor espaciado
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (min-width:1200px)': {
            maxWidth: '1400px',
          },
          '@media (min-width:1536px)': {
            maxWidth: '1600px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '16px',
          '@media (min-width:1200px)': {
            padding: '24px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          '@media (min-width:1200px)': {
            padding: '12px 24px',
            fontSize: '1rem',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontSize: '1rem',
            '@media (min-width:1200px)': {
              fontSize: '1.125rem',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '1rem',
            '@media (min-width:1200px)': {
              fontSize: '1.125rem',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          padding: '16px',
          '@media (min-width:1200px)': {
            padding: '24px',
          },
        },
      },
    },
  },
});

export default theme;