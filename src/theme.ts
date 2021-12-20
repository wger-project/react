// import font from 'styles/abstracts/_font.module.scss'
// import breakpoints from 'styles/abstracts/_breakpoints.module.scss'
import createTheme, { ThemeOptions } from '@mui/material/styles/createTheme';
// import colors from 'styles/abstracts/_colors.module.scss'


const themeOptions: ThemeOptions = {
    
    spacing: 8,
    typography: {
      fontFamily: `'Poppins'`
    },
};

export const theme = createTheme(themeOptions);
