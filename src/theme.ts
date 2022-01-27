import createTheme, { ThemeOptions } from '@mui/material/styles/createTheme';

const themeOptions: ThemeOptions = {

    spacing: 8,
    typography: {
        fontFamily: `'Open Sans Light'`
    },
    palette: {
        primary: {
            main: '#2A4C7D',
        },
        secondary: {
            main: '#e63946',
        },
        warning: {
            main: '#cba328',
        },
        info: {
            main: '#457b9d',
        },
        success: {
            main: '#307916',
        },
    }
};

export const theme = createTheme(themeOptions);
