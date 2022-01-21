import createTheme, { ThemeOptions } from '@mui/material/styles/createTheme';

const themeOptions: ThemeOptions = {

    spacing: 8,
    typography: {
        fontFamily: `'Open Sans Light'`
    },
};

export const theme = createTheme(themeOptions);
