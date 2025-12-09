import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },
});

export default theme;
